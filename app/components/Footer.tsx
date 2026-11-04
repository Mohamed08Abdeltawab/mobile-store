"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function Footer() {
  const { setIsWishlistOpen } = useCart();
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201065712366";

  return (
    <footer className="bg-[#090d0b] text-neutral-400 border-t border-white/10 pt-14 pb-24 md:pb-14" id="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-white/10">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link className="flex items-center gap-2.5 group" href="/">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-lime-400 text-black shadow-md shadow-lime-400/20 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="3" ry="3"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
              </span>
              <span className="flex flex-col">
                <span className="font-extrabold text-2xl text-white tracking-wider leading-none">
                  MOBILE<span className="text-lime-400">STORE</span>
                </span>
                <span className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase">
                  موبايلات · تابلت · إلكترونيات
                </span>
              </span>
            </Link>

            <p className="text-xs leading-relaxed text-neutral-400">
              متجر Mobile Store المتخصص في بيع الهواتف الذكية والأجهزة اللوحية والإكسسوارات الأصلية. نحرص على تقديم أعلى معايير الجودة، المعاينة والفحص الكامل قبل الدفع، وضمان محلي معتمد مع استبدال فوري.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-4">
              أقسام وتشكيلات المتجر
            </h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-lime-400 transition-colors">الرئيسية</Link></li>
              <li><Link href="/shop" className="hover:text-lime-400 transition-colors">كل الأجهزة والإلكترونيات</Link></li>
              <li><Link href="/shop?filter=bestseller" className="hover:text-lime-400 transition-colors">🔥 الأكثر طلباً ومبيعاً</Link></li>
              <li><Link href="/shop?category=phones" className="hover:text-lime-400 transition-colors">الهواتف الذكية (الموبايلات)</Link></li>
              <li><Link href="/shop?condition=used" className="hover:text-lime-400 transition-colors text-sky-400 font-bold">هواتف كسر زيرو ومستعملة 💎</Link></li>
              <li><Link href="/shop?category=tablets" className="hover:text-lime-400 transition-colors">التابلت والآيباد</Link></li>
              <li><Link href="/shop?category=headphones" className="hover:text-lime-400 transition-colors">السماعات وإيربودز</Link></li>
              <li><Link href="/shop?category=chargers-cables" className="hover:text-lime-400 transition-colors">الشواحن والباوربانك</Link></li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsWishlistOpen(true)}
                  className="hover:text-lime-400 transition-colors text-right cursor-pointer"
                >
                  قائمة المفضلة ❤️
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-4">
              خدمة العملاء والضمان
            </h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/customer-service" className="hover:text-lime-400 transition-colors font-bold text-white">مركز خدمة العملاء والضمان المعتمد</Link></li>
              <li><Link href="/why-us" className="hover:text-lime-400 transition-colors font-bold text-white">لماذا موبايل ستور؟ (الفحص قبل الدفع)</Link></li>
              <li><a href={`tel:+${waNumber}`} className="hover:text-lime-400 transition-colors">هاتف المبيعات: 0106 571 2366</a></li>
              <li><a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="hover:text-lime-400 transition-colors">المحادثة والمساعدة عبر واتساب</a></li>
              <li><Link href="/admin" className="hover:text-lime-400 transition-colors">لوحة تحكم الإدارة (Dashboard)</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-4">
              بيانات التواصل
            </h3>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>التجمع الخامس، شارع التسعين، القاهرة، جمهورية مصر العربية</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>هاتف المبيعات: 0106 571 2366</span>
              </li>
              <li className="flex items-center gap-2">
                <span>💬</span>
                <span>واتساب المبيعات: 0106 571 2366</span>
              </li>
              <li className="flex items-center gap-2">
                <span>⏰</span>
                <span>يومياً من 10:00 صباحاً حتى 11:00 مساءً</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © 2026 Mobile Store — جميع الحقوق محفوظة. جميع الأجهزة أصلية 100% والمعاينة والفحص قبل الاستلام.
          </div>

          <div className="flex items-center gap-3 text-neutral-400 font-bold flex-wrap">
            <span>الدفع عند الاستلام بعد المعاينة</span> · <span>إنستاباي / InstaPay</span> · <span>محافظ إلكترونية (Vodafone Cash)</span> · <span>فيزا وماستركارد</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
