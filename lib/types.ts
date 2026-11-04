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
