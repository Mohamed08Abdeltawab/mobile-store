import { NextResponse } from "next/server";
import { createOrder, getAllOrders } from "../../../lib/db";
import { cookies } from "next/headers";

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201065712366";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("mobile_admin_token");
    if (!token || token.value !== "mobile_authorized_session") {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
    }

    const orders = await getAllOrders();
    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.customer_name || !body.customer_phone || !body.address || !body.items || body.items.length === 0) {
      return NextResponse.json({ success: false, error: "يرجى ملء جميع البيانات المطلوبة والمنتجات" }, { status: 400 });
    }

    // Create order in database
    const order = await createOrder(body);
    if (!order) {
      return NextResponse.json({ success: false, error: "فشل حفظ الطلب" }, { status: 500 });
    }

    // Format WhatsApp message with unique Order Reference
    let itemsList = "";
    if (Array.isArray(order.items)) {
      itemsList = order.items.map((it, idx) => 
        `${idx + 1}. ${it.name} ${it.variant ? `(${it.variant})` : (it.color ? `(${it.color})` : "")} × ${it.qty} = ${(it.price * it.qty).toLocaleString("ar-EG")} ج.م`
      ).join("\n");
    }

    const waMessage = `*طلب جديد من متجر الموبايل والإلكترونيات* 📱
*رقم مرجع الطلب:* #${order.order_ref}

👤 *بيانات العميل:*
• الاسم: ${order.customer_name}
• الهاتف: ${order.customer_phone}
• المحافظة: ${order.governorate}
• العنوان بالتفصيل: ${order.address}

📦 *تفاصيل الأجهزة والطلبات:*
${itemsList}

💰 *الحساب الإجمالي:*
• قيمة المنتجات: ${Number(order.subtotal).toLocaleString("ar-EG")} ج.م
• الشحن: ${order.shipping === 0 ? "مجاني" : Number(order.shipping).toLocaleString("ar-EG") + " ج.م"}
• الإجمالي المستحق: *${Number(order.total).toLocaleString("ar-EG")} ج.م*

طريقة الدفع: الدفع عند الاستلام بعد الفحص والمعاينة الكاملة`;

    const whatsappUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMessage)}`;

    return NextResponse.json({
      success: true,
      order,
      whatsappUrl,
      orderRef: order.order_ref
    }, { status: 201 });

  } catch (err: any) {
    console.error("POST /api/orders error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
