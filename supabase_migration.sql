-- ==============================================================================
-- Mobile Store - Supabase Migration & Alignment SQL
-- تشغيل هذا الملف في SQL Editor في Supabase Dashboard
-- ==============================================================================

-- 1. تحديث حالات المنتجات القديمة من الإنجليزية إلى العربية المعتمدة
UPDATE products
SET condition = 'جديد'
WHERE condition IN ('new', 'New Sealed', 'جديد (New Sealed)', 'new_sealed')
   OR condition IS NULL;

UPDATE products
SET condition = 'كسر زيرو'
WHERE condition IN ('like-new', 'like_new', 'Like New', 'كسر زيرو (Like New)', 'mint');

UPDATE products
SET condition = 'مستعمل'
WHERE condition IN ('used', 'pre-owned', 'Pre-Owned', 'مستعمل (Pre-Owned)', 'good');

-- 2. التحقق من قيود الأسعار والحدود المسموحة
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_check;
ALTER TABLE products ADD CONSTRAINT products_price_check CHECK (price > 0);

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_old_price_check;
ALTER TABLE products ADD CONSTRAINT products_old_price_check CHECK (old_price IS NULL OR old_price >= price);

-- 3. قيد حالات الجهاز (جديد / كسر زيرو / مستعمل فقط)
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_condition_check;
ALTER TABLE products ADD CONSTRAINT products_condition_check CHECK (condition IN ('جديد', 'كسر زيرو', 'مستعمل'));

-- 4. التأكد من أن حقل القسم الفرعي اختياري ولا يمنع الإضافة
ALTER TABLE products ALTER COLUMN subcategory DROP NOT NULL;
ALTER TABLE products ALTER COLUMN subcategory SET DEFAULT '';

-- 5. تحديث أسماء الماركات بالصيغة الموحدة (العربية والإنجليزية بين قوسين)
UPDATE products SET brand = 'سامسونج (Samsung)' WHERE brand ILIKE 'Samsung' OR brand ILIKE 'سامسونج';
UPDATE products SET brand = 'آبل (Apple)' WHERE brand ILIKE 'Apple' OR brand ILIKE 'ابل' OR brand ILIKE 'آبل';
UPDATE products SET brand = 'شاومي (Xiaomi)' WHERE brand ILIKE 'Xiaomi' OR brand ILIKE 'شاومي';
UPDATE products SET brand = 'أوبو (OPPO)' WHERE brand ILIKE 'Oppo' OR brand ILIKE 'OPPO' OR brand ILIKE 'أوبو';
UPDATE products SET brand = 'ريلمي (Realme)' WHERE brand ILIKE 'Realme' OR brand ILIKE 'ريلمي';
UPDATE products SET brand = 'فيفو (Vivo)' WHERE brand ILIKE 'Vivo' OR brand ILIKE 'فيفو';
UPDATE products SET brand = 'هونر (Honor)' WHERE brand ILIKE 'Honor' OR brand ILIKE 'هونر';
UPDATE products SET brand = 'إنفينيكس (Infinix)' WHERE brand ILIKE 'Infinix' OR brand ILIKE 'انفينكس';
UPDATE products SET brand = 'تكنو (Tecno)' WHERE brand ILIKE 'Tecno' OR brand ILIKE 'تكنو';
UPDATE products SET brand = 'هواوي (Huawei)' WHERE brand ILIKE 'Huawei' OR brand ILIKE 'هواوي';
UPDATE products SET brand = 'أنكر (Anker)' WHERE brand ILIKE 'Anker' OR brand ILIKE 'أنكر';
UPDATE products SET brand = 'جويروم (Joyroom)' WHERE brand ILIKE 'Joyroom' OR brand ILIKE 'جويروم';
UPDATE products SET brand = 'بيسوس (Baseus)' WHERE brand ILIKE 'Baseus' OR brand ILIKE 'بيسوس';
UPDATE products SET brand = 'سوني (Sony)' WHERE brand ILIKE 'Sony' OR brand ILIKE 'سوني';

-- 6. سياسات RLS للوصول السحابي
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access products" ON products;
CREATE POLICY "Service role full access products" ON products FOR ALL USING (true) WITH CHECK (true);
