import { NextResponse } from "next/server";
import { getOrderByRef, updateOrderStatus } from "../../../../lib/db";
import { cookies } from "next/headers";

export async function GET(req: Request, context: { params: Promise<{ ref: string }> }) {
  try {
    const { ref } = await context.params;
    const order = await getOrderByRef(ref);
    if (!order) {
      return NextResponse.json({ success: false, error: "الطلب غير موجود" }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ ref: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("mobile_admin_token");
    if (!token || token.value !== "mobile_authorized_session") {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
    }

    const { ref } = await context.params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ success: false, error: "حالة الطلب مطلوبة" }, { status: 400 });
    }

    const updated = await updateOrderStatus(ref, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: "فشل تحديث حالة الطلب" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "تم تحديث حالة الطلب بنجاح" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
