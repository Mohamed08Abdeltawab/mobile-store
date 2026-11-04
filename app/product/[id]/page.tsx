"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useCart, GOVERNORATES } from "../../context/CartContext";
import ProductCard from "../../components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "../../../lib/types";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const productId = unwrappedParams.id;

  const {
    products,
    addToCart,
    openCheckoutWithProduct,
    sendDirectWhatsApp,
    isWishlisted,
    toggleWishlist
  } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedGov, setSelectedGov] = useState(GOVERNORATES[0]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    // Try finding in products from context
    const found = products.find(p => p.id === productId);
    if (found) {
      setProduct(found);
      setLoading(false);
    } else {
      // Fetch from API
      fetch(`/api/products/${productId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.product) {
            setProduct(data.product);
          } else {
            setProduct(null);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [productId, products]);

  // Robust image extraction helper
  const images = (() => {
    if (!product) return ["/img/iphone-16-pro-max.png"];
    let list: string[] = [];

    if (Array.isArray(product.images)) {
      list = product.images;
    } else if (typeof product.images === "string") {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) list = parsed;
        else if (typeof parsed === "string") list = [parsed];
      } catch {
        list = [product.image];
      }
    }

    list = list
      .filter(item => typeof item === "string" && item.trim().length > 0)
      .map(item => item.trim());

    if (product.image && typeof product.image === "string" && product.image.trim()) {
      const trimmed = product.image.trim();
      if (!list.includes(trimmed)) {
        list.unshift(trimmed);
      }
    }

    list = Array.from(new Set(list));
    return list.length > 0 ? list : ["/img/iphone-16-pro-max.png"];
  })();

  // Reset or clamp image index
  useEffect(() => {
    if (activeImgIndex >= images.length) {
      setActiveImgIndex(0);
    }
  }, [images.length, activeImgIndex]);

  // Image flipping functions
  const handleNextImage = () => {
    if (images.length <= 1) return;
    setActiveImgIndex(prev => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    if (images.length <= 1) return;
    setActiveImgIndex(prev => (prev - 1 + images.length) % images.length);
  };

  // Keyboard navigation
  useEffect(() => {
    if (images.length <= 1 && !isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((document.activeElement as HTMLElement)?.tagName)) return;

      if (e.key === "Escape" && isLightboxOpen) {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        // In Arabic RTL, left arrow moves to next image
        handleNextImage();
      } else if (e.key === "ArrowRight") {
        // In Arabic RTL, right arrow moves to previous image
        handlePrevImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, isLightboxOpen]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (images.length <= 1) return;
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || images.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
    setTouchStartX(null);
  };

  if (loading) {
    return (
      <div className="py-28 text-center space-y-3">
        <div className="text-4xl animate-bounce">📱</div>
        <h3 className="font-bold text-lg text-neutral-800">جاري تحميل مواصفات الجهاز...</h3>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-28 text-center max-w-md mx-auto px-4 space-y-4">
        <h2 className="text-2xl font-black text-neutral-900">الجهاز غير موجود أو تم حذفه</h2>
        <p className="text-xs text-neutral-500">قد يكون الرابط خاطئاً أو تم تعديل معرف المنتج</p>
        <Button asChild className="bg-lime-400 hover:bg-lime-500 text-black font-extrabold rounded-full px-6">
          <Link href="/shop">
            العودة لكتالوج الأجهزة
          </Link>
        </Button>
      </div>
    );
  }

  const discount = Boolean(product.old_price && Number(product.old_price) > Number(product.price))
    ? Math.round(((Number(product.old_price) - Number(product.price)) / Number(product.old_price)) * 100)
    : 0;

  const isFav = isWishlisted(product.id);
  const colors = product.colors || [];
  const currentColor = selectedColor || (colors[0] ? colors[0].color_name : "");

  // Related products
  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.category_id === product.category_id || p.brand_id === product.brand_id))
    .slice(0, 4);

  const isUsedOrLikeNew = product.condition === "كسر زيرو" || product.condition === "مستعمل";

  return (
    <div className="pb-24">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-400 flex-wrap" aria-label="مسار التنقل">
          <Link href="/" className="hover:text-emerald-700 transition-colors">الرئيسية</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-emerald-700 transition-colors">المتجر</Link>
          <span>/</span>
          <Link href={`/shop?category=${encodeURIComponent(product.category_id || product.cat)}`} className="hover:text-emerald-700 transition-colors">
            {product.cat}
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-bold truncate max-w-xs">{product.name}</span>
        </nav>
      </div>

      {/* Main Product Layout */}
      <section className="pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Gallery Column */}
            <div className="lg:col-span-6 space-y-4">
              <div
                className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-neutral-200/80 p-6 flex items-center justify-center shadow-xs select-none touch-pan-y group"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  key={activeImgIndex}
                  src={images[activeImgIndex] || product.image || "/img/mobile-concept-01.png"}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-all duration-300 hover:scale-105 animate-in fade-in zoom-in-95 cursor-zoom-in"
                  onClick={() => setIsLightboxOpen(true)}
                  title="انقر لتكبير ومعاينة الصورة كاملة"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/img/mobile-concept-01.png";
                  }}
                />

                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-10 pointer-events-none">
                  {product.condition && (
                    <Badge className="bg-lime-400 text-black font-extrabold text-xs hover:bg-lime-400 shadow-xs border-0">
                      {product.condition}
                    </Badge>
                  )}
                  {discount > 0 && (
                    <Badge className="bg-rose-600 text-white font-bold text-xs hover:bg-rose-600 shadow-xs border-0">
                      خصم {discount}%
                    </Badge>
                  )}
                </div>

                {/* Top Action Buttons (Wishlist + Zoom Lightbox) */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <button
                    type="button"
                    className={`flex items-center justify-center w-11 h-11 rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:scale-110 cursor-pointer border border-neutral-200/50 ${
                      isFav ? "text-rose-500" : "text-neutral-400 hover:text-neutral-700"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    aria-label="المفضلة"
                    title={isFav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="flex items-center justify-center w-11 h-11 rounded-full bg-white/90 shadow-md backdrop-blur-sm text-neutral-600 hover:text-black transition-all hover:scale-110 cursor-pointer border border-neutral-200/50"
                    onClick={() => setIsLightboxOpen(true)}
                    aria-label="تكبير الصورة"
                    title="تكبير ومعاينة الصورة كاملة"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      <line x1="11" y1="8" x2="11" y2="14"></line>
                      <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                  </button>
                </div>

                {/* Navigation arrows if multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-neutral-800 hover:text-black shadow-lg shadow-black/10 border border-neutral-200 backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer z-10"
                      onClick={handlePrevImage}
                      aria-label="الصورة السابقة"
                      title="الصورة السابقة"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>

                    <button
                      type="button"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-neutral-800 hover:text-black shadow-lg shadow-black/10 border border-neutral-200 backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer z-10"
                      onClick={handleNextImage}
                      aria-label="الصورة التالية"
                      title="الصورة التالية"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>

                    {/* Counter Pill */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/85 hover:bg-neutral-900 text-white backdrop-blur-md text-xs font-bold shadow-lg transition-all border border-white/10">
                      <span className="text-[11px] tracking-wider select-none px-1">
                        صورة {activeImgIndex + 1} من {images.length}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails Strip */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto py-2 px-1 scrollbar-thin">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 p-1.5 bg-white shrink-0 transition-all duration-200 cursor-pointer overflow-hidden ${
                        activeImgIndex === idx
                          ? "border-lime-500 ring-2 ring-lime-400/50 scale-105 shadow-md"
                          : "border-neutral-200 opacity-60 hover:opacity-100 hover:border-neutral-400"
                      }`}
                      onClick={() => setActiveImgIndex(idx)}
                      aria-label={`عرض صورة ${idx + 1}`}
                    >
                      <img
                        src={imgUrl || "/img/mobile-concept-01.png"}
                        alt={`${product.name} - ${idx + 1}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/img/mobile-concept-01.png";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details & Purchase Column */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Category, Brand, Stock */}
              <div className="flex items-center gap-2 flex-wrap">
                {product.brand && (
                  <Badge variant="outline" className="text-xs font-bold text-neutral-800 border-neutral-200 bg-neutral-100">
                    {product.brand}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs font-bold text-neutral-800 border-neutral-200 bg-neutral-100">
                  {product.cat}
                </Badge>
                <span className="text-xs text-emerald-700 font-extrabold flex items-center gap-1 mr-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  متوفر بالمخزن وجاهز للشحن الفوري
                </span>
              </div>

              {/* Title & Sub */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 leading-tight">
                  {product.name}
                </h1>
                {product.sub && (
                  <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                    {product.sub}
                  </p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <span className="text-amber-500 font-bold tracking-wider text-sm">★★★★★</span>
                <span className="font-extrabold text-neutral-900">{product.rating} / 5.0</span>
                <span className="text-neutral-400">({product.reviews} تقييم موثق من المشترين)</span>
              </div>

              {/* Price Box */}
              <div className="p-4 rounded-2xl bg-neutral-100/80 border border-neutral-200 space-y-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-black text-neutral-900">
                    {Number(product.price).toLocaleString("ar-EG")} <span className="text-sm font-bold text-neutral-500">ج.م</span>
                  </span>
                  {Boolean(product.old_price && Number(product.old_price) > Number(product.price)) && (
                    <s className="text-sm text-neutral-400 line-through">
                      {Number(product.old_price).toLocaleString("ar-EG")} ج.م
                    </s>
                  )}
                </div>
                {discount > 0 && (
                  <div className="text-xs font-bold text-emerald-800">
                    🎉 وفرت اليوم {(Number(product.old_price) - Number(product.price)).toLocaleString("ar-EG")} ج.م مع معاينة وفحص مجاني قبل الدفع!
                  </div>
                )}
              </div>

              {/* Color Selector with stock */}
              {colors.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-neutral-800">
                    اللون المتاح: <strong className="text-emerald-800">{currentColor}</strong>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {colors.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedColor(c.color_name)}
                        className={`px-3 py-1.5 rounded-xl border-2 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                          currentColor === c.color_name
                            ? "border-lime-500 bg-lime-400/10 text-black shadow-xs"
                            : "border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-white"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: c.hex_code }}
                        />
                        <span>{c.color_name}</span>
                        {c.quantity !== undefined && (
                          <span className="text-[10px] text-neutral-400">({c.quantity} متبقي)</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Condition Inspection Report (Highlighted for Used / Like-New devices) */}
              {isUsedOrLikeNew && (
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-sky-950 flex items-center gap-1.5">
                      <span>💎</span>
                      <span>تقرير الفحص الفني المعتمد (حالة الجهاز: {product.condition})</span>
                    </span>
                    <span className="text-[10px] font-bold text-sky-700 bg-white px-2 py-0.5 rounded-full border border-sky-200">
                      مفحوص ومضمون
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    {product.specifications?.battery_health && (
                      <div className="p-2 rounded-xl bg-white border border-sky-100">
                        <span className="text-[11px] text-neutral-400 block">صحة البطارية:</span>
                        <strong className="text-emerald-700 font-black">{product.specifications.battery_health}</strong>
                      </div>
                    )}
                    {product.specifications?.screen_condition && (
                      <div className="p-2 rounded-xl bg-white border border-sky-100">
                        <span className="text-[11px] text-neutral-400 block">حالة الشاشة:</span>
                        <strong className="text-neutral-900 font-bold">{product.specifications.screen_condition}</strong>
                      </div>
                    )}
                    {product.specifications?.frame_condition && (
                      <div className="p-2 rounded-xl bg-white border border-sky-100">
                        <span className="text-[11px] text-neutral-400 block">حالة الفريم والشاسيه:</span>
                        <strong className="text-neutral-900 font-bold">{product.specifications.frame_condition}</strong>
                      </div>
                    )}
                    {product.specifications?.repair_history && (
                      <div className="p-2 rounded-xl bg-white border border-sky-100">
                        <span className="text-[11px] text-neutral-400 block">حالة الصيانة والفتح:</span>
                        <strong className="text-emerald-800 font-bold">{product.specifications.repair_history}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Trust Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 text-xs text-emerald-950">
                <div className="flex items-start gap-2.5">
                  <span className="text-base">🔍</span>
                  <div>
                    <strong className="block font-bold">معاينة وفحص قبل الدفع:</strong>
                    <span className="text-[11px] text-emerald-800">افتح العلبة وافحص السيريال والشاشة والبطارية أمام المندوب.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-base">🛡️</span>
                  <div>
                    <strong className="block font-bold">ضمان معتمد:</strong>
                    <span className="text-[11px] text-emerald-800">{product.specifications?.warranty || "ضمان محلي شامل مع استبدال فوري ضد عيوب الصناعة."}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  className="w-full bg-lime-400 hover:bg-lime-500 text-black font-extrabold h-12 rounded-2xl text-base shadow-lg shadow-lime-400/25 transition-transform active:scale-[0.99] gap-2 cursor-pointer"
                  onClick={() => addToCart(product, 1, currentColor ? `لون: ${currentColor}` : "", currentColor)}
                >
                  <svg className="w-5 h-5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>أضف إلى السلة للمعاينة والشراء</span>
                </Button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold h-11 rounded-xl gap-2 shadow-sm cursor-pointer"
                    onClick={() => sendDirectWhatsApp(product)}
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z"></path>
                    </svg>
                    <span>طلب مباشر عبر واتساب</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full text-neutral-900 font-extrabold h-11 rounded-xl border-neutral-300 hover:bg-neutral-100 cursor-pointer"
                    onClick={() => openCheckoutWithProduct(product)}
                  >
                    شراء سريع فوري (معاينة قبل الدفع)
                  </Button>
                </div>
              </div>

              {/* Shipping Calculator */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between gap-3 flex-wrap text-xs font-bold text-neutral-800">
                  <span>🚚 مصاريف ومواعيد الشحن لمحافظتك:</span>
                  <select
                    className="h-10 px-3 rounded-lg border border-neutral-200 bg-white text-xs font-bold text-neutral-800 outline-none cursor-pointer"
                    value={selectedGov.id}
                    onChange={(e) => {
                      const g = GOVERNORATES.find(gov => gov.id === e.target.value);
                      if (g) setSelectedGov(g);
                    }}
                  >
                    {GOVERNORATES.map(gov => (
                      <option key={gov.id} value={gov.id}>{gov.name}</option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  الشحن إلى <strong className="text-neutral-800">{selectedGov.name}</strong> يستغرق <strong className="text-neutral-800">{selectedGov.days}</strong> وقيمته <strong className="text-emerald-700">{selectedGov.shipping === 0 ? "مجاناً" : `${selectedGov.shipping} ج.م`}</strong> (أو مجاني للطلبات فوق 5,000 ج.م).
                </p>
              </div>

            </div>

          </div>

          {/* Technical Specifications Section */}
          <div className="mt-14 pt-10 border-t border-neutral-200">
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 mb-6">
              المواصفات التقنية الكاملة للجهاز
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "الماركة والتصنيف:", val: `${product.brand || "أصلي"} · ${product.cat}` },
                { label: "حالة الجهاز:", val: product.condition || "جديد" },
                product.specifications?.ram ? { label: "الذاكرة العشوائية (RAM):", val: product.specifications.ram } : null,
                product.specifications?.storage ? { label: "سعة التخزين الداخلية:", val: product.specifications.storage } : null,
                product.specifications?.network ? { label: "شبكات الاتصال المدعومة:", val: product.specifications.network } : null,
                product.specifications?.battery_health ? { label: "صحة البطارية:", val: product.specifications.battery_health } : null,
                product.specifications?.warranty ? { label: "مدة ونوع الضمان:", val: product.specifications.warranty } : null,
                product.specifications?.charging_power ? { label: "قدرة الشحن:", val: product.specifications.charging_power } : null,
                product.specifications?.connection_type ? { label: "نوع الاتصال:", val: product.specifications.connection_type } : null,
                product.specifications?.battery_life ? { label: "عمر البطارية:", val: product.specifications.battery_life } : null,
                product.specifications?.compatible_device ? { label: "الأجهزة المتوافقة:", val: product.specifications.compatible_device } : null,
              ].filter(Boolean).map((spec: any, i) => (
                <div key={i} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-neutral-400 block">{spec.label}</span>
                  <span className="text-xs font-bold text-neutral-800 leading-snug block">{spec.val}</span>
                </div>
              ))}
            </div>

            {/* Full Detailed Description */}
            {(product.description || product.overview) && (
              <div className="mt-6 p-6 rounded-3xl bg-neutral-50 border border-neutral-200/80 space-y-2">
                <h3 className="font-extrabold text-sm sm:text-base text-neutral-900">نظرة عامة وشرح تفصيلي</h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                  {product.description || product.overview}
                </p>
              </div>
            )}
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-14 pt-10 border-t border-neutral-200">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <Badge variant="outline" className="mb-2 text-xs font-bold text-emerald-800 border-emerald-300 bg-emerald-50">
                    أجهزة قد تعجبك
                  </Badge>
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900">
                    أجهزة <span className="text-emerald-700">مشابهة</span> من نفس الفئة
                  </h2>
                </div>
                <Button asChild variant="outline" className="border-neutral-300 rounded-full h-10 px-5 text-xs font-bold self-start sm:self-auto cursor-pointer">
                  <Link href="/shop" className="flex items-center gap-2">
                    <span>تصفح كل التشكيلات</span>
                    <span>←</span>
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {relatedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200 select-none"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-sm sm:text-base">{product.name}</span>
              {images.length > 1 && (
                <Badge className="bg-lime-400 text-black font-extrabold text-xs">
                  {activeImgIndex + 1} / {images.length}
                </Badge>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
              aria-label="إغلاق المعاينة"
              title="إغلاق (Esc)"
            >
              ✕
            </button>
          </div>

          {/* Main Lightbox Image View with Large Arrows */}
          <div className="relative flex-1 flex items-center justify-center p-4">
            <img
              src={images[activeImgIndex] || product.image || "/img/mobile-concept-01.png"}
              alt={product.name}
              className="max-h-[75vh] max-w-[90vw] object-contain transition-all duration-300 drop-shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/img/mobile-concept-01.png";
              }}
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 flex items-center justify-center text-xl transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-2xl z-20"
                  aria-label="السابق"
                  title="الصورة السابقة"
                >
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 flex items-center justify-center text-xl transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-2xl z-20"
                  aria-label="التالي"
                  title="الصورة التالية"
                >
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip in Lightbox */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 pt-4 border-t border-white/10">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImgIndex(idx)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 p-1 bg-white/5 transition-all overflow-hidden shrink-0 cursor-pointer ${
                    activeImgIndex === idx
                      ? "border-lime-400 scale-105 shadow-lg shadow-lime-400/20"
                      : "border-white/20 opacity-50 hover:opacity-90"
                  }`}
                  aria-label={`معاينة صورة ${idx + 1}`}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
