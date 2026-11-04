"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CustomerServicePage() {
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201065712366";

  return (
    <div className="pb-20">
      <section className="bg-gradient-to-b from-[#0d1210] to-[#141c18] text-white py-12 sm:py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 text-center sm:text-right">
          <Badge className="bg-lime-400/20 text-lime-400 border-lime-400/30 text-xs font-bold">
            مركز خدمة العملاء والدعم المعتمد
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            خدمة العملاء، الضمان، وتتبع الشحنات
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
            نحن هنا لمساعدتك في كل خطوة، بدءاً من اختيار هاتفك المثالي، حتى استلامه وفحصه مع المندوب وخدمات ما بعد البيع.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl">
              🔍
            </div>
            <h3 className="font-extrabold text-base text-neutral-900">سياسة الفحص والمعاينة</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              يحق للعميل فتح الشحنة بحضور مندوب شركة الشحن، فحص الهاتف والتأكد من مطابقة المواصفات وصحة البطارية والشاشة قبل سداد أي مبلغ.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-lime-50 text-lime-700 flex items-center justify-center text-2xl">
              🛡️
            </div>
            <h3 className="font-extrabold text-base text-neutral-900">شروط الضمان والاستبدال</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              جميع الأجهزة الجديدة مشمولة بضمان محلي معتمد من 12 إلى 24 شهراً. والأجهزة كسر زيرو مشمولة بضمان استبدال فوري من المتجر لمدة 6 أشهر كاملة.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center text-2xl">
              🚚
            </div>
            <h3 className="font-extrabold text-base text-neutral-900">مواعيد وتتبع الشحن</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              يتم تجهيز الطلب وإرسال كود المرجع مباشرة فور التسجيل. الشحن يستغرق 24-48 ساعة للقاهرة والجيزة والإسكندرية والدلتا، و3-4 أيام لمحافظات الصعيد.
            </p>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-[#0d1210] text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-right">
            <h3 className="text-xl font-black">تحتاج مساعدة فورية أو تتبع لطلبك؟</h3>
            <p className="text-xs text-neutral-400">فريق خدمة العملاء متواجد لمساعدتك يومياً من 10 صباحاً حتى 11 مساءً عبر واتساب المباشر.</p>
          </div>
          <Button asChild className="bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold h-12 px-7 rounded-full shrink-0">
            <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent("مرحباً خدمة عملاء موبايل ستور، أود الاستفسار بخصوص طلبي")}`} target="_blank" rel="noreferrer">
              تواصل معنا على واتساب الآن 💬
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
