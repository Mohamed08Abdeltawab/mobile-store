"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function QuickViewModal() {
  const {
    quickProduct,
    setQuickProduct,
    addToCart,
    sendDirectWhatsApp
  } = useCart();

  const [selectedColor, setSelectedColor] = useState<string>("");

  if (!quickProduct) return null;

  const discount = Boolean(quickProduct.old_price && Number(quickProduct.old_price) > Number(quickProduct.price))
    ? Math.round(((Number(quickProduct.old_price) - Number(quickProduct.price)) / Number(quickProduct.old_price)) * 100)
    : 0;

  const colors = quickProduct.colors || [];
  const activeColor = selectedColor || (colors[0] ? colors[0].color_name : "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => setQuickProduct(null)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          className="absolute top-4 left-4 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors text-base font-bold cursor-pointer"
          type="button"
          onClick={() => setQuickProduct(null)}
          aria-label="إغلاق"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 sm:p-6 items-center">
          {/* Product Image */}
          <div className="aspect-square bg-neutral-100 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden">
            <img
              src={quickProduct.image}
              alt={quickProduct.name}
              className="max-h-full max-w-full object-contain"
            />
            {quickProduct.condition && (
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-black bg-lime-400 text-black shadow-xs">
                {quickProduct.condition}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3.5">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-bold mb-1">
                <span>{quickProduct.brand}</span>
                <span>·</span>
                <span>{quickProduct.cat}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-neutral-900 leading-tight">
                {quickProduct.name}
              </h3>
              {quickProduct.sub && (
                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                  {quickProduct.sub}
                </p>
              )}
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-black text-neutral-900">
                {Number(quickProduct.price).toLocaleString("ar-EG")} <span className="text-xs font-bold text-neutral-500">ج.م</span>
              </span>
              {Boolean(quickProduct.old_price && Number(quickProduct.old_price) > Number(quickProduct.price)) && (
                <s className="text-xs text-neutral-400 line-through">
                  {Number(quickProduct.old_price).toLocaleString("ar-EG")} ج.م
                </s>
              )}
              {discount > 0 && (
                <Badge className="bg-rose-600 text-white text-[10px] font-bold">
                  وفر {discount}%
                </Badge>
              )}
            </div>

            {/* Specs Highlights */}
            {quickProduct.specifications && (
              <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                {quickProduct.specifications.storage && (
                  <div>
                    <span className="text-neutral-400 block font-bold">المساحة:</span>
                    <span className="text-neutral-800 font-extrabold">{quickProduct.specifications.storage}</span>
                  </div>
                )}
                {quickProduct.specifications.ram && (
                  <div>
                    <span className="text-neutral-400 block font-bold">الرام:</span>
                    <span className="text-neutral-800 font-extrabold">{quickProduct.specifications.ram}</span>
                  </div>
                )}
                {quickProduct.specifications.battery_health && (
                  <div>
                    <span className="text-neutral-400 block font-bold">صحة البطارية:</span>
                    <span className="text-emerald-700 font-extrabold">{quickProduct.specifications.battery_health}</span>
                  </div>
                )}
                {quickProduct.specifications.warranty && (
                  <div>
                    <span className="text-neutral-400 block font-bold">الضمان:</span>
                    <span className="text-neutral-800 font-extrabold truncate block">{quickProduct.specifications.warranty}</span>
                  </div>
                )}
              </div>
            )}

            {/* Colors */}
            {colors.length > 0 && (
              <div>
                <span className="text-xs font-bold text-neutral-700 block mb-1.5">
                  اللون المختار: <strong className="text-emerald-800">{activeColor}</strong>
                </span>
                <div className="flex gap-2">
                  {colors.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedColor(c.color_name)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        activeColor === c.color_name ? "border-lime-500 scale-110 shadow-sm" : "border-neutral-200"
                      }`}
                      style={{ backgroundColor: c.hex_code }}
                      title={c.color_name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <Button
                className="w-full bg-lime-400 hover:bg-lime-500 text-black font-extrabold h-11 rounded-xl text-xs sm:text-sm shadow-md shadow-lime-400/20 cursor-pointer"
                onClick={() => {
                  addToCart(quickProduct, 1, activeColor ? `لون: ${activeColor}` : "", activeColor);
                  setQuickProduct(null);
                }}
              >
                أضف إلى السلة للمعاينة والدفع
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="w-full text-xs font-bold h-10 rounded-xl"
                  onClick={() => {
                    sendDirectWhatsApp(quickProduct);
                    setQuickProduct(null);
                  }}
                >
                  طلب عبر واتساب 💬
                </Button>

                <Button asChild variant="ghost" className="w-full text-xs font-bold h-10 rounded-xl text-neutral-700">
                  <Link
                    href={`/product/${quickProduct.id}`}
                    onClick={() => setQuickProduct(null)}
                  >
                    تفاصيل الجهاز بالكامل ↗
                  </Link>
                </Button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
