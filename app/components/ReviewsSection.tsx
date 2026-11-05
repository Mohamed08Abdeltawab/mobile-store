"use client";

import { Badge } from "@/components/ui/badge";
import ScrollReveal from "./ScrollReveal";

export default function ReviewsSection() {
  const reviews = [
    {
      name: "م. كريم عبد الرحمن",
      city: "القاهرة الجديدة",
      item: "iPhone 16 Pro Max 256GB",
      stars: 5,
      date: "منذ 3 أيام",
      comment: "أفضل تجربة شراء موبايل أونلاين على الإطلاق. المندوب انتظرني حوالي ربع ساعة لما فتحت الكرتونة وفحصت السيريال والبطارية وتأكدت إنه جديد كلياً مختوم قبل ما أدفع. شكراً على المصداقية العالية!"
    },
    {
      name: "د. طارق محمود",
      city: "الإسكندرية - سموحة",
      item: "Samsung Galaxy S24 Ultra",
      stars: 5,
      date: "منذ أسبوع",
      comment: "الجهاز وصلني تاني يوم من الطلب في إسكندرية متغلف باحترافية شديدة مع فاتورة وضمان مختوم. سرعة وتجاوب خدمة العملاء على الواتساب ممتازين."
    },
    {
      name: "مروة السعيد",
      city: "المنصورة - الدقهلية",
      item: "iPhone 15 Pro (كسر زيرو)",
      stars: 5,
      date: "منذ 5 أيام",
      comment: "كنت مترددة أشتري جهاز كسر زيرو أونلاين، بس لما وصلني الجهاز انبهرت بجد! البطارية 99% فعلاً والفريم والشاشة زيرو تماماً والعلبة الأصلية معاه. أنصح بالتعامل معاهم وبشدة."
    },
    {
      name: "أحمد حسام",
      city: "الجيزة - الشيخ زايد",
      item: "AirPods Pro 2 USB-C",
      stars: 5,
      date: "منذ أسبوعين",
      comment: "السماعة أصلية 100% وعملت اقتران وظهر الضمان في موقع أبل فوراً. صوت نقي وعزل خرافي وسعر أقل من المحلات الكبيرة."
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-neutral-100/60" id="reviews">
      <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <Badge variant="outline" className="mb-2 text-xs font-bold text-emerald-800 border-emerald-300 bg-emerald-50">
              آراء وتجارب حقيقية
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight">
              تقييمات عملائنا في <span className="text-emerald-700">مختلف المحافظات</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-lg">
              أكثر من 18,500 عميل راضٍ استلموا أجهزتهم وفحصوها قبل الدفع مع تقييم عام 4.9 / 5.
            </p>
          </div>

          <div className="flex items-center gap-2 text-amber-500 font-black text-base shrink-0">
            <span>★★★★★</span>
            <span className="text-neutral-900 text-sm font-extrabold">4.9 / 5 تقييم ممتاز</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-500 font-bold tracking-wider">★★★★★</span>
                  <span className="text-[11px] text-neutral-400">{rev.date}</span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100">
                <div className="font-extrabold text-xs text-neutral-900">{rev.name}</div>
                <div className="text-[11px] text-neutral-400 flex items-center justify-between mt-0.5">
                  <span>📍 {rev.city}</span>
                  <span className="text-emerald-700 font-bold truncate max-w-[120px]">{rev.item}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </ScrollReveal>
    </section>
  );
}
