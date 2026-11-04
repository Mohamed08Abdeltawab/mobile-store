"use client";

import { useCart } from "../context/CartContext";

export default function ToastContainer() {
  const { toasts } = useCart();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-neutral-900/95 text-white border border-lime-400/40 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            <span>{t.msg}</span>
          </div>
          <span className="text-lime-400 font-extrabold text-sm">✓</span>
        </div>
      ))}
    </div>
  );
}
