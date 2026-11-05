"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCart } from "../../context/CartContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { checkAdminAuth } = useCart();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (data.success) {
        await checkAdminAuth();
        router.push("/admin");
      } else {
        setError(data.error || "بيانات الدخول غير صحيحة");
      }
    } catch (err) {
      setError("حدث خطأ أثناء الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden min-h-screen bg-[#0d1210] text-white flex items-center justify-center p-4" dir="rtl">
      
      {/* Background Glow */}
      <div className="absolute w-96 h-96 rounded-full bg-lime-400/10 blur-3xl pointer-events-none" />

      <Card className="relative z-10 w-full max-w-md bg-[#141c18] border-white/10 text-white shadow-2xl rounded-3xl p-4 sm:p-6">
        
        {/* Top Back Link */}
        <div className="flex items-center justify-between pb-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-lime-400 transition-colors py-1.5 px-3 rounded-full bg-white/5 border border-white/10 hover:border-lime-400/30"
          >
            <svg className="w-3.5 h-3.5 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>الرجوع للشاشة الرئيسية</span>
          </Link>
        </div>

        <CardHeader className="text-center pb-6 space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-lime-400/15 border border-lime-400/40 text-lime-400 flex items-center justify-center mb-2 shadow-inner">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="3" ry="3"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
          </div>

          <CardTitle className="text-2xl font-black text-white">
            لوحة تحكم <span className="text-lime-400">موبايل ستور</span>
          </CardTitle>

          <CardDescription className="text-xs text-neutral-400">
            تسجيل دخول مسؤول المتجر لإدارة الأجهزة، المخزون، والطلبات
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500 text-rose-300 text-xs text-center font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-neutral-300">اسم المستخدم</Label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="h-11 rounded-xl bg-[#090d0b] border-white/15 text-white placeholder-neutral-500 text-sm focus:border-lime-400 focus:ring-lime-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-neutral-300">كلمة المرور</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="h-11 rounded-xl bg-[#090d0b] border-white/15 text-white placeholder-neutral-500 text-sm focus:border-lime-400 focus:ring-lime-400"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-lime-400 hover:bg-lime-500 text-black font-extrabold h-12 rounded-xl text-sm shadow-lg shadow-lime-400/25 transition-transform active:scale-[0.99] mt-2 cursor-pointer"
            >
              {loading ? "جاري التحقق والدخول..." : "تسجيل الدخول"}
            </Button>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white text-xs font-bold transition-all active:scale-[0.99]"
            >
              <svg className="w-4 h-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>الرجوع للشاشة الرئيسية للمتجر</span>
            </Link>
          </form>

          <div className="pt-4 mt-4 border-t border-white/10 text-center text-xs text-neutral-400 space-y-1">
            <p className="text-[11px] text-neutral-500">
              بوابة مخصصة للإدارة فقط · مشفرة ومحمية بـ Bcrypt
            </p>
          </div>
        </CardContent>

      </Card>
    </div>
  );
}
