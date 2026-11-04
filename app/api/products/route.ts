import { NextResponse } from "next/server";
import { getAllProducts, createProduct } from "../../../lib/db";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    console.error("GET /api/products error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("mobile_admin_token");
    if (!token || token.value !== "mobile_authorized_session") {
      return NextResponse.json({ success: false, error: "غير مصرح لك بتنفيذ هذه العملية" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.name || !body.price || !body.cat) {
      return NextResponse.json({ success: false, error: "البيانات الأساسية مطلوبة (الاسم، السعر، الفئة)" }, { status: 400 });
    }

    const product = await createProduct(body);
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/products error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
