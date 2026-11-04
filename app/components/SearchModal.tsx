"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { Badge } from "@/components/ui/badge";

export default function SearchModal() {
  const { isSearchOpen, setIsSearchOpen, products, addToCart } = useCart();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter(p => {
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sub && p.sub.toLowerCase().includes(q)) ||
        (p.cat && p.cat.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.condition && p.condition.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.specifications?.ram && p.specifications.ram.toLowerCase().includes(q)) ||
        (p.specifications?.storage && p.specifications.storage.toLowerCase().includes(q))
      );
    });
  }, [query, products]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden mt-10 animate-in zoom-in-95 duration-200">
        
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center gap-3 bg-neutral-50/50">
          <svg className="w-5 h-5 text-lime-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم، الموديل، الماركة (آيفون، سامسونج، كسر زيرو...)"
            autoFocus
            className="flex-1 bg-transparent text-sm sm:text-base font-bold text-neutral-900 placeholder-neutral-400 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-neutral-400 hover:text-neutral-600 text-xs font-bold px-2 py-1 cursor-pointer"
            >
              مسح
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="w-9 h-9 rounded-full bg-neutral-200/60 hover:bg-neutral-300 text-neutral-600 flex items-center justify-center font-bold text-sm cursor-pointer shrink-0"
            aria-label="إغلاق البحث"
          >
            ✕
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-neutral-400 space-y-3">
              <span className="text-3xl block">🔍</span>
              <span>اكتب ما تبحث عنه لمعاينة الأجهزة المتاحة فوراً</span>
              <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
                <span className="text-[11px] font-bold text-neutral-500">كلمات مقترحة:</span>
                {["آيفون 16 برو", "سامسونج S24", "كسر زيرو", "إيربودز برو", "شاحن 65W", "آيباد"].map((tag, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400 space-y-2">
              <span className="text-3xl block">🚫</span>
              <span className="font-bold text-neutral-700 block text-sm">لم نجد أي جهاز يطابق "{query}"</span>
              <span>تأكد من كتابة الكلمات بشكل صحيح أو تصفح الأقسام من المتجر</span>
            </div>
          ) : (
            results.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-colors"
              >
                <Link
                  href={`/product/${p.id}`}
                  onClick={() => setIsSearchOpen(false)}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-14 h-14 object-contain bg-white rounded-xl p-1 border border-neutral-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold text-neutral-400">{p.cat}</span>
                      {p.condition && (
                        <span className="text-[9px] px-1.5 rounded-full font-bold bg-neutral-100 text-neutral-700">
                          {p.condition}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-black text-neutral-900 truncate">
                      {p.name}
                    </h4>
                    <span className="text-xs font-black text-emerald-800 block mt-0.5">
                      {Number(p.price).toLocaleString("ar-EG")} ج.م
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    addToCart(p, 1);
                    setIsSearchOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-black font-extrabold text-xs shrink-0 cursor-pointer transition-colors shadow-2xs"
                >
                  + للسلة
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {query.trim() && (
          <div className="p-3 bg-neutral-50 border-t border-neutral-100 text-center text-xs">
            <Link
              href={`/shop?search=${encodeURIComponent(query)}`}
              onClick={() => setIsSearchOpen(false)}
              className="text-emerald-800 hover:underline font-bold"
            >
              عرض كل نتائج البحث ({results.length}) في المتجر ↗
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
