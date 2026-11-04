"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WhyUsPage() {
  return (
    <div className="pb-20">
      <section className="bg-gradient-to-b from-[#0d1210] to-[#141c18] text-white py-12 sm:py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 text-center sm:text-right">
          <Badge className="bg-lime-400/20 text-lime-400 border-lime-400/30 text-xs font-bold">
            معايير الأصالة والمصداقية
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            لماذا يختار العملاء موبايل ستور؟
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
            في سوق الهواتف الذكية المليء بالأجهزة المقلدة والمجددة، نحن نقدم تجربة شراء شفافة تضمن لك راحة البال الكاملة وأعلى قيمة مقابل سعرك.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-7 rounded-3xl bg-white border border-neutral-200 shadow-sm space-y-3">
            <span className="text-3xl">1️⃣</span>
            <h3 className="font-extrabold text-lg text-neutral-900">مبدأ المعاينة قبل الدفع</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              لا نطلب أي عربون مسبق. المندوب يصلك حتى باب منزلك، ويمنحك الوقت الكافي لفتح العلبة وتشغيل الهاتف والتأكد من رقمه التسلسلي وفحص الكاميرا والشاشة قبل أن تدفع أي مليم.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-neutral-200 shadow-sm space-y-3">
            <span className="text-3xl">2️⃣</span>
            <h3 className="font-extrabold text-lg text-neutral-900">فحص فني دقيق لكل جهاز كسر زيرو</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              جميع الأجهزة كسر زيرو تمر باختبار تقني صارم يتضمن أكثر من 40 نقطة فحص (حالة البطارية، الشاشة الأصلية، الفيس آي دي، الميكروفونات، والشبكة) مع تقرير فحص تفصيلي مرفق.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-neutral-200 shadow-sm space-y-3">
            <span className="text-3xl">3️⃣</span>
            <h3 className="font-extrabold text-lg text-neutral-900">أسعار منافسة وعروض حقيقية</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              نعمل مباشرة مع الموزعين والوكلاء المعتمدين لنوفر لك أسعاراً أقل من المتاجر التقليدية، مع هدايا حقيقية مثل جرابات MagSafe واسكرينات حماية مجاناً.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-neutral-200 shadow-sm space-y-3">
            <span className="text-3xl">4️⃣</span>
            <h3 className="font-extrabold text-lg text-neutral-900">شحن آمن وتغليف مدرع</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              نستخدم تغليفاً خاصاً متعدد الطبقات ضد الصدمات والرطوبة يضمن وصول هاتفك في حالة المصنع التامة، مع شراكات مع أكبر شركات الشحن في مصر.
            </p>
          </div>
        </div>

        <div className="text-center pt-6">
          <Button asChild className="bg-lime-400 hover:bg-lime-500 text-black font-extrabold h-12 px-8 rounded-full shadow-lg shadow-lime-400/20 text-sm">
            <Link href="/shop">
              ابدأ التسوق واستعرض الأجهزة المتاحة الآن ←
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
