"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PREDEFINED_COLORS } from "../../lib/types";

function ShopContent() {
  const { products, categories, brands } = useCart();
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get("category");
  const conditionParam = searchParams.get("condition");
  const brandParam = searchParams.get("brand");
  const filterParam = searchParams.get("filter");
  const searchUrlParam = searchParams.get("search");

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeCondition, setActiveCondition] = useState<string>("all");
  const [activeBrand, setActiveBrand] = useState<string>("all");
  const [activeRam, setActiveRam] = useState<string>("all");
  const [activeStorage, setActiveStorage] = useState<string>("all");
  const [activeColor, setActiveColor] = useState<string>("all");
  const [activeSort, setActiveSort] = useState<string>("featured");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sync with searchParams on load
  useEffect(() => {
    if (categoryParam) {
      if (categoryParam === "phones" || categoryParam.includes("موبايل")) setActiveCategory("phones");
      else if (categoryParam === "tablets" || categoryParam.includes("تابلت")) setActiveCategory("tablets");
      else if (categoryParam === "headphones" || categoryParam.includes("سماع")) setActiveCategory("headphones");
      else if (categoryParam === "chargers-cables" || categoryParam.includes("شواحن")) setActiveCategory("chargers-cables");
      else if (categoryParam === "smart-watches" || categoryParam.includes("ساعات")) setActiveCategory("smart-watches");
      else if (categoryParam === "cases-protection" || categoryParam.includes("جراب")) setActiveCategory("cases-protection");
      else if (categoryParam === "accessories" || categoryParam.includes("إكسسوار")) setActiveCategory("accessories");
      else setActiveCategory(categoryParam);
    }

    if (conditionParam) {
      if (conditionParam === "used" || conditionParam === "كسر زيرو") setActiveCondition("used-or-like-new");
      else if (conditionParam === "new" || conditionParam === "جديد") setActiveCondition("جديد");
      else setActiveCondition(conditionParam);
    }

    if (brandParam) {
      setActiveBrand(brandParam);
    }

    if (filterParam === "bestseller") {
      setActiveSort("bestseller");
    } else if (filterParam === "top-rated") {
      setActiveSort("rating");
    }

    if (searchUrlParam) {
      setSearchQuery(searchUrlParam);
    }
  }, [categoryParam, conditionParam, brandParam, filterParam, searchUrlParam]);

  // Filtering
  const filtered = useMemo(() => {
    let list = [...products];

    // Category filter
    if (activeCategory !== "all") {
      list = list.filter(p => {
        return p.category_id === activeCategory || (p.cat && p.cat.includes(activeCategory));
      });
    }

    // Condition filter
    if (activeCondition !== "all") {
      if (activeCondition === "used-or-like-new") {
        list = list.filter(p => p.condition === "كسر زيرو" || p.condition === "مستعمل");
      } else {
        list = list.filter(p => p.condition === activeCondition);
      }
    }

    // Brand filter
    if (activeBrand !== "all") {
      list = list.filter(p => {
        return (p.brand_id && p.brand_id.toLowerCase() === activeBrand.toLowerCase()) ||
               (p.brand && p.brand.toLowerCase() === activeBrand.toLowerCase());
      });
    }

    // RAM filter
    if (activeRam !== "all") {
      list = list.filter(p => {
        const ram = p.specifications?.ram || "";
        return ram.toLowerCase().includes(activeRam.toLowerCase());
      });
    }

    // Storage filter
    if (activeStorage !== "all") {
      list = list.filter(p => {
        const storage = p.specifications?.storage || "";
        return storage.toLowerCase().includes(activeStorage.toLowerCase());
      });
    }

    // Color filter
    if (activeColor !== "all") {
      list = list.filter(p => {
        const colors = p.colors || [];
        return colors.some((c: any) => {
          const cId = c.color_id || c.id || "";
          const cName = c.color_name || c.name_ar || c.name || "";
          return cId === activeColor || cName.includes(activeColor);
        });
      });
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => {
        return (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.sub && p.sub.toLowerCase().includes(q)) ||
          (p.cat && p.cat.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
      });
    }

    // Sorting
    if (activeSort === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (activeSort === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (activeSort === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (activeSort === "bestseller") {
      list.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    }

    return list;
  }, [products, activeCategory, activeCondition, activeBrand, activeRam, activeStorage, activeColor, searchQuery, activeSort]);

  function resetFilters() {
    setActiveCategory("all");
    setActiveCondition("all");
    setActiveBrand("all");
    setActiveRam("all");
    setActiveStorage("all");
    setActiveColor("all");
    setActiveSort("featured");
    setSearchQuery("");
  }

  const isPhoneOrTablet = activeCategory === "all" || activeCategory === "phones" || activeCategory === "tablets";

  return (
    <div className="pb-16">
      {/* Shop Page Banner */}
      <section className="bg-gradient-to-b from-[#0d1210] to-[#141c18] text-white py-10 sm:py-14 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          <nav className="flex items-center gap-2 text-xs text-neutral-400 font-semibold" aria-label="مسار التنقل">
            <Link href="/" className="hover:text-lime-400 transition-colors">الرئيسية</Link>
            <span>/</span>
            <span className="text-white">المتجر وجميع الأجهزة</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <Badge className="bg-lime-400/20 text-lime-400 border-lime-400/30 text-xs font-bold mb-2">
                كتالوج الهواتف والإلكترونيات 2026
              </Badge>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                تشكيلات أجهزة <span className="text-lime-400">موبايل ستور</span> الأصلية
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl">
                تصفح جميع الهواتف الجديدة والكسر زيرو والتابلت والسماعات مع ميزة الفحص والمعاينة قبل الدفع وشحن سريع لكافة المحافظات.
              </p>
            </div>

            {/* In-page Search */}
            <div className="w-full md:w-80 relative">
              <input
                type="search"
                placeholder="ابحث بالاسم، الموديل، الماركة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 px-4 pr-10 rounded-full bg-white/10 border border-white/15 text-white placeholder-neutral-400 text-xs outline-none focus:ring-2 focus:ring-lime-400"
              />
              <svg className="w-4 h-4 text-lime-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

        </div>
      </section>

      {/* Filter Bar */}
      <section className="top-0 sm:sticky sm:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2.5">
          
          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-bold text-neutral-400 shrink-0 ml-1">الأقسام:</span>
            {[
              { id: "all", label: "جميع المنتجات" },
              { id: "phones", label: "📱 الموبايلات" },
              { id: "tablets", label: "التابلت والآيباد" },
              { id: "headphones", label: "السماعات وإيربودز" },
              { id: "chargers-cables", label: "الشواحن والكابلات" },
              { id: "smart-watches", label: "الساعات الذكية" },
              { id: "cases-protection", label: "الجرابات والحماية" },
              { id: "accessories", label: "إكسسوارات أخرى" }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 min-h-[38px] rounded-full text-xs font-bold shrink-0 transition-all flex items-center justify-center cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-lime-400 text-black shadow-xs"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sub Row 1: Condition & Brands */}
          <div className="flex items-center justify-between gap-3 flex-wrap pt-1 border-t border-neutral-100 text-xs">
            
            {/* Condition Filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-neutral-400">الحالة:</span>
              {[
                { id: "all", label: "الكل" },
                { id: "جديد", label: "جديد بالكامل" },
                { id: "used-or-like-new", label: "💎 كسر زيرو ومستعمل" }
              ].map(cond => (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => setActiveCondition(cond.id)}
                  className={`px-3 py-1.5 min-h-[36px] rounded-lg font-bold transition-all flex items-center justify-center cursor-pointer ${
                    activeCondition === cond.id
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {cond.label}
                </button>
              ))}
            </div>

            {/* Brand Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-neutral-400">الماركة:</span>
              <select
                value={activeBrand}
                onChange={(e) => setActiveBrand(e.target.value)}
                className="h-9 px-2.5 rounded-lg border border-neutral-200 bg-white text-xs font-bold text-neutral-800 outline-none cursor-pointer"
              >
                <option value="all">جميع الماركات</option>
                <option value="apple">Apple</option>
                <option value="samsung">Samsung</option>
                <option value="xiaomi">Xiaomi</option>
                <option value="anker">Anker</option>
                <option value="sony">Sony</option>
                <option value="joyroom">Joyroom</option>
              </select>
            </div>

            {/* Sort & Reset */}
            <div className="flex items-center gap-2 mr-auto">
              <span className="font-bold text-neutral-400">الترتيب:</span>
              <select
                value={activeSort}
                onChange={(e) => setActiveSort(e.target.value)}
                className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs font-bold text-neutral-800 outline-none focus:ring-1 focus:ring-lime-400 cursor-pointer"
              >
                <option value="featured">المقترح والمميز</option>
                <option value="bestseller">الأكثر طلباً ومبيعاً</option>
                <option value="rating">الأعلى تقييماً</option>
                <option value="price-low">السعر: من الأقل للأعلى</option>
                <option value="price-high">السعر: من الأعلى للأقل</option>
              </select>

              {(activeCategory !== "all" || activeCondition !== "all" || activeBrand !== "all" || activeRam !== "all" || activeStorage !== "all" || searchQuery || activeSort !== "featured") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="min-h-[36px] flex items-center text-xs font-bold text-rose-500 hover:underline mr-2 cursor-pointer"
                >
                  إعادة تعيين
                </button>
              )}
            </div>

          </div>

          {/* Sub Row 2: Category-Aware Filters (RAM & Storage for Phones/Tablets) */}
          {isPhoneOrTablet && (
            <div className="flex items-center gap-4 flex-wrap pt-1 text-xs border-t border-neutral-100">
              {/* Storage */}
              <div className="flex items-center gap-1">
                <span className="font-bold text-neutral-400">سعة التخزين:</span>
                {["all", "128GB", "256GB", "512GB"].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setActiveStorage(st)}
                    className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                      activeStorage === st ? "bg-lime-400 text-black" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {st === "all" ? "الكل" : st}
                  </button>
                ))}
              </div>

              {/* RAM */}
              <div className="flex items-center gap-1">
                <span className="font-bold text-neutral-400">الرام:</span>
                {["all", "8GB", "12GB", "16GB"].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setActiveRam(r)}
                    className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                      activeRam === r ? "bg-lime-400 text-black" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {r === "all" ? "الكل" : r}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Product Results */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-6 text-xs text-neutral-500 font-semibold">
          <span>عرض {filtered.length} من أصل {products.length} جهاز متوفر</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-neutral-200 p-8">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="font-extrabold text-lg text-neutral-900 mb-1">لم يتم العثور على أجهزة مطابقة</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-5">
              جرّب تغيير فئة البحث أو مسح الفلاتر المحددة لاستعراض التشكيلات المتاحة.
            </p>
            <Button
              className="bg-lime-400 hover:bg-lime-500 text-black font-extrabold rounded-full px-6 cursor-pointer"
              onClick={resetFilters}
            >
              إعادة تعيين جميع الفلاتر
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="py-24 text-center">
        <div className="text-3xl mb-2">📱</div>
        <p className="text-sm font-bold text-neutral-600">جاري تحميل تشكيلة الأجهزة...</p>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
