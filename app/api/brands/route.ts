import { NextResponse } from "next/server";
import { getAllBrands, createBrand, deleteBrand } from "../../../lib/db";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const brands = await getAllBrands();
    return NextResponse.json({ success: true, brands });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("mobile_admin_token");
    if (!token || token.value !== "mobile_authorized_session") {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.id || !body.name) {
      return NextResponse.json({ success: false, error: "اسم ومعرف الماركة مطلوبان" }, { status: 400 });
    }

    const created = await createBrand(body);
    return NextResponse.json({ success: true, brand: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("mobile_admin_token");
    if (!token || token.value !== "mobile_authorized_session") {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await req.json();
    const success = await deleteBrand(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
