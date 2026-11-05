"use client";

import { Button } from "@/components/ui/button";
import ScrollReveal from "./ScrollReveal";

export default function WhatsAppSection() {
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201065712366";

  return (
    <section
      className="py-14 sm:py-20 bg-[#0d1210] text-white border-t border-white/10 relative overflow-hidden"
      id="support"
    >
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-80 h-80 rounded-full bg-[#25D366]/10 blur-3xl pointer-events-none" />

      <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-[#141c18] border border-white/10 rounded-3xl p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-4 text-center lg:text-right max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <span>فريق المبيعات والدعم الفني متواجد الآن</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              هل تبحث عن جهاز محدد أو تريد استشارة فورية؟
              <br />
              <span className="text-[#25D366]">
                تواصل معنا مباشرة عبر واتساب
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              يسعدنا الإجابة على كل استفساراتك حول الهواتف المتاحة، فحص الأجهزة
              كسر زيرو، صور وفيديوهات حقيقية للجهاز قبل شحنه، وتأكيد طلبك في
              دقائق.
            </p>

            <div className="flex items-center justify-center lg:justify-start gap-4 text-xs text-neutral-400 pt-2 flex-wrap">
              <span>✓ رد سريع خلال دقيقتين</span>
              <span>✓ إرسال صور وفيديو واقعي للجهاز</span>
              <span>✓ مساعدة في اختيار الأنسب لميزانيتك</span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-3">
            <Button
              asChild
              className="bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-sm sm:text-base h-14 px-8 rounded-full shadow-xl shadow-[#25D366]/25 transition-transform hover:scale-105 active:scale-95"
            >
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent("مرحباً، أود التحدث مع مستشار المبيعات لمعرفة الأجهزة والعروض المتاحة")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z"></path>
                </svg>
                <span>بدء المحادثة على واتساب (0106 571 2366)</span>
              </a>
            </Button>
            <span className="text-[11px] text-neutral-500">
              متاح يومياً من 10:00 صباحاً حتى 11:00 مساءً
            </span>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
