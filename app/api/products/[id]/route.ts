import { NextResponse } from "next/server";
import { getProductById, updateProduct, deleteProduct } from "../../../../lib/db";
import { cookies } from "next/headers";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ success: false, error: "المنتج غير موجود" }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "فشل جلب المنتج: " + err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("mobile_admin_token");
    if (!token || token.value !== "mobile_authorized_session") {
      return NextResponse.json({ success: false, error: "غير مصرح لك بتعديل هذا المنتج. يرجى تسجيل الدخول أولاً." }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    if (body.price !== undefined) {
      const price = parseFloat(body.price);
      if (isNaN(price) || price <= 0) {
        return NextResponse.json({ success: false, error: "السعر يجب أن يكون أكبر من صفر." }, { status: 400 });
      }
      body.price = price;
    }

    const rawOldPrice = body.original_price !== undefined ? body.original_price : body.old_price;
    if (rawOldPrice !== undefined) {
      if (rawOldPrice !== null && rawOldPrice !== "") {
        const oldPrice = parseFloat(rawOldPrice);
        if (isNaN(oldPrice) || oldPrice < 0) {
          return NextResponse.json({ success: false, error: "السعر قبل الخصم لا يمكن أن يكون رقمًا سالبًا." }, { status: 400 });
        }
        if (body.price && oldPrice <= body.price) {
          return NextResponse.json({ success: false, error: "السعر قبل الخصم يجب أن يكون أكبر من سعر البيع الحالي." }, { status: 400 });
        }
        body.old_price = oldPrice;
        body.original_price = oldPrice;
      } else {
        body.old_price = null;
        body.original_price = null;
      }
    }

    if (body.category) {
      body.cat = body.category;
    }

    const updated = await updateProduct(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "فشل تحديث المنتج، قد يكون غير موجود" }, { status: 404 });
    }
    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    console.error("PUT /api/products/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message || "حدث خطأ أثناء تعديل بيانات المنتج" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("mobile_admin_token");
    if (!token || token.value !== "mobile_authorized_session") {
      return NextResponse.json({ success: false, error: "غير مصرح لك بحذف المنتجات. يرجى تسجيل الدخول أولاً." }, { status: 401 });
    }

    const { id } = await context.params;
    const success = await deleteProduct(id);
    if (!success) {
      return NextResponse.json({ success: false, error: "تعذر حذف المنتج أو المنتج غير موجود في قاعدة البيانات" }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: "تم حذف المنتج بنجاح" });
  } catch (err: any) {
    console.error("DELETE /api/products/[id] error:", err);
    return NextResponse.json({ success: false, error: err.message || "حدث خطأ أثناء محاولة حذف المنتج" }, { status: 500 });
  }
}
