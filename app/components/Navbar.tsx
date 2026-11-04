"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../context/CartContext";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const {
    totalCartCount,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsSearchOpen,
    setIsMobileMenuOpen,
    isAdmin
  } = useCart();

  const pathname = usePathname();
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201065712366";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0d1210]/95 backdrop-blur-md text-white shadow-lg transition-all" id="siteHeader">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 md:px-6 lg:px-8">
        
        {/* Main Top Header Bar */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-4 h-16 sm:h-20">
          
          {/* Right Group (in RTL): Mobile Hamburger + Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Hamburger Toggle (Visible on Mobile & Tablets < lg) */}
            <button
              type="button"
              className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all shrink-0 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="فتح القائمة الرئيسية"
              title="القائمة الرئيسية والأقسام"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            {/* Brand Logo */}
            <Link className="flex items-center gap-2 sm:gap-2.5 group shrink-0" href="/">
              <span className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-lime-400 text-black shadow-md shadow-lime-400/20 group-hover:scale-105 transition-transform shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="3" ry="3"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
              </span>
              <span className="flex flex-col">
                <span className="font-extrabold text-base sm:text-xl lg:text-2xl tracking-wider leading-none">
                  MOBILE<span className="text-lime-400">STORE</span>
                </span>
                <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-neutral-400 tracking-widest uppercase">
                  موبايلات · تابلت · إلكترونيات
                </span>
              </span>
            </Link>
          </div>

          {/* Center Group: Search Trigger */}
          <div className="flex-1 min-w-0 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg hidden sm:block mx-1 md:mx-3">
            <button
              type="button"
              className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 sm:py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-lime-400/40 text-right truncate cursor-pointer"
              onClick={() => setIsSearchOpen(true)}
              title="بحث عن هاتف أو جهاز"
            >
              <svg className="w-4 h-4 text-lime-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span className="truncate">ابحث عن آيفون، سامسونج، كسر زيرو، إيربودز...</span>
            </button>
          </div>

          {/* Left Group (in RTL Actions): WhatsApp + Wishlist + Cart + Dashboard */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 shrink-0">
            {/* Search Icon Trigger on Small Mobile */}
            <button
              type="button"
              className="sm:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-lime-400 transition-colors shrink-0 cursor-pointer"
              onClick={() => setIsSearchOpen(true)}
              aria-label="بحث"
              title="بحث عن هاتف أو جهاز"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            {/* Direct WhatsApp Contact Button */}
            <a
              className="inline-flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] shrink-0"
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent("مرحباً، أود الاستفسار عن الهواتف والأجهزة المتاحة في موبايل ستور")}`}
              target="_blank"
              rel="noopener noreferrer"
              title="تواصل مباشر عبر واتساب"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z"></path>
              </svg>
              <span className="hidden xl:inline text-xs">واتساب VIP</span>
            </a>

            {/* Wishlist Button (Visible on md+) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWishlistOpen(true)}
              className="hidden md:inline-flex items-center rounded-full bg-white/5 border-white/10 hover:bg-white/15 text-white gap-1 sm:gap-1.5 h-8 sm:h-9 px-2 sm:px-2.5 shrink-0 cursor-pointer"
              title="قائمة المفضلة"
              aria-label={`المفضلة (${wishlist.length})`}
            >
              <span className="text-sm">❤️</span>
              <span className="hidden 2xl:inline text-xs">المفضلة</span>
              <span className="text-[11px] sm:text-xs px-1.5 py-0.2 rounded-full bg-white/20 text-white font-bold leading-none">
                {wishlist.length}
              </span>
            </Button>

            {/* Cart Button (Visible on md+) */}
            <Button
              size="sm"
              onClick={() => setIsCartOpen(true)}
              className="hidden md:inline-flex items-center justify-center rounded-full bg-lime-400 hover:bg-lime-500 text-black font-extrabold gap-1 sm:gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 shadow-md shadow-lime-400/20 active:scale-95 transition-transform shrink-0 cursor-pointer"
              title="سلة المشتريات"
              aria-label={`سلة المشتريات (${totalCartCount})`}
            >
              <span className="text-sm leading-none">🛒</span>
              <span className="hidden xs:inline text-xs font-black leading-none">السلة</span>
              <span className="text-[11px] sm:text-xs min-w-[18px] h-[18px] px-1 rounded-full bg-black text-lime-400 font-black flex items-center justify-center leading-none">
                {totalCartCount}
              </span>
            </Button>

            {/* Dashboard / Login Button */}
            {isAdmin ? (
              <Link
                href="/admin"
                className="hidden md:inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 h-8 sm:h-9 rounded-full bg-lime-400 text-black font-black text-xs shadow-md shadow-lime-400/25 hover:bg-lime-300 active:scale-95 transition-all shrink-0"
                title="لوحة تحكم المتجر"
                aria-label="لوحة تحكم المتجر"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span className="hidden sm:inline">لوحة التحكم</span>
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="hidden md:inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 h-8 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs active:scale-95 transition-all shrink-0"
                title="تسجيل الدخول للإدارة"
                aria-label="تسجيل الدخول"
              >
                <svg className="w-3.5 h-3.5 text-lime-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="hidden md:inline">دخول</span>
              </Link>
            )}

          </div>
        </div>

        {/* Secondary Category Navigation Bar */}
        <nav
          className="hidden md:flex items-center gap-2 py-2 text-xs font-semibold text-neutral-300 border-t border-white/10 overflow-x-auto no-scrollbar scrollbar-none whitespace-nowrap scroll-smooth"
          aria-label="أقسام المتجر والتنقل"
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${pathname === "/" ? "bg-white/15 text-lime-400 font-bold" : "hover:text-white hover:bg-white/5"}`}
            >
              الرئيسية
            </Link>
            <Link
              href="/shop"
              className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${pathname === "/shop" && !pathname.includes("?") ? "bg-white/15 text-lime-400 font-bold" : "hover:text-white hover:bg-white/5"}`}
            >
              كل الأجهزة
            </Link>
            <Link
              href="/shop?filter=bestseller"
              className="px-3 py-1.5 rounded-lg text-amber-300 hover:bg-amber-400/10 transition-colors font-bold flex items-center gap-1 shrink-0"
            >
              🔥 الأكثر طلباً
            </Link>
            <Link href="/shop?category=phones" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors shrink-0">
              📱 الموبايلات
            </Link>
            <Link href="/shop?condition=used" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 text-sky-400 font-bold transition-colors shrink-0">
              💎 كسر زيرو ومستعمل
            </Link>
            <Link href="/shop?category=tablets" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors shrink-0">
              التابلت
            </Link>
            <Link href="/shop?category=headphones" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors shrink-0">
              السماعات
            </Link>
            <Link href="/shop?category=chargers-cables" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors shrink-0">
              الشواحن والكابلات
            </Link>
            <Link href="/shop?category=smart-watches" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors shrink-0">
              الساعات الذكية
            </Link>
            <Link href="/shop?category=cases-protection" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors shrink-0">
              الجرابات والحماية
            </Link>
            <Link href="/shop?category=accessories" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors shrink-0">
              إكسسوارات أخرى
            </Link>
          </div>

          <div className="h-4 w-px bg-white/15 mx-1 shrink-0" aria-hidden="true" />

          <div className="flex items-center gap-2 shrink-0 mr-auto">
            <Link
              href="/why-us"
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-400 hover:text-white transition-colors shrink-0"
            >
              لماذا نحن؟
            </Link>
            <Link
              href="/customer-service"
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-400 hover:text-white transition-colors shrink-0"
            >
              خدمة العملاء والضمان
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
