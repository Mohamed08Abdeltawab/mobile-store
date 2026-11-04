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

const BRANDS = [
  "Apple",
  "Samsung",
  "Xiaomi",
  "Oppo",
  "Realme",
  "Vivo",
  "Honor",
  "Infinix",
  "Tecno",
  "Huawei",
  "Anker",
  "Joyroom",
  "Baseus",
  "أخرى"
];

const STORAGE_OPTIONS = ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"];
const RAM_OPTIONS = ["2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB", "24GB"];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { setIsAdmin } = useCart();
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "categories" | "brands">("products");
  
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

  // Product Form State
  const initialFormState = {
    name: "",
    category: "الموبايلات",
    subcategory: "آيفون",
    brand: "Apple",
    price: "",
    original_price: "",
    quantity: 10,
    condition: "جديد" as ProductCondition,
    description: "",
    is_featured: false,
    is_published: true,
    images: ["/img/mobile-concept-01.png"],
    // Specifications
    ram: "8GB",
    storage: "256GB",
    network: "5G",
    battery_health: "100%",
    screen_condition: "أصلية 100% بدون أي خدوش",
    frame_condition: "ممتاز كأنه جديد",
    back_condition: "سليم بدون أي علامات",
    repaired: false,
    box_available: true,
    charger_available: true,
    warranty: "ضمان محلي معتمد لمدة سنة",
    charging_power: "65W",
    connector_type: "Type-C",
    connection_type: "Bluetooth 5.3",
    compatibility: "iOS / Android",
    // Selected colors with independent stock
    colors: [
      { id: "black", name_ar: "أسود", hex: "#000000", quantity: 5 },
      { id: "gold", name_ar: "ذهبي", hex: "#D4AF37", quantity: 5 }
    ]
  };

  const [form, setForm] = useState(initialFormState);

  // New Category / Brand forms
  const [newCatName, setNewCatName] = useState("");
  const [newCatNameAr, setNewCatNameAr] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandNameAr, setNewBrandNameAr] = useState("");

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
      alert("وصلت للحد الأقصى المسموح به (10 صور للمنتج الواحد)");
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
        notify(`تم رفع وتخزين ${data.urls.length} صور في ملفات المتجر بنجاح`);
      } else {
        setUploadError(data.error || "فشل رفع الصور");
      }
    } catch (err) {
      setUploadError("حدث خطأ أثناء رفع الصور");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  }

  function handleAddManualImage() {
    const url = manualImageUrl.trim();
    if (!url) return;
    if (form.images.length >= 10) {
      alert("وصلت للحد الأقصى (10 صور)");
      return;
    }
    setForm(prev => ({
      ...prev,
      images: [...prev.images, url].slice(0, 10)
    }));
    setManualImageUrl("");
    notify("تمت إضافة رابط الصورة بنجاح");
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
      notify("تم حذف ملف الصورة");
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
    if (!confirm(`هل أنت متأكد من حذف المنتج "${name}" نهائياً من قاعدة البيانات؟`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        notify(`تم حذف "${name}" بنجاح`);
        loadData();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("حدث خطأ أثناء الحذف");
    }
  }

  function startEdit(p: Product) {
    setEditingProduct(p);

    const initialImages = Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : ["/img/mobile-concept-01.png"];

    const specs = p.specifications || {};

    const colorItems = Array.isArray(p.colors) && p.colors.length > 0
      ? p.colors.map(c => ({
          id: c.color_id || c.id || "black",
          name_ar: c.name_ar || c.color_name || c.name || "أسود",
          hex: c.hex || c.hex_code || "#000000",
          quantity: c.quantity || 5
        }))
      : [
          { id: "black", name_ar: "أسود", hex: "#000000", quantity: Number(p.quantity || 5) }
        ];

    setForm({
      name: p.name,
      category: p.category || p.cat || "الموبايلات",
      subcategory: p.subcategory || "",
      brand: p.brand || "Apple",
      price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : (p.old_price ? String(p.old_price) : ""),
      quantity: Number(p.quantity || 5),
      condition: p.condition || "جديد",
      description: p.description || "",
      is_featured: !!p.is_featured,
      is_published: p.is_published !== undefined ? !!p.is_published : true,
      images: initialImages,
      // Specs
      ram: String(specs.ram || "8GB"),
      storage: String(specs.storage || "256GB"),
      network: String(specs.network || "5G"),
      battery_health: String(specs.battery_health || "100%"),
      screen_condition: String(specs.screen_condition || "أصلية 100% بدون أي خدوش"),
      frame_condition: String(specs.frame_condition || "ممتاز كأنه جديد"),
      back_condition: String(specs.back_condition || "سليم بدون أي علامات"),
      repaired: Boolean(specs.repaired),
      box_available: specs.box_available === false ? false : true,
      charger_available: specs.charger_available === false ? false : true,
      warranty: String(specs.warranty || "ضمان محلي معتمد لمدة سنة"),
      charging_power: String(specs.charging_power || "65W"),
      connector_type: String(specs.connector_type || "Type-C"),
      connection_type: String(specs.connection_type || "Bluetooth 5.3"),
      compatibility: String(specs.compatibility || "iOS / Android"),
      colors: colorItems
    });

    setManualImageUrl("");
    setUploadError("");
    setShowProductModal(true);
  }

  function resetForm() {
    setEditingProduct(null);
    setForm(initialFormState);
    setManualImageUrl("");
    setUploadError("");
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();

    if (form.images.length === 0) {
      alert("يرجى إضافة صورة واحدة على الأقل للمنتج");
      return;
    }

    if (!form.name || !form.price || !form.category || !form.brand) {
      alert("يرجى ملء كافة الحقول الأساسية المطلوبة");
      return;
    }

    const specifications: any = {
      warranty: form.warranty,
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

    // Total quantity calculated from colors, or default
    const totalQty = form.colors.length > 0
      ? form.colors.reduce((sum, c) => sum + (c.quantity || 0), 0)
      : Number(form.quantity);

    const payload = {
      name: form.name,
      category: form.category,
      subcategory: form.subcategory,
      brand: form.brand,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      quantity: totalQty,
      condition: form.condition,
      description: form.description,
      is_featured: form.is_featured,
      is_published: form.is_published,
      images: form.images.slice(0, 10),
      colors: form.colors,
      specifications
    };

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
        notify(editingProduct ? "تم تحديث بيانات المنتج بنجاح" : "تمت إضافة المنتج الجديد للكتالوج بنجاح");
        setShowProductModal(false);
        resetForm();
        loadData();
      } else {
        alert(data.error || "حدث خطأ أثناء حفظ المنتج");
      }
    } catch (err) {
      alert("فشل الاتصال بالخادم لحفظ المنتج");
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

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName || !newCatNameAr) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName, name_ar: newCatNameAr, icon: "Smartphone" })
      });
      const data = await res.json();
      if (data.success) {
        notify("تمت إضافة القسم الجديد بنجاح");
        setNewCatName("");
        setNewCatNameAr("");
        loadData();
      }
    } catch (err) {
      alert("فشل إضافة القسم");
    }
  }

  async function handleCreateBrand(e: React.FormEvent) {
    e.preventDefault();
    if (!newBrandName || !newBrandNameAr) return;
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBrandName, name_ar: newBrandNameAr })
      });
      const data = await res.json();
      if (data.success) {
        notify("تمت إضافة العلامة التجارية بنجاح");
        setNewBrandName("");
        setNewBrandNameAr("");
        loadData();
      }
    } catch (err) {
      alert("فشل إضافة البراند");
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

        {/* Tab Navigation */}
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

          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-extrabold text-xs sm:text-sm cursor-pointer border-0 whitespace-nowrap transition-all ${
              activeTab === "categories"
                ? "bg-lime-400 text-black shadow-lg shadow-lime-400/20"
                : "bg-white/10 text-white hover:bg-white/15"
            }`}
          >
            🏷️ الأقسام والتصنيفات ({categoriesList.length})
          </button>

          <button
            onClick={() => setActiveTab("brands")}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-extrabold text-xs sm:text-sm cursor-pointer border-0 whitespace-nowrap transition-all ${
              activeTab === "brands"
                ? "bg-lime-400 text-black shadow-lg shadow-lime-400/20"
                : "bg-white/10 text-white hover:bg-white/15"
            }`}
          >
            🏢 الماركات والبراندات ({brandsList.length})
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
                  className="px-6 py-2.5 rounded-xl bg-lime-400 text-black font-extrabold text-sm"
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
                        const coverImg = Array.isArray(p.images) && p.images[0] ? p.images[0] : "/img/mobile-concept-01.png";
                        return (
                          <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                            {/* Product Info */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 overflow-hidden relative shrink-0">
                                  <Image
                                    src={coverImg}
                                    alt={p.name}
                                    fill
                                    className="object-contain p-1"
                                    unoptimized
                                  />
                                </div>
                                <div>
                                  <h4 className="font-bold text-white text-sm line-clamp-1">{p.name}</h4>
                                  <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-2">
                                    {p.specifications?.storage && <span>{p.specifications.storage}</span>}
                                    {p.specifications?.ram && <span>· {p.specifications.ram} RAM</span>}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Category & Brand */}
                            <td className="p-4">
                              <div className="text-xs text-white font-semibold">{p.category || p.cat}</div>
                              <div className="text-[11px] text-neutral-400">{p.brand}</div>
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
                              <div>{p.price.toLocaleString("ar-EG")} ج.م</div>
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
                                  p.colors.map(c => (
                                    <span
                                      key={c.id || c.color_id}
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
                          {/* WhatsApp Chat Button */}
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2 transition-colors no-underline"
                          >
                            <span>محادثة واتساب 💬</span>
                          </a>

                          {/* Status Selector */}
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
                              <div className="w-10 h-10 rounded-lg bg-black/50 border border-white/10 relative overflow-hidden shrink-0">
                                <Image
                                  src={item.image || "/img/mobile-concept-01.png"}
                                  alt={item.name}
                                  fill
                                  className="object-contain p-1"
                                  unoptimized
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

        {/* ========================================================= */}
        {/* TAB 3: CATEGORIES MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="bg-[#141c18] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-black text-white mb-2">إضافة قسم جديد</h3>
              <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="الاسم بالعربي (مثال: الشواحن اللاسلكية)"
                  value={newCatNameAr}
                  onChange={(e) => setNewCatNameAr(e.target.value)}
                  className="bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400 flex-1"
                  required
                />
                <input
                  type="text"
                  placeholder="Slug بالإنجليزية (مثال: wireless-chargers)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400 flex-1"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-lime-400 text-black font-extrabold text-sm cursor-pointer hover:bg-lime-300 transition-colors"
                >
                  إضافة القسم
                </button>
              </form>
            </div>

            {/* Existing Categories List */}
            <div className="bg-[#141c18] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-black text-white mb-4">الأقسام الحالية بالمتجر</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categoriesList.map(cat => (
                  <div
                    key={cat.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{cat.name_ar}</div>
                      <div className="text-xs text-neutral-400">{cat.name}</div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-lime-400/10 text-lime-400 font-bold">
                      نشط
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: BRANDS MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === "brands" && (
          <div className="space-y-6">
            <div className="bg-[#141c18] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-black text-white mb-2">إضافة براند أو علامة تجارية</h3>
              <form onSubmit={handleCreateBrand} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="اسم البراند بالعربي (مثال: أنكر)"
                  value={newBrandNameAr}
                  onChange={(e) => setNewBrandNameAr(e.target.value)}
                  className="bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400 flex-1"
                  required
                />
                <input
                  type="text"
                  placeholder="الاسم بالإنجليزي (مثال: Anker)"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400 flex-1"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-lime-400 text-black font-extrabold text-sm cursor-pointer hover:bg-lime-300 transition-colors"
                >
                  إضافة الماركة
                </button>
              </form>
            </div>

            {/* Existing Brands List */}
            <div className="bg-[#141c18] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-black text-white mb-4">العلامات التجارية المعتمدة</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {brandsList.map(b => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{b.name}</div>
                      <div className="text-xs text-neutral-400">{b.name_ar}</div>
                    </div>
                    <span className="text-[11px] text-lime-400 font-bold">معتمد ✓</span>
                  </div>
                ))}
              </div>
            </div>
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
                  أدخل مواصفات الجهاز بدقة، حدد الألوان والمخزون، وارفع حتى 10 صور عالية الدقة.
                </span>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    اسم المنتج بالكامل *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: iPhone 16 Pro Max 256GB Desert Titanium"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    القسم الرئيسي *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    البراند / الماركة *
                  </label>
                  <select
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
                  >
                    {BRANDS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    القسم الفرعي
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: آيفون، سماعات بلوتوث، شواحن سريعة"
                    value={form.subcategory}
                    onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>

              {/* Pricing & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-black/30 p-4 rounded-xl border border-white/5">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    سعر البيع (ج.م) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="مثال: 58500"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    السعر قبل الخصم (اختياري)
                  </label>
                  <input
                    type="number"
                    placeholder="مثال: 62000"
                    value={form.original_price}
                    onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    حالة الجهاز *
                  </label>
                  <select
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value as ProductCondition })}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400 font-bold"
                  >
                    <option value="جديد">جديد (New Sealed)</option>
                    <option value="كسر زيرو">كسر زيرو (Like New)</option>
                    <option value="مستعمل">مستعمل (Pre-Owned)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Condition Report (When Like-New or Used) */}
              {(form.condition === "كسر زيرو" || form.condition === "مستعمل") && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-4">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                    <span>⚠️</span>
                    <span>تقرير الفحص والضمان للأجهزة (كسر زيرو ومستعمل):</span>
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
                      <span>الجهاز تم صيانته أو فتح مسبقاً</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.box_available}
                        onChange={(e) => setForm({ ...form, box_available: e.target.checked })}
                        className="rounded accent-lime-400"
                      />
                      <span>الكرتونة الأصلية متوفرة</span>
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

              {/* Hardware Specifications */}
              {(form.category === "الموبايلات" || form.category === "التابلت") && (
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="text-xs font-bold text-neutral-300">مواصفات الهاردوير والشبكة:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">السعة التخزينية</label>
                      <select
                        value={form.storage}
                        onChange={(e) => setForm({ ...form, storage: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                      >
                        {STORAGE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">الذاكرة العشوائية RAM</label>
                      <select
                        value={form.ram}
                        onChange={(e) => setForm({ ...form, ram: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                      >
                        {RAM_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">الشبكة والاتصال</label>
                      <select
                        value={form.network}
                        onChange={(e) => setForm({ ...form, network: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                      >
                        <option value="5G">5G فائقة السرعة</option>
                        <option value="4G">4G LTE</option>
                        <option value="Wi-Fi Only">واي فاي فقط (Wi-Fi)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">مدة ونوع الضمان</label>
                      <input
                        type="text"
                        value={form.warranty}
                        onChange={(e) => setForm({ ...form, warranty: e.target.value })}
                        placeholder="ضمان محلي سنة"
                        className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Color System with Independent Stock */}
              <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300">
                    الألوان المتاحة والكميات المستقلة لكل لون:
                  </span>
                  <span className="text-[11px] text-lime-400">
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

              {/* Product Images (Up to 10 images) */}
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
                      {uploadingImage ? "جاري رفع الصور..." : "📁 اضغط لاختيار صور من جهازك (متعدد)"}
                    </span>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">
                      JPG, PNG, WEBP, SVG حتى 5MB
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
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-2">
                  {form.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative aspect-square rounded-lg border overflow-hidden group bg-black/40 ${
                        idx === 0 ? "border-lime-400" : "border-white/10"
                      }`}
                    >
                      <Image
                        src={img}
                        alt="Product preview"
                        fill
                        className="object-contain p-1"
                        unoptimized
                      />
                      {idx === 0 && (
                        <span className="absolute top-1 right-1 bg-lime-400 text-black text-[9px] font-black px-1 rounded">
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
                  <span>تمييز المنتج في الصفحة الرئيسية (Featured)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-300">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    className="rounded accent-lime-400"
                  />
                  <span>نشر المنتج في المتجر فوراً (Published)</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold cursor-pointer transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-xs sm:text-sm font-black cursor-pointer transition-colors shadow-lg shadow-lime-400/20"
                >
                  {editingProduct ? "حفظ التعديلات" : "إضافة المنتج الآن"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
