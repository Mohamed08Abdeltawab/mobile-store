"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ScrollReveal from "./ScrollReveal";

export default function CollectionCTA() {
  return (
    <section className="py-14 sm:py-20 bg-gradient-to-r from-[#0d1210] via-[#15231c] to-[#0d1210] text-white border-y border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(163,230,53,0.15),transparent_50%)] pointer-events-none" />

      <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5">
        <span className="text-lime-400 font-extrabold text-xs tracking-widest uppercase bg-lime-400/15 border border-lime-400/30 px-3.5 py-1 rounded-full inline-block">
          كتالوج الأجهزة الإلكترونية 2026
        </span>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto leading-tight">
          كل ما تحتاجه من هواتف، تابلت، وسماعات أصلية في مكان واحد
        </h2>

        <p className="text-xs sm:text-sm md:text-base text-neutral-300 max-w-xl mx-auto leading-relaxed">
          اختر من بين تشكيلات أبل، سامسونج، شاومي، وأقوى الماركات العالمية، مع ميزة الفحص والمعاينة قبل الدفع وبضمان محلي معتمد.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
          <Button asChild className="bg-lime-400 hover:bg-lime-500 text-black font-extrabold h-12 px-8 rounded-full shadow-lg shadow-lime-400/25 text-sm sm:text-base">
            <Link href="/shop" className="flex items-center gap-2">
              <span>تصفح كل المنتجات الآن</span>
              <span>←</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold h-12 px-6 rounded-full text-sm sm:text-base">
            <Link href="/shop?condition=used">
              تصفح أجهزة كسر زيرو بأسعار مخفضة 💎
            </Link>
          </Button>
        </div>
      </ScrollReveal>
    </section>
  );
}
