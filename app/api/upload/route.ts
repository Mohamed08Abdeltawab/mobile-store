import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import path from "node:path";
import { uploadImageToStorage, deleteImageFromStorage } from "../../../lib/r2";
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

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const rawExt = path.extname(file.name) || ".png";
      const ext = allowedExts.includes(rawExt.toLowerCase()) ? rawExt.toLowerCase() : ".png";

      const cleanBase = path.basename(file.name, rawExt).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 25);
      const filename = `mob-${Date.now()}-${i}-${cleanBase || "img"}${ext}`;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || (ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".svg" ? "image/svg+xml" : "image/jpeg");

      // Upload to Cloudflare R2 (or fallback to local uploads)
      const uploadResult = await uploadImageToStorage(filename, buffer, mimeType);
      uploadedUrls.push(uploadResult.url);
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

    // 1. Delete from Cloudflare R2 / Local storage
    await deleteImageFromStorage(url);

    // 2. Legacy fallback: Check if it was stored in Supabase Storage previously
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "mobiles";
    const useSupabase = isSupabaseConfigured();

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

    return NextResponse.json({
      success: true,
      message: "تم حذف ملف الصورة بنجاح"
    });
  } catch (err: any) {
    console.error("DELETE /api/upload error:", err);
    return NextResponse.json({ success: false, error: "فشل حذف ملف الصورة: " + err.message }, { status: 500 });
  }
}
