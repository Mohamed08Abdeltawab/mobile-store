import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../lib/supabase";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("mobile_admin_token");
    if (!token || token.value !== "mobile_authorized_session") {
      return NextResponse.json({ success: false, error: "غير مصرح لك برفع الصور" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files").concat(formData.getAll("file")).filter(f => f && typeof f !== "string") as File[];

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: "يرجى اختيار ملف صورة صالح على الأقل" }, { status: 400 });
    }

    const allowedExts = [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"];
    const uploadedUrls: string[] = [];

    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "mobiles";
    const useSupabase = isSupabaseConfigured();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const rawExt = path.extname(file.name) || ".png";
      const ext = allowedExts.includes(rawExt.toLowerCase()) ? rawExt.toLowerCase() : ".png";

      const cleanBase = path.basename(file.name, rawExt).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 25);
      const filename = `mob-${Date.now()}-${i}-${cleanBase || "img"}${ext}`;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (useSupabase) {
        const supabase = getSupabaseAdmin()!;
        const mimeType = file.type || (ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg");

        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filename, buffer, {
            contentType: mimeType,
            upsert: true
          });

        if (error) {
          console.error("[Supabase Storage Upload Error]:", error);
          throw new Error("فشل الرفع إلى Supabase Storage: " + error.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filename);

        uploadedUrls.push(publicUrlData.publicUrl);
      } else {
        // Local filesystem fallback
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await fs.mkdir(uploadsDir, { recursive: true });
        const destination = path.join(uploadsDir, filename);
        await fs.writeFile(destination, buffer);
        uploadedUrls.push(`/uploads/${filename}`);
      }
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0],
      urls: uploadedUrls,
      count: uploadedUrls.length
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ success: false, error: "فشل حفظ الصور: " + err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("mobile_admin_token");
    if (!token || token.value !== "mobile_authorized_session") {
      return NextResponse.json({ success: false, error: "غير مصرح لك بحذف الصور" }, { status: 401 });
    }

    const body = await req.json();
    const url = body?.url;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ success: false, error: "رابط الصورة مطلوب لحذفها" }, { status: 400 });
    }

    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "mobiles";
    const useSupabase = isSupabaseConfigured();

    // Check if it's stored in Supabase Storage
    if (useSupabase && (url.includes(bucketName) || url.includes("supabase.co"))) {
      try {
        const supabase = getSupabaseAdmin()!;
        const cleanUrl = url.split("?")[0];
        const filename = path.basename(cleanUrl);
        const { error } = await supabase.storage.from(bucketName).remove([filename]);
        if (error) {
          console.error("[Supabase Storage Delete Error]:", error);
        }
      } catch (err) {
        console.error("Supabase Storage deletion error:", err);
      }
    }

    // Check if it's stored in local public/uploads directory
    if (url.startsWith("/uploads/") || url.includes("/uploads/")) {
      const cleanUrl = url.split("?")[0];
      const filename = path.basename(cleanUrl);
      const filePath = path.join(process.cwd(), "public", "uploads", filename);

      try {
        await fs.unlink(filePath);
      } catch (err: any) {
        if (err.code !== "ENOENT") {
          console.error("Local file deletion error:", err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "تم حذف ملف الصورة بنجاح"
    });
  } catch (err: any) {
    console.error("DELETE /api/upload error:", err);
    return NextResponse.json({ success: false, error: "فشل حذف ملف الصورة: " + err.message }, { status: 500 });
  }
}
