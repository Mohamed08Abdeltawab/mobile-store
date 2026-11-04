import { NextResponse } from "next/server";
import { getAllProducts, createProduct } from "../../../lib/db";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    console.error("GET /api/products error:", err);
    return NextResponse.json({ success: false, error: "فشل جلب المنتجات: " + err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("mobile_admin_token");
    if (!token || token.value !== "mobile_authorized_session") {
      return NextResponse.json({ success: false, error: "غير مصرح لك بتنفيذ هذه العملية. يرجى تسجيل الدخول أولاً." }, { status: 401 });
    }

    const body = await req.json();
    const name = (body.name || "").trim();
    const category = body.cat || body.category;

    if (!name) {
      return NextResponse.json({ success: false, error: "اسم المنتج بالكامل مطلوب." }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ success: false, error: "القسم الرئيسي للمنتج مطلوب." }, { status: 400 });
    }

    const price = parseFloat(body.price);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ success: false, error: "السعر يجب أن يكون أكبر من صفر." }, { status: 400 });
    }

    const rawOldPrice = body.original_price !== undefined ? body.original_price : body.old_price;
    let oldPrice: number | null = null;
    if (rawOldPrice !== undefined && rawOldPrice !== null && rawOldPrice !== "") {
      oldPrice = parseFloat(rawOldPrice);
      if (isNaN(oldPrice) || oldPrice < 0) {
        return NextResponse.json({ success: false, error: "السعر قبل الخصم لا يمكن أن يكون رقمًا سالبًا." }, { status: 400 });
      }
      if (oldPrice <= price) {
        return NextResponse.json({ success: false, error: "السعر قبل الخصم يجب أن يكون أكبر من سعر البيع الحالي." }, { status: 400 });
      }
    }

    const product = await createProduct({
      ...body,
      name,
      cat: category,
      category,
      price,
      old_price: oldPrice,
      original_price: oldPrice
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "فشل حفظ المنتج في قاعدة البيانات" }, { status: 500 });
    }

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/products error:", err);
    return NextResponse.json({ success: false, error: err.message || "حدث خطأ غير متوقع أثناء حفظ المنتج" }, { status: 500 });
  }
}
