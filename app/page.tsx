"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "./context/CartContext";
import ProductCard from "./components/ProductCard";
import MarqueeTicker from "./components/MarqueeTicker";
import CollectionCTA from "./components/CollectionCTA";
import WhatsAppSection from "./components/WhatsAppSection";
import GuaranteesSection from "./components/GuaranteesSection";
import ReviewsSection from "./components/ReviewsSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const { products, openCheckoutWithProduct } = useCart();

  // Countdown timer for today's deal
  const [timeLeft, setTimeLeft] = useState({ hours: 14, mins: 32, secs: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let s = prev.secs - 1;
        let m = prev.mins;
        let h = prev.hours;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 23; }
        return { hours: h, mins: m, secs: s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter 4 Best Sellers
  const bestSellers = products
    .filter(p => p.tag === "best" || (p.badge_text && (p.badge_text.includes("طلباً") || p.badge_text.includes("مبيعاً"))))
    .slice(0, 4);
  const displayBestSellers = bestSellers.length > 0 ? bestSellers : products.slice(0, 4);

  // Filter Used & Like-New devices
  const usedAndLikeNew = products
    .filter(p => p.condition === "كسر زيرو" || p.condition === "مستعمل")
    .slice(0, 4);
  const displayUsed = usedAndLikeNew.length > 0 ? usedAndLikeNew : products.filter(p => p.category_id === "phones").slice(0, 4);

  // Filter 4 Top Rated / Flagships
  const topRated = [...products]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);
  const displayTopRated = topRated.length > 0 ? topRated : products.slice(2, 6);

  // Featured Deal product
  const dealProduct = products.find(p => p.id === "iphone-16-pro-max") || products[0];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0d1210] via-[#141c18] to-[#0d1210] text-white py-14 sm:py-20 lg:py-28" id="hero">
        
        {/* Ambient Glows */}
        <div className="absolute top-1/4 -right-24 w-96 h-96 rounded-full bg-lime-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Copy Column */}
            <div className="lg:col-span-7 space-y-5 text-right">
              <Badge className="bg-lime-400/15 text-lime-400 border border-lime-400/30 text-xs font-bold px-3 py-1 gap-2">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                <span>أحدث الهواتف الذكية والإلكترونيات لعام 2026</span>
              </Badge>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.2] tracking-tight">
                هواتف ذكية تصنع الفرق،<br />
                <span className="text-lime-400">وقوة تليق باختياراتك</span>
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed max-w-xl">
                استكشف عالم Mobile Store المتخصص في أحدث هواتف آيفون، سامسونج، شاومي، وأجهزة التابلت والسماعات الأصلية. مع ميزة الفحص والمعاينة الكاملة قبل الدفع، وضمان محلي معتمد مع استبدال فوري.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2 flex-wrap">
                <Button asChild className="bg-lime-400 hover:bg-lime-500 text-black font-extrabold h-12 px-7 rounded-full shadow-lg shadow-lime-400/25 text-sm sm:text-base cursor-pointer">
                  <Link href="/shop" className="flex items-center gap-2">
                    <span>تصفح كل الأجهزة</span>
                    <span>←</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold h-12 px-6 rounded-full text-sm sm:text-base cursor-pointer">
                  <a href="#deal">
                    عروض التخفيض الحصرية 🔥
                  </a>
                </Button>
              </div>

              {/* Social Proof */}
              <div className="pt-4 flex items-center gap-3 border-t border-white/10 text-xs text-neutral-300">
                <span className="text-amber-400 font-bold tracking-wider text-sm">★★★★★</span>
                <div>
                  <b className="text-white">4.9 / 5 تقييم العملاء</b> · أكثر من 18,500 عميل راضٍ في جميع محافظات مصر
                </div>
              </div>
            </div>

            {/* Visual Showcase Column */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-72 sm:w-80 lg:w-96 aspect-square flex items-center justify-center">
                {/* Backdrop decorative rings */}
                <div className="absolute inset-0 rounded-full border border-lime-400/20 animate-spin-slow pointer-events-none" />
                <div className="absolute inset-6 rounded-full bg-lime-400/10 blur-2xl pointer-events-none" />

                {/* Floating Chip Top */}
                <div className="absolute -top-3 -right-2 z-20 flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-black/80 border border-white/15 backdrop-blur-md shadow-xl text-xs">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-lime-400/20 text-lime-400 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="font-extrabold text-white text-[10px] sm:text-[11px]">ضمان معتمد 12-24 شهر</div>
                    <div className="text-[8px] sm:text-[9px] text-neutral-400">استبدال فوري بدون تعقيد</div>
                  </div>
                </div>

                {/* Smartphone Concept Image */}
                <div className="relative z-10 w-full h-full p-4 flex items-center justify-center">
                  <img
                    src="/img/iphone-16-pro-max.png"
                    alt="آيفون 16 برو ماكس"
                    className="max-h-full max-w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/img/mobile-concept-01.png";
                    }}
                  />
                </div>

                {/* Floating Chip Bottom */}
                <div className="absolute -bottom-3 -left-2 z-20 flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-black/80 border border-white/15 backdrop-blur-md shadow-xl text-xs">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-lime-400/20 text-lime-400 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 6v6l4 2"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="font-extrabold text-white text-[10px] sm:text-[11px]">شحن سريع 24-48 ساعة</div>
                    <div className="text-[8px] sm:text-[9px] text-neutral-400">معاينة وفحص دقيق قبل الدفع</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <MarqueeTicker />

      {/* 1. Categories Bento Grid */}
      <section className="py-14 sm:py-20 bg-white" id="categories">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <Badge variant="outline" className="mb-2 text-xs font-bold text-emerald-800 border-emerald-300 bg-emerald-50">
                أقسام الأجهزة والإلكترونيات
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight">
                اختر فئتك المفضلة من <span className="text-emerald-700">موبايل ستور</span>
              </h2>
            </div>
            <Button asChild variant="outline" className="border-neutral-300 rounded-full h-10 px-5 text-xs font-bold self-start sm:self-auto cursor-pointer">
              <Link href="/shop" className="flex items-center gap-2">
                <span>عرض كل الأقسام</span>
                <span>←</span>
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                href: "/shop?category=phones",
                img: "/img/iphone-16-pro-max.png",
                tag: "أحدث هواتف 2026",
                title: "الهواتف الذكية (الموبايلات)",
                sub: "آيفون، سامسونج، شاومي، وأقوى الإصدارات"
              },
              {
                href: "/shop?condition=used",
                img: "/img/samsung-s24-ultra.png",
                tag: "توفير حتى 35%",
                title: "كسر زيرو ومستعمل",
                sub: "أجهزة بحالة المصنع مفحوصة 100% وبطاريات 95%+"
              },
              {
                href: "/shop?category=tablets",
                img: "/img/ipad-pro-m4.png",
                tag: "إنتاجية ودراسة",
                title: "التابلت والآيباد",
                sub: "آيباد برو M4 وجالاكسي تاب بشاشات سينمائية"
              },
              {
                href: "/shop?category=headphones",
                img: "/img/airpods-pro-2.png",
                tag: "عزل ضوضاء متطور",
                title: "السماعات وإيربودز",
                sub: "AirPods Pro 2 وSony وعزل ضوضاء فائق"
              }
            ].map((cat, idx) => (
              <Link
                key={idx}
                href={cat.href}
                className="group relative rounded-3xl overflow-hidden bg-neutral-100 p-6 flex flex-col justify-between min-h-[260px] border border-neutral-200 hover:border-lime-400 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative z-10 space-y-1">
                  <span className="text-[11px] font-extrabold text-emerald-800 bg-white/80 px-2.5 py-1 rounded-full shadow-xs inline-block">
                    {cat.tag}
                  </span>
                  <h3 className="font-extrabold text-base sm:text-lg text-neutral-900 group-hover:text-emerald-700 transition-colors pt-1">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {cat.sub}
                  </p>
                </div>

                <div className="relative mt-4 flex items-center justify-center h-32">
                  <img
                    src={cat.img}
                    alt={cat.title}
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/img/mobile-concept-01.png";
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 2. Best Sellers Section */}
      <section className="py-14 sm:py-20 bg-neutral-100/70" id="best-sellers">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <Badge variant="outline" className="mb-2 text-xs font-bold text-emerald-800 border-emerald-300 bg-emerald-50">
                الأعلى مبيعاً هذا الشهر
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight">
                الأجهزة <span className="text-emerald-700">الأكثر طلباً</span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-lg">
                الهواتف والأجهزة الأكثر طلباً واختياراً من عملائنا مع تقييمات إيجابية ممتازة وفحص كامل قبل الاستلام.
              </p>
            </div>
            <Button asChild variant="outline" className="border-neutral-300 rounded-full h-10 px-5 text-xs font-bold self-start sm:self-auto cursor-pointer">
              <Link href="/shop?filter=bestseller" className="flex items-center gap-2">
                <span>عرض المزيد من الأكثر مبيعاً</span>
                <span>←</span>
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {displayBestSellers.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

        </div>
      </section>

      {/* 3. Used & Like-New Phones Showcase */}
      <section className="py-14 sm:py-20 bg-white" id="used-phones">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <Badge variant="outline" className="mb-2 text-xs font-bold text-sky-800 border-sky-300 bg-sky-50">
                قسم كسر زيرو المعتمد 💎
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight">
                أجهزة كسر زيرو ومستعملة <span className="text-sky-700">بضمان وفحص شامل</span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-lg">
                أجهزة أصلية لم تُفتح، بطاريات تفوق 95%، شاشات أصلية 100%، مع إمكانية الفحص الكامل أمام المندوب وضمان استبدال.
              </p>
            </div>
            <Button asChild variant="outline" className="border-neutral-300 rounded-full h-10 px-5 text-xs font-bold self-start sm:self-auto cursor-pointer">
              <Link href="/shop?condition=used" className="flex items-center gap-2">
                <span>عرض كل أجهزة كسر زيرو</span>
                <span>←</span>
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {displayUsed.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

        </div>
      </section>

      {/* 4. Trending & Flagships Section */}
      <section className="py-14 sm:py-20 bg-neutral-100/70" id="trending">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <Badge variant="outline" className="mb-2 text-xs font-bold text-emerald-800 border-emerald-300 bg-emerald-50">
                إصدارات رائدة مختارة بعناية
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight">
                الهواتف والأجهزة <span className="text-emerald-700">الأعلى تقييماً</span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-lg">
                موديلات نالت إعجاب عشاق التكنولوجيا بفضل المعالجات الجبارة وجودة الكاميرات والبطاريات القوية.
              </p>
            </div>
            <Button asChild variant="outline" className="border-neutral-300 rounded-full h-10 px-5 text-xs font-bold self-start sm:self-auto cursor-pointer">
              <Link href="/shop?filter=top-rated" className="flex items-center gap-2">
                <span>عرض المزيد من الأعلى تقييماً</span>
                <span>←</span>
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {displayTopRated.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

        </div>
      </section>

      {/* 5. Explore Collections Full Banner CTA */}
      <CollectionCTA />

      {/* 6. Deal of the Day Countdown */}
      <section className="py-14 sm:py-20 bg-[#0d1210] text-white" id="deal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <Badge className="bg-lime-400/20 text-lime-400 border-lime-400/30 text-xs font-bold px-3 py-1">
                عرض اليوم الحصري لفترة محدودة 🔥
              </Badge>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                {dealProduct?.name || "آيفون 16 برو ماكس (iPhone 16 Pro Max)"}<br />
                <span className="text-lime-400">بخصم استثنائي 5,500 ج.م</span>
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
                احصل على أقوى هواتف أبل بهيكل التيتانيوم الصحراوي ومعالج A18 Pro الجبار، مع شحن مجاني لكافة المحافظات وجراب حماية ماج سيف أصلي مجاناً!
              </p>

              {/* Countdown timer */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/15">
                  <span className="text-xl sm:text-2xl font-black text-lime-400">{String(timeLeft.hours).padStart(2, "0")}</span>
                  <span className="text-[10px] text-neutral-400">ساعة</span>
                </div>
                <span className="text-xl font-bold text-neutral-500">:</span>
                <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/15">
                  <span className="text-xl sm:text-2xl font-black text-lime-400">{String(timeLeft.mins).padStart(2, "0")}</span>
                  <span className="text-[10px] text-neutral-400">دقيقة</span>
                </div>
                <span className="text-xl font-bold text-neutral-500">:</span>
                <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/15">
                  <span className="text-xl sm:text-2xl font-black text-lime-400">{String(timeLeft.secs).padStart(2, "0")}</span>
                  <span className="text-[10px] text-neutral-400">ثانية</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-3 pt-4 flex-wrap">
                <Button
                  className="w-full sm:w-auto bg-lime-400 hover:bg-lime-500 text-black font-extrabold h-12 px-7 rounded-full shadow-lg shadow-lime-400/20 text-sm sm:text-base cursor-pointer"
                  onClick={() => {
                    if (dealProduct) openCheckoutWithProduct(dealProduct);
                  }}
                >
                  اطلب العرض الآن بـ {Number(dealProduct?.price || 78500).toLocaleString("ar-EG")} ج.م
                </Button>

                <Button asChild variant="outline" className="w-full sm:w-auto border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold h-12 px-6 rounded-full text-sm cursor-pointer">
                  <Link href={`/product/${dealProduct?.id || 'iphone-16-pro-max'}`}>
                    تفاصيل الجهاز كاملة
                  </Link>
                </Button>
              </div>

            </div>

            {/* Poster with Stamp */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                {/* Save discount badge */}
                <div className="absolute top-2 left-2 z-20 flex flex-col items-center justify-center w-16 h-16 rounded-full bg-rose-600 text-white font-black text-xs shadow-xl rotate-12">
                  <span>وفر</span>
                  <span className="text-[10px]">5,500 ج.م</span>
                </div>

                <div className="absolute inset-0 rounded-full bg-lime-400/20 blur-2xl pointer-events-none" />
                <img
                  src={dealProduct?.image || "/img/iphone-16-pro-max.png"}
                  alt={dealProduct?.name || "عرض اليوم"}
                  className="relative z-10 w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/img/mobile-concept-01.png";
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. WhatsApp VIP Concierge Support & Order */}
      <WhatsAppSection />

      {/* 8. Guarantees Section */}
      <GuaranteesSection />

      {/* 9. Real Customer Reviews */}
      <ReviewsSection />
    </>
  );
}
