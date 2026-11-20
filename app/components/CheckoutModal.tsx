"use client";

import { useState } from "react";
import { useCart } from "../context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    directBuyItem,
    setDirectBuyItem,
    checkoutItems,
    totalCheckoutCount,
    checkoutSubtotal,
    isCheckoutFreeShipping,
    checkoutShippingFee,
    checkoutTotal,
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
    handleOrderSubmit,
    activeGovernorates,
    settings,
    formatPrice,
  } = useCart();

  const [copiedHandle, setCopiedHandle] = useState<string | null>(null);

  function copyToClipboard(text: string, label: string) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedHandle(label);
      setTimeout(() => setCopiedHandle(null), 2500);
    }
  }

  if (!isCheckoutOpen) return null;

  // Active payment options
  const hasCod = settings?.payment_cod_enabled ?? true;
  const hasVodafone = settings?.payment_vodafone_cash_enabled ?? true;
  const hasInstapay = settings?.payment_instapay_enabled ?? true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          setIsCheckoutOpen(false);
          setDirectBuyItem(null);
        }}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl max-h-[80vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-neutral-100 bg-neutral-50/70 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg sm:text-xl text-neutral-900">
                تأكيد الطلب وحجز مرجع الفاتورة
              </h3>
              {directBuyItem && (
                <span className="px-2 py-0.5 rounded-full bg-lime-100 text-lime-900 text-[10px] font-black border border-lime-300">
                  طلب سريع فوري ⚡
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              سجل بياناتك وسيتم إنشاء كود مرجعي فريد #MOB للطلب وتأكيده مع الفحص والمعاينة قبل الدفع
            </p>
          </div>
          <button
            className="flex items-center justify-center w-11 h-11 rounded-full bg-neutral-200/60 hover:bg-neutral-300 text-neutral-600 transition-colors text-base font-bold shrink-0 cursor-pointer"
            type="button"
            onClick={() => {
              setIsCheckoutOpen(false);
              setDirectBuyItem(null);
              setOrderCompleted(null);
            }}
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {orderCompleted ? (
          <div className="p-6 sm:p-8 text-center space-y-4 overflow-y-auto">
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
                  setDirectBuyItem(null);
                  setOrderCompleted(null);
                }}
              >
                إغلاق والعودة للمتجر
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleOrderSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">

            {/* If direct buy, show a clean badge summary of the single item */}
            {directBuyItem && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-lime-50/60 border border-lime-200">
                <img
                  src={directBuyItem.image}
                  alt={directBuyItem.name}
                  className="w-14 h-14 object-contain rounded-xl bg-white p-1 border border-neutral-150 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-xs sm:text-sm text-neutral-900 truncate">
                    {directBuyItem.name}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-600 mt-0.5">
                    {directBuyItem.variant && <span>{directBuyItem.variant}</span>}
                    {directBuyItem.condition && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700 font-bold">
                        {directBuyItem.condition}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-black text-emerald-800 mt-1">
                    {formatPrice(directBuyItem.price)} × {directBuyItem.qty}
                  </div>
                </div>
              </div>
            )}
            
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
                  const g = activeGovernorates.find(gov => gov.id === e.target.value);
                  if (g) setSelectedGov(g);
                }}
                className="w-full h-11 px-3 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-bold text-neutral-800 outline-none cursor-pointer"
              >
                {activeGovernorates.map(gov => (
                  <option key={gov.id} value={gov.id}>
                    {gov.name} ({gov.shipping === 0 ? "شحن مجاني" : formatPrice(gov.shipping)} · {gov.days})
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

            {/* Payment Method Selector & Information */}
            <div className="space-y-2 pt-1">
              <Label className="text-xs font-bold text-neutral-700">طريقة الدفع وتأكيد الحجز *</Label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {hasCod && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === "cod"
                        ? "bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600 text-emerald-950"
                        : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-base">💵</span>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentMethod === "cod" ? "border-emerald-600 bg-emerald-600" : "border-neutral-300"}`}>
                        {paymentMethod === "cod" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    <span className="font-extrabold text-xs">الدفع عند الاستلام</span>
                    <span className="text-[10px] text-neutral-500 mt-0.5">معاينة وفحص قبل الدفع</span>
                  </button>
                )}

                {hasVodafone && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("vodafone_cash")}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === "vodafone_cash"
                        ? "bg-red-50 border-red-600 ring-1 ring-red-600 text-red-950"
                        : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-base">📱</span>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentMethod === "vodafone_cash" ? "border-red-600 bg-red-600" : "border-neutral-300"}`}>
                        {paymentMethod === "vodafone_cash" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    <span className="font-extrabold text-xs">فودافون كاش</span>
                    <span className="text-[10px] text-neutral-500 mt-0.5">محافظ إلكترونية</span>
                  </button>
                )}

                {hasInstapay && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("instapay")}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                      paymentMethod === "instapay"
                        ? "bg-purple-50 border-purple-600 ring-1 ring-purple-600 text-purple-950"
                        : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-base">⚡</span>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentMethod === "instapay" ? "border-purple-600 bg-purple-600" : "border-neutral-300"}`}>
                        {paymentMethod === "instapay" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    <span className="font-extrabold text-xs">إنستاباي (InstaPay)</span>
                    <span className="text-[10px] text-neutral-500 mt-0.5">تحويل لحظي بنكي</span>
                  </button>
                )}
              </div>

              {/* Method Details Box */}
              {paymentMethod === "cod" && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5 text-emerald-900">
                    <span>🛡️</span>
                    <span>{settings?.payment_cod_title || "الدفع عند الاستلام بعد المعاينة والفحص"}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    {settings?.payment_cod_notes || "لك كامل الحق في فتح الشحنة وفحص الجهاز والتأكد من حالته ومطابقته للمواصفات قبل دفع أي مبلغ للمندوب."}
                  </p>
                </div>
              )}

              {paymentMethod === "vodafone_cash" && (
                <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200 text-xs text-red-950 space-y-2">
                  <div className="font-extrabold flex items-center justify-between text-red-900">
                    <span className="flex items-center gap-1.5">
                      <span>📱</span>
                      <span>رقم محفظة فودافون كاش: <b>{settings?.payment_vodafone_cash_number || "01012345678"}</b></span>
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(settings?.payment_vodafone_cash_number || "01012345678", "vodafone")}
                      className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-[10px] hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      {copiedHandle === "vodafone" ? "تم النسخ ✓" : "نسخ الرقم"}
                    </button>
                  </div>
                  <p className="text-[11px] text-red-800 leading-relaxed">
                    {settings?.payment_vodafone_cash_instructions || "قم بتحويل قيمة الطلب أو العربون إلى محفظة فودافون كاش، وأرسل صورة رسالة التحويل عبر الواتساب لتأكيد الشحن فوراً."}
                  </p>
                  {settings?.payment_vodafone_cash_qr && (
                    <div className="pt-1 flex items-center gap-3">
                      <img src={settings.payment_vodafone_cash_qr} alt="Vodafone Cash QR" className="w-16 h-16 rounded-lg bg-white p-1 border border-red-200 object-contain" />
                      <span className="text-[10px] text-red-700">امسح الكود عبر تطبيق أنا فودافون للدفع المباشر</span>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === "instapay" && (
                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs text-purple-950 space-y-2">
                  <div className="font-extrabold flex items-center justify-between text-purple-900">
                    <span className="flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>معرف InstaPay IPA: <b dir="ltr">{settings?.payment_instapay_handle || "mobilestore@instapay"}</b></span>
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(settings?.payment_instapay_handle || "mobilestore@instapay", "instapay")}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold text-[10px] hover:bg-purple-700 transition-colors cursor-pointer"
                    >
                      {copiedHandle === "instapay" ? "تم النسخ ✓" : "نسخ المعرف"}
                    </button>
                  </div>
                  <p className="text-[11px] text-purple-800 leading-relaxed">
                    {settings?.payment_instapay_instructions || "قم بالتحويل عبر تطبيق إنستاباي إلى المعرف (IPA) الموضح أعلاه، واحتفظ بإيصال العملية للمعاينة."}
                  </p>
                  {settings?.payment_instapay_qr && (
                    <div className="pt-1 flex items-center gap-3">
                      <img src={settings.payment_instapay_qr} alt="InstaPay QR" className="w-16 h-16 rounded-lg bg-white p-1 border border-purple-200 object-contain" />
                      <span className="text-[10px] text-purple-700">امسح الكود عبر تطبيق إنستاباي للتحويل الفوري</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="p-3.5 rounded-2xl bg-neutral-100/70 space-y-1.5 text-xs text-neutral-700">
              <div className="flex justify-between">
                <span>{directBuyItem ? "سعر الجهاز:" : `إجمالي الأجهزة (${totalCheckoutCount}):`}</span>
                <span className="font-bold">{formatPrice(checkoutSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>تكلفة الشحن إلى {selectedGov.name}:</span>
                <span className="font-bold text-emerald-700">{isCheckoutFreeShipping ? "شحن مجاني 🎉" : formatPrice(checkoutShippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-neutral-900 pt-1.5 border-t border-neutral-200">
                <span>المبلغ الإجمالي للدفع:</span>
                <span className="text-emerald-800 text-base">{formatPrice(checkoutTotal)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={submittingOrder}
                className="w-full bg-lime-400 hover:bg-lime-500 text-black font-extrabold h-12 rounded-xl text-sm shadow-md shadow-lime-400/25 transition-transform active:scale-[0.99] cursor-pointer"
              >
                {submittingOrder ? "جاري تسجيل وتأكيد الطلب..." : `تأكيد حجز الطلب (${formatPrice(checkoutTotal)}) ⚡`}
              </Button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
