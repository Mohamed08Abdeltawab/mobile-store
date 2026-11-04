"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, CartItem, Order, Category, Brand, PredefinedColor } from "../../lib/types";

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
  { id: "delta", name: "محافظات الدلتا (المنصورة، طنطا، الزقازيق...)", shipping: 65, days: "48-72 ساعة" },
  { id: "canal", name: "مدن القناة (الإسماعيلية، بورسعيد، السويس)", shipping: 70, days: "48-72 ساعة" },
  { id: "upper", name: "محافظات الصعيد (بني سويف، أسيوط، سوهاج...)", shipping: 80, days: "3-4 أيام" },
  { id: "remote", name: "المحافظات الحدودية (البحر الأحمر، مطروح...)", shipping: 95, days: "4-5 أيام" }
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
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  wishlist: string[];
  addToCart: (product: Product, qty?: number, variant?: string, color?: string, ram?: string, storage?: string) => void;
  updateCartQty: (index: number, delta: number) => void;
  removeFromCart: (index: number) => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  sendDirectWhatsApp: (product: Product) => void;
  openCheckoutWithProduct: (product: Product) => void;
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
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [colors, setColors] = useState<PredefinedColor[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modals & Overlays
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickProduct, setQuickProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Checkout State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedGov, setSelectedGov] = useState<Governorate>(GOVERNORATES[0]);
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  async function checkAdminAuth(): Promise<boolean> {
    try {
      const res = await fetch("/api/admin/login");
      const data = await res.json();
      const authed = Boolean(data.authenticated);
      setIsAdmin(authed);
      return authed;
    } catch (e) {
      setIsAdmin(false);
      return false;
    }
  }

  async function refreshProducts() {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Error loading products:", err);
    }
  }

  // Load Initial Products, Categories & Auth
  useEffect(() => {
    checkAdminAuth();
    refreshProducts();

    fetch("/api/categories")
      .then(res => res.json())
      .then(data => { if (data.success) setCategories(data.categories); })
      .catch(() => {});

    fetch("/api/brands")
      .then(res => res.json())
      .then(data => { if (data.success) setBrands(data.brands); })
      .catch(() => {});

    fetch("/api/colors")
      .then(res => res.json())
      .then(data => { if (data.success) setColors(data.colors); })
      .catch(() => {});

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
      localStorage.setItem("mobile_store_wishlist", JSON.stringify([...new Set(wishlist)]));
    }
  }, [wishlist, isLoaded]);

  // Toast notifications
  function showToast(msg: string) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }

  // Cart Management
  function addToCart(
    product: Product,
    qty: number = 1,
    variant: string = "",
    color: string = "",
    ram: string = "",
    storage: string = ""
  ) {
    if (!product) return;
    const vName = variant || (color ? `لون: ${color}` : (product.colors && product.colors[0] ? `لون: ${product.colors[0].color_name}` : ""));

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.variant === vName);
      if (existing) {
        return prev.map(item => item === existing ? { ...item, qty: item.qty + qty } : item);
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        variant: vName,
        color: color || (product.colors && product.colors[0] ? product.colors[0].color_name : ""),
        ram: ram || (product.specifications?.ram || ""),
        storage: storage || (product.specifications?.storage || ""),
        condition: product.condition,
        qty
      }];
    });

    showToast(`تمت إضافة "${product.name}" إلى سلة التسوق`);
    setIsCartOpen(true);
  }

  function updateCartQty(index: number, delta: number) {
    setCart(prev => {
      return prev
        .map((item, i) => {
          if (i === index) {
            return { ...item, qty: item.qty + delta };
          }
          return item;
        })
        .filter(item => item.qty > 0);
    });
  }

  function removeFromCart(index: number) {
    setCart(prev => prev.filter((_, i) => i !== index));
    showToast("تم حذف المنتج من السلة");
  }

  // Wishlist Management
  function toggleWishlist(productId: string) {
    const isCurrentlyFav = wishlist.includes(productId);
    if (isCurrentlyFav) {
      setWishlist(prev => prev.filter(id => id !== productId));
      showToast("تمت الإزالة من المفضلة");
    } else {
      setWishlist(prev => {
        if (prev.includes(productId)) return prev;
        return [...prev, productId];
      });
      showToast("تمت الإضافة إلى المفضلة ❤️");
    }
  }

  function isWishlisted(productId: string) {
    return wishlist.includes(productId);
  }

  // Quick WhatsApp Purchase
  function sendDirectWhatsApp(product: Product) {
    if (!product) return;
    const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201065712366";
    const conditionText = product.condition ? ` (حالة: ${product.condition})` : "";
    const text = `مرحباً، أود الاستفسار وطلب جهاز *${product.name}*${conditionText} بسعر *${Number(product.price).toLocaleString("ar-EG")} ج.م* مع ميزة الفحص والمعاينة قبل الدفع.`;
    const url = `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  // Fast Checkout opener for single product
  function openCheckoutWithProduct(product: Product) {
    if (!product) return;
    addToCart(product, 1);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }

  // Calculations
  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const isFreeShipping = cartSubtotal >= 5000;
  const shippingFee = isFreeShipping ? 0 : selectedGov.shipping;
  const cartTotal = cartSubtotal + shippingFee;

  // Checkout submission
  async function handleOrderSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, boolean> = {};

    if (!customerName.trim()) errs.name = true;
    if (!customerPhone.trim() || !/^01[0125][0-9]{8}$/.test(customerPhone.trim())) errs.phone = true;
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
          items: cart,
          subtotal: cartSubtotal,
          shipping: shippingFee,
          total: cartTotal
        })
      });

      const data = await res.json();
      if (data.success) {
        setOrderCompleted(data);
        setCart([]);
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
        cart,
        setCart,
        wishlist,
        addToCart,
        updateCartQty,
        removeFromCart,
        toggleWishlist,
        isWishlisted,
        sendDirectWhatsApp,
        openCheckoutWithProduct,
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
        refreshProducts
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
