-- ==============================================================================
-- Mobile Store - Supabase Complete Schema & Initial Data
-- متجر فون زون (PhoneZone) للأجهزة الذكية والإلكترونيات
-- قم بنسخ هذا الكود بالكامل ولصقه في SQL Editor داخل Supabase ثم اضغط Run
-- ==============================================================================

-- 1. جدول الفئات الرئيسية والفرعية (Categories Table)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  image TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول الماركات (Brands Table)
CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول الألوان الموحدة (Colors Table)
CREATE TABLE IF NOT EXISTS colors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  hex_code TEXT NOT NULL
);

-- 4. جدول المنتجات الأساسي (Products Table)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sub TEXT DEFAULT '',
  cat TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  subcategory TEXT DEFAULT '',
  brand_id TEXT REFERENCES brands(id) ON DELETE SET NULL,
  brand TEXT DEFAULT '',
  price NUMERIC NOT NULL CHECK (price > 0),
  old_price NUMERIC CHECK (old_price IS NULL OR old_price >= price),
  rating NUMERIC DEFAULT 4.9,
  reviews INTEGER DEFAULT 85,
  tag TEXT DEFAULT 'new',
  badge_text TEXT DEFAULT 'جديد',
  image TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  overview TEXT DEFAULT '',
  description TEXT DEFAULT '',
  condition TEXT DEFAULT 'جديد' CHECK (condition IN ('جديد', 'كسر زيرو', 'مستعمل')),
  specifications JSONB DEFAULT '{}'::jsonb,
  colors JSONB DEFAULT '[]'::jsonb,
  variants JSONB DEFAULT '[]'::jsonb,
  in_stock INTEGER DEFAULT 1,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول مخزون الألوان لكل منتج (Product Colors Table)
CREATE TABLE IF NOT EXISTS product_colors (
  id BIGSERIAL PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  color_id TEXT REFERENCES colors(id) ON DELETE CASCADE,
  color_name TEXT NOT NULL,
  hex_code TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  UNIQUE(product_id, color_id)
);

-- 6. جدول متغيرات المنتجات (Product Variants Table)
CREATE TABLE IF NOT EXISTS product_variants (
  id BIGSERIAL PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  ram TEXT DEFAULT '',
  storage TEXT DEFAULT '',
  color_id TEXT REFERENCES colors(id) ON DELETE SET NULL,
  price NUMERIC NOT NULL,
  quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. جدول الطلبات (Orders Table)
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_ref TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  governorate TEXT NOT NULL,
  address TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL,
  shipping NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'قيد المراجعة',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. جدول تفاصيل بنود الطلبات (Order Items Table)
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  variant_id BIGINT REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_name TEXT DEFAULT '',
  color_name TEXT DEFAULT '',
  ram TEXT DEFAULT '',
  storage TEXT DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL
);

-- 9. جدول المشرفين (Admin Users Table)
CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إضافة حساب المشرف الافتراضي (admin / admin)
INSERT INTO admins (username, password_hash)
VALUES ('admin', '$2b$10$rzmW8Z9S9SZzkc6vpTKcJeLdoghftshEu.TvIa7yaWxR8nOslVHzK')
ON CONFLICT (username) DO UPDATE 
SET password_hash = '$2b$10$rzmW8Z9S9SZzkc6vpTKcJeLdoghftshEu.TvIa7yaWxR8nOslVHzK';

-- 10. إدخال الألوان الـ 15 المعتمدة
INSERT INTO colors (id, name, hex_code) VALUES
('black', 'أسود', '#111827'),
('white', 'أبيض', '#FFFFFF'),
('silver', 'فضي', '#E5E7EB'),
('gold', 'ذهبي', '#F59E0B'),
('gray', 'رمادي', '#6B7280'),
('blue', 'أزرق', '#2563EB'),
('green', 'أخضر', '#10B981'),
('red', 'أحمر', '#EF4444'),
('purple', 'بنفسجي', '#8B5CF6'),
('pink', 'وردي', '#EC4899'),
('brown', 'بني', '#78350F'),
('orange', 'برتقالي', '#F97316'),
('yellow', 'أصفر', '#EAB308'),
('transparent', 'شفاف', '#F3F4F6'),
('multicolor', 'ألوان متعددة', '#4F46E5')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, hex_code = EXCLUDED.hex_code;

-- 11. إدخال الفئات الرئيسية والفرعية
INSERT INTO categories (id, name, parent_id, sort_order) VALUES
('phones', 'الموبايلات', NULL, 1),
('tablets', 'التابلت', NULL, 2),
('headphones', 'السماعات', NULL, 3),
('cases-protection', 'الجرابات ووسائل الحماية', NULL, 4),
('chargers-cables', 'الشواحن والكابلات', NULL, 5),
('smart-watches', 'الساعات الذكية', NULL, 6),
('accessories', 'إكسسوارات أخرى', NULL, 7)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

-- 12. الماركات الرئيسية (مع الصيغة الموحدة: العربية والإنجليزية بين قوسين)
INSERT INTO brands (id, name, category_id) VALUES
('samsung', 'سامسونج (Samsung)', 'phones'),
('apple', 'آبل (Apple)', 'phones'),
('xiaomi', 'شاومي (Xiaomi)', 'phones'),
('oppo', 'أوبو (OPPO)', 'phones'),
('realme', 'ريلمي (Realme)', 'phones'),
('vivo', 'فيفو (Vivo)', 'phones'),
('honor', 'هونر (Honor)', 'phones'),
('infinix', 'إنفينيكس (Infinix)', 'phones'),
('tecno', 'تكنو (Tecno)', 'phones'),
('huawei', 'هواوي (Huawei)', 'phones'),
('anker', 'أنكر (Anker)', 'chargers-cables'),
('sony', 'سوني (Sony)', 'headphones'),
('joyroom', 'جويروم (Joyroom)', 'accessories'),
('baseus', 'بيسوس (Baseus)', 'chargers-cables')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, category_id = EXCLUDED.category_id;

-- 13. إدخال المنتجات الأولية المميزة (Initial Products Seed)
INSERT INTO products (
  id, name, sub, cat, category_id, subcategory, brand_id, brand,
  price, old_price, rating, reviews, tag, badge_text, image, images,
  overview, description, condition, specifications, colors, in_stock, is_featured
) VALUES
(
  'samsung-s24-ultra',
  'سامسونج جالاكسي S24 ألترا (Galaxy S24 Ultra 512GB)',
  'ذكاء اصطناعي Galaxy AI · شاشة مسطحة مقاومة للانعكاس وقلم S-Pen مدمج',
  'الموبايلات', 'phones', '', 'samsung', 'سامسونج (Samsung)',
  61900, 67500, 4.95, 245, 'best', 'الأعلى تقييماً',
  'https://upload.wikimedia.org/wikipedia/commons/e/ed/Samsung_S24_Ultra_Phone.png', '["https://upload.wikimedia.org/wikipedia/commons/e/ed/Samsung_S24_Ultra_Phone.png"]'::jsonb,
  'Snapdragon 8 Gen 3 · شاشة 6.8 بوصة QHD+ 120Hz · كاميرا 200MP · قلم S-Pen مدمج',
  'عملاق الأندرويد بلا منازع. معالج Snapdragon 8 Gen 3 المخصص لجالاكسي، كاميرا أسطورية 200MP مع تقريب بصري مذهل، إطار تيتانيوم صلب وزجاج Gorilla Armor المقاوم للانعكاسات والخدوش. يدعم ميزات Galaxy AI للترجمة الفورية وتعديل الصور الذكي.',
  'جديد',
  '{"ram": "12GB", "storage": "512GB", "network": "5G", "condition": "جديد", "warranty": "سنتين", "battery_health": "100%", "box_available": true, "charger_available": false}'::jsonb,
  '[{"color_id": "gray", "color_name": "رمادي", "hex_code": "#6B7280", "quantity": 6}, {"color_id": "black", "color_name": "أسود", "hex_code": "#111827", "quantity": 7}]'::jsonb,
  1, true
),
(
  'iphone-16-pro-max',
  'آيفون 16 برو ماكس (iPhone 16 Pro Max 256GB)',
  'تيتانيوم صحراوي فاخر · معالج A18 Pro الجبار وزر الكاميرا الجديد',
  'الموبايلات', 'phones', '', 'apple', 'آبل (Apple)',
  78500, 84000, 4.98, 312, 'best', 'الأكثر طلباً 🔥',
  'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-deserttitanium?wid=1000&hei=1000&fmt=jpeg&qlt=90', '["https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-deserttitanium?wid=1000&hei=1000&fmt=jpeg&qlt=90"]'::jsonb,
  'معالج A18 Pro · شاشة 6.9 بوصة OLED 120Hz · كاميرا احترافية 48MP',
  'الهاتف الأقوى من أبل لعام 2026. إطار تيتانيوم من الدرجة الخامسة فائق المتانة والخفة، شاشة 6.9 بوصة Super Retina XDR ProMotion بتردد 120Hz، كاميرا رئيسية 48MP مع تقريب بصري 5x وزر التحكم بالكاميرا الاحترافي. ضمان الوكيل المعتمد 12 شهر.',
  'جديد',
  '{"ram": "8GB", "storage": "256GB", "network": "5G", "condition": "جديد", "warranty": "سنة", "battery_health": "100%", "box_available": true, "charger_available": false}'::jsonb,
  '[{"color_id": "gold", "color_name": "ذهبي", "hex_code": "#F59E0B", "quantity": 8}, {"color_id": "black", "color_name": "أسود", "hex_code": "#111827", "quantity": 5}]'::jsonb,
  1, true
),
(
  'iphone-15-pro-like-new',
  'آيفون 15 برو كسر زيرو (iPhone 15 Pro 128GB)',
  'كسر زيرو كالجديد تماماً · بطارية 99% مع العلبة وكابل الشحن الأصلي',
  'الموبايلات', 'phones', '', 'apple', 'آبل (Apple)',
  46500, 52000, 4.92, 178, 'sale', 'كسر زيرو 💎',
  'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-bluetitanium?wid=1000&hei=1000&fmt=jpeg&qlt=90', '["https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-bluetitanium?wid=1000&hei=1000&fmt=jpeg&qlt=90"]'::jsonb,
  'معالج A17 Pro · شاشة 6.1 بوصة 120Hz ProMotion · صحة البطارية 99%',
  'جهاز كسر زيرو استخدام أسابيع قليلة فقط، بحالة المصنع خالي من أي خدوش أو علامات استخدام. صحة البطارية 99%، الشاشة أصلية 100% مع فحص كامل لكافة أجزاء الهاتف والمستشعرات والفيس آي دي.',
  'كسر زيرو',
  '{"ram": "8GB", "storage": "128GB", "network": "5G", "condition": "كسر زيرو", "warranty": "6 شهور", "battery_health": "99%", "screen_condition": "أصلية 100% بحالة المصنع", "frame_condition": "تيتانيوم أزرق كالجديد", "repair_history": "لم يُفتح نهائياً", "box_available": true, "charger_available": true}'::jsonb,
  '[{"color_id": "blue", "color_name": "أزرق", "hex_code": "#2563EB", "quantity": 2}, {"color_id": "gray", "color_name": "رمادي", "hex_code": "#6B7280", "quantity": 3}]'::jsonb,
  1, true
),
(
  'airpods-pro-2-type-c',
  'سماعات أبل إيربودز برو 2 (AirPods Pro 2 USB-C)',
  'عزل ضوضاء نشط مضاعف 2x ANC · صوت مكاني مخصص ومنفذ شحن Type-C',
  'السماعات', 'headphones', '', 'apple', 'آبل (Apple)',
  11900, 13500, 4.97, 520, 'best', 'الأكثر مبيعاً 🎧',
  'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MTJV3?wid=1000&hei=1000&fmt=jpeg&qlt=90', '["https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MTJV3?wid=1000&hei=1000&fmt=jpeg&qlt=90"]'::jsonb,
  'شريحة Apple H2 · إلغاء الضوضاء المتطور · 30 ساعة استماع مع علبة USB-C',
  'التجربة الصوتية الأروع من أبل مع شريحة H2 المتطورة. عزل ضوضاء نشط فائق القوة، نمط شفافية الصوت المتكيف، صوت مكاني يغمرك في الموسيقى والأفلام، ومقاومة الماء والعرق IP54.',
  'جديد',
  '{"connection_type": "بلوتوث 5.3", "battery_life": "حتى 30 ساعة مع العلبة", "headphone_type": "إيربودز داخل الأذن", "condition": "جديد", "warranty": "سنة"}'::jsonb,
  '[{"color_id": "white", "color_name": "أبيض", "hex_code": "#FFFFFF", "quantity": 15}]'::jsonb,
  1, true
),
(
  'apple-watch-ultra-2',
  'ساعة أبل واتش ألترا 2 تيتانيوم (Apple Watch Ultra 2 49mm)',
  'تيتانيوم فضائي مقاوم للخدش والصدمات · شاشة بسطوع 3000 شمعة وGPS مزدوج',
  'الساعات الذكية', 'smart-watches', '', 'apple', 'آبل (Apple)',
  43500, 48000, 4.96, 185, 'best', 'تيتانيوم 49mm',
  'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/refurb-49-ultra-natural-titanium-ocean-navy?wid=1000&hei=1000&fmt=jpeg&qlt=90', '["https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/refurb-49-ultra-natural-titanium-ocean-navy?wid=1000&hei=1000&fmt=jpeg&qlt=90"]'::jsonb,
  'تيتانيوم فضائي 49 ملم · شاشة Retina بسطوع 3000 nits · مقاومة ماء 100M',
  'الساعة الأكثر صلابة وقدرة من أبل. صممت لتحمل أقسى التحديات والرياضات الخطرة والغوص حتى عمق 40 متراً، مع معالج S9 فائق السرعة وإيماءة الضغط المزدوج Double Tap.',
  'جديد',
  '{"connection_type": "بلوتوث 5.3 + eSIM", "compatibility": "iPhone", "battery_life": "36-72 ساعة", "condition": "جديد", "warranty": "سنة"}'::jsonb,
  '[{"color_id": "silver", "color_name": "فضي", "hex_code": "#E5E7EB", "quantity": 6}, {"color_id": "orange", "color_name": "برتقالي", "hex_code": "#F97316", "quantity": 4}]'::jsonb,
  1, true
),
(
  'anker-prime-65w',
  'شاحن أنكر برايم فائق السرعة 65W GaN (Anker Prime 65W)',
  'تقنية GaN III فائقة الصغر · 3 منافذ شحن سريع للهواتف واللابتوبات والتابلت',
  'الشواحن والكابلات', 'chargers-cables', '', 'anker', 'أنكر (Anker)',
  2450, 2900, 4.93, 320, 'best', 'شاحن GaN 65W',
  'https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A2663111-Anker_715_Charger_Nano_II_65W.png', '["https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A2663111-Anker_715_Charger_Nano_II_65W.png"]'::jsonb,
  'قدرة 65W · 2 منفذ USB-C + 1 منفذ USB-A · متوافق مع iPhone, Samsung, Mac, iPad',
  'شاحن واحد يكفيك لجميع أجهزتك. يعتمد على أحدث تقنيات نيتريد الجاليوم GaN لتوفير طاقة 65W بحجم أصغر بنسبة 50% من الشواحن التقليدية، مع نظام حماية حرارية متطور ActiveShield 2.0.',
  'جديد',
  '{"charging_power": "65W Max", "connector_type": "2x Type-C + 1x USB-A", "condition": "جديد", "warranty": "ضمان آخر"}'::jsonb,
  '[{"color_id": "black", "color_name": "أسود", "hex_code": "#111827", "quantity": 20}]'::jsonb,
  1, false
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  sub = EXCLUDED.sub,
  cat = EXCLUDED.cat,
  category_id = EXCLUDED.category_id,
  brand = EXCLUDED.brand,
  brand_id = EXCLUDED.brand_id,
  price = EXCLUDED.price,
  old_price = EXCLUDED.old_price,
  condition = EXCLUDED.condition,
  specifications = EXCLUDED.specifications,
  colors = EXCLUDED.colors;

-- 14. تفعيل Row Level Security (RLS) وسياسات الوصول
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة إن وجدت لمنع تكرار الأسماء
DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Public read brands" ON brands;
DROP POLICY IF EXISTS "Public read colors" ON colors;
DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Public read product_colors" ON product_colors;
DROP POLICY IF EXISTS "Public read product_variants" ON product_variants;
DROP POLICY IF EXISTS "Public insert orders" ON orders;
DROP POLICY IF EXISTS "Public insert order_items" ON order_items;
DROP POLICY IF EXISTS "Service role full access products" ON products;
DROP POLICY IF EXISTS "Service role full access categories" ON categories;
DROP POLICY IF EXISTS "Service role full access brands" ON brands;
DROP POLICY IF EXISTS "Service role full access colors" ON colors;
DROP POLICY IF EXISTS "Service role full access orders" ON orders;
DROP POLICY IF EXISTS "Service role full access order_items" ON order_items;

-- سياسات القراءة العامة للمتجر
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Public read colors" ON colors FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read product_colors" ON product_colors FOR SELECT USING (true);
CREATE POLICY "Public read product_variants" ON product_variants FOR SELECT USING (true);

-- سياسة إنشاء الطلبات للعملاء
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert order_items" ON order_items FOR INSERT WITH CHECK (true);

-- سياسات الوصول الكامل لـ service_role (لوحة الأدمن والسيرفر)
CREATE POLICY "Service role full access products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access brands" ON brands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access colors" ON colors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- 15. تحديث كاش PostgREST Schema فوراً
NOTIFY pgrst, 'reload schema';
