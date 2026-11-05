"use client";

import { useCart } from "../context/CartContext";
import { Button } from "@/components/ui/button";
import LazyImage from "./LazyImage";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    totalCartCount,
    cartSubtotal,
    isFreeShipping,
    updateCartQty,
    removeFromCart,
    setIsCheckoutOpen
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Panel */}
      <aside className="fixed inset-y-0 left-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2.5 font-extrabold text-base sm:text-lg text-neutral-900">
            <svg className="w-5 h-5 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>سلة التسوق ({totalCartCount})</span>
          </div>
          <button
            className="flex items-center justify-center w-11 h-11 rounded-full bg-neutral-200/60 hover:bg-neutral-300 text-neutral-600 transition-colors text-base font-bold shrink-0 cursor-pointer"
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="إغلاق السلة"
          >
            ✕
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="p-3.5 bg-neutral-50 border-b border-neutral-100">
          <div className="text-xs font-semibold text-neutral-700 mb-1.5 flex items-center justify-between">
            {isFreeShipping ? (
              <span className="text-emerald-700 font-bold">🎉 مبروك! طلبك مؤهل لشحن مجاني لكافة المحافظات</span>
            ) : (
              <span>متبقي <b className="text-emerald-700 font-bold">{(5000 - cartSubtotal).toLocaleString("ar-EG")} ج.م</b> على الشحن المجاني</span>
            )}
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-lime-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (cartSubtotal / 5000) * 100)}%` }}
            />
          </div>
        </div>

        {/* Cart Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
              <div className="text-5xl mb-3">🛒</div>
              <h3 className="font-bold text-lg text-neutral-900 mb-1">سلتك فارغة حالياً</h3>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-xs mb-5">
                تصفح أحدث الهواتف والأجهزة الذكية والإكسسوارات واختر طلبك الآن
              </p>
              <Button
                className="bg-lime-400 hover:bg-lime-500 text-black font-extrabold rounded-full px-6 shadow-md shadow-lime-400/20"
                onClick={() => setIsCartOpen(false)}
                asChild
              >
                <a href="/shop">تصفح تشكيلة الأجهزة</a>
              </Button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-2xl border border-neutral-100 bg-white hover:border-neutral-200 transition-colors shadow-sm"
              >
                <LazyImage
                  wrapperClassName="w-16 h-16 rounded-xl bg-neutral-50 p-1 border border-neutral-100 shrink-0 flex items-center justify-center"
                  className="w-full h-full object-contain"
                  src={item.image || "/img/mobile-concept-01.png"}
                  alt={item.name}
                />
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate mb-0.5">
                    {item.name}
                  </h4>
                  {(item.variant || item.color || item.storage) && (
                    <div className="text-[11px] text-neutral-500 truncate mb-1">
                      {[item.color, item.storage, item.ram ? `${item.ram} RAM` : null].filter(Boolean).join(" · ")}
                    </div>
                  )}
                  <div className="text-xs font-black text-emerald-800">
                    {Number(item.price).toLocaleString("ar-EG")} ج.م
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
                    <button
                      type="button"
                      className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 font-bold transition-colors cursor-pointer"
                      onClick={() => updateCartQty(idx, -1)}
                      aria-label="تقليل الكمية"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-neutral-900">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 font-bold transition-colors cursor-pointer"
                      onClick={() => updateCartQty(idx, 1)}
                      aria-label="زيادة الكمية"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="text-[10px] text-rose-500 hover:text-rose-700 font-bold cursor-pointer transition-colors"
                    onClick={() => removeFromCart(idx)}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-neutral-100 bg-neutral-50/50 space-y-3">
            <div className="space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-bold text-neutral-900">{cartSubtotal.toLocaleString("ar-EG")} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span>الشحن:</span>
                <span className="font-bold text-emerald-700">{isFreeShipping ? "شحن مجاني" : "يُحسب عند الدفع"}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-extrabold text-neutral-900 pt-1.5 border-t border-neutral-200">
                <span>الإجمالي المقدر:</span>
                <span className="text-emerald-800">{cartSubtotal.toLocaleString("ar-EG")} ج.م</span>
              </div>
            </div>

            <Button
              className="w-full bg-lime-400 hover:bg-lime-500 text-black font-extrabold h-12 rounded-xl text-sm shadow-md shadow-lime-400/25 transition-transform active:scale-[0.99] cursor-pointer"
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
            >
              متابعة الطلب والدفع بعد المعاينة ⚡
            </Button>
          </div>
        )}

      </aside>
    </div>
  );
}
