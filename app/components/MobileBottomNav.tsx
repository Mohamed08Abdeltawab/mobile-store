"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../context/CartContext";

export default function MobileBottomNav() {
  const {
    totalCartCount,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsSearchOpen
  } = useCart();

  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0d1210]/95 backdrop-blur-md border-t border-white/10 px-2 py-1 pb-[calc(env(safe-area-inset-bottom,0px)+6px)] shadow-2xl flex items-center justify-around" aria-label="شريط التنقل السفلي للموبايل">
      
      {/* Home */}
      <Link
        href="/"
        className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 p-1 text-[11px] font-bold transition-colors ${
          pathname === "/" ? "text-lime-400" : "text-neutral-400 hover:text-white"
        }`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>الرئيسية</span>
      </Link>

      {/* Shop */}
      <Link
        href="/shop"
        className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 p-1 text-[11px] font-bold transition-colors ${
          pathname.startsWith("/shop") ? "text-lime-400" : "text-neutral-400 hover:text-white"
        }`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <span>المتجر</span>
      </Link>

      {/* Search Trigger */}
      <button
        type="button"
        className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 p-1 text-[11px] font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
        onClick={() => setIsSearchOpen(true)}
        aria-label="بحث عن هاتف"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span>بحث</span>
      </button>

      {/* Wishlist Trigger */}
      <button
        type="button"
        className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 p-1 text-[11px] font-bold text-neutral-400 hover:text-white transition-colors relative cursor-pointer"
        onClick={() => setIsWishlistOpen(true)}
        aria-label={`المفضلة (${wishlist.length})`}
      >
        <div className="relative">
          <svg className={`w-5 h-5 ${wishlist.length > 0 ? "text-rose-500 fill-rose-500" : ""}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          {wishlist.length > 0 && (
            <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
        </div>
        <span>المفضلة</span>
      </button>

      {/* Cart Trigger */}
      <button
        type="button"
        className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 p-1 text-[11px] font-bold text-neutral-400 hover:text-white transition-colors relative cursor-pointer"
        onClick={() => setIsCartOpen(true)}
        aria-label={`سلة التسوق (${totalCartCount})`}
      >
        <div className="relative">
          <svg className="w-5 h-5 text-lime-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          {totalCartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-lime-400 text-black font-black text-[9px] flex items-center justify-center">
              {totalCartCount}
            </span>
          )}
        </div>
        <span>السلة</span>
      </button>

    </nav>
  );
}
