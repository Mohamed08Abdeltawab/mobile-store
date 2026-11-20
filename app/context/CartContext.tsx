"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  Product,
  CartItem,
  Order,
  Category,
  Brand,
  PredefinedColor,
  StoreSettings,
  DEFAULT_STORE_SETTINGS,
  formatCurrency,
} from "../../lib/types";

export interface Governorate {
  id: string;
  name: string;
  shipping: number;
  days: string;
}

export const GOVERNORATES: Governorate[] = [
  { id: "cairo", name: "القاهرة", shipping: 50, days: "24-48 ساعة" },
  { id: "giza", name: "الجيزة", shipping: 50, days: "24-48 ساعة" },
  { id: "alex", name: "الإسكندرية", shipping: 60, days: "48 ساعة" },
  {
    id: "delta",
    name: "محافظات الدلتا (المنصورة، طنطا، الزقازيق...)",
    shipping: 65,
    days: "48-72 ساعة",
  },
  {
    id: "canal",
    name: "مدن القناة (الإسماعيلية، بورسعيد، السويس)",
    shipping: 70,
    days: "48-72 ساعة",
  },
  {
    id: "upper",
    name: "محافظات الصعيد (بني سويف، أسيوط، سوهاج...)",
    shipping: 80,
    days: "3-4 أيام",
  },
  {
    id: "remote",
    name: "المحافظات الحدودية (البحر الأحمر، مطروح...)",
    shipping: 95,
    days: "4-5 أيام",
  },
];

interface Toast {
  id: string;
  msg: string;
}

interface CartContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  brands: Brand[];
  colors: PredefinedColor[];
  settings: StoreSettings;
  setSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
  formatPrice: (amount: number | string | undefined | null) => string;
  activeGovernorates: Governorate[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  wishlist: string[];
  addToCart: (
    product: Product,
    qty?: number,
    variant?: string,
    color?: string,
    ram?: string,
    storage?: string,
  ) => void;
  updateCartQty: (index: number, delta: number) => void;
  removeFromCart: (index: number) => void;
  toggleWishlist: (productId: string) => void;
  addAllWishlistToCart?: () => void;
  isWishlisted: (productId: string) => boolean;
  sendDirectWhatsApp: (product: Product) => void;
  openCheckoutWithProduct: (
    product: Product,
    options?: {
      qty?: number;
      variant?: string;
      color?: string;
      ram?: string;
      storage?: string;
    }
  ) => void;
  directBuyItem: CartItem | null;
  setDirectBuyItem: (item: CartItem | null) => void;
  checkoutItems: CartItem[];
  totalCheckoutCount: number;
  checkoutSubtotal: number;
  isCheckoutFreeShipping: boolean;
  checkoutShippingFee: number;
  checkoutTotal: number;
  totalCartCount: number;
  cartSubtotal: number;
  isFreeShipping: boolean;
  shippingFee: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  quickProduct: Product | null;
  setQuickProduct: (prod: Product | null) => void;
  toasts: Toast[];
  showToast: (msg: string) => void;
  // Checkout state
  customerName: string;
  setCustomerName: (val: string) => void;
  customerPhone: string;
  setCustomerPhone: (val: string) => void;
  selectedGov: Governorate;
  setSelectedGov: (gov: Governorate) => void;
  customerAddress: string;
  setCustomerAddress: (val: string) => void;
  paymentMethod: string;
  setPaymentMethod: (val: string) => void;
  formErrors: Record<string, boolean>;
  submittingOrder: boolean;
  orderCompleted: any;
  setOrderCompleted: (order: any) => void;
  handleOrderSubmit: (e: React.FormEvent) => Promise<void>;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  checkAdminAuth: () => Promise<boolean>;
  refreshProducts: () => Promise<void>;
  isSettingsLoaded: boolean;
  updateSettings: (newSettings: StoreSettings) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [colors, setColors] = useState<PredefinedColor[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Dynamic active governorates from store settings
  const activeGovernorates: Governorate[] =
    settings.shipping_cities && settings.shipping_cities.length > 0
      ? settings.shipping_cities
          .filter((c) => c.is_active)
          .map((c) => ({
            id: c.id,
            name: c.name,
            shipping: c.shipping,
            days: c.days,
          }))
      : GOVERNORATES;

  // Modals & Overlays
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickProduct, setQuickProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Checkout State
  const [directBuyItem, setDirectBuyItem] = useState<CartItem | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedGov, setSelectedGov] = useState<Governorate>(GOVERNORATES[0]);
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Keep selectedGov in sync with activeGovernorates
  useEffect(() => {
    if (activeGovernorates.length > 0) {
      const exists = activeGovernorates.some((g) => g.id === selectedGov?.id);
      if (!exists) {
        setSelectedGov(activeGovernorates[0]);
      }
    }
  }, [activeGovernorates]);

  function applyBrandTheme(primaryColor?: string, secondaryColor?: string) {
  if (typeof document === "undefined") return;
  const primary = primaryColor || "#A3E635";
  const secondary = secondaryColor || "#10B981";

  const hexToRgb = (hex: string) => {
    const clean = hex.replace("#", "").trim();
    const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
    const num = parseInt(full, 16);
    if (isNaN(num)) return { r: 163, g: 230, b: 53 };
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const getContrast = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 140 ? "#000000" : "#ffffff";
  };

  const adjustBrightness = (hex: string, factor: number) => {
    const { r, g, b } = hexToRgb(hex);
    const adjR = Math.min(255, Math.max(0, Math.round(r * factor)));
    const adjG = Math.min(255, Math.max(0, Math.round(g * factor)));
    const adjB = Math.min(255, Math.max(0, Math.round(b * factor)));
    return `#${((1 << 24) + (adjR << 16) + (adjG << 8) + adjB).toString(16).slice(1)}`;
  };

  const pRgb = hexToRgb(primary);
  const sRgb = hexToRgb(secondary);

  const root = document.documentElement.style;
  root.setProperty("--brand-primary", primary);
  root.setProperty("--brand-primary-hover", adjustBrightness(primary, 0.88));
  root.setProperty("--brand-primary-text", getContrast(primary));
  root.setProperty("--brand-primary-glow", `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.35)`);
  root.setProperty("--brand-primary-light", `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.15)`);

  root.setProperty("--brand-secondary", secondary);
  root.setProperty("--brand-secondary-hover", adjustBrightness(secondary, 0.88));
  root.setProperty("--brand-secondary-text", getContrast(secondary));
  root.setProperty("--brand-secondary-glow", `rgba(${sRgb.r}, ${sRgb.g}, ${sRgb.b}, 0.35)`);
  root.setProperty("--brand-secondary-light", `rgba(${sRgb.r}, ${sRgb.g}, ${sRgb.b}, 0.15)`);

  root.setProperty("--color-accent-green", primary);
  root.setProperty("--color-lime-400", primary);
  root.setProperty("--color-lime-500", adjustBrightness(primary, 0.88));
  root.setProperty("--primary", primary);
  root.setProperty("--primary-foreground", getContrast(primary));

  try {
    localStorage.setItem(
      "mobile_brand_colors",
      JSON.stringify({ primary, secondary })
    );
  } catch (e) {}
}

  // Update settings in memory and localStorage immediately
  function updateSettings(newSettings: StoreSettings) {
    const merged = { ...DEFAULT_STORE_SETTINGS, ...newSettings };
    setSettings(merged);
    setIsSettingsLoaded(true);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("mobile_store_settings", JSON.stringify(newSettings));
      } catch (e) {}
    }
    applyBrandTheme(merged.primary_color, merged.secondary_color);
  }

  // Apply Brand Colors dynamically only once real settings are loaded
  useEffect(() => {
    if (!isSettingsLoaded) return;
    applyBrandTheme(settings.primary_color, settings.secondary_color);
  }, [settings.primary_color, settings.secondary_color, isSettingsLoaded]);

  async function checkAdminAuth(): Promise<boolean> {
    const shouldCheck =
      typeof window !== "undefined" &&
      (window.location.pathname.startsWith("/admin") ||
        localStorage.getItem("mobile_admin_hint") === "true");

    if (!shouldCheck) {
      setIsAdmin(false);
      return false;
    }

    try {
      const res = await fetch("/api/admin/login");
      const data: any = await res.json();
      const authed = Boolean(data.authenticated);
      setIsAdmin(authed);
      if (!authed && typeof window !== "undefined") {
        localStorage.removeItem("mobile_admin_hint");
      }
      return authed;
    } catch (e) {
      setIsAdmin(false);
      return false;
    }
  }

  async function loadInitialData() {
    // 1. Instant load from localStorage settings cache to avoid any flash of defaults
    if (typeof window !== "undefined") {
      try {
        const localSettings = localStorage.getItem("mobile_store_settings");
        if (localSettings) {
          const parsedLocal = JSON.parse(localSettings);
          if (parsedLocal && typeof parsedLocal === "object") {
            const mergedLocal = { ...DEFAULT_STORE_SETTINGS, ...parsedLocal };
            setSettings(mergedLocal);
            setIsSettingsLoaded(true);
            applyBrandTheme(mergedLocal.primary_color, mergedLocal.secondary_color);
          }
        }
      } catch (e) {}

      // 2. Try load from sessionStorage cache (for products, categories, etc.)
      try {
        const cached = sessionStorage.getItem("mobile_store_bootstrap");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (
            parsed &&
            parsed.products &&
            parsed.timestamp &&
            Date.now() - parsed.timestamp < 120000
          ) {
            setProducts(parsed.products || []);
            setCategories(parsed.categories || []);
            setBrands(parsed.brands || []);
            setColors(parsed.colors || []);
            if (parsed.settings) {
              setSettings({ ...DEFAULT_STORE_SETTINGS, ...parsed.settings });
              setIsSettingsLoaded(true);
            }
          }
        }
      } catch (e) {}
    }

    // 3. Single consolidated request for all store data from server/database
    try {
      const res = await fetch(`/api/bootstrap?t=${Date.now()}`, { cache: "no-store" });
      const data: any = await res.json();
      if (data.success) {
        if (Array.isArray(data.products)) setProducts(data.products);
        if (Array.isArray(data.categories)) setCategories(data.categories);
        if (Array.isArray(data.brands)) setBrands(data.brands);
        if (Array.isArray(data.colors)) setColors(data.colors);
        if (data.settings) {
          const merged = { ...DEFAULT_STORE_SETTINGS, ...data.settings };
          setSettings(merged);
          setIsSettingsLoaded(true);
          applyBrandTheme(merged.primary_color, merged.secondary_color);
          try {
            localStorage.setItem("mobile_store_settings", JSON.stringify(data.settings));
          } catch (e) {}
        }

        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(
              "mobile_store_bootstrap",
              JSON.stringify({
                products: data.products,
                categories: data.categories,
                brands: data.brands,
                colors: data.colors,
                settings: data.settings,
                timestamp: Date.now(),
              }),
            );
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error("Error loading bootstrap data:", err);
    }
  }

  async function refreshProducts() {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const data: any = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("mobile_store_bootstrap");
        }
      }
    } catch (err) {
      console.error("Error loading products:", err);
    }
  }

  async function refreshSettings() {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      const data: any = await res.json();
      if (data.success && data.settings) {
        setSettings({ ...DEFAULT_STORE_SETTINGS, ...data.settings });
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("mobile_store_bootstrap");
        }
      }
    } catch (err) {
      console.error("Error refreshing settings:", err);
    }
  }

  async function updateSettings(newSettings: Partial<StoreSettings>): Promise<boolean> {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      const data: any = await res.json();
      if (data.success && data.settings) {
        setSettings({ ...DEFAULT_STORE_SETTINGS, ...data.settings });
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("mobile_store_bootstrap");
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updating settings:", err);
      return false;
    }
  }

  function formatPrice(amount: number | string | undefined | null) {
    return formatCurrency(amount, settings);
  }

  // Load Initial Products, Categories & Auth
  useEffect(() => {
    checkAdminAuth();
    loadInitialData();

    // Load saved cart & wishlist from localStorage
    try {
      const savedCart = localStorage.getItem("mobile_store_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) {}

    try {
      const savedWish = localStorage.getItem("mobile_store_wishlist");
      if (savedWish) {
        const parsed = JSON.parse(savedWish);
        if (Array.isArray(parsed)) {
          setWishlist([...new Set(parsed)]);
        }
      }
    } catch (e) {}

    setIsLoaded(true);
  }, []);

  // Save Cart to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("mobile_store_cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // Save Wishlist to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        "mobile_store_wishlist",
        JSON.stringify([...new Set(wishlist)]),
      );
    }
  }, [wishlist, isLoaded]);

  // Toast notifications
  function showToast(msg: string) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }

  // Cart Management
  function addToCart(
    product: Product,
    qty: number = 1,
    variant: string = "",
    color: string = "",
    ram: string = "",
    storage: string = "",
  ) {
    if (!product) return;
    const defaultColorName =
      product.colors && product.colors[0]
        ? product.colors[0].color_name ||
          (product.colors[0] as any).name_ar ||
          (product.colors[0] as any).name ||
          ""
        : "";
    const chosenColor = color || defaultColorName;
    const vName = variant || (chosenColor ? `لون: ${chosenColor}` : "");

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.variant === vName,
      );
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, qty: item.qty + qty } : item,
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          variant: vName,
          color: chosenColor,
          ram: ram || product.specifications?.ram || "",
          storage: storage || product.specifications?.storage || "",
          condition: product.condition,
          qty,
        },
      ];
    });

    showToast(`تمت إضافة "${product.name}" إلى سلة التسوق`);
    setIsCartOpen(true);
  }

  function updateCartQty(index: number, delta: number) {
    setCart((prev) => {
      return prev
        .map((item, i) => {
          if (i === index) {
            return { ...item, qty: item.qty + delta };
          }
          return item;
        })
        .filter((item) => item.qty > 0);
    });
  }

  function removeFromCart(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index));
    showToast("تم حذف المنتج من السلة");
  }

  // Wishlist Management
  function toggleWishlist(productId: string) {
    const isCurrentlyFav = wishlist.includes(productId);
    if (isCurrentlyFav) {
      setWishlist((prev) => prev.filter((id) => id !== productId));
      showToast("تمت الإزالة من المفضلة");
    } else {
      setWishlist((prev) => {
        if (prev.includes(productId)) return prev;
        return [...prev, productId];
      });
      showToast("تمت الإضافة إلى المفضلة ❤️");
    }
  }

  function isWishlisted(productId: string) {
    return wishlist.includes(productId);
  }

  function addAllWishlistToCart() {
    const favProducts = products.filter((p) => wishlist.includes(p.id));
    if (favProducts.length === 0) return;

    setCart((prev) => {
      let updated = [...prev];
      for (const product of favProducts) {
        const defaultColorName =
          product.colors && product.colors[0]
            ? product.colors[0].color_name ||
              (product.colors[0] as any).name_ar ||
              (product.colors[0] as any).name ||
              ""
            : "";
        const vName = defaultColorName ? `لون: ${defaultColorName}` : "";
        const existingIdx = updated.findIndex(
          (item) => item.id === product.id && item.variant === vName,
        );
        if (existingIdx > -1) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            qty: updated[existingIdx].qty + 1,
          };
        } else {
          updated.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            variant: vName,
            color: defaultColorName,
            ram: product.specifications?.ram || "",
            storage: product.specifications?.storage || "",
            condition: product.condition,
            qty: 1,
          });
        }
      }
      return updated;
    });

    showToast(`تمت إضافة ${favProducts.length} من عناصر المفضلة إلى السلة`);
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  }

  // Quick WhatsApp Purchase
  function sendDirectWhatsApp(product: Product) {
    if (!product) return;
    const num = settings.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201131350988";
    const conditionText = product.condition
      ? ` (حالة: ${product.condition})`
      : "";
    const text = `مرحباً، أود الاستفسار وطلب جهاز *${product.name}*${conditionText} بسعر *${formatPrice(product.price)}* مع ميزة الفحص والمعاينة قبل الدفع.`;
    const url = `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  // Fast Checkout opener for single product (Direct Buy - separate from cart)
  function openCheckoutWithProduct(
    product: Product,
    options?: {
      qty?: number;
      variant?: string;
      color?: string;
      ram?: string;
      storage?: string;
    }
  ) {
    if (!product) return;
    const defaultColorName =
      product.colors && product.colors[0]
        ? product.colors[0].color_name ||
          (product.colors[0] as any).name_ar ||
          (product.colors[0] as any).name ||
          ""
        : "";
    const chosenColor = options?.color || defaultColorName;
    const vName = options?.variant || (chosenColor ? `لون: ${chosenColor}` : "");

    const singleItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      variant: vName,
      color: chosenColor,
      ram: options?.ram || product.specifications?.ram || "",
      storage: options?.storage || product.specifications?.storage || "",
      condition: product.condition,
      qty: options?.qty || 1,
    };

    setDirectBuyItem(singleItem);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }

  // Calculations for general cart
  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const isFreeShipping = Boolean(settings.free_shipping_enabled && cartSubtotal >= settings.free_shipping_threshold);
  const shippingFee = isFreeShipping ? 0 : (selectedGov?.shipping ?? 0);
  const cartTotal = cartSubtotal + shippingFee;

  // Active checkout items: either directBuyItem or entire cart
  const checkoutItems: CartItem[] = directBuyItem ? [directBuyItem] : cart;
  const totalCheckoutCount = checkoutItems.reduce((sum, item) => sum + item.qty, 0);
  const checkoutSubtotal = checkoutItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const isCheckoutFreeShipping = Boolean(
    settings.free_shipping_enabled && checkoutSubtotal >= settings.free_shipping_threshold
  );
  const checkoutShippingFee = isCheckoutFreeShipping ? 0 : (selectedGov?.shipping ?? 0);
  const checkoutTotal = checkoutSubtotal + checkoutShippingFee;

  // Checkout submission
  async function handleOrderSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, boolean> = {};

    if (!customerName.trim()) errs.name = true;
    if (
      !customerPhone.trim() ||
      !/^01[0125][0-9]{8}$/.test(customerPhone.trim())
    )
      errs.phone = true;
    if (!customerAddress.trim()) errs.addr = true;

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setSubmittingOrder(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          governorate: selectedGov.name,
          address: customerAddress.trim(),
          payment_method: paymentMethod,
          items: checkoutItems,
          subtotal: checkoutSubtotal,
          shipping: checkoutShippingFee,
          total: checkoutTotal,
        }),
      });

      const data: any = await res.json();
      if (data.success) {
        setOrderCompleted(data);
        if (directBuyItem) {
          setDirectBuyItem(null);
        } else {
          setCart([]);
        }
        if (data.whatsappUrl) {
          window.open(data.whatsappUrl, "_blank");
        }
      } else {
        alert(data.error || "حدث خطأ أثناء حفظ الطلب");
      }
    } catch (err) {
      alert("فشل الاتصال بقاعدة البيانات");
    } finally {
      setSubmittingOrder(false);
    }
  }

  return (
    <CartContext.Provider
      value={{
        products,
        setProducts,
        categories,
        brands,
        colors,
        settings,
        setSettings,
        updateSettings,
        refreshSettings,
        formatPrice,
        activeGovernorates,
        cart,
        setCart,
        wishlist,
        addToCart,
        updateCartQty,
        removeFromCart,
        toggleWishlist,
        addAllWishlistToCart,
        isWishlisted,
        sendDirectWhatsApp,
        openCheckoutWithProduct,
        directBuyItem,
        setDirectBuyItem,
        checkoutItems,
        totalCheckoutCount,
        checkoutSubtotal,
        isCheckoutFreeShipping,
        checkoutShippingFee,
        checkoutTotal,
        totalCartCount,
        cartSubtotal,
        isFreeShipping,
        shippingFee,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isSearchOpen,
        setIsSearchOpen,
        quickProduct,
        setQuickProduct,
        toasts,
        showToast,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        selectedGov,
        setSelectedGov,
        customerAddress,
        setCustomerAddress,
        paymentMethod,
        setPaymentMethod,
        formErrors,
        submittingOrder,
        orderCompleted,
        setOrderCompleted,
        handleOrderSubmit,
        isAdmin,
        setIsAdmin,
        checkAdminAuth,
        refreshProducts,
        isSettingsLoaded,
        updateSettings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
