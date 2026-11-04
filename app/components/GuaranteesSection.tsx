"use client";

import { Badge } from "@/components/ui/badge";

export default function GuaranteesSection() {
  const guarantees = [
    {
      icon: "🔍",
      title: "معاينة وفحص كامل قبل الدفع",
      desc: "افتح العلبة وافحص الجهاز وتأكد من السيريال نمبر والشاشة وصحة البطارية أمام المندوب قبل دفع أي جنيه."
    },
    {
      icon: "🛡️",
      title: "ضمان معتمد واستبدال فوري",
      desc: "ضمان محلي شامل من 6 إلى 24 شهراً مع استبدال فوري ضد عيوب الصناعة وخدمة ما بعد البيع."
    },
    {
      icon: "⚡",
      title: "شحن سريع لكافة المحافظات",
      desc: "توصيل آمن مع بوليصة تتبع مباشرة لجميع محافظات جمهورية مصر العربية خلال 24 إلى 48 ساعة فقط."
    },
    {
      icon: "💎",
      title: "أجهزة أصلية ومفحوصة 100%",
      desc: "أجهزة جديدة ومختومة وكالة، وقسم خاص للأجهزة كسر زيرو خالية من أي صيانة وبطاريات تفوق 95%."
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-white border-t border-neutral-100" id="guarantees">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2">
          <Badge variant="outline" className="text-xs font-bold text-emerald-800 border-emerald-300 bg-emerald-50">
            لماذا يثق بنا آلاف العملاء في مصر؟
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight">
            معايير الأمان والضمان في <span className="text-emerald-700">موبايل ستور</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            تجربة تسوق إلكترونية خالية تماماً من المخاطر. لا تدفع قبل أن تستلم وتفحص جهازك بنفسك.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {guarantees.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-neutral-50/70 border border-neutral-200 hover:border-lime-400 hover:shadow-xl transition-all duration-300 space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-lime-400/20 text-lime-600 flex items-center justify-center text-2xl shadow-inner">
                {item.icon}
              </div>
              <h3 className="font-extrabold text-base text-neutral-900">
                {item.title}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
