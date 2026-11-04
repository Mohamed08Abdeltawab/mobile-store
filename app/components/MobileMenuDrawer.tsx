"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../context/CartContext";

export default function MobileMenuDrawer() {
  const { isMobileMenuOpen, setIsMobileMenuOpen, isAdmin } = useCart();
  const pathname = usePathname();
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201065712366";

  if (!isMobileMenuOpen) return null;

  const categories = [
    { href: "/shop", label: "📱 جميع الأجهزة والمنتجات", badge: null },
    { href: "/shop?filter=bestseller", label: "🔥 الأكثر طلباً ومبيعاً", badge: "مميز" },
    { href: "/shop?category=phones", label: "الهواتف الذكية (الموبايلات)", badge: null },
    { href: "/shop?condition=used", label: "💎 هواتف كسر زيرو ومستعملة", badge: "فحص 100%" },
    { href: "/shop?category=tablets", label: "الأجهزة اللوحية (التابلت والآيباد)", badge: null },
    { href: "/shop?category=headphones", label: "السماعات وإيربودز", badge: null },
    { href: "/shop?category=chargers-cables", label: "الشواحن والكابلات والباوربانك", badge: null },
    { href: "/shop?category=smart-watches", label: "الساعات والأساور الذكية", badge: null },
    { href: "/shop?category=cases-protection", label: "الجرابات واسكرينات الحماية", badge: null },
    { href: "/shop?category=accessories", label: "إكسسوارات إلكترونية أخرى", badge: null },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Drawer Panel (slides from right in RTL) */}
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-[#0d1210] border-l border-white/10 text-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#141c18]">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 group"
          >
            <span className="w-8 h-8 rounded-lg bg-lime-400 text-black flex items-center justify-center font-black text-sm">
              M
            </span>
            <span className="font-extrabold text-base tracking-wider">
              MOBILE<span className="text-lime-400">STORE</span>
            </span>
          </Link>

          <button
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-base cursor-pointer transition-colors"
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="إغلاق القائمة"
          >
            ✕
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 px-3 uppercase tracking-wider block mb-1">
            أقسام المتجر
          </span>

          {categories.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`min-h-[44px] flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                pathname === cat.href ? "bg-white/15 text-lime-400" : "text-neutral-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{cat.label}</span>
              {cat.badge && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-400 font-extrabold">
                  {cat.badge}
                </span>
              )}
            </Link>
          ))}

          <div className="pt-3 mt-3 border-t border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 px-3 uppercase tracking-wider block mb-1">
              خدمة العملاء والإدارة
            </span>

            <Link
              href="/why-us"
              onClick={() => setIsMobileMenuOpen(false)}
              className="min-h-[44px] flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              ⭐ لماذا تشتري من موبايل ستور؟
            </Link>

            <Link
              href="/customer-service"
              onClick={() => setIsMobileMenuOpen(false)}
              className="min-h-[44px] flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              🛡️ الضمان والفحص قبل الدفع
            </Link>

            <Link
              href={isAdmin ? "/admin" : "/admin/login"}
              onClick={() => setIsMobileMenuOpen(false)}
              className="min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-lime-400 hover:bg-lime-400/10 transition-colors"
            >
              <span>🔐</span>
              <span>{isAdmin ? "لوحة تحكم المشرف (Dashboard)" : "تسجيل دخول المشرف"}</span>
            </Link>
          </div>
        </div>

        {/* WhatsApp Direct Action at Bottom */}
        <div className="p-4 border-t border-white/10 bg-[#121815]">
          <a
            href={`https://wa.me/${waNumber}?text=${encodeURIComponent("مرحباً، أود الاستفسار عن عروض الأجهزة")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
          >
            <span>💬</span>
            <span>تواصل مباشر عبر واتساب VIP</span>
          </a>
        </div>

      </aside>
    </div>
  );
}
