"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { Button } from "@/components/ui/button";

export default function WishlistDrawer() {
  const {
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    products,
    toggleWishlist,
    addToCart
  } = useCart();

  if (!isWishlistOpen) return null;

  const favProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsWishlistOpen(false)}
      />

      {/* Drawer Panel */}
      <aside className="fixed inset-y-0 left-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2 font-extrabold text-base sm:text-lg text-neutral-900">
            <span>❤️</span>
            <span>قائمة المفضلة ({wishlist.length})</span>
          </div>
          <button
            className="flex items-center justify-center w-11 h-11 rounded-full bg-neutral-200/60 hover:bg-neutral-300 text-neutral-600 transition-colors text-base font-bold shrink-0 cursor-pointer"
            type="button"
            onClick={() => setIsWishlistOpen(false)}
            aria-label="إغلاق المفضلة"
          >
            ✕
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {favProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
              <div className="text-5xl mb-3">🤍</div>
              <h3 className="font-bold text-lg text-neutral-900 mb-1">قائمة المفضلة فارغة</h3>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-xs mb-5">
                احفظ أجهزتك المفضلة بالضغط على أيقونة القلب في بطاقة المنتج للرجوع إليها لاحقاً
              </p>
              <Button
                className="bg-lime-400 hover:bg-lime-500 text-black font-extrabold rounded-full px-6 shadow-md shadow-lime-400/20"
                onClick={() => setIsWishlistOpen(false)}
                asChild
              >
                <Link href="/shop">تصفح الهواتف والأجهزة</Link>
              </Button>
            </div>
          ) : (
            favProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 rounded-2xl border border-neutral-100 bg-white hover:border-neutral-200 transition-colors shadow-sm"
              >
                <img
                  className="w-16 h-16 rounded-xl object-contain bg-neutral-50 p-1 border border-neutral-100 shrink-0"
                  src={p.image || "/img/mobile-concept-01.png"}
                  alt={p.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/img/mobile-concept-01.png";
                  }}
                />
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate mb-0.5">
                    <Link
                      href={`/product/${p.id}`}
                      onClick={() => setIsWishlistOpen(false)}
                      className="hover:text-emerald-700 transition-colors"
                    >
                      {p.name}
                    </Link>
                  </h4>
                  <div className="text-xs font-black text-emerald-800 mb-1">
                    {Number(p.price).toLocaleString("ar-EG")} ج.م
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addToCart(p, 1)}
                      className="text-[11px] font-extrabold text-lime-600 hover:text-lime-700 bg-lime-400/20 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                    >
                      + أضف للسلة
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(p.id)}
                      className="text-[11px] text-neutral-400 hover:text-rose-600 cursor-pointer transition-colors"
                    >
                      إزالة
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </aside>
    </div>
  );
}
