import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getStoreSettings, updateStoreSettings } from "../../../lib/db";
import { StoreSettings } from "../../../lib/types";

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json(
      { success: true, settings },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/settings error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load store settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("mobile_admin_token");
    if (!token || token.value !== "mobile_authorized_session") {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بتحديث إعدادات المتجر. يرجى تسجيل الدخول أولاً." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as Partial<StoreSettings>;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "بيانات الإعدادات غير صالحة." },
        { status: 400 }
      );
    }

    // Validation
    if (body.store_name !== undefined && !body.store_name.trim()) {
      return NextResponse.json(
        { success: false, error: "اسم المتجر مطلوب ولا يمكن أن يكون فارغاً." },
        { status: 400 }
      );
    }

    if (body.free_shipping_threshold !== undefined) {
      const threshold = Number(body.free_shipping_threshold);
      if (isNaN(threshold) || threshold < 0) {
        return NextResponse.json(
          { success: false, error: "حد الشحن المجاني يجب أن يكون رقماً موجباً." },
          { status: 400 }
        );
      }
      body.free_shipping_threshold = threshold;
    }

    if (body.primary_color && !/^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(body.primary_color.trim())) {
      return NextResponse.json(
        { success: false, error: "كود اللون الأساسي غير صالح (يجب أن يكون بصيغة Hex مثل #A3E635)." },
        { status: 400 }
      );
    }

    if (body.secondary_color && !/^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(body.secondary_color.trim())) {
      return NextResponse.json(
        { success: false, error: "كود اللون الثانوي غير صالح (يجب أن يكون بصيغة Hex مثل #10B981)." },
        { status: 400 }
      );
    }

    const updated = await updateStoreSettings(body);

    return NextResponse.json({
      success: true,
      message: "تم حفظ وتحديث إعدادات المتجر بنجاح",
      settings: updated,
    });
  } catch (err: any) {
    console.error("PUT /api/settings error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "فشل حفظ إعدادات المتجر." },
      { status: 500 }
    );
  }
}

// Allow POST as an alias for PUT
export async function POST(req: Request) {
  return PUT(req);
}
