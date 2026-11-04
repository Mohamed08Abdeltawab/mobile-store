"use client";

export default function MarqueeTicker() {
  const items = [
    { text: "أجهزة أصلية 100% ومفحوصة بالكامل معتمدة", icon: "💎" },
    { text: "معاينة وفحص كامل للجهاز قبل الدفع والاستلام", icon: "🔍" },
    { text: "ضمان محلي معتمد مع استبدال فوري ضد عيوب الصناعة", icon: "🛡️" },
    { text: "شحن سريع لكافة محافظات مصر خلال 24-48 ساعة", icon: "⚡" },
    { text: "الدفع عند الاستلام كاش أو إنستاباي ومحافظ إلكترونية", icon: "💵" },
    { text: "قسم مخصص للأجهزة كسر زيرو ببطاريات 95%+ وضمان", icon: "📱" },
  ];

  return (
    <div
      className="bg-[#141c18] border-y border-white/10 py-3 overflow-hidden text-neutral-300 text-xs sm:text-sm select-none group"
      dir="ltr"
      aria-label="شريط المميزات والضمانات"
    >
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {/* Track 1 */}
        <div className="flex items-center shrink-0" dir="rtl">
          {items.map((it, idx) => (
            <div key={`t1-${idx}`} className="flex items-center gap-2 mx-6 whitespace-nowrap">
              <span className="text-base">{it.icon}</span>
              <span className="font-extrabold text-white">{it.text}</span>
              <span className="text-lime-400 font-black mr-4">•</span>
            </div>
          ))}
        </div>

        {/* Track 2 (Clone for infinite seamless loop) */}
        <div className="flex items-center shrink-0" dir="rtl">
          {items.map((it, idx) => (
            <div key={`t2-${idx}`} className="flex items-center gap-2 mx-6 whitespace-nowrap">
              <span className="text-base">{it.icon}</span>
              <span className="font-extrabold text-white">{it.text}</span>
              <span className="text-lime-400 font-black mr-4">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
