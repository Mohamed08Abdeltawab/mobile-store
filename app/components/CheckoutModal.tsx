"use client";

import { useCart, GOVERNORATES } from "../context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    totalCartCount,
    cartSubtotal,
    isFreeShipping,
    shippingFee,
    cartTotal,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    selectedGov,
    setSelectedGov,
    customerAddress,
    setCustomerAddress,
    paymentMethod,
    setPaymentMethod,
    formErrors,
    submittingOrder,
    orderCompleted,
    setOrderCompleted,
    handleOrderSubmit
  } = useCart();

  if (!isCheckoutOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsCheckoutOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-neutral-100 bg-neutral-50/70">
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl text-neutral-900">
              تأكيد الطلب وحجز مرجع الفاتورة
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              سجل بياناتك وسيتم إنشاء كود مرجعي فريد #MOB للطلب وتأكيده مع الفحص والمعاينة قبل الدفع
            </p>
          </div>
          <button
            className="flex items-center justify-center w-11 h-11 rounded-full bg-neutral-200/60 hover:bg-neutral-300 text-neutral-600 transition-colors text-base font-bold shrink-0 cursor-pointer"
            type="button"
            onClick={() => {
              setIsCheckoutOpen(false);
              setOrderCompleted(null);
            }}
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {orderCompleted ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <h3 className="font-extrabold text-xl text-neutral-900">
              تم استلام طلبك وتسجيله بنجاح!
            </h3>

            <div className="bg-emerald-50 border-2 border-dashed border-lime-400 rounded-2xl p-4 my-4 text-emerald-900">
              <span className="text-xs font-semibold text-emerald-700">كود مرجع الطلب الخاص بك:</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-wider my-1">
                #{orderCompleted.orderRef}
              </div>
              <small className="text-[11px] text-emerald-700">احتفظ بهذا الكود لتتبع شحنتك ومعاينة الجهاز مع المندوب</small>
            </div>

            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-md mx-auto">
              تم تجهيز رسالة الواتساب تلقائياً مع تفاصيل جهازك وكود المرجع. يمكنك المتابعة المباشرة عبر الزر التالي:
            </p>

            <div className="space-y-2 pt-2">
              <Button
                asChild
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold h-12 rounded-xl text-sm shadow-md"
              >
                <a
                  href={orderCompleted.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  متابعة الطلب على واتساب برقم #{orderCompleted.orderRef}
                </a>
              </Button>

              <Button
                variant="outline"
                className="w-full rounded-xl text-xs font-bold"
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setOrderCompleted(null);
                }}
              >
                إغلاق والعودة للمتجر
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleOrderSubmit} className="p-5 sm:p-6 space-y-4">
            
            {/* Customer Name */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-neutral-700">الاسم ثلاثي أو ثنائي *</Label>
              <Input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="أحمد محمد علي"
                className={`h-11 rounded-xl bg-neutral-50 text-sm ${formErrors.name ? "border-rose-500 ring-1 ring-rose-500" : ""}`}
              />
              {formErrors.name && (
                <span className="text-[11px] text-rose-500 font-bold">يرجى كتابة الاسم بالكامل</span>
              )}
            </div>

            {/* Customer Phone */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-neutral-700">رقم الهاتف (موبايل مصري) *</Label>
              <Input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="01012345678"
                dir="ltr"
                className={`h-11 rounded-xl bg-neutral-50 text-sm text-right ${formErrors.phone ? "border-rose-500 ring-1 ring-rose-500" : ""}`}
              />
              {formErrors.phone && (
                <span className="text-[11px] text-rose-500 font-bold">يرجى إدخال رقم موبايل مصري صحيح (11 رقم يبدأ بـ 01)</span>
              )}
            </div>

            {/* Governorate Selector */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-neutral-700">المحافظة *</Label>
              <select
                value={selectedGov.id}
                onChange={(e) => {
                  const g = GOVERNORATES.find(gov => gov.id === e.target.value);
                  if (g) setSelectedGov(g);
                }}
                className="w-full h-11 px-3 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-bold text-neutral-800 outline-none cursor-pointer"
              >
                {GOVERNORATES.map(gov => (
                  <option key={gov.id} value={gov.id}>
                    {gov.name} ({gov.shipping === 0 ? "مجاني" : `${gov.shipping} ج.م`} · {gov.days})
                  </option>
                ))}
              </select>
            </div>

            {/* Address Details */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-neutral-700">العنوان بالتفصيل (المنطقة، الشارع، رقم العمارة والشقة) *</Label>
              <Input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="التجمع الخامس، شارع التسعين، عمارة 14 الدور 3"
                className={`h-11 rounded-xl bg-neutral-50 text-sm ${formErrors.addr ? "border-rose-500 ring-1 ring-rose-500" : ""}`}
              />
              {formErrors.addr && (
                <span className="text-[11px] text-rose-500 font-bold">يرجى كتابة عنوان التوصيل بالتفصيل</span>
              )}
            </div>

            {/* Payment Method Notice */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <div className="font-extrabold flex items-center gap-1.5 text-emerald-900">
                <span>🛡️</span>
                <span>طريقة الدفع: الدفع عند الاستلام بعد المعاينة والفحص</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                لك كامل الحق في فتح الشحنة وفحص الجهاز والتأكد من حالته ومطابقته للمواصفات перед دفع أي جنيه للمندوب.
              </p>
            </div>

            {/* Price Summary */}
            <div className="p-3.5 rounded-2xl bg-neutral-100/70 space-y-1.5 text-xs text-neutral-700">
              <div className="flex justify-between">
                <span>إجمالي الأجهزة ({totalCartCount}):</span>
                <span className="font-bold">{cartSubtotal.toLocaleString("ar-EG")} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span>تكلفة الشحن إلى {selectedGov.name}:</span>
                <span className="font-bold text-emerald-700">{isFreeShipping ? "شحن مجاني 🎉" : `${shippingFee} ج.م`}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-neutral-900 pt-1.5 border-t border-neutral-200">
                <span>المبلغ الإجمالي للدفع:</span>
                <span className="text-emerald-800 text-base">{cartTotal.toLocaleString("ar-EG")} ج.م</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={submittingOrder}
                className="w-full bg-lime-400 hover:bg-lime-500 text-black font-extrabold h-12 rounded-xl text-sm shadow-md shadow-lime-400/25 transition-transform active:scale-[0.99] cursor-pointer"
              >
                {submittingOrder ? "جاري تسجيل وتأكيد الطلب..." : `تأكيد حجز الطلب (${cartTotal.toLocaleString("ar-EG")} ج.م) ⚡`}
              </Button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
