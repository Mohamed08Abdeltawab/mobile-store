export type ProductCondition = 'جديد' | 'كسر زيرو' | 'مستعمل';

export interface PredefinedColor {
  id: string;
  name: string;
  name_ar?: string;
  hex_code: string;
  hex?: string;
}

export interface ProductColor {
  id?: string;
  product_id?: string;
  color_id?: string;
  color_name?: string;
  name_ar?: string;
  name?: string;
  hex_code?: string;
  hex?: string;
  quantity?: number;
}

export interface ProductVariant {
  id?: string;
  product_id?: string;
  ram?: string;
  storage?: string;
  color_id?: string;
  color_name?: string;
  price: number;
  quantity: number;
}

export interface Specifications {
  ram?: string;
  storage?: string;
  network?: string; // 4G / 5G / Wi-Fi Only
  battery_health?: string | number; // e.g. "98%" or 98
  screen_condition?: string; // أصلية / مستبدلة / ممتازة
  frame_condition?: string; // حالة الفريم
  back_condition?: string; // حالة الظهر
  repair_history?: string; // هل تم فتح الجهاز أو صيانته
  repaired?: boolean;
  box_available?: boolean | string; // توفر العلبة الأصلية
  charger_available?: boolean | string; // توفر الشاحن الأصلي
  warranty?: string; // مدة ونوع الضمان
  notes?: string; // عيوب أو ملاحظات إضافية

  // Category specific specs
  connection_type?: string; // بلوتوث / سلكي
  battery_life?: string; // عمر البطارية بالساعات
  headphone_type?: string; // إيربودز / رأس / ألعاب
  compatible_device?: string; // الأجهزة المتوافقة
  material?: string; // مادة الصنع (سيليكون، جلد، كربون...)
  protection_type?: string; // 9D / سيراميك / مطفي / خصوصية
  charging_power?: string; // قدرة الشحن (20W, 45W, 65W...)
  connector_type?: string; // Type-C, Lightning, Micro
  cable_length?: string; // طول الكابل (1m, 2m...)
  battery_capacity?: string; // سعة البطارية للباوربانك (10000mAh, 20000mAh...)
  compatibility?: string; // التوافق مع الأنظمة (iOS, Android)
  [key: string]: any;
}

export interface Category {
  id: string;
  name: string;
  name_ar?: string;
  parent_id?: string | null;
  image?: string;
  is_active: boolean;
  sort_order: number;
}

export interface Brand {
  id: string;
  name: string;
  name_ar?: string;
  category_id?: string | null;
}

export interface Product {
  id: string;
  name: string;
  sub?: string;
  cat?: string;
  category?: string;
  category_id?: string;
  subcategory?: string;
  brand_id?: string;
  brand?: string;
  price: number;
  old_price?: number | null;
  original_price?: number | null;
  quantity?: number;
  rating?: number;
  reviews?: number;
  tag?: string;
  badge_text?: string;
  image: string;
  images: string[];
  description?: string;
  overview?: string;
  condition: ProductCondition;
  specifications: Specifications;
  colors?: ProductColor[];
  variants?: ProductVariant[];
  in_stock?: boolean | number;
  is_featured?: boolean;
  is_published?: boolean;
  created_at?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  variant?: string;
  variant_id?: string;
  color?: string;
  selectedColor?: { id: string; name_ar?: string; name?: string; hex?: string; hex_code?: string };
  ram?: string;
  storage?: string;
  condition?: ProductCondition;
  qty: number;
}

export interface Order {
  id?: number | string;
  order_ref: string;
  customer_name: string;
  customer_phone: string;
  governorate: string;
  address: string;
  payment_method: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'قيد المراجعة' | 'تم التأكيد' | 'جاري الشحن' | 'تم التسليم' | 'ملغي';
  created_at?: string;
}

export const PREDEFINED_COLORS: PredefinedColor[] = [
  { id: "black", name: "أسود", name_ar: "أسود", hex_code: "#111827", hex: "#111827" },
  { id: "white", name: "أبيض", name_ar: "أبيض", hex_code: "#FFFFFF", hex: "#FFFFFF" },
  { id: "silver", name: "فضي", name_ar: "فضي", hex_code: "#E5E7EB", hex: "#E5E7EB" },
  { id: "gold", name: "ذهبي", name_ar: "ذهبي", hex_code: "#F59E0B", hex: "#F59E0B" },
  { id: "gray", name: "رمادي", name_ar: "رمادي", hex_code: "#6B7280", hex: "#6B7280" },
  { id: "blue", name: "أزرق", name_ar: "أزرق", hex_code: "#2563EB", hex: "#2563EB" },
  { id: "green", name: "أخضر", name_ar: "أخضر", hex_code: "#10B981", hex: "#10B981" },
  { id: "red", name: "أحمر", name_ar: "أحمر", hex_code: "#EF4444", hex: "#EF4444" },
  { id: "purple", name: "بنفسجي", name_ar: "بنفسجي", hex_code: "#8B5CF6", hex: "#8B5CF6" },
  { id: "pink", name: "وردي", name_ar: "وردي", hex_code: "#EC4899", hex: "#EC4899" },
  { id: "brown", name: "بني", name_ar: "بني", hex_code: "#78350F", hex: "#78350F" },
  { id: "orange", name: "برتقالي", name_ar: "برتقالي", hex_code: "#F97316", hex: "#F97316" },
  { id: "yellow", name: "أصفر", name_ar: "أصفر", hex_code: "#EAB308", hex: "#EAB308" },
  { id: "transparent", name: "شفاف", name_ar: "شفاف", hex_code: "#F3F4F6", hex: "#F3F4F6" },
  { id: "multicolor", name: "ألوان متعددة", name_ar: "ألوان متعددة", hex_code: "#4F46E5", hex: "#4F46E5" }
];

// ==============================================================================
// Store Settings & Configuration Models
// ==============================================================================

export type CurrencyCode = "EGP" | "USD" | "SAR";

export type CurrencyFormat =
  | "symbol_after_arabic" // e.g. "250 ج.م"
  | "symbol_before_english" // e.g. "LE 250"
  | "symbol_after_english" // e.g. "250 LE"
  | "symbol_before_arabic"; // e.g. "ج.م 250"

export interface ShippingCity {
  id: string;
  name: string;
  shipping: number;
  days: string;
  is_active: boolean;
}

export interface PhoneCountryOption {
  id: string;
  name: string;
  dial_code: string;
  flag: string;
  placeholder: string;
  min_digits: number;
  max_digits: number;
  pattern?: string;
  is_active: boolean;
}

export const PRESET_PHONE_COUNTRIES: PhoneCountryOption[] = [
  {
    id: "eg",
    name: "مصر",
    dial_code: "+20",
    flag: "🇪🇬",
    placeholder: "01012345678",
    min_digits: 10,
    max_digits: 11,
    pattern: "^0?1[0125][0-9]{8}$",
    is_active: true,
  },
  {
    id: "sa",
    name: "السعودية",
    dial_code: "+966",
    flag: "🇸🇦",
    placeholder: "0501234567",
    min_digits: 9,
    max_digits: 10,
    pattern: "^0?5[0-9]{8}$",
    is_active: true,
  },
  {
    id: "ae",
    name: "الإمارات",
    dial_code: "+971",
    flag: "🇦🇪",
    placeholder: "0501234567",
    min_digits: 9,
    max_digits: 10,
    pattern: "^0?5[0-9]{8}$",
    is_active: true,
  },
  {
    id: "kw",
    name: "الكويت",
    dial_code: "+965",
    flag: "🇰🇼",
    placeholder: "50123456",
    min_digits: 8,
    max_digits: 8,
    is_active: true,
  },
  {
    id: "qa",
    name: "قطر",
    dial_code: "+974",
    flag: "🇶🇦",
    placeholder: "30123456",
    min_digits: 8,
    max_digits: 8,
    is_active: true,
  },
  {
    id: "bh",
    name: "البحرين",
    dial_code: "+973",
    flag: "🇧🇭",
    placeholder: "30123456",
    min_digits: 8,
    max_digits: 8,
    is_active: true,
  },
  {
    id: "om",
    name: "عُمان",
    dial_code: "+968",
    flag: "🇴🇲",
    placeholder: "90123456",
    min_digits: 8,
    max_digits: 8,
    is_active: true,
  },
  {
    id: "jo",
    name: "الأردن",
    dial_code: "+962",
    flag: "🇯🇴",
    placeholder: "0791234567",
    min_digits: 9,
    max_digits: 10,
    is_active: true,
  },
];

/**
 * Validate a local phone input against a configured country rule.
 */
export function validatePhoneForCountry(rawPhone: string, country: PhoneCountryOption): boolean {
  let cleaned = rawPhone.replace(/[\s\-()]/g, "");
  if (country.dial_code && cleaned.startsWith(country.dial_code)) {
    cleaned = cleaned.slice(country.dial_code.length);
  }
  if (!/^\d+$/.test(cleaned)) return false;
  if (country.pattern) {
    try {
      return new RegExp(country.pattern).test(cleaned);
    } catch {
      // Fallback to digit length check if custom regex is invalid
    }
  }
  return cleaned.length >= country.min_digits && cleaned.length <= country.max_digits;
}

/**
 * Format a validated phone number with its country dial code (e.g. +201012345678).
 */
export function formatPhoneWithDialCode(rawPhone: string, country: PhoneCountryOption): string {
  let cleaned = rawPhone.replace(/[\s\-()]/g, "");
  if (country.dial_code && cleaned.startsWith(country.dial_code)) {
    return cleaned;
  }
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }
  return `${country.dial_code}${cleaned}`;
}

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  button_text?: string;
  button_link?: string;
  badge?: string;
  is_active: boolean;
  sort_order: number;
}

export interface StoreSettings {
  // 1. Brand & Identity
  store_name: string;
  logo_url: string;
  logo_dark_url?: string;
  tagline: string;
  description: string;

  // 2. Localization & Currency
  currency: CurrencyCode;
  currency_format: CurrencyFormat;
  custom_currency_symbol?: string;
  phone_countries?: PhoneCountryOption[];

  // 3. Social Media Links (Marketing)
  social_facebook: string;
  social_facebook_enabled: boolean;
  social_instagram: string;
  social_instagram_enabled: boolean;
  social_tiktok: string;
  social_tiktok_enabled: boolean;
  whatsapp_number: string;
  whatsapp_enabled: boolean;
  phone_number: string;
  sales_hours: string;
  address_text: string;

  // 4. Shipping Configuration
  shipping_cities: ShippingCity[];
  free_shipping_enabled: boolean;
  free_shipping_threshold: number;
  free_shipping_message: string;

  // 5. Payment Methods
  payment_cod_enabled: boolean;
  payment_cod_title: string;
  payment_cod_notes: string;

  payment_vodafone_cash_enabled: boolean;
  payment_vodafone_cash_number: string;
  payment_vodafone_cash_instructions: string;
  payment_vodafone_cash_qr?: string;

  payment_instapay_enabled: boolean;
  payment_instapay_handle: string;
  payment_instapay_instructions: string;
  payment_instapay_qr?: string;

  // 6. Theme & Visual Appearance
  primary_color: string;
  secondary_color: string;
  hero_slides: HeroSlide[];

  updated_at?: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  store_name: "MOBILE STORE",
  logo_url: "",
  logo_dark_url: "",
  tagline: "موبايلات · تابلت · إلكترونيات",
  description: "متجر Mobile Store المتخصص في بيع الهواتف الذكية والأجهزة اللوحية والإكسسوارات الأصلية. نحرص على تقديم أعلى معايير الجودة، المعاينة والفحص الكامل قبل الدفع، وضمان محلي معتمد مع استبدال فوري.",

  currency: "EGP",
  currency_format: "symbol_after_arabic",
  custom_currency_symbol: "",
  phone_countries: [PRESET_PHONE_COUNTRIES[0]],

  social_facebook: "https://facebook.com",
  social_facebook_enabled: true,
  social_instagram: "https://instagram.com",
  social_instagram_enabled: true,
  social_tiktok: "https://tiktok.com",
  social_tiktok_enabled: true,
  whatsapp_number: "201131350988",
  whatsapp_enabled: true,
  phone_number: "0106 571 2366",
  sales_hours: "يومياً من 10:00 صباحاً حتى 11:00 مساءً",
  address_text: "التجمع الخامس، شارع التسعين، القاهرة، جمهورية مصر العربية",

  shipping_cities: [
    { id: "cairo", name: "القاهرة", shipping: 50, days: "24-48 ساعة", is_active: true },
    { id: "giza", name: "الجيزة", shipping: 50, days: "24-48 ساعة", is_active: true },
    { id: "alex", name: "الإسكندرية", shipping: 60, days: "48 ساعة", is_active: true },
    { id: "delta", name: "محافظات الدلتا (المنصورة، طنطا، الزقازيق...)", shipping: 65, days: "48-72 ساعة", is_active: true },
    { id: "canal", name: "مدن القناة (الإسماعيلية، بورسعيد، السويس)", shipping: 70, days: "48-72 ساعة", is_active: true },
    { id: "upper", name: "محافظات الصعيد (بني سويف، أسيوط، سوهاج...)", shipping: 80, days: "3-4 أيام", is_active: true },
    { id: "remote", name: "المحافظات الحدودية (البحر الأحمر، مطروح...)", shipping: 95, days: "4-5 أيام", is_active: true },
  ],
  free_shipping_enabled: true,
  free_shipping_threshold: 5000,
  free_shipping_message: "شحن مجاني لكافة المحافظات للطلبات الأعلى من 5000 ج.م",

  payment_cod_enabled: true,
  payment_cod_title: "الدفع عند الاستلام بعد المعاينة والفحص",
  payment_cod_notes: "لك كامل الحق في فتح الشحنة وفحص الجهاز والتأكد من حالته ومطابقته للمواصفات قبل دفع أي مبلغ للمندوب.",

  payment_vodafone_cash_enabled: true,
  payment_vodafone_cash_number: "01012345678",
  payment_vodafone_cash_instructions: "قم بتحويل قيمة الطلب أو العربون إلى محفظة فودافون كاش، وأرسل صورة رسالة التحويل عبر الواتساب لتأكيد الشحن فوراً.",
  payment_vodafone_cash_qr: "",

  payment_instapay_enabled: true,
  payment_instapay_handle: "mobilestore@instapay",
  payment_instapay_instructions: "قم بالتحويل عبر تطبيق إنستاباي إلى المعرف (IPA) الموضح أعلاه، واحتفظ بإيصال العملية للمعاينة.",
  payment_instapay_qr: "",

  primary_color: "#A3E635",
  secondary_color: "#10B981",
  hero_slides: [
    {
      id: "slide-1",
      image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-deserttitanium?wid=1000&hei=1000&fmt=jpeg&qlt=90",
      title: "هواتف ذكية تصنع الفرق، وقوة تليق باختياراتك",
      subtitle: "استكشف عالم Mobile Store المتخصص في أحدث هواتف آيفون، سامسونج، شاومي، وأجهزة التابلت والسماعات الأصلية مع ميزة الفحص قبل الدفع.",
      button_text: "تصفح كل الأجهزة",
      button_link: "/shop",
      badge: "أحدث الهواتف الذكية والإلكترونيات لعام 2026",
      is_active: true,
      sort_order: 1
    }
  ]
};

/**
 * Universal Currency Formatter respecting active store settings
 */
export function formatCurrency(
  amount: number | string | undefined | null,
  settings?: Partial<StoreSettings>
): string {
  const num = typeof amount === "number" ? amount : parseFloat(String(amount || 0));
  if (isNaN(num)) return "0";

  const currency = settings?.currency || "EGP";
  const format = settings?.currency_format || "symbol_after_arabic";

  const isInt = Math.round(num) === num;
  const numStrAr = isInt
    ? num.toLocaleString("ar-EG")
    : num.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const numStrEn = isInt
    ? num.toLocaleString("en-US")
    : num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (currency === "USD") {
    switch (format) {
      case "symbol_before_english":
        return `$${numStrEn}`;
      case "symbol_after_english":
        return `${numStrEn} USD`;
      case "symbol_before_arabic":
        return `$ ${numStrEn}`;
      case "symbol_after_arabic":
      default:
        return `${numStrAr} دولار`;
    }
  }

  if (currency === "SAR") {
    switch (format) {
      case "symbol_before_english":
        return `SAR ${numStrEn}`;
      case "symbol_after_english":
        return `${numStrEn} SAR`;
      case "symbol_before_arabic":
        return `ر.س ${numStrAr}`;
      case "symbol_after_arabic":
      default:
        return `${numStrAr} ر.س`;
    }
  }

  if (currency === "EGP") {
    switch (format) {
      case "symbol_before_english":
        return `LE ${numStrEn}`;
      case "symbol_after_english":
        return `${numStrEn} LE`;
      case "symbol_before_arabic":
        return `ج.م ${numStrAr}`;
      case "symbol_after_arabic":
      default:
        return `${numStrAr} ج.م`;
    }
  }

  // Custom or other currencies
  const customSymbol = settings?.custom_currency_symbol?.trim() || String(currency);
  switch (format) {
    case "symbol_before_english":
      return `${customSymbol} ${numStrEn}`;
    case "symbol_after_english":
      return `${numStrEn} ${customSymbol}`;
    case "symbol_before_arabic":
      return `${customSymbol} ${numStrAr}`;
    case "symbol_after_arabic":
    default:
      return `${numStrAr} ${customSymbol}`;
  }
}
