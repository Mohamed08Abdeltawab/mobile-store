"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import { PREDEFINED_COLORS, Product, ProductCondition } from "@/lib/types";

const CATEGORIES = [
  "الموبايلات",
  "التابلت",
  "السماعات",
  "الجرابات ووسائل الحماية",
  "الشواحن والكابلات",
  "الساعات الذكية",
  "إكسسوارات أخرى"
];

export const BRAND_OPTIONS = [
  { id: "samsung", name_ar: "سامسونج", name_en: "Samsung", display: "سامسونج (Samsung)" },
  { id: "apple", name_ar: "آبل", name_en: "Apple", display: "آبل (Apple)" },
  { id: "xiaomi", name_ar: "شاومي", name_en: "Xiaomi", display: "شاومي (Xiaomi)" },
  { id: "oppo", name_ar: "أوبو", name_en: "OPPO", display: "أوبو (OPPO)" },
  { id: "realme", name_ar: "ريلمي", name_en: "Realme", display: "ريلمي (Realme)" },
  { id: "vivo", name_ar: "فيفو", name_en: "Vivo", display: "فيفو (Vivo)" },
  { id: "honor", name_ar: "هونر", name_en: "Honor", display: "هونر (Honor)" },
  { id: "infinix", name_ar: "إنفينيكس", name_en: "Infinix", display: "إنفينيكس (Infinix)" },
  { id: "tecno", name_ar: "تكنو", name_en: "Tecno", display: "تكنو (Tecno)" },
  { id: "huawei", name_ar: "هواوي", name_en: "Huawei", display: "هواوي (Huawei)" },
  { id: "anker", name_ar: "أنكر", name_en: "Anker", display: "أنكر (Anker)" },
  { id: "joyroom", name_ar: "جويروم", name_en: "Joyroom", display: "جويروم (Joyroom)" },
  { id: "baseus", name_ar: "بيسوس", name_en: "Baseus", display: "بيسوس (Baseus)" },
  { id: "sony", name_ar: "سوني", name_en: "Sony", display: "سوني (Sony)" },
  { id: "other", name_ar: "ماركة أخرى", name_en: "Other", display: "أخرى (Other)" }
];

export function getBrandDisplay(brand: string | undefined): string {
  if (!brand) return "سامسونج (Samsung)";
  const trimmed = brand.trim();
  if (trimmed.includes("(") && trimmed.includes(")")) return trimmed;
  const match = BRAND_OPTIONS.find(b =>
    b.id.toLowerCase() === trimmed.toLowerCase() ||
    b.name_en.toLowerCase() === trimmed.toLowerCase() ||
    b.name_ar === trimmed ||
    b.name_ar.replace(/[أإآ]/g, "ا") === trimmed.replace(/[أإآ]/g, "ا")
  );
  return match ? match.display : trimmed;
}

export const WARRANTY_OPTIONS = [
  "14 يوم",
  "شهر",
  "شهرين",
  "3 شهور",
  "6 شهور",
  "سنة",
  "سنتين",
  "ضمان آخر"
] as const;

export const CONDITION_OPTIONS: ProductCondition[] = ["جديد", "كسر زيرو", "مستعمل"];

const STORAGE_OPTIONS = ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"];
const RAM_OPTIONS = ["2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB", "24GB"];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { setIsAdmin } = useCart();
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [brandsList, setBrandsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [manualImageUrl, setManualImageUrl] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [priceError, setPriceError] = useState("");

  // Product Form State (Default Values for Mobile Products as per Requirement 6)
  const initialFormState = {
    name: "",
    category: "الموبايلات",
    brand: "سامسونج (Samsung)",
    price: "",
    original_price: "",
    quantity: 10,
    condition: "جديد" as ProductCondition,
    description: "",
    is_featured: false,
    is_published: true,
    images: [] as string[],
    // Specs defaults: 128GB Storage, 8GB RAM, 4G LTE Network
    ram: "8GB",
    storage: "128GB",
    network: "4G LTE",
    warranty_duration: "سنة",
    custom_warranty: "",
    battery_health: "100%",
    screen_condition: "أصلية 100% بدون أي خدوش",
    frame_condition: "ممتاز كأنه جديد",
    back_condition: "سليم بدون أي علامات",
    repaired: false,
    box_available: true,
    charger_available: true,
    charging_power: "65W",
    connector_type: "Type-C",
    connection_type: "بلوتوث 5.3",
    compatibility: "iOS / Android",
    colors: [
      { id: "black", name_ar: "أسود", hex: "#111827", quantity: 5 }
    ]
  };

  const [form, setForm] = useState(initialFormState);

  function notify(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  }

  async function loadData() {
    setLoading(true);
    try {
      const [pRes, oRes, cRes, bRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders"),
        fetch("/api/categories"),
        fetch("/api/brands")
      ]);

      if (oRes.status === 401) {
        setIsAdmin(false);
        router.push("/admin/login");
        return;
      }

      setIsAdmin(true);
      const pData = await pRes.json();
      const oData = await oRes.json();
      const cData = await cRes.json();
      const bData = await bRes.json();

      if (pData.success) setProducts(pData.products || []);
      if (oData.success) setOrders(oData.orders || []);
      if (cData.success) setCategoriesList(cData.categories || []);
      if (bData.success) setBrandsList(bData.brands || []);
    } catch (err) {
      console.error("Admin loadData error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAdmin(false);
    router.push("/admin/login");
  }

  // Handle Multi-Image Upload (Up to 10 images)
  async function handleMultipleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentCount = form.images.length;
    const remainingSlots = 10 - currentCount;

    if (remainingSlots <= 0) {
      alert("لقد وصلت للحد الأقصى المسموح به (10 صور للمنتج الواحد)");
      e.target.value = "";
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      notify(`تم أخذ أول ${remainingSlots} صور فقط للوصول إلى الحد الأقصى (10 صور)`);
    }

    setUploadingImage(true);
    setUploadError("");

    const formData = new FormData();
    filesToUpload.forEach(f => formData.append("files", f));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.urls)) {
        setForm(prev => {
          const combined = [...prev.images, ...data.urls].slice(0, 10);
          return {
            ...prev,
            images: combined
          };
        });
        notify(`تم رفع وتخزين ${data.urls.length} صور بنجاح ✓`);
      } else {
        setUploadError(data.error || "فشل رفع الصور، يرجى المحاولة مرة أخرى");
      }
    } catch (err: any) {
      setUploadError("حدث خطأ أثناء الاتصال بالخادم لرفع الصور");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  }

  function handleAddManualImage() {
    const url = manualImageUrl.trim();
    if (!url) return;
    if (form.images.length >= 10) {
      alert("لقد وصلت للحد الأقصى المسموح به (10 صور)");
      return;
    }
    setForm(prev => ({
      ...prev,
      images: [...prev.images, url].slice(0, 10)
    }));
    setManualImageUrl("");
    notify("تمت إضافة رابط الصورة بنجاح ✓");
  }

  function handleSetAsCover(idx: number) {
    if (idx === 0) return;
    setForm(prev => {
      const imgs = [...prev.images];
      const [chosen] = imgs.splice(idx, 1);
      imgs.unshift(chosen);
      return {
        ...prev,
        images: imgs
      };
    });
    notify("تم تعيين الصورة كغلاف رئيسي للمنتج");
  }

  async function handleRemoveImage(idx: number) {
    const targetUrl = form.images[idx];
    if (!targetUrl) return;

    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));

    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl })
      });
      notify("تم حذف ملف الصورة بنجاح");
    } catch (err) {
      console.error(err);
    }
  }

  // Toggle or add color in form
  function handleToggleColor(colorObj: typeof PREDEFINED_COLORS[0]) {
    setForm(prev => {
      const exists = prev.colors.some(c => c.id === colorObj.id);
      if (exists) {
        return {
          ...prev,
          colors: prev.colors.filter(c => c.id !== colorObj.id)
        };
      } else {
        return {
          ...prev,
          colors: [
            ...prev.colors,
            { id: colorObj.id, name_ar: colorObj.name_ar || colorObj.name, hex: colorObj.hex || colorObj.hex_code, quantity: 5 }
          ]
        };
      }
    });
  }

  function handleUpdateColorQty(colorId: string, qty: number) {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.map(c => c.id === colorId ? { ...c, quantity: Math.max(0, qty) } : c)
    }));
  }

  async function handleDeleteProduct(id: string | number, name: string) {
    if (!confirm(`هل أنت متأكد من حذف المنتج "${name}" نهائياً من قاعدة البيانات؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        notify(`تم حذف المنتج "${name}" بنجاح ✓`);
        loadData();
      } else {
        alert(data.error || "فشل حذف المنتج من قاعدة البيانات");
      }
    } catch (err: any) {
      alert("حدث خطأ أثناء محاولة حذف المنتج: " + (err.message || "خطأ غير معروف"));
    }
  }

  function startEdit(p: Product) {
    setEditingProduct(p);

    const initialImages = Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : (p.image ? [p.image] : []);

    const specs = p.specifications || {};

    const colorItems = Array.isArray(p.colors) && p.colors.length > 0
      ? p.colors.map(c => ({
          id: c.color_id || c.id || "black",
          name_ar: c.name_ar || c.color_name || c.name || "أسود",
          hex: c.hex || c.hex_code || "#111827",
          quantity: c.quantity !== undefined ? c.quantity : 5
        }))
      : [
          { id: "black", name_ar: "أسود", hex: "#111827", quantity: Number(p.quantity ?? 5) }
        ];

    // Normalize condition
    let normalizedCondition: ProductCondition = "جديد";
    const rawCond = (p.condition || "").trim().toLowerCase();
    if (rawCond.includes("كسر") || rawCond.includes("like")) {
      normalizedCondition = "كسر زيرو";
    } else if (rawCond.includes("مستعمل") || rawCond.includes("used") || rawCond.includes("pre-owned")) {
      normalizedCondition = "مستعمل";
    }

    // Determine warranty duration & custom warranty
    const savedWarranty = (specs.warranty || "").trim();
    const standardWarranties = ["14 يوم", "شهر", "شهرين", "3 شهور", "6 شهور", "سنة", "سنتين"];
    let warrantyDuration = "سنة";
    let customWarranty = "";

    if (standardWarranties.includes(savedWarranty)) {
      warrantyDuration = savedWarranty;
      customWarranty = "";
    } else if (savedWarranty) {
      warrantyDuration = "ضمان آخر";
      customWarranty = savedWarranty;
    }

    setForm({
      name: p.name,
      category: p.category || p.cat || "الموبايلات",
      brand: getBrandDisplay(p.brand || "Samsung"),
      price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : (p.old_price ? String(p.old_price) : ""),
      quantity: Number(p.quantity ?? 10),
      condition: normalizedCondition,
      description: p.description || p.overview || "",
      is_featured: !!p.is_featured,
      is_published: p.is_published !== undefined ? !!p.is_published : true,
      images: initialImages,
      // Specs - use SAVED values, NOT default values!
      ram: specs.ram ? String(specs.ram) : "8GB",
      storage: specs.storage ? String(specs.storage) : "128GB",
      network: specs.network ? String(specs.network) : "4G LTE",
      warranty_duration: warrantyDuration,
      custom_warranty: customWarranty,
      battery_health: specs.battery_health ? String(specs.battery_health) : "100%",
      screen_condition: specs.screen_condition ? String(specs.screen_condition) : "أصلية 100% بدون أي خدوش",
      frame_condition: specs.frame_condition ? String(specs.frame_condition) : "ممتاز كأنه جديد",
      back_condition: specs.back_condition ? String(specs.back_condition) : "سليم بدون أي علامات",
      repaired: Boolean(specs.repaired),
      box_available: specs.box_available === false ? false : true,
      charger_available: specs.charger_available === false ? false : true,
      charging_power: specs.charging_power ? String(specs.charging_power) : "65W",
      connector_type: specs.connector_type ? String(specs.connector_type) : "Type-C",
      connection_type: specs.connection_type ? String(specs.connection_type) : "بلوتوث 5.3",
      compatibility: specs.compatibility ? String(specs.compatibility) : "iOS / Android",
      colors: colorItems
    });

    setPriceError("");
    setManualImageUrl("");
    setUploadError("");
    setShowProductModal(true);
  }

  function resetForm() {
    setEditingProduct(null);
    setForm(initialFormState);
    setPriceError("");
    setManualImageUrl("");
    setUploadError("");
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    setPriceError("");

    if (!form.name.trim()) {
      alert("يرجى إدخال اسم المنتج بالكامل");
      return;
    }

    if (!form.category) {
      alert("يرجى اختيار القسم الرئيسي للمنتج");
      return;
    }

    if (!form.brand) {
      alert("يرجى اختيار البراند / الماركة");
      return;
    }

    // Strict price validation
    const numPrice = parseFloat(form.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setPriceError("السعر يجب أن يكون أكبر من صفر.");
      return;
    }

    let numOriginal: number | null = null;
    if (form.original_price && form.original_price.trim() !== "") {
      numOriginal = parseFloat(form.original_price);
      if (isNaN(numOriginal) || numOriginal < 0) {
        setPriceError("السعر قبل الخصم لا يمكن أن يكون رقمًا سالبًا.");
        return;
      }
      if (numOriginal <= numPrice) {
        setPriceError("السعر قبل الخصم يجب أن يكون أكبر من سعر البيع الحالي.");
        return;
      }
    }

    if (form.warranty_duration === "ضمان آخر" && !form.custom_warranty.trim()) {
      alert("يرجى كتابة مدة الضمان المطلوبة أو اختيار مدة جاهزة من القائمة");
      return;
    }

    if (form.images.length === 0) {
      alert("يرجى إضافة صورة واحدة على الأقل للمنتج (رفع من الجهاز أو إدخال رابط)");
      return;
    }

    // Determine final warranty string
    const finalWarranty = form.warranty_duration === "ضمان آخر"
      ? form.custom_warranty.trim()
      : form.warranty_duration;

    const specifications: any = {
      warranty: finalWarranty,
      box_available: form.box_available,
      charger_available: form.charger_available
    };

    if (form.category === "الموبايلات" || form.category === "التابلت") {
      specifications.ram = form.ram;
      specifications.storage = form.storage;
      specifications.network = form.network;
      if (form.condition !== "جديد") {
        specifications.battery_health = form.battery_health;
        specifications.screen_condition = form.screen_condition;
        specifications.frame_condition = form.frame_condition;
        specifications.back_condition = form.back_condition;
        specifications.repaired = form.repaired;
      }
    } else if (form.category === "الشواحن والكابلات") {
      specifications.charging_power = form.charging_power;
      specifications.connector_type = form.connector_type;
    } else if (form.category === "السماعات" || form.category === "الساعات الذكية") {
      specifications.connection_type = form.connection_type;
      specifications.compatibility = form.compatibility;
    }

    // Total quantity calculated from colors or direct quantity
    const totalQty = form.colors.length > 0
      ? form.colors.reduce((sum, c) => sum + (c.quantity || 0), 0)
      : Number(form.quantity || 10);

    const payload = {
      name: form.name.trim(),
      cat: form.category,
      category: form.category,
      brand: form.brand,
      price: numPrice,
      old_price: numOriginal,
      original_price: numOriginal,
      quantity: totalQty,
      condition: form.condition,
      description: form.description,
      is_featured: form.is_featured,
      is_published: form.is_published,
      images: form.images.slice(0, 10),
      colors: form.colors,
      specifications
    };

    setIsSaving(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        notify(editingProduct ? "تم تحديث بيانات المنتج بنجاح ✓" : "تمت إضافة المنتج الجديد للكتالوج بنجاح ✓");
        setShowProductModal(false);
        resetForm();
        loadData();
      } else {
        alert(data.error || "حدث خطأ أثناء حفظ المنتج في قاعدة البيانات");
      }
    } catch (err: any) {
      alert("فشل الاتصال بالخادم لحفظ المنتج: " + (err.message || "خطأ غير معروف"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdateOrderStatus(orderRef: string, newStatus: string) {
    try {
      const res = await fetch(`/api/orders/${orderRef}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        notify(`تم تحديث حالة الطلب #${orderRef} إلى: ${newStatus}`);
        loadData();
      } else {
        alert(data.error || "فشل تحديث حالة الطلب");
      }
    } catch (err) {
      alert("فشل تحديث حالة الطلب");
    }
  }

  const totalSales = orders.reduce((sum, o) => sum + (parseFloat(o.total_price || o.total) || 0), 0);
  const pendingOrders = orders.filter(o => o.status === "قيد المراجعة" || o.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#0b0f0d] text-white font-sans" dir="rtl">
      {/* Top Navbar */}
      <header className="bg-[#121815] border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Logo & Title */}
          <Link
            href="/"
            title="الرجوع إلى المتجر"
            className="flex items-center gap-3 text-white no-underline group transition-opacity hover:opacity-90"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-lime-400/15 border border-lime-400 text-lime-400 grid place-items-center font-black text-sm sm:text-base transition-transform group-hover:scale-105 shadow-inner">
              📱
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black m-0 flex items-center gap-1.5 leading-tight">
                <span>لوحة تحكم</span>
                <span className="text-lime-400">فون زون · PhoneZone</span>
              </h1>
              <span className="text-[11px] text-neutral-400 block mt-0.5">
                نظام إدارة المتجر والمخزون والطلبات المعتمد · اضغط للرجوع للمتجر ↗
              </span>
            </div>
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 justify-end">
            <Link
              href="/"
              className="px-3.5 sm:px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-bold no-underline transition-colors flex items-center justify-center gap-1.5"
            >
              <span>زيارة المتجر الرئيسي</span>
              <span className="text-lime-400">↗</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3.5 sm:px-4 py-2 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500 text-rose-300 text-xs sm:text-sm font-bold cursor-pointer transition-colors"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1400px] mx-auto p-3 sm:p-6 md:p-8">
        {/* Flash Notification */}
        {notification && (
          <div className="bg-lime-400/15 border border-lime-400 text-lime-400 px-4 py-3 rounded-xl mb-5 font-bold text-xs sm:text-sm flex items-center gap-2 animate-fadeIn">
            <span>✓</span>
            <span>{notification}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-[#141c18] border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5">
            <span className="text-[11px] sm:text-xs text-neutral-400 block font-medium">إجمالي المنتجات المسجلة</span>
            <div className="text-lg sm:text-2xl md:text-3xl font-black text-white mt-1">
              {products.length} <small className="text-xs sm:text-sm text-lime-400 font-bold">جهاز / إكسسوار</small>
            </div>
          </div>

          <div className="bg-[#141c18] border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5">
            <span className="text-[11px] sm:text-xs text-neutral-400 block font-medium">إجمالي طلبات الشراء</span>
            <div className="text-lg sm:text-2xl md:text-3xl font-black text-white mt-1">
              {orders.length} <small className="text-xs sm:text-sm text-sky-400 font-bold">طلب</small>
            </div>
          </div>

          <div className="bg-[#141c18] border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5">
            <span className="text-[11px] sm:text-xs text-neutral-400 block font-medium">طلبات بانتظار التأكيد</span>
            <div className="text-lg sm:text-2xl md:text-3xl font-black text-amber-400 mt-1">
              {pendingOrders} <small className="text-xs sm:text-sm text-neutral-300 font-bold">طلب معلق</small>
            </div>
          </div>

          <div className="bg-[#141c18] border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5">
            <span className="text-[11px] sm:text-xs text-neutral-400 block font-medium">حجم المبيعات الإجمالي</span>
            <div className="text-lg sm:text-2xl md:text-3xl font-black text-lime-400 mt-1">
              {totalSales.toLocaleString("ar-EG")} <small className="text-xs sm:text-sm text-white font-bold">ج.م</small>
            </div>
          </div>
        </div>

        {/* Tab Navigation: Products & Orders Only (Tabs for categories and brands removed as requested) */}
        <div className="flex gap-2 sm:gap-3 mb-6 border-b border-white/10 pb-3 sm:pb-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-extrabold text-xs sm:text-sm cursor-pointer border-0 whitespace-nowrap transition-all ${
              activeTab === "products"
                ? "bg-lime-400 text-black shadow-lg shadow-lime-400/20"
                : "bg-white/10 text-white hover:bg-white/15"
            }`}
          >
            📱 إدارة المنتجات والمخزون ({products.length})
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-extrabold text-xs sm:text-sm cursor-pointer border-0 whitespace-nowrap transition-all ${
              activeTab === "orders"
                ? "bg-lime-400 text-black shadow-lg shadow-lime-400/20"
                : "bg-white/10 text-white hover:bg-white/15"
            }`}
          >
            📋 الطلبات والواتساب ({orders.length})
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: PRODUCTS MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === "products" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-black text-white">كتالوج المنتجات</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  تحكم بجميع أجهزة الموبايل، التابلت، الشواحن والإكسسوارات مع دعم كامل لحالات الأجهزة (جديد / كسر زيرو / مستعمل).
                </p>
              </div>

              <button
                onClick={() => {
                  resetForm();
                  setShowProductModal(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-sm cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20 transition-all hover:scale-102"
              >
                <span>+</span>
                <span>إضافة منتج جديد</span>
              </button>
            </div>

            {loading ? (
              <div className="py-20 text-center text-neutral-400">جاري تحميل كتالوج المنتجات...</div>
            ) : products.length === 0 ? (
              <div className="bg-[#141c18] border border-white/10 rounded-2xl p-12 text-center">
                <span className="text-4xl block mb-3">📱</span>
                <h3 className="text-lg font-bold text-white mb-2">لا توجد منتجات مسجلة حالياً</h3>
                <p className="text-sm text-neutral-400 mb-6">ابدأ بإضافة أول هاتف أو إكسسوار في المتجر</p>
                <button
                  onClick={() => {
                    resetForm();
                    setShowProductModal(true);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-lime-400 text-black font-extrabold text-sm cursor-pointer"
                >
                  إضافة أول منتج
                </button>
              </div>
            ) : (
              <div className="bg-[#141c18] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-neutral-400 text-xs">
                        <th className="p-4">المنتج</th>
                        <th className="p-4">القسم / البراند</th>
                        <th className="p-4">الحالة</th>
                        <th className="p-4">السعر</th>
                        <th className="p-4">المخزون الكلي</th>
                        <th className="p-4">الألوان المتوفرة</th>
                        <th className="p-4">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {products.map(p => {
                        const coverImg = Array.isArray(p.images) && p.images[0] ? p.images[0] : (p.image || "/img/mobile-concept-01.png");
                        return (
                          <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                            {/* Product Info */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 overflow-hidden relative shrink-0 flex items-center justify-center p-1">
                                  <img
                                    src={coverImg}
                                    alt={p.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/img/mobile-concept-01.png";
                                    }}
                                  />
                                </div>
                                <div>
                                  <h4 className="font-bold text-white text-sm line-clamp-1">{p.name}</h4>
                                  <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-2">
                                    {p.specifications?.storage && <span>{p.specifications.storage}</span>}
                                    {p.specifications?.ram && <span>· {p.specifications.ram} رام</span>}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Category & Brand (Brand displayed with Arabic and English in parentheses) */}
                            <td className="p-4">
                              <div className="text-xs text-white font-semibold">{p.category || p.cat}</div>
                              <div className="text-[11px] text-neutral-400 font-medium">{getBrandDisplay(p.brand)}</div>
                            </td>

                            {/* Condition Badge */}
                            <td className="p-4">
                              <span
                                className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                                  p.condition === "جديد"
                                    ? "bg-lime-400/15 text-lime-400 border border-lime-400/30"
                                    : p.condition === "كسر زيرو"
                                    ? "bg-sky-400/15 text-sky-400 border border-sky-400/30"
                                    : "bg-amber-400/15 text-amber-400 border border-amber-400/30"
                                }`}
                              >
                                {p.condition}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="p-4 font-bold text-white">
                              <div>{Number(p.price).toLocaleString("ar-EG")} ج.م</div>
                              {(p.original_price || p.old_price) && (Number(p.original_price || p.old_price) > p.price) && (
                                <div className="text-[11px] text-neutral-500 line-through">
                                  {Number(p.original_price || p.old_price).toLocaleString("ar-EG")} ج.م
                                </div>
                              )}
                            </td>

                            {/* Stock */}
                            <td className="p-4">
                              <span
                                className={`text-xs font-bold ${
                                  (p.quantity ?? 10) > 5
                                    ? "text-lime-400"
                                    : (p.quantity ?? 10) > 0
                                    ? "text-amber-400"
                                    : "text-rose-400"
                                }`}
                              >
                                {(p.quantity ?? 10) > 0 ? `${p.quantity ?? 10} قطعة` : "نفذ المخزون"}
                              </span>
                            </td>

                            {/* Colors */}
                            <td className="p-4">
                              <div className="flex items-center gap-1.5 flex-wrap max-w-[150px]">
                                {Array.isArray(p.colors) && p.colors.length > 0 ? (
                                  p.colors.map((c, cIdx) => (
                                    <span
                                      key={c.id || c.color_id || cIdx}
                                      title={`${c.name_ar || c.color_name || c.name || ""} (${c.quantity || 0} قطعة)`}
                                      className="w-4 h-4 rounded-full border border-white/20 inline-block"
                                      style={{ backgroundColor: c.hex || c.hex_code || "#000" }}
                                    />
                                  ))
                                ) : (
                                  <span className="text-[11px] text-neutral-500">—</span>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => startEdit(p)}
                                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                                >
                                  تعديل
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                                >
                                  حذف
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ORDERS MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === "orders" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-black text-white">طلبات العملاء والشحن</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  إدارة طلبات المتجر مع إمكانية التواصل الفوري عبر الواتساب وتحديث حالات الشحن.
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="bg-[#141c18] border border-white/10 rounded-2xl p-12 text-center text-neutral-400">
                لا توجد طلبات واردة حتى الآن.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => {
                  const items = Array.isArray(order.items)
                    ? order.items
                    : typeof order.items === "string"
                    ? JSON.parse(order.items)
                    : [];

                  const cleanPhone = (order.customer_phone || "").replace(/\D/g, "");
                  const intlPhone = cleanPhone.startsWith("0") ? `2${cleanPhone}` : cleanPhone;
                  const waUrl = `https://wa.me/${intlPhone}?text=${encodeURIComponent(
                    `مرحباً ${order.customer_name}، نتواصل معك بخصوص طلبك رقم #${order.order_reference} من متجر فون زون.`
                  )}`;

                  return (
                    <div
                      key={order.id}
                      className="bg-[#141c18] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                        {/* Order Summary */}
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-lime-400 font-extrabold text-base">
                              #{order.order_reference}
                            </span>
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                order.status === "تم التسليم"
                                  ? "bg-lime-400/15 text-lime-400 border border-lime-400/30"
                                  : order.status === "تم الشحن"
                                  ? "bg-sky-400/15 text-sky-400 border border-sky-400/30"
                                  : order.status === "تم التأكيد"
                                  ? "bg-indigo-400/15 text-indigo-400 border border-indigo-400/30"
                                  : order.status === "ملغي"
                                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                  : "bg-amber-400/15 text-amber-400 border border-amber-400/30"
                              }`}
                            >
                              {order.status || "قيد المراجعة"}
                            </span>
                          </div>

                          <div className="text-xs text-neutral-400 mt-1">
                            العميل: <strong className="text-white">{order.customer_name}</strong> · هاتف:{" "}
                            <span dir="ltr" className="font-mono text-neutral-300">{order.customer_phone}</span>
                            {order.governorate && ` · محافظة: ${order.governorate}`}
                          </div>
                          {order.address && (
                            <div className="text-xs text-neutral-400 mt-0.5">
                              العنوان بالتفصيل: <span className="text-neutral-200">{order.address}</span>
                            </div>
                          )}
                        </div>

                        {/* Order Actions */}
                        <div className="flex items-center gap-3">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2 transition-colors no-underline"
                          >
                            <span>محادثة واتساب 💬</span>
                          </a>

                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.order_reference, e.target.value)}
                            className="bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-bold cursor-pointer focus:outline-none focus:border-lime-400"
                          >
                            <option value="قيد المراجعة">قيد المراجعة</option>
                            <option value="تم التأكيد">تم التأكيد</option>
                            <option value="تم الشحن">تم الشحن</option>
                            <option value="تم التسليم">تم التسليم</option>
                            <option value="ملغي">ملغي</option>
                          </select>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-neutral-400">المنتجات المطلوبة:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {items.map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="bg-black/30 border border-white/5 rounded-xl p-3 flex items-center gap-3"
                            >
                              <div className="w-10 h-10 rounded-lg bg-black/50 border border-white/10 relative overflow-hidden shrink-0 flex items-center justify-center p-1">
                                <img
                                  src={item.image || "/img/mobile-concept-01.png"}
                                  alt={item.name}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/img/mobile-concept-01.png";
                                  }}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-white truncate">{item.name}</div>
                                <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                                  <span>{item.quantity} × {item.price?.toLocaleString("ar-EG")} ج.م</span>
                                  {item.selectedColor && (
                                    <span className="flex items-center gap-1">
                                      <span
                                        className="w-2.5 h-2.5 rounded-full inline-block"
                                        style={{ backgroundColor: item.selectedColor.hex }}
                                      />
                                      <span>{item.selectedColor.name_ar}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total */}
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                        <span className="text-neutral-400">
                          طريقة الدفع: {order.payment_method === "cod" ? "الدفع عند الاستلام (COD)" : "أونلاين"}
                        </span>
                        <div className="text-sm font-black text-lime-400">
                          الإجمالي: {(parseFloat(order.total_price || order.total) || 0).toLocaleString("ar-EG")} ج.م
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* PRODUCT CREATE / EDIT MODAL */}
      {/* ========================================================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#141c18] border border-white/15 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8 shadow-2xl my-auto text-right">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {editingProduct ? `تعديل المنتج: ${editingProduct.name}` : "إضافة منتج جديد للكتالوج"}
                </h3>
                <span className="text-xs text-neutral-400 block mt-0.5">
                  أدخل بيانات ومواصفات الجهاز بدقة، حدد الألوان والمخزون، وارفع حتى 10 صور عالية الجودة.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* القسم الأول: البيانات الأساسية */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-lime-400 flex items-center gap-2">
                  <span>📋</span>
                  <span>البيانات الأساسية:</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Row 1, Col 1: اسم المنتج بالكامل */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      اسم المنتج بالكامل *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: سامسونج جالاكسي S24 ألترا (Galaxy S24 Ultra 512GB)"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
                    />
                  </div>

                  {/* Row 1, Col 2: القسم الرئيسي */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      القسم الرئيسي *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400 cursor-pointer font-medium"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Row 2, Col 1: البراند / الماركة (معروضة بالعربية والإنجليزية بين قوسين) */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      البراند / الماركة *
                    </label>
                    <select
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400 cursor-pointer font-medium"
                    >
                      {BRAND_OPTIONS.map(b => (
                        <option key={b.id} value={b.display}>
                          {b.display}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Row 2, Col 2: حالة الجهاز (بجوار الماركة مباشرة بالخيارات العربية الثلاثة) */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      حالة الجهاز *
                    </label>
                    <select
                      value={form.condition}
                      onChange={(e) => setForm({ ...form, condition: e.target.value as ProductCondition })}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400 font-bold cursor-pointer"
                    >
                      {CONDITION_OPTIONS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* القسم الثاني: قسم السعر والخصومات */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-lime-400 flex items-center gap-2">
                  <span>💰</span>
                  <span>التسعير والعروض:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/30 p-4 rounded-xl border border-white/5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      سعر البيع (ج.م) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder="مثال: 58500"
                      value={form.price}
                      onChange={(e) => {
                        setForm({ ...form, price: e.target.value });
                        if (priceError) setPriceError("");
                      }}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      السعر قبل الخصم (اختياري)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="مثال: 62000"
                      value={form.original_price}
                      onChange={(e) => {
                        setForm({ ...form, original_price: e.target.value });
                        if (priceError) setPriceError("");
                      }}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
                    />
                  </div>
                </div>

                {priceError && (
                  <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5 font-bold">
                    ⚠️ {priceError}
                  </div>
                )}
              </div>

              {/* تقرير الفحص والضمان للأجهزة (كسر زيرو ومستعمل) */}
              {(form.condition === "كسر زيرو" || form.condition === "مستعمل") && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-4">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                    <span>⚠️</span>
                    <span>تقرير الفحص والضمان للأجهزة ({form.condition}):</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-neutral-300 mb-1">نسبة البطارية</label>
                      <input
                        type="text"
                        placeholder="مثال: 94%"
                        value={form.battery_health}
                        onChange={(e) => setForm({ ...form, battery_health: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-neutral-300 mb-1">حالة الشاشة</label>
                      <input
                        type="text"
                        placeholder="أصلية 100% / بدون خدوش"
                        value={form.screen_condition}
                        onChange={(e) => setForm({ ...form, screen_condition: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-neutral-300 mb-1">حالة الفريم</label>
                      <input
                        type="text"
                        placeholder="نظيف جداً بدون صدمات"
                        value={form.frame_condition}
                        onChange={(e) => setForm({ ...form, frame_condition: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-neutral-300 mb-1">حالة الظهر</label>
                      <input
                        type="text"
                        placeholder="سليم كلياً بدون علامات"
                        value={form.back_condition}
                        onChange={(e) => setForm({ ...form, back_condition: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-neutral-300 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.repaired}
                        onChange={(e) => setForm({ ...form, repaired: e.target.checked })}
                        className="rounded accent-lime-400"
                      />
                      <span>الجهاز تم صيانته أو فتحه مسبقاً</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.box_available}
                        onChange={(e) => setForm({ ...form, box_available: e.target.checked })}
                        className="rounded accent-lime-400"
                      />
                      <span>العلبة الأصلية متوفرة</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.charger_available}
                        onChange={(e) => setForm({ ...form, charger_available: e.target.checked })}
                        className="rounded accent-lime-400"
                      />
                      <span>الشاحن الأصلي متوفر</span>
                    </label>
                  </div>
                </div>
              )}

              {/* مواصفات الهاردوير والشبكة ونظام الضمان (للموبايلات والتابلت) */}
              {(form.category === "الموبايلات" || form.category === "التابلت") ? (
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="text-xs font-bold text-neutral-300">مواصفات الهاردوير والشبكة والضمان:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* السعة التخزينية (افتراضي 128GB للموبايل الجديد) */}
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">السعة التخزينية</label>
                      <select
                        value={form.storage}
                        onChange={(e) => setForm({ ...form, storage: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white font-medium"
                      >
                        {STORAGE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    {/* الذاكرة العشوائية RAM (افتراضي 8GB للموبايل الجديد) */}
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">الذاكرة العشوائية RAM</label>
                      <select
                        value={form.ram}
                        onChange={(e) => setForm({ ...form, ram: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white font-medium"
                      >
                        {RAM_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>

                    {/* الشبكة والاتصال (افتراضي 4G LTE للموبايل الجديد) */}
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">الشبكة والاتصال</label>
                      <select
                        value={form.network}
                        onChange={(e) => setForm({ ...form, network: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white font-medium"
                      >
                        <option value="4G LTE">4G LTE</option>
                        <option value="5G">5G</option>
                        <option value="واي فاي فقط (Wi-Fi)">واي فاي فقط (Wi-Fi)</option>
                      </select>
                    </div>

                    {/* مدة الضمان (Select واضح بالخيارات الثمانية المطلوبة) */}
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">مدة الضمان</label>
                      <select
                        value={form.warranty_duration}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm({
                            ...form,
                            warranty_duration: val,
                            custom_warranty: val === "ضمان آخر" ? form.custom_warranty : ""
                          });
                        }}
                        className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white font-bold"
                      >
                        {WARRANTY_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* الحقل الإضافي الذي يظهر فقط عند اختيار "ضمان آخر" */}
                  {form.warranty_duration === "ضمان آخر" && (
                    <div className="pt-2 animate-fadeIn">
                      <label className="block text-xs font-bold text-lime-400 mb-1.5">
                        اكتب مدة الضمان *
                      </label>
                      <input
                        type="text"
                        required={form.warranty_duration === "ضمان آخر"}
                        placeholder="مثال: 45 يوم، 4 شهور، 18 شهر"
                        value={form.custom_warranty}
                        onChange={(e) => setForm({ ...form, custom_warranty: e.target.value })}
                        className="w-full bg-black/50 border border-lime-400/50 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-lime-400"
                      />
                      <span className="text-[10px] text-neutral-400 block mt-1">
                        سيتم حفظ هذه المدة كنص عربي مخصص يظهر للمشتري في صفحة المنتج وسلة الشراء.
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* مواصفات الأقسام الأخرى ونظام الضمان */
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="text-xs font-bold text-neutral-300">مواصفات القسم والضمان:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {form.category === "الشواحن والكابلات" && (
                      <>
                        <div>
                          <label className="block text-[11px] text-neutral-400 mb-1">قدرة الشحن</label>
                          <input
                            type="text"
                            placeholder="مثال: 65W GaN"
                            value={form.charging_power}
                            onChange={(e) => setForm({ ...form, charging_power: e.target.value })}
                            className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-neutral-400 mb-1">نوع المنفذ</label>
                          <input
                            type="text"
                            placeholder="مثال: Type-C إلى Type-C"
                            value={form.connector_type}
                            onChange={(e) => setForm({ ...form, connector_type: e.target.value })}
                            className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </>
                    )}

                    {(form.category === "السماعات" || form.category === "الساعات الذكية") && (
                      <>
                        <div>
                          <label className="block text-[11px] text-neutral-400 mb-1">طريقة الاتصال</label>
                          <input
                            type="text"
                            placeholder="مثال: بلوتوث 5.3"
                            value={form.connection_type}
                            onChange={(e) => setForm({ ...form, connection_type: e.target.value })}
                            className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-neutral-400 mb-1">التوافق</label>
                          <input
                            type="text"
                            placeholder="مثال: iOS / Android"
                            value={form.compatibility}
                            onChange={(e) => setForm({ ...form, compatibility: e.target.value })}
                            className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </>
                    )}

                    {/* مدة الضمان للأقسام الأخرى */}
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">مدة الضمان</label>
                      <select
                        value={form.warranty_duration}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm({
                            ...form,
                            warranty_duration: val,
                            custom_warranty: val === "ضمان آخر" ? form.custom_warranty : ""
                          });
                        }}
                        className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white font-bold"
                      >
                        {WARRANTY_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {form.warranty_duration === "ضمان آخر" && (
                    <div className="pt-2 animate-fadeIn">
                      <label className="block text-xs font-bold text-lime-400 mb-1.5">
                        اكتب مدة الضمان *
                      </label>
                      <input
                        type="text"
                        required={form.warranty_duration === "ضمان آخر"}
                        placeholder="مثال: 45 يوم، 4 شهور، 18 شهر"
                        value={form.custom_warranty}
                        onChange={(e) => setForm({ ...form, custom_warranty: e.target.value })}
                        className="w-full bg-black/50 border border-lime-400/50 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-lime-400"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* نظام الألوان والمخزون المستقل */}
              <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300">
                    الألوان المتاحة والكميات المستقلة لكل لون:
                  </span>
                  <span className="text-[11px] text-lime-400 font-bold">
                    محدد ({form.colors.length}) لون
                  </span>
                </div>

                {/* Color Buttons */}
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_COLORS.map(c => {
                    const isSelected = form.colors.some(fc => fc.id === c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => handleToggleColor(c)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-lime-400/20 text-lime-400 border border-lime-400/60"
                            : "bg-white/5 text-neutral-300 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: c.hex || c.hex_code }}
                        />
                        <span>{c.name_ar || c.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Quantities per Color */}
                {form.colors.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    {form.colors.map(c => (
                      <div
                        key={c.id}
                        className="bg-black/40 border border-white/10 rounded-lg p-2.5 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="text-xs text-white font-bold">{c.name_ar}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={c.quantity}
                            onChange={(e) => handleUpdateColorQty(c.id, parseInt(e.target.value) || 0)}
                            className="w-14 bg-white/10 border border-white/20 rounded px-1.5 py-1 text-xs text-center text-white"
                          />
                          <span className="text-[10px] text-neutral-400">قطعة</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* صور المنتج (حتى 10 صور) */}
              <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300">
                    صور المنتج (حتى 10 صور) · الصورة الأولى هي الغلاف
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {form.images.length} / 10 صور
                  </span>
                </div>

                {/* Upload Input */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="flex-1 cursor-pointer bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded-xl p-3 text-center transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultipleImageUpload}
                      disabled={uploadingImage || form.images.length >= 10}
                      className="hidden"
                    />
                    <span className="text-xs text-lime-400 font-bold block">
                      {uploadingImage ? "جاري رفع الصور وتخزينها..." : "📁 اضغط لاختيار صور من جهازك (متعدد)"}
                    </span>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">
                      JPG, PNG, WEBP حتى 5MB للملف الواحد
                    </span>
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="أو ضع رابط صورة مباشر..."
                      value={manualImageUrl}
                      onChange={(e) => setManualImageUrl(e.target.value)}
                      className="bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white w-48 sm:w-64"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualImage}
                      className="px-3 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 cursor-pointer"
                    >
                      إضافة
                    </button>
                  </div>
                </div>

                {uploadError && <div className="text-xs text-rose-400">{uploadError}</div>}

                {/* Thumbnails */}
                {form.images.length > 0 && (
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-2">
                    {form.images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative aspect-square rounded-lg border overflow-hidden group bg-black/40 flex items-center justify-center p-1 ${
                          idx === 0 ? "border-lime-400" : "border-white/10"
                        }`}
                      >
                        <img
                          src={img}
                          alt="Product preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/img/mobile-concept-01.png";
                          }}
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 right-1 bg-lime-400 text-black text-[9px] font-black px-1 rounded shadow">
                            غلاف
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetAsCover(idx)}
                              title="تعيين كغلاف رئيسي"
                              className="text-[10px] bg-lime-400 text-black px-1.5 py-0.5 rounded font-bold cursor-pointer"
                            >
                              غلاف
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            title="حذف الصورة"
                            className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  وصف المنتج ومميزاته بالتفصيل
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="اكتب مواصفات الجهاز بالتفصيل، الكاميرات، الشاشة، المعالج، ونقاط القوة..."
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              {/* Flags */}
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-300">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="rounded accent-lime-400"
                  />
                  <span>تمييز المنتج في الصفحة الرئيسية (مميز)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-300">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    className="rounded accent-lime-400"
                  />
                  <span>عرض ونشر المنتج في المتجر فوراً (نشط)</span>
                </label>
              </div>

              {/* Submit Buttons with Double-Submit Prevention */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold cursor-pointer transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-xs sm:text-sm font-black cursor-pointer transition-colors shadow-lg shadow-lime-400/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && (
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin inline-block" />
                  )}
                  <span>
                    {isSaving
                      ? "جاري الحفظ..."
                      : editingProduct
                      ? "حفظ التعديلات"
                      : "إضافة المنتج الآن"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
