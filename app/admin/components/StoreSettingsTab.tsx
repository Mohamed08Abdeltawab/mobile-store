"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  StoreSettings,
  DEFAULT_STORE_SETTINGS,
  ShippingCity,
  HeroSlide,
  formatCurrency,
  CurrencyCode,
  CurrencyFormat
} from "@/lib/types";

interface StoreSettingsTabProps {
  initialSettings?: StoreSettings;
  onSaved?: (newSettings: StoreSettings) => void;
  showToast?: (msg: string) => void;
}

export default function StoreSettingsTab({
  initialSettings,
  onSaved,
  showToast
}: StoreSettingsTabProps) {
  const [settings, setSettings] = useState<StoreSettings>(initialSettings || DEFAULT_STORE_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<StoreSettings>(initialSettings || DEFAULT_STORE_SETTINGS);
  const [subTab, setSubTab] = useState<"brand" | "localization" | "social" | "shipping" | "payment" | "theme">("brand");
  
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingDarkLogo, setUploadingDarkLogo] = useState(false);
  const [uploadingVodafoneQR, setUploadingVodafoneQR] = useState(false);
  const [uploadingInstapayQR, setUploadingInstapayQR] = useState(false);
  const [uploadingHeroImg, setUploadingHeroImg] = useState(false);

  // New shipping city modal / state
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [newCity, setNewCity] = useState<Partial<ShippingCity>>({
    name: "",
    shipping: 60,
    days: "24-48 ساعة",
    is_active: true
  });
  const [editingCityIndex, setEditingCityIndex] = useState<number | null>(null);

  // New hero slide modal / state
  const [showAddSlideModal, setShowAddSlideModal] = useState(false);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [slideForm, setSlideForm] = useState<Partial<HeroSlide>>({
    image: "",
    title: "",
    subtitle: "",
    badge: "جديد وحصري ⚡",
    button_text: "تصفح الأجهزة",
    button_link: "/shop",
    is_active: true
  });

  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Track unsaved changes
  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  // Always fetch fresh settings from database on mount (no-store)
  useEffect(() => {
    let isMounted = true;
    async function fetchFreshSettings() {
      try {
        setIsLoadingSettings(true);
        const res = await fetch(`/api/settings?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const data: any = await res.json();
        if (isMounted && data.success && data.settings) {
          setSettings(data.settings);
          setSavedSettings(data.settings);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        if (isMounted) setIsLoadingSettings(false);
      }
    }
    fetchFreshSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Flash notification helper
  function notify(type: "success" | "error", text: string) {
    setNotification({ type, text });
    if (showToast) showToast(text);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }

  // Handle generic image upload to /api/upload
  async function handleImageUpload(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data: any = await res.json();
      if (data.success && (data.url || (data.urls && data.urls[0]))) {
        return data.url || data.urls[0];
      }
      notify("error", data.error || "فشل رفع الصورة");
      return null;
    } catch (e: any) {
      notify("error", "فشل رفع الصورة: " + e.message);
      return null;
    }
  }

  // Save Settings to Backend API
  async function handleSaveSettings() {
    // Basic validation
    if (!settings.store_name.trim()) {
      notify("error", "اسم المتجر مطلوب.");
      setSubTab("brand");
      return;
    }

    if (settings.free_shipping_threshold < 0) {
      notify("error", "حد الشحن المجاني يجب أن يكون رقماً موجباً.");
      setSubTab("shipping");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify(settings),
      });
      const data: any = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        setSavedSettings(data.settings);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("mobile_store_bootstrap");
        }
        notify("success", "تم حفظ وتحديث كافة إعدادات المتجر في قاعدة البيانات بنجاح! ✓");
        if (onSaved) onSaved(data.settings);
      } else {
        notify("error", data.error || "فشل حفظ التعديلات");
      }
    } catch (err: any) {
      notify("error", "حدث خطأ أثناء حفظ الإعدادات: " + err.message);
    } finally {
      setIsSaving(false);
    }
  }

  // Reset to default settings
  function handleResetToDefaults() {
    if (window.confirm("هل أنت متأكد من استعادة كافة الإعدادات إلى القيم الافتراضية للمتجر؟")) {
      setSettings(DEFAULT_STORE_SETTINGS);
      notify("success", "تمت استعادة الإعدادات الافتراضية. لا تنس الضغط على حفظ التغييرات.");
    }
  }

  // Shipping city handlers
  function handleSaveCity() {
    if (!newCity.name?.trim()) {
      alert("يرجى إدخال اسم المحافظة أو المدينة");
      return;
    }
    const currentCities = [...(settings.shipping_cities || [])];
    if (editingCityIndex !== null) {
      currentCities[editingCityIndex] = {
        id: currentCities[editingCityIndex].id,
        name: newCity.name.trim(),
        shipping: Number(newCity.shipping) || 0,
        days: newCity.days?.trim() || "24-48 ساعة",
        is_active: newCity.is_active ?? true
      };
    } else {
      currentCities.push({
        id: `city-${Date.now()}`,
        name: newCity.name.trim(),
        shipping: Number(newCity.shipping) || 0,
        days: newCity.days?.trim() || "24-48 ساعة",
        is_active: newCity.is_active ?? true
      });
    }
    setSettings({ ...settings, shipping_cities: currentCities });
    setShowAddCityModal(false);
    setEditingCityIndex(null);
    setNewCity({ name: "", shipping: 60, days: "24-48 ساعة", is_active: true });
  }

  function handleDeleteCity(index: number) {
    if (window.confirm(`هل أنت متأكد من حذف ${settings.shipping_cities[index]?.name}؟`)) {
      const updated = settings.shipping_cities.filter((_, i) => i !== index);
      setSettings({ ...settings, shipping_cities: updated });
    }
  }

  function handleToggleCityActive(index: number) {
    const updated = [...settings.shipping_cities];
    updated[index].is_active = !updated[index].is_active;
    setSettings({ ...settings, shipping_cities: updated });
  }

  function handleBulkToggleCities(active: boolean) {
    const updated = settings.shipping_cities.map(c => ({ ...c, is_active: active }));
    setSettings({ ...settings, shipping_cities: updated });
  }

  // Hero slide handlers
  function handleSaveSlide() {
    if (!slideForm.image?.trim()) {
      alert("يرجى رفع أو إدخال رابط صورة للبانر");
      return;
    }
    const currentSlides = [...(settings.hero_slides || [])];
    if (editingSlideIndex !== null) {
      currentSlides[editingSlideIndex] = {
        ...currentSlides[editingSlideIndex],
        image: slideForm.image.trim(),
        title: slideForm.title?.trim() || "",
        subtitle: slideForm.subtitle?.trim() || "",
        badge: slideForm.badge?.trim() || "",
        button_text: slideForm.button_text?.trim() || "تصفح الأجهزة",
        button_link: slideForm.button_link?.trim() || "/shop",
        is_active: slideForm.is_active ?? true,
      };
    } else {
      currentSlides.push({
        id: `slide-${Date.now()}`,
        image: slideForm.image.trim(),
        title: slideForm.title?.trim() || "",
        subtitle: slideForm.subtitle?.trim() || "",
        badge: slideForm.badge?.trim() || "",
        button_text: slideForm.button_text?.trim() || "تصفح الأجهزة",
        button_link: slideForm.button_link?.trim() || "/shop",
        is_active: slideForm.is_active ?? true,
        sort_order: currentSlides.length + 1
      });
    }
    setSettings({ ...settings, hero_slides: currentSlides });
    setShowAddSlideModal(false);
    setEditingSlideIndex(null);
    setSlideForm({
      image: "",
      title: "",
      subtitle: "",
      badge: "جديد وحصري ⚡",
      button_text: "تصفح الأجهزة",
      button_link: "/shop",
      is_active: true
    });
  }

  function handleDeleteSlide(index: number) {
    if (window.confirm("هل أنت متأكد من حذف هذه الشريحة؟")) {
      const updated = settings.hero_slides.filter((_, i) => i !== index);
      setSettings({ ...settings, hero_slides: updated });
    }
  }

  function handleMoveSlide(index: number, direction: "up" | "down") {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= settings.hero_slides.length) return;
    const updated = [...settings.hero_slides];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    // update sort_order
    updated.forEach((s, idx) => { s.sort_order = idx + 1; });
    setSettings({ ...settings, hero_slides: updated });
  }

  // Color preset options
  const COLOR_PRESETS = [
    { name: "أخضر ليموني (الافتراضي)", hex: "#A3E635" },
    { name: "أخضر زمردي", hex: "#10B981" },
    { name: "أزرق سماوي", hex: "#0284C7" },
    { name: "ذهبي ملكي", hex: "#D4AF37" },
    { name: "بنفسجي كهربائي", hex: "#8B5CF6" },
    { name: "برتقالي ناري", hex: "#F97316" },
    { name: "أسود داكن", hex: "#111827" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Sticky Action Bar */}
      <div className="bg-[#141c18] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-20 z-30 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white">إعدادات المتجر وهوية العلامة التجارية</h2>
            {isLoadingSettings ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-400/20 text-sky-300 border border-sky-400/40 animate-pulse">
                جاري التحميل من قاعدة البيانات...
              </span>
            ) : hasUnsavedChanges ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse">
                تعديلات غير محفوظة
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-lime-400/15 text-lime-400 border border-lime-400/30">
                متصل ومحدث مع قاعدة البيانات ✓
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            تحكم بكامل تفاصيل الهوية، الشعار، العملات، أسعار الشحن للمحافظات، بوابات الدفع، والألوان المنعكسة مباشرة على المتجر.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
          >
            استعادة الافتراضي
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 disabled:opacity-50 text-black font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-lime-400/20 flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <span>💾 حفظ التغييرات</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            notification.type === "success"
              ? "bg-lime-400/15 border border-lime-400/40 text-lime-400"
              : "bg-rose-500/15 border border-rose-500/40 text-rose-300"
          }`}
        >
          <span>{notification.type === "success" ? "✓" : "⚠"}</span>
          <span>{notification.text}</span>
        </div>
      )}

      {/* Sub-Tabs Navigation */}
      <div className="flex gap-1.5 sm:gap-2 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setSubTab("brand")}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === "brand"
              ? "bg-lime-400/20 text-lime-400 border border-lime-400/40"
              : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-transparent"
          }`}
        >
          <span>🎨 الهوية والشعار</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("localization")}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === "localization"
              ? "bg-lime-400/20 text-lime-400 border border-lime-400/40"
              : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-transparent"
          }`}
        >
          <span>💱 العملة والمنطقة</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("social")}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === "social"
              ? "bg-lime-400/20 text-lime-400 border border-lime-400/40"
              : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-transparent"
          }`}
        >
          <span>🌐 منصات التواصل والتسويق</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("shipping")}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === "shipping"
              ? "bg-lime-400/20 text-lime-400 border border-lime-400/40"
              : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-transparent"
          }`}
        >
          <span>🚚 الشحن والمحافظات</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("payment")}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === "payment"
              ? "bg-lime-400/20 text-lime-400 border border-lime-400/40"
              : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-transparent"
          }`}
        >
          <span>💳 طرق الدفع والتحصيل</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("theme")}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            subTab === "theme"
              ? "bg-lime-400/20 text-lime-400 border border-lime-400/40"
              : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-transparent"
          }`}
        >
          <span>🖼️ المظهر وصور الهيرو</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 1: BRAND & IDENTITY */}
      {/* ==================================================================== */}
      {subTab === "brand" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Card: Brand Text Info */}
            <div className="bg-[#141c18] border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <span className="text-lime-400 text-base">🏷️</span>
                <span>بيانات المتجر والوصف الرئيسي</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    اسم المتجر *
                  </label>
                  <input
                    type="text"
                    value={settings.store_name}
                    onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                    placeholder="مثال: MOBILE STORE"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400 font-bold"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">يظهر في رأس الموقع، الفوتر، وعناوين الفواتير.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    الشعار اللفظي (Slogan / Tagline)
                  </label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    placeholder="مثال: موبايلات · تابلت · إلكترونيات"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">شعار قصير يعبر عن نشاط المتجر يظهر بجوار اللوجو.</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  الوصف العام للمتجر (Store Description / SEO)
                </label>
                <textarea
                  rows={3}
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  placeholder="اكتب نبذة تعريفية مختصرة عن المتجر..."
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400 leading-relaxed"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  يستخدم في الفوتر السفلي، صفحة من نحن، ومحركات البحث.
                </span>
              </div>
            </div>

            {/* Card: Logo Management */}
            <div className="bg-[#141c18] border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <span className="text-lime-400 text-base">🖼️</span>
                <span>شعار المتجر (Logo)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Logo (For Dark Background / Standard Header) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white">اللوجو الرئيسي (Header Logo)</label>
                    <span className="text-[10px] text-lime-400 font-medium">موصى به: 240×60 بكسل PNG/SVG</span>
                  </div>

                  <div className="border border-dashed border-white/20 rounded-xl p-4 bg-black/40 text-center flex flex-col items-center justify-center min-h-[140px] relative">
                    {settings.logo_url ? (
                      <div className="space-y-3">
                        <div className="relative h-14 w-44 mx-auto flex items-center justify-center bg-white/5 rounded-lg p-2 border border-white/10">
                          <img
                            src={settings.logo_url}
                            alt="Main Logo Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="flex items-center gap-2 justify-center">
                          <label className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white cursor-pointer transition-colors">
                            <span>استبدال الشعار</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploadingLogo(true);
                                const url = await handleImageUpload(file);
                                if (url) setSettings({ ...settings, logo_url: url });
                                setUploadingLogo(false);
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, logo_url: "" })}
                            className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-neutral-400 flex items-center justify-center mx-auto text-xl">
                          📁
                        </div>
                        <label className="inline-block px-4 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-black font-extrabold text-xs cursor-pointer transition-all shadow-md">
                          {uploadingLogo ? "جاري الرفع..." : "اختر صورة الشعار"}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingLogo}
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploadingLogo(true);
                              const url = await handleImageUpload(file);
                              if (url) setSettings({ ...settings, logo_url: url });
                              setUploadingLogo(false);
                            }}
                          />
                        </label>
                        <span className="text-[10px] text-neutral-500 block">PNG, SVG, WEBP مع خلفية شفافة</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-neutral-400 block mb-1">أو أدخل رابط مباشر للصورة:</span>
                    <input
                      type="url"
                      value={settings.logo_url}
                      onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-lime-400"
                    />
                  </div>
                </div>

                {/* Dark / Secondary Logo */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white">شعار بديل / الفواتير (Dark/Print Logo)</label>
                    <span className="text-[10px] text-neutral-400">اختياري</span>
                  </div>

                  <div className="border border-dashed border-white/20 rounded-xl p-4 bg-black/40 text-center flex flex-col items-center justify-center min-h-[140px] relative">
                    {settings.logo_dark_url ? (
                      <div className="space-y-3">
                        <div className="relative h-14 w-44 mx-auto flex items-center justify-center bg-white rounded-lg p-2 border border-neutral-300">
                          <img
                            src={settings.logo_dark_url}
                            alt="Dark Logo Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="flex items-center gap-2 justify-center">
                          <label className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white cursor-pointer transition-colors">
                            <span>استبدال</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploadingDarkLogo(true);
                                const url = await handleImageUpload(file);
                                if (url) setSettings({ ...settings, logo_dark_url: url });
                                setUploadingDarkLogo(false);
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, logo_dark_url: "" })}
                            className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-neutral-400 flex items-center justify-center mx-auto text-xl">
                          🖨️
                        </div>
                        <label className="inline-block px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer transition-all">
                          {uploadingDarkLogo ? "جاري الرفع..." : "رفع شعار داكن / خلفية فاتحة"}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingDarkLogo}
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploadingDarkLogo(true);
                              const url = await handleImageUpload(file);
                              if (url) setSettings({ ...settings, logo_dark_url: url });
                              setUploadingDarkLogo(false);
                            }}
                          />
                        </label>
                        <span className="text-[10px] text-neutral-500 block">يصلح للفواتير المطبوعة أو الخلفيات البيضاء</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-neutral-400 block mb-1">أو أدخل رابط الشعار البديل:</span>
                    <input
                      type="url"
                      value={settings.logo_dark_url || ""}
                      onChange={(e) => setSettings({ ...settings, logo_dark_url: e.target.value })}
                      placeholder="https://example.com/logo-dark.png"
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-lime-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Live Preview Card */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-[#141c18] border border-white/10 rounded-2xl p-5 sticky top-40">
              <span className="text-xs font-bold text-lime-400 block mb-3">👁️ معاينة حية لرأس المتجر (Header Preview)</span>
              
              <div className="bg-[#0d1210] border border-white/15 rounded-xl p-4 shadow-inner space-y-3">
                <div className="flex items-center gap-3">
                  {settings.logo_url ? (
                    <img
                      src={settings.logo_url}
                      alt={settings.store_name}
                      className="h-10 max-w-[130px] object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-lime-400 text-black shadow-md shadow-lime-400/20 shrink-0 font-black">
                      📱
                    </div>
                  )}

                  <div className="flex flex-col">
                    <span className="font-extrabold text-base text-white tracking-wider leading-none">
                      {settings.store_name}
                    </span>
                    <span className="text-[9px] font-bold text-neutral-400 tracking-wider mt-1">
                      {settings.tagline}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 text-[11px] text-neutral-400 line-clamp-3">
                  {settings.description}
                </div>
              </div>

              <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-neutral-300 space-y-1">
                <div className="font-bold text-white">💡 نصيحة لتحسين مظهر المتجر:</div>
                <p>
                  استخدم شعاراً شفافاً بصيغة SVG أو PNG ليتناغم تماماً مع شريط التنقل الزجاجي والوضع الليلي المعتمد في التطبيق.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 2: LOCALIZATION & CURRENCY */}
      {/* ==================================================================== */}
      {subTab === "localization" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#141c18] border border-white/10 rounded-2xl p-5 space-y-5">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <span className="text-lime-400 text-base">💱</span>
                <span>إعدادات العملة وصيغ العرض</span>
              </h3>

              {/* Currency Selector */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-2">
                  العملة المعتمدة للمتجر (Store Currency) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, currency: "EGP" })}
                    className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                      settings.currency === "EGP"
                        ? "bg-lime-400/20 border-lime-400 text-white shadow-md shadow-lime-400/10"
                        : "bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm text-lime-400">🇪🇬 EGP</span>
                      {settings.currency === "EGP" && <span className="text-lime-400">✓</span>}
                    </div>
                    <div className="font-bold text-xs text-white">الجنيه المصري</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">العملة الأساسية (ج.م)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, currency: "USD" })}
                    className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                      settings.currency === "USD"
                        ? "bg-lime-400/20 border-lime-400 text-white shadow-md shadow-lime-400/10"
                        : "bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm text-lime-400">🇺🇸 USD</span>
                      {settings.currency === "USD" && <span className="text-lime-400">✓</span>}
                    </div>
                    <div className="font-bold text-xs text-white">الدولار الأمريكي</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">United States Dollar ($)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, currency: "SAR" })}
                    className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                      settings.currency === "SAR"
                        ? "bg-lime-400/20 border-lime-400 text-white shadow-md shadow-lime-400/10"
                        : "bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm text-lime-400">🇸🇦 SAR</span>
                      {settings.currency === "SAR" && <span className="text-lime-400">✓</span>}
                    </div>
                    <div className="font-bold text-xs text-white">الريال السعودي</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Saudi Riyal (ر.س)</div>
                  </button>
                </div>
              </div>

              {/* Currency Display Format */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-neutral-300 mb-2">
                  طريقة وتنسيق ظهور العملة (Display Format) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      settings.currency_format === "symbol_after_arabic"
                        ? "bg-lime-400/15 border-lime-400 text-white"
                        : "bg-black/40 border-white/10 text-neutral-300 hover:bg-white/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name="currency_format"
                      checked={settings.currency_format === "symbol_after_arabic"}
                      onChange={() => setSettings({ ...settings, currency_format: "symbol_after_arabic" })}
                      className="mt-1 accent-lime-400"
                    />
                    <div>
                      <div className="font-bold text-xs text-white">رمز عربي بعد السعر (موصى به)</div>
                      <div className="text-[11px] text-lime-400 font-bold mt-1">
                        مثال: {formatCurrency(250, { currency: settings.currency, currency_format: "symbol_after_arabic" })}
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      settings.currency_format === "symbol_before_english"
                        ? "bg-lime-400/15 border-lime-400 text-white"
                        : "bg-black/40 border-white/10 text-neutral-300 hover:bg-white/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name="currency_format"
                      checked={settings.currency_format === "symbol_before_english"}
                      onChange={() => setSettings({ ...settings, currency_format: "symbol_before_english" })}
                      className="mt-1 accent-lime-400"
                    />
                    <div>
                      <div className="font-bold text-xs text-white">رمز إنجليزي قبل السعر</div>
                      <div className="text-[11px] text-lime-400 font-bold mt-1">
                        مثال: {formatCurrency(250, { currency: settings.currency, currency_format: "symbol_before_english" })}
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      settings.currency_format === "symbol_after_english"
                        ? "bg-lime-400/15 border-lime-400 text-white"
                        : "bg-black/40 border-white/10 text-neutral-300 hover:bg-white/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name="currency_format"
                      checked={settings.currency_format === "symbol_after_english"}
                      onChange={() => setSettings({ ...settings, currency_format: "symbol_after_english" })}
                      className="mt-1 accent-lime-400"
                    />
                    <div>
                      <div className="font-bold text-xs text-white">رمز إنجليزي بعد السعر</div>
                      <div className="text-[11px] text-lime-400 font-bold mt-1">
                        مثال: {formatCurrency(250, { currency: settings.currency, currency_format: "symbol_after_english" })}
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      settings.currency_format === "symbol_before_arabic"
                        ? "bg-lime-400/15 border-lime-400 text-white"
                        : "bg-black/40 border-white/10 text-neutral-300 hover:bg-white/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name="currency_format"
                      checked={settings.currency_format === "symbol_before_arabic"}
                      onChange={() => setSettings({ ...settings, currency_format: "symbol_before_arabic" })}
                      className="mt-1 accent-lime-400"
                    />
                    <div>
                      <div className="font-bold text-xs text-white">رمز عربي قبل السعر</div>
                      <div className="text-[11px] text-lime-400 font-bold mt-1">
                        مثال: {formatCurrency(250, { currency: settings.currency, currency_format: "symbol_before_arabic" })}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Optional Custom Currency Symbol */}
              <div className="pt-2 border-t border-white/10">
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  رمز العملة المخصص (اختياري - يترك فارغاً لاستخدام الرمز القياسي للعملة)
                </label>
                <input
                  type="text"
                  value={settings.custom_currency_symbol || ""}
                  onChange={(e) => setSettings({ ...settings, custom_currency_symbol: e.target.value })}
                  placeholder="مثال: ج.م أو USD أو ر.س أو $"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400 font-mono"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  إذا أردت تخصيص رمز خاص لعملتك يتجاوز الرموز القياسية.
                </span>
              </div>
            </div>
          </div>

          {/* Price Preview Simulator */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#141c18] border border-white/10 rounded-2xl p-5 sticky top-40 space-y-4">
              <span className="text-xs font-bold text-lime-400 block">📊 محاكي عرض الأسعار في الواجهة:</span>

              <div className="bg-black/50 border border-white/10 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="text-neutral-400">سعر كابل أو شاحن:</span>
                  <span className="font-black text-white text-sm">{formatCurrency(350, settings)}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="text-neutral-400">سعر سماعة إيربودز:</span>
                  <span className="font-black text-white text-sm">{formatCurrency(2450, settings)}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="text-neutral-400">سعر هاتف فلاجشيب:</span>
                  <span className="font-black text-lime-400 text-base">{formatCurrency(54000, settings)}</span>
                </div>

                <div className="flex justify-between items-center pt-1 text-emerald-300">
                  <span className="font-bold">إجمالي سلة الشراء:</span>
                  <span className="font-black text-lg">{formatCurrency(56800, settings)}</span>
                </div>
              </div>

              <div className="text-[11px] text-neutral-400 leading-relaxed">
                أي تغيير في العملة وتنسيق الرمز سيطبق تلقائياً وبشكل فوري على بطاقات المنتجات، سلة المشتريات، رسائل الواتساب، وصفحة الدفع.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 3: SOCIAL MEDIA & MARKETING */}
      {/* ==================================================================== */}
      {subTab === "social" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Social Media Channels */}
            <div className="bg-[#141c18] border border-white/10 rounded-2xl p-5 space-y-5">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <span className="text-lime-400 text-base">🌐</span>
                <span>روابط وحسابات التواصل الاجتماعي (تظهر في رأس وفوتر الموقع)</span>
              </h3>

              {/* Facebook */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#1877F2]/20 text-[#1877F2] flex items-center justify-center font-bold text-base">
                      f
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">صفحة فيسبوك (Facebook)</div>
                      <div className="text-[10px] text-neutral-400">رابط الصفحة الرسمية للمتجر على فيسبوك</div>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-neutral-400 font-medium">
                      {settings.social_facebook_enabled ? "ظاهر في المتجر" : "مخفي"}
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.social_facebook_enabled}
                      onChange={(e) => setSettings({ ...settings, social_facebook_enabled: e.target.checked })}
                      className="w-4 h-4 accent-lime-400 rounded cursor-pointer"
                    />
                  </label>
                </div>

                <div>
                  <input
                    type="url"
                    value={settings.social_facebook}
                    onChange={(e) => setSettings({ ...settings, social_facebook: e.target.value })}
                    placeholder="https://facebook.com/yourpagelink"
                    dir="ltr"
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>

              {/* Instagram */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
                      📸
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">إنستجرام (Instagram)</div>
                      <div className="text-[10px] text-neutral-400">حساب المتجر على منصة إنستجرام للريلز والصور</div>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-neutral-400 font-medium">
                      {settings.social_instagram_enabled ? "ظاهر في المتجر" : "مخفي"}
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.social_instagram_enabled}
                      onChange={(e) => setSettings({ ...settings, social_instagram_enabled: e.target.checked })}
                      className="w-4 h-4 accent-lime-400 rounded cursor-pointer"
                    />
                  </label>
                </div>

                <div>
                  <input
                    type="url"
                    value={settings.social_instagram}
                    onChange={(e) => setSettings({ ...settings, social_instagram: e.target.value })}
                    placeholder="https://instagram.com/yourhandle"
                    dir="ltr"
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>

              {/* TikTok */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/20 text-white flex items-center justify-center font-bold text-sm">
                      🎵
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">تيك توك (TikTok)</div>
                      <div className="text-[10px] text-neutral-400">قناة الفيديوهات ومراجعات الأجهزة على تيك توك</div>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-neutral-400 font-medium">
                      {settings.social_tiktok_enabled ? "ظاهر في المتجر" : "مخفي"}
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.social_tiktok_enabled}
                      onChange={(e) => setSettings({ ...settings, social_tiktok_enabled: e.target.checked })}
                      className="w-4 h-4 accent-lime-400 rounded cursor-pointer"
                    />
                  </label>
                </div>

                <div>
                  <input
                    type="url"
                    value={settings.social_tiktok}
                    onChange={(e) => setSettings({ ...settings, social_tiktok: e.target.value })}
                    placeholder="https://tiktok.com/@youraccount"
                    dir="ltr"
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>
            </div>

            {/* Direct Contact & Location Info */}
            <div className="bg-[#141c18] border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <span className="text-lime-400 text-base">📞</span>
                <span>أرقام التواصل وخدمة العملاء</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-neutral-300">
                      رقم الواتساب الرسمي (بدون علامة +) *
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-neutral-400 font-medium">
                        {settings.whatsapp_enabled ? "ظاهر في المتجر" : "مخفي"}
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.whatsapp_enabled}
                        onChange={(e) => setSettings({ ...settings, whatsapp_enabled: e.target.checked })}
                        className="w-4 h-4 accent-lime-400 rounded cursor-pointer"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={settings.whatsapp_number}
                    onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                    placeholder="201131350988"
                    dir="ltr"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">يستخدم لتوجيه المحادثات وطلبات الشراء الفورية.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    هاتف المبيعات والاستفسارات
                  </label>
                  <input
                    type="text"
                    value={settings.phone_number}
                    onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
                    placeholder="0106 571 2366"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">يظهر في الفوتر وصفحة خدمة العملاء.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    مواعيد وساعات العمل
                  </label>
                  <input
                    type="text"
                    value={settings.sales_hours}
                    onChange={(e) => setSettings({ ...settings, sales_hours: e.target.value })}
                    placeholder="يومياً من 10:00 صباحاً حتى 11:00 مساءً"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    عنوان المقر الرئيسي / المعرض
                  </label>
                  <input
                    type="text"
                    value={settings.address_text}
                    onChange={(e) => setSettings({ ...settings, address_text: e.target.value })}
                    placeholder="التجمع الخامس، شارع التسعين، القاهرة"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#141c18] border border-white/10 rounded-2xl p-5 sticky top-40 space-y-4">
              <span className="text-xs font-bold text-lime-400 block">📱 معاينة أزرار التواصل في الفوتر:</span>
              <div className="p-4 bg-[#0d1210] rounded-xl border border-white/10 space-y-3">
                <div className="text-xs text-neutral-300 font-bold">تابعنا وتواصل معنا:</div>
                <div className="flex items-center gap-3">
                  {settings.social_facebook_enabled && (
                    <div className="w-8 h-8 rounded-full bg-[#1877F2]/20 border border-[#1877F2]/40 text-[#1877F2] flex items-center justify-center text-xs font-bold">
                      f
                    </div>
                  )}
                  {settings.social_instagram_enabled && (
                    <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-center text-xs">
                      📸
                    </div>
                  )}
                  {settings.social_tiktok_enabled && (
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center text-xs">
                      🎵
                    </div>
                  )}
                  {settings.whatsapp_enabled && (
                    <div className="w-8 h-8 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] flex items-center justify-center text-xs">
                      💬
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 4: SHIPPING CONFIGURATION */}
      {/* ==================================================================== */}
      {subTab === "shipping" && (
        <div className="space-y-6">
          {/* Card: Free Shipping Threshold */}
          <div className="bg-[#141c18] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lime-400 text-lg">🎁</span>
                <h3 className="text-sm font-extrabold text-white">الشحن المجاني (Free Shipping Promotion)</h3>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-xs font-bold text-neutral-300">تفعيل الشحن المجاني التلقائي:</span>
                <input
                  type="checkbox"
                  checked={settings.free_shipping_enabled}
                  onChange={(e) => setSettings({ ...settings, free_shipping_enabled: e.target.checked })}
                  className="w-4 h-4 accent-lime-400 rounded cursor-pointer"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  الحد الأدنى لقيمة الطلب المؤهلة للشحن المجاني ({settings.currency}) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={settings.free_shipping_threshold}
                  onChange={(e) => setSettings({ ...settings, free_shipping_threshold: Number(e.target.value) || 0 })}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400 font-bold"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  إذا وصل إجمالي سلة العميل لهذا المبلغ تصبح مصاريف الشحن 0 تلقائياً.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  رسالة الإشعار الترويجي في سلة الشراء
                </label>
                <input
                  type="text"
                  value={settings.free_shipping_message}
                  onChange={(e) => setSettings({ ...settings, free_shipping_message: e.target.value })}
                  placeholder="شحن مجاني لكافة المحافظات للطلبات الأعلى من 5000 ج.م"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  تظهر في شريط تقدم الشحن المجاني بأعلى سلة التسوق.
                </span>
              </div>
            </div>
          </div>

          {/* Card: Governorates & Shipping Rates Dynamic Table */}
          <div className="bg-[#141c18] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span className="text-lime-400 text-base">🚚</span>
                  <span>أسعار الشحن حسب المحافظات والمدن ({settings.shipping_cities.length})</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  يمكنك إضافة مناطق ومدن جديدة، ضبط تكلفة التوصيل، وتفعيل أو تعطيل الشحن لمنطقة محددة.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleBulkToggleCities(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-neutral-300 transition-colors cursor-pointer"
                >
                  تفعيل الكل
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkToggleCities(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-neutral-300 transition-colors cursor-pointer"
                >
                  تعطيل الكل
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCityIndex(null);
                    setNewCity({ name: "", shipping: 60, days: "24-48 ساعة", is_active: true });
                    setShowAddCityModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-black font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>+</span>
                  <span>إضافة مدينة / محافظة جديدة</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400 text-xs">
                    <th className="py-3 px-3">المحافظة / المدينة</th>
                    <th className="py-3 px-3">تكلفة الشحن ({settings.currency})</th>
                    <th className="py-3 px-3">مدة التوصيل التقديرية</th>
                    <th className="py-3 px-3 text-center">الحالة</th>
                    <th className="py-3 px-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-neutral-200">
                  {settings.shipping_cities.map((city, idx) => (
                    <tr key={city.id || idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">
                        {city.name}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-lime-400">
                        {formatCurrency(city.shipping, settings)}
                      </td>
                      <td className="py-3 px-3 text-neutral-400">
                        {city.days}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleCityActive(idx)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition-colors ${
                            city.is_active
                              ? "bg-lime-400/20 text-lime-400 border border-lime-400/30"
                              : "bg-white/10 text-neutral-400 border border-white/10"
                          }`}
                        >
                          {city.is_active ? "نشط ومتاح ✓" : "مغلق مؤقتاً ✕"}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCityIndex(idx);
                              setNewCity({ ...city });
                              setShowAddCityModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                            title="تعديل"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCity(idx)}
                            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors cursor-pointer"
                            title="حذف"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 5: PAYMENT METHODS */}
      {/* ==================================================================== */}
      {subTab === "payment" && (
        <div className="space-y-6">
          {/* Method 1: Cash on Delivery (COD) */}
          <div className="bg-[#141c18] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">💵</span>
                <div>
                  <h3 className="text-sm font-extrabold text-white">الدفع عند الاستلام (Cash on Delivery - COD)</h3>
                  <span className="text-[11px] text-neutral-400">المعاينة والفحص قبل الدفع للمندوب</span>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-xs font-bold text-neutral-300">
                  {settings.payment_cod_enabled ? "مفعّل في المتجر" : "معطّل"}
                </span>
                <input
                  type="checkbox"
                  checked={settings.payment_cod_enabled}
                  onChange={(e) => setSettings({ ...settings, payment_cod_enabled: e.target.checked })}
                  className="w-4 h-4 accent-lime-400 rounded cursor-pointer"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  عنوان طريقة الدفع الظاهر للعميل
                </label>
                <input
                  type="text"
                  value={settings.payment_cod_title}
                  onChange={(e) => setSettings({ ...settings, payment_cod_title: e.target.value })}
                  placeholder="الدفع عند الاستلام بعد المعاينة والفحص"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  ملاحظات وتعليمات الفحص في صفحة الدفع
                </label>
                <textarea
                  rows={2}
                  value={settings.payment_cod_notes}
                  onChange={(e) => setSettings({ ...settings, payment_cod_notes: e.target.value })}
                  placeholder="لك كامل الحق في فتح الشحنة وفحص الجهاز..."
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-lime-400 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Method 2: Vodafone Cash (E-Wallet) */}
          <div className="bg-[#141c18] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E60000] text-white flex items-center justify-center font-bold text-sm">
                  V
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">فودافون كاش والمحافظ الإلكترونية (Vodafone Cash)</h3>
                  <span className="text-[11px] text-neutral-400">التحويل الفوري عبر محافظ الهواتف الذكية</span>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-xs font-bold text-neutral-300">
                  {settings.payment_vodafone_cash_enabled ? "مفعّل في المتجر" : "معطّل"}
                </span>
                <input
                  type="checkbox"
                  checked={settings.payment_vodafone_cash_enabled}
                  onChange={(e) => setSettings({ ...settings, payment_vodafone_cash_enabled: e.target.checked })}
                  className="w-4 h-4 accent-lime-400 rounded cursor-pointer"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-8 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    رقم محفظة فودافون كاش لاستقبال المدفوعات *
                  </label>
                  <input
                    type="text"
                    value={settings.payment_vodafone_cash_number}
                    onChange={(e) => setSettings({ ...settings, payment_vodafone_cash_number: e.target.value })}
                    placeholder="مثال: 01012345678"
                    dir="ltr"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400 font-bold tracking-widest text-right"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    يظهر للعميل زر نسخ مباشر لرقم المحفظة عند اختيارها في صفحة الدفع.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    تعليمات التحويل وإثبات الدفع للعميل
                  </label>
                  <textarea
                    rows={2}
                    value={settings.payment_vodafone_cash_instructions}
                    onChange={(e) => setSettings({ ...settings, payment_vodafone_cash_instructions: e.target.value })}
                    placeholder="قم بالتحويل على رقم المحفظة وأرسل صورة رسالة التأكيد عبر واتساب..."
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-lime-400 leading-relaxed"
                  />
                </div>
              </div>

              {/* QR Code Upload for Vodafone Cash */}
              <div className="md:col-span-4 space-y-2">
                <label className="block text-xs font-bold text-neutral-300">
                  كود الاستجابة السريعة (QR Code)
                </label>
                <div className="border border-dashed border-white/20 rounded-xl p-3 bg-black/40 text-center flex flex-col items-center justify-center min-h-[120px]">
                  {settings.payment_vodafone_cash_qr ? (
                    <div className="space-y-2">
                      <img
                        src={settings.payment_vodafone_cash_qr}
                        alt="Vodafone Cash QR"
                        className="w-20 h-20 object-contain rounded-lg mx-auto bg-white p-1"
                      />
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, payment_vodafone_cash_qr: "" })}
                        className="text-[11px] text-rose-400 hover:underline cursor-pointer block mx-auto"
                      >
                        حذف الكود
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold cursor-pointer transition-colors inline-block">
                        {uploadingVodafoneQR ? "جاري الرفع..." : "رفع صورة QR"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploadingVodafoneQR(true);
                            const url = await handleImageUpload(file);
                            if (url) setSettings({ ...settings, payment_vodafone_cash_qr: url });
                            setUploadingVodafoneQR(false);
                          }}
                        />
                      </label>
                      <span className="text-[10px] text-neutral-500 block mt-1">اختياري للمسح السريع</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Method 3: InstaPay */}
          <div className="bg-[#141c18] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#5A287F] text-white flex items-center justify-center font-bold text-sm">
                  ⚡
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">إنستاباي والتحويل اللحظي (InstaPay)</h3>
                  <span className="text-[11px] text-neutral-400">التحويل البنكي اللحظي عبر شبكة المدفوعات اللحظية IPN</span>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-xs font-bold text-neutral-300">
                  {settings.payment_instapay_enabled ? "مفعّل في المتجر" : "معطّل"}
                </span>
                <input
                  type="checkbox"
                  checked={settings.payment_instapay_enabled}
                  onChange={(e) => setSettings({ ...settings, payment_instapay_enabled: e.target.checked })}
                  className="w-4 h-4 accent-lime-400 rounded cursor-pointer"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-8 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    معرف إنستاباي (IPA Handle) أو رابط الدفع *
                  </label>
                  <input
                    type="text"
                    value={settings.payment_instapay_handle}
                    onChange={(e) => setSettings({ ...settings, payment_instapay_handle: e.target.value })}
                    placeholder="مثال: mobilestore@instapay أو https://ipn.eg/..."
                    dir="ltr"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400 font-bold text-right"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    يمكن للعميل نسخه بضغطة زر واحدة لإتمام التحويل المباشر في تطبيق إنستاباي.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    تعليمات وإشعار التحويل للعميل
                  </label>
                  <textarea
                    rows={2}
                    value={settings.payment_instapay_instructions}
                    onChange={(e) => setSettings({ ...settings, payment_instapay_instructions: e.target.value })}
                    placeholder="قم بالتحويل عبر تطبيق إنستاباي واحتفظ بإيصال العملية..."
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-lime-400 leading-relaxed"
                  />
                </div>
              </div>

              {/* QR Code Upload for InstaPay */}
              <div className="md:col-span-4 space-y-2">
                <label className="block text-xs font-bold text-neutral-300">
                  كود InstaPay QR Code
                </label>
                <div className="border border-dashed border-white/20 rounded-xl p-3 bg-black/40 text-center flex flex-col items-center justify-center min-h-[120px]">
                  {settings.payment_instapay_qr ? (
                    <div className="space-y-2">
                      <img
                        src={settings.payment_instapay_qr}
                        alt="InstaPay QR"
                        className="w-20 h-20 object-contain rounded-lg mx-auto bg-white p-1"
                      />
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, payment_instapay_qr: "" })}
                        className="text-[11px] text-rose-400 hover:underline cursor-pointer block mx-auto"
                      >
                        حذف الكود
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold cursor-pointer transition-colors inline-block">
                        {uploadingInstapayQR ? "جاري الرفع..." : "رفع صورة QR"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploadingInstapayQR(true);
                            const url = await handleImageUpload(file);
                            if (url) setSettings({ ...settings, payment_instapay_qr: url });
                            setUploadingInstapayQR(false);
                          }}
                        />
                      </label>
                      <span className="text-[10px] text-neutral-500 block mt-1">اختياري للدفع السريع بالباركود</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 6: THEME & VISUAL APPEARANCE */}
      {/* ==================================================================== */}
      {subTab === "theme" && (
        <div className="space-y-6">
          {/* Card: Colors */}
          <div className="bg-[#141c18] border border-white/10 rounded-2xl p-5 space-y-5">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <span className="text-lime-400 text-base">🎨</span>
              <span>الألوان الرئيسية لثيم المتجر (Store Brand Colors)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Color */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-neutral-300">
                  اللون الأساسي (Primary Brand Color) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="w-12 h-12 rounded-xl border border-white/20 cursor-pointer bg-transparent"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={settings.primary_color}
                      onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                      placeholder="#A3E635"
                      dir="ltr"
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-lime-400"
                    />
                    <span className="text-[10px] text-neutral-500 mt-0.5 block">
                      يتحكم في أزرار الشراء، الشارات الترويجية، وألوان التمييز الرئيسية.
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-neutral-400 font-bold block">نماذج ألوان سريعة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PRESETS.map((p) => (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() => setSettings({ ...settings, primary_color: p.hex })}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/10 hover:border-white/30 transition-all flex items-center gap-1.5 cursor-pointer"
                        style={{ backgroundColor: `${p.hex}22`, color: p.hex }}
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.hex }} />
                        <span>{p.name.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Secondary Color */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-neutral-300">
                  اللون الثانوي (Secondary Color / Text Accent) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    className="w-12 h-12 rounded-xl border border-white/20 cursor-pointer bg-transparent"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={settings.secondary_color}
                      onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                      placeholder="#10B981"
                      dir="ltr"
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-lime-400"
                    />
                    <span className="text-[10px] text-neutral-500 mt-0.5 block">
                      يتحكم في العناوين الثانوية والتدرجات والرموز الإرشادية.
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-neutral-400 font-bold block">نماذج ألوان سريعة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PRESETS.map((p) => (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() => setSettings({ ...settings, secondary_color: p.hex })}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/10 hover:border-white/30 transition-all flex items-center gap-1.5 cursor-pointer"
                        style={{ backgroundColor: `${p.hex}22`, color: p.hex }}
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.hex }} />
                        <span>{p.name.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Theme Preview Pill */}
            <div className="p-4 rounded-xl bg-black/50 border border-white/10 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-bold text-neutral-300">معاينة تأثير الألوان على الأزرار والشارات:</span>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  style={{ backgroundColor: settings.primary_color }}
                  className="px-4 py-2 rounded-xl text-black font-extrabold text-xs shadow-md pointer-events-none"
                >
                  أضف إلى السلة 🛒
                </button>
                <span
                  style={{ color: settings.primary_color, borderColor: `${settings.primary_color}55`, backgroundColor: `${settings.primary_color}15` }}
                  className="px-3 py-1 rounded-full text-xs font-bold border"
                >
                  ضمان معتمد 12 شهر
                </span>
                <span
                  style={{ color: settings.secondary_color }}
                  className="text-xs font-bold"
                >
                  رابط ثانوي مخصص ←
                </span>
              </div>
            </div>
          </div>

          {/* Card: Hero Banners Manager */}
          <div className="bg-[#141c18] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span className="text-lime-400 text-base">🖼️</span>
                  <span>صور وبانرات الواجهة الرئيسية (Hero Banners) ({settings.hero_slides.length})</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  تحكم بالصور والبانرات الترويجية في أعلى الصفحة الرئيسية مع إمكانية الترتيب وإضافة نصوص وأزرار توجيه.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingSlideIndex(null);
                  setSlideForm({
                    image: "",
                    title: "",
                    subtitle: "",
                    badge: "أحدث الهواتف الذكية لعام 2026",
                    button_text: "تصفح كل الأجهزة",
                    button_link: "/shop",
                    is_active: true
                  });
                  setShowAddSlideModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-black font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span>+</span>
                <span>إضافة بانر / شريحة هيرو جديدة</span>
              </button>
            </div>

            {/* Slides List */}
            {settings.hero_slides.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-xs">
                لا توجد شرائح هيرو مضافة حالياً. اضغط على الزر أعلاه لإضافة أول بانر.
              </div>
            ) : (
              <div className="space-y-3">
                {settings.hero_slides.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 relative flex items-center justify-center">
                        {slide.image ? (
                          <img
                            src={slide.image}
                            alt={slide.title || "Hero banner"}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-xl">🖼️</span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-white">
                            {slide.title || "بانر بدون عنوان"}
                          </span>
                          {slide.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] bg-lime-400/15 text-lime-400 border border-lime-400/30">
                              {slide.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-400 line-clamp-1 max-w-lg">
                          {slide.subtitle || "بدون وصف إضافي"}
                        </p>
                        <div className="text-[10px] text-neutral-500 flex items-center gap-2">
                          <span>الزر: {slide.button_text || "تصفح"}</span>
                          <span>·</span>
                          <span dir="ltr">{slide.button_link || "/shop"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                      {/* Active toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...settings.hero_slides];
                          updated[idx].is_active = !updated[idx].is_active;
                          setSettings({ ...settings, hero_slides: updated });
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition-colors ${
                          slide.is_active
                            ? "bg-lime-400/20 text-lime-400 border border-lime-400/30"
                            : "bg-white/10 text-neutral-400 border border-white/10"
                        }`}
                      >
                        {slide.is_active ? "نشط ومفعل ✓" : "معطل ✕"}
                      </button>

                      {/* Reorder buttons */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveSlide(idx, "up")}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-xs cursor-pointer"
                        title="تحريك لأعلى"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={idx === settings.hero_slides.length - 1}
                        onClick={() => handleMoveSlide(idx, "down")}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-xs cursor-pointer"
                        title="تحريك لأسفل"
                      >
                        ▼
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSlideIndex(idx);
                          setSlideForm({ ...slide });
                          setShowAddSlideModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer"
                        title="تعديل"
                      >
                        ✏️
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteSlide(idx)}
                        className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs cursor-pointer"
                        title="حذف"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD / EDIT SHIPPING CITY */}
      {/* ==================================================================== */}
      {showAddCityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141c18] border border-white/15 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white">
                {editingCityIndex !== null ? "تعديل بيانات المحافظة / المدينة" : "إضافة محافظة أو مدينة جديدة"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCityModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  اسم المحافظة أو المدينة *
                </label>
                <input
                  type="text"
                  value={newCity.name || ""}
                  onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
                  placeholder="مثال: الغربية (طنطا)"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  تكلفة الشحن ({settings.currency}) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={newCity.shipping ?? 60}
                  onChange={(e) => setNewCity({ ...newCity, shipping: Number(e.target.value) || 0 })}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  مدة التوصيل التقديرية
                </label>
                <input
                  type="text"
                  value={newCity.days || ""}
                  onChange={(e) => setNewCity({ ...newCity, days: e.target.value })}
                  placeholder="مثال: 24-48 ساعة أو 2-3 أيام"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="city_active"
                  checked={newCity.is_active ?? true}
                  onChange={(e) => setNewCity({ ...newCity, is_active: e.target.checked })}
                  className="w-4 h-4 accent-lime-400 rounded cursor-pointer"
                />
                <label htmlFor="city_active" className="text-xs text-white font-bold cursor-pointer">
                  متاحة للشحن واستقبال الطلبات فوراً
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleSaveCity}
                className="flex-1 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-black font-extrabold text-xs transition-colors cursor-pointer"
              >
                {editingCityIndex !== null ? "حفظ التعديلات" : "إضافة المحافظة"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddCityModal(false)}
                className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD / EDIT HERO SLIDE */}
      {/* ==================================================================== */}
      {showAddSlideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141c18] border border-white/15 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl text-right space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white">
                {editingSlideIndex !== null ? "تعديل شريحة البانر الرئيسي" : "إضافة شريحة بانر هيرو جديدة"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddSlideModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Image Upload / URL */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  صورة البانر (Hero Image) *
                </label>
                <div className="flex items-center gap-3">
                  {slideForm.image && (
                    <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/15 p-1 shrink-0 relative flex items-center justify-center overflow-hidden">
                      <img src={slideForm.image} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <label className="inline-block px-3.5 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-black font-extrabold text-xs cursor-pointer transition-all">
                      {uploadingHeroImg ? "جاري الرفع..." : "رفع صورة من الجهاز"}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingHeroImg}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingHeroImg(true);
                          const url = await handleImageUpload(file);
                          if (url) setSlideForm({ ...slideForm, image: url });
                          setUploadingHeroImg(false);
                        }}
                      />
                    </label>
                    <input
                      type="url"
                      value={slideForm.image || ""}
                      onChange={(e) => setSlideForm({ ...slideForm, image: e.target.value })}
                      placeholder="أو ضع رابط مباشر للصورة هنا..."
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-lime-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  الشارة العلوية (Badge Text)
                </label>
                <input
                  type="text"
                  value={slideForm.badge || ""}
                  onChange={(e) => setSlideForm({ ...slideForm, badge: e.target.value })}
                  placeholder="مثال: أحدث هواتف آبل وسامسونج لعام 2026"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  العنوان الرئيسي للبانر (Headline) *
                </label>
                <input
                  type="text"
                  value={slideForm.title || ""}
                  onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                  placeholder="مثال: هواتف ذكية تصنع الفرق، وقوة تليق باختياراتك"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  الوصف التوضيحي (Subtitle / Description)
                </label>
                <textarea
                  rows={2}
                  value={slideForm.subtitle || ""}
                  onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
                  placeholder="اكتب نبذة ترويجية جذابة تظهر أسفل العنوان..."
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    نص زر الإجراء (Button CTA)
                  </label>
                  <input
                    type="text"
                    value={slideForm.button_text || ""}
                    onChange={(e) => setSlideForm({ ...slideForm, button_text: e.target.value })}
                    placeholder="تصفح كل الأجهزة"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    رابط الزر (Target URL)
                  </label>
                  <input
                    type="text"
                    value={slideForm.button_link || ""}
                    onChange={(e) => setSlideForm({ ...slideForm, button_link: e.target.value })}
                    placeholder="/shop أو /shop?category=phones"
                    dir="ltr"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lime-400 text-right"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="slide_active"
                  checked={slideForm.is_active ?? true}
                  onChange={(e) => setSlideForm({ ...slideForm, is_active: e.target.checked })}
                  className="w-4 h-4 accent-lime-400 rounded cursor-pointer"
                />
                <label htmlFor="slide_active" className="text-xs text-white font-bold cursor-pointer">
                  عرض هذا البانر في الصفحة الرئيسية فوراً
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleSaveSlide}
                className="flex-1 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-black font-extrabold text-xs transition-colors cursor-pointer"
              >
                {editingSlideIndex !== null ? "حفظ تعديلات البانر" : "إضافة البانر"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddSlideModal(false)}
                className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
