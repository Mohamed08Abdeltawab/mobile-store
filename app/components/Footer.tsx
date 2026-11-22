"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "./icons/SocialIcons";

export default function Footer() {
  const { setIsWishlistOpen, settings, isSettingsLoaded } = useCart();
  const waNumber = settings?.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201131350988";
  const storeName = settings?.store_name || "MOBILE STORE";
  const tagline = settings?.tagline || "موبايلات · تابلت · إلكترونيات";
  const description = settings?.description || "متجر Mobile Store المتخصص في بيع الهواتف الذكية والأجهزة اللوحية والإكسسوارات الأصلية. نحرص على تقديم أعلى معايير الجودة، المعاينة والفحص الكامل قبل الدفع، وضمان محلي معتمد مع استبدال فوري.";
  const addressText = settings?.address_text || "التجمع الخامس، شارع التسعين، القاهرة، جمهورية مصر العربية";
  const phoneNumber = settings?.phone_number || "0106 571 2366";
  const salesHours = settings?.sales_hours || "يومياً من 10:00 صباحاً حتى 11:00 مساءً";

  return (
    <footer
      className="bg-[#090d0b] text-neutral-400 border-t border-white/10 pt-14 pb-24 md:pb-14"
      id="footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link className="flex items-center gap-2.5 group" href="/">
              {!isSettingsLoaded ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 animate-pulse shrink-0" />
                  <div className="flex flex-col gap-1.5">
                    <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
                    <div className="h-2.5 w-20 bg-white/5 rounded animate-pulse" />
                  </div>
                </div>
              ) : settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={storeName}
                  className="h-10 max-w-[170px] object-contain"
                />
              ) : (
                <>
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-lime-400 text-black shadow-md shadow-lime-400/20 group-hover:scale-105 transition-transform">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="5" y="2" width="14" height="20" rx="3" ry="3"></rect>
                      <line x1="12" y1="18" x2="12.01" y2="18"></line>
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-extrabold text-2xl text-white tracking-wider leading-none">
                      {storeName}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase">
                      {tagline}
                    </span>
                  </span>
                </>
              )}
            </Link>

            {!isSettingsLoaded ? (
              <div className="space-y-1.5 pt-1">
                <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-white/5 rounded animate-pulse" />
              </div>
            ) : (
              <p className="text-xs leading-relaxed text-neutral-400">
                {description}
              </p>
            )}

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-neutral-300 block mb-2">تابعنا وتواصل معنا:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {settings?.social_facebook_enabled && settings?.social_facebook && (
                  <a
                    href={settings.social_facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#1877F2]/20 border border-white/10 hover:border-[#1877F2]/40 text-neutral-300 hover:text-[#1877F2] flex items-center justify-center transition-all hover:scale-105 shadow-sm"
                    title="فيسبوك"
                  >
                    <FacebookIcon className="w-4 h-4 fill-current" />
                  </a>
                )}
                {settings?.social_instagram_enabled && settings?.social_instagram && (
                  <a
                    href={settings.social_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-neutral-300 hover:text-rose-400 flex items-center justify-center transition-all hover:scale-105 shadow-sm"
                    title="إنستجرام"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                )}
                {settings?.social_tiktok_enabled && settings?.social_tiktok && (
                  <a
                    href={settings.social_tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/20 border border-white/10 hover:border-white/30 text-neutral-300 hover:text-white flex items-center justify-center transition-all hover:scale-105 shadow-sm"
                    title="تيك توك"
                  >
                    <TikTokIcon className="w-4 h-4 fill-current" />
                  </a>
                )}
                {settings?.whatsapp_enabled && (
                  <a
                    href={`https://wa.me/${waNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] flex items-center justify-center transition-all hover:scale-105 shadow-sm"
                    title="واتساب"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-current" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-4">
              أقسام وتشكيلات المتجر
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/"
                  prefetch={false}
                  className="hover:text-lime-400 transition-colors"
                >
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  prefetch={false}
                  className="hover:text-lime-400 transition-colors"
                >
                  كل الأجهزة والإلكترونيات
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?filter=bestseller"
                  prefetch={false}
                  className="hover:text-lime-400 transition-colors"
                >
                  🔥 الأكثر طلباً ومبيعاً
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=phones"
                  prefetch={false}
                  className="hover:text-lime-400 transition-colors"
                >
                  الهواتف الذكية (الموبايلات)
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?condition=used"
                  prefetch={false}
                  className="hover:text-lime-400 transition-colors text-sky-400 font-bold"
                >
                  هواتف كسر زيرو ومستعملة 💎
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=tablets"
                  prefetch={false}
                  className="hover:text-lime-400 transition-colors"
                >
                  التابلت والآيباد
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=headphones"
                  prefetch={false}
                  className="hover:text-lime-400 transition-colors"
                >
                  السماعات وإيربودز
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=chargers-cables"
                  prefetch={false}
                  className="hover:text-lime-400 transition-colors"
                >
                  الشواحن والباوربانك
                </Link>
              </li>
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
              <li>
                <Link
                  href="/customer-service"
                  prefetch={false}
                  className="hover:text-lime-400 transition-colors font-bold text-white"
                >
                  مركز خدمة العملاء والضمان المعتمد
                </Link>
              </li>
              <li>
                <Link
                  href="/why-us"
                  prefetch={false}
                  className="hover:text-lime-400 transition-colors font-bold text-white"
                >
                  لماذا موبايل ستور؟ (الفحص قبل الدفع)
                </Link>
              </li>
              <li>
                <a
                  href={`tel:+${waNumber}`}
                  className="hover:text-lime-400 transition-colors"
                >
                  هاتف المبيعات: 0106 571 2366
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-lime-400 transition-colors"
                >
                  المحادثة والمساعدة عبر واتساب
                </a>
              </li>
              <li>
                <Link
                  href="/admin"
                  prefetch={false}
                  className="hover:text-lime-400 transition-colors"
                >
                  لوحة تحكم الإدارة (Dashboard)
                </Link>
              </li>
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
                <span>{addressText}</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>هاتف المبيعات: {phoneNumber}</span>
              </li>
              <li className="flex items-center gap-2">
                <span>💬</span>
                <span>واتساب المبيعات: {waNumber}</span>
              </li>
              <li className="flex items-center gap-2">
                <span>⏰</span>
                <span>{salesHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()} {storeName} — جميع الحقوق محفوظة. جميع الأجهزة أصلية 100%
            والمعاينة والفحص قبل الاستلام.
          </div>

          <div className="flex items-center gap-2.5 text-neutral-400 font-bold flex-wrap">
            {settings?.payment_cod_enabled && (
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-lime-400">
                الدفع عند الاستلام بعد المعاينة 💵
              </span>
            )}
            {settings?.payment_instapay_enabled && (
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-purple-400">
                إنستاباي / InstaPay ⚡
              </span>
            )}
            {settings?.payment_vodafone_cash_enabled && (
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-red-400">
                فودافون كاش (Vodafone Cash) 📱
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
