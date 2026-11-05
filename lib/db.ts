// Safe dynamic loading of SQLite for serverless / Cloudflare compatibility
import path from "node:path";
import fs from "node:fs/promises";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";
import { Product, Order, Category, Brand, PredefinedColor, PREDEFINED_COLORS } from "./types";

let sqliteInstance: any = null;
let DatabaseSyncClass: any = null;

function getDatabaseSync() {
  if (DatabaseSyncClass) return DatabaseSyncClass;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sqlite = require("node:sqlite");
    DatabaseSyncClass = sqlite.DatabaseSync;
    return DatabaseSyncClass;
  } catch {
    return null;
  }
}

// ==============================================================================
// SQLite Fallback Layer (Seamless local database without external dependencies)
// ==============================================================================

function getSqliteDb() {
  if (sqliteInstance) return sqliteInstance;

  const dbPath = path.join(process.cwd(), "mobile_store.db");
  const DatabaseSync = getDatabaseSync();
  if (!DatabaseSync) {
    throw new Error("SQLite is not supported in this runtime. Please configure Supabase in environment variables.");
  }
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");

  // 1. Categories Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id TEXT DEFAULT NULL,
      image TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );
  `);

  // 2. Brands Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category_id TEXT DEFAULT NULL
    );
  `);

  // 3. Colors Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS colors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      hex_code TEXT NOT NULL
    );
  `);

  // 4. Products Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sub TEXT DEFAULT '',
      cat TEXT NOT NULL,
      category_id TEXT DEFAULT '',
      subcategory TEXT DEFAULT '',
      brand_id TEXT DEFAULT '',
      brand TEXT DEFAULT '',
      price REAL NOT NULL,
      old_price REAL DEFAULT NULL,
      rating REAL DEFAULT 4.9,
      reviews INTEGER DEFAULT 85,
      tag TEXT DEFAULT 'new',
      badge_text TEXT DEFAULT 'جديد',
      image TEXT NOT NULL,
      overview TEXT DEFAULT '',
      description TEXT DEFAULT '',
      condition TEXT DEFAULT 'جديد',
      specifications TEXT DEFAULT '{}',
      colors TEXT DEFAULT '[]',
      variants TEXT DEFAULT '[]',
      in_stock INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      images TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 5. Product Colors Inventory Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_colors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      color_id TEXT NOT NULL,
      color_name TEXT NOT NULL,
      hex_code TEXT NOT NULL,
      quantity INTEGER DEFAULT 0,
      UNIQUE(product_id, color_id)
    );
  `);

  // 6. Orders Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_ref TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      governorate TEXT NOT NULL,
      address TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      shipping REAL NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'قيد المراجعة',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 7. Admins Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Seed default admin
  const adminCheck = db.prepare("SELECT COUNT(*) as count FROM admins").get() as any;
  if (!adminCheck || adminCheck.count === 0) {
    const defaultPassword = process.env.ADMIN_PASSWORD || "admin";
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(defaultPassword, salt);
    db.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").run("admin", hash);
  }

  // Seed predefined colors
  const colorCheck = db.prepare("SELECT COUNT(*) as count FROM colors").get() as any;
  if (!colorCheck || colorCheck.count === 0) {
    const insertColor = db.prepare("INSERT INTO colors (id, name, hex_code) VALUES (?, ?, ?)");
    for (const c of PREDEFINED_COLORS) {
      insertColor.run(c.id, c.name, c.hex_code);
    }
  }

  // Seed categories
  const catCheck = db.prepare("SELECT COUNT(*) as count FROM categories").get() as any;
  if (!catCheck || catCheck.count === 0) {
    const initialCategories = [
      { id: "phones", name: "الموبايلات", sort: 1 },
      { id: "tablets", name: "التابلت", sort: 2 },
      { id: "headphones", name: "السماعات", sort: 3 },
      { id: "cases-protection", name: "الجرابات ووسائل الحماية", sort: 4 },
      { id: "chargers-cables", name: "الشواحن والكابلات", sort: 5 },
      { id: "smart-watches", name: "الساعات الذكية", sort: 6 },
      { id: "accessories", name: "إكسسوارات أخرى", sort: 7 },
    ];
    const insertCat = db.prepare("INSERT INTO categories (id, name, parent_id, sort_order) VALUES (?, ?, NULL, ?)");
    for (const cat of initialCategories) {
      insertCat.run(cat.id, cat.name, cat.sort);
    }
  }

  // Seed brands
  const brandCheck = db.prepare("SELECT COUNT(*) as count FROM brands").get() as any;
  if (!brandCheck || brandCheck.count === 0) {
    const initialBrands = [
      { id: "apple", name: "Apple", category_id: "phones" },
      { id: "samsung", name: "Samsung", category_id: "phones" },
      { id: "xiaomi", name: "Xiaomi", category_id: "phones" },
      { id: "oppo", name: "Oppo", category_id: "phones" },
      { id: "realme", name: "Realme", category_id: "phones" },
      { id: "vivo", name: "Vivo", category_id: "phones" },
      { id: "honor", name: "Honor", category_id: "phones" },
      { id: "infinix", name: "Infinix", category_id: "phones" },
      { id: "huawei", name: "Huawei", category_id: "phones" },
      { id: "anker", name: "Anker", category_id: "chargers-cables" },
      { id: "sony", name: "Sony", category_id: "headphones" },
      { id: "joyroom", name: "Joyroom", category_id: "accessories" },
    ];
    const insertBrand = db.prepare("INSERT INTO brands (id, name, category_id) VALUES (?, ?, ?)");
    for (const b of initialBrands) {
      insertBrand.run(b.id, b.name, b.category_id);
    }
  }

  // Seed products
  const productCheck = db.prepare("SELECT COUNT(*) as count FROM products").get() as any;
  if (!productCheck || productCheck.count === 0) {
    seedInitialProducts(db);
  }

  sqliteInstance = db;
  return sqliteInstance;
}

function seedInitialProducts(db: any) {
  const seedItems = [
    {
      id: "iphone-16-pro-max",
      name: "آيفون 16 برو ماكس (iPhone 16 Pro Max 256GB)",
      sub: "تيتانيوم صحراوي فاخر · معالج A18 Pro الجبار وزر الكاميرا الجديد",
      cat: "الموبايلات",
      category_id: "phones",
      subcategory: "آيفون",
      brand_id: "apple",
      brand: "Apple",
      price: 78500,
      old_price: 84000,
      rating: 4.98,
      reviews: 312,
      tag: "best",
      badge_text: "الأكثر طلباً 🔥",
      image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-deserttitanium?wid=1000&hei=1000&fmt=jpeg&qlt=90",
      images: JSON.stringify([
        "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-deserttitanium?wid=1000&hei=1000&fmt=jpeg&qlt=90",
        "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg"
      ]),
      condition: "جديد",
      description: "الهاتف الأقوى من أبل لعام 2026. إطار تيتانيوم من الدرجة الخامسة فائق المتانة والخفة، شاشة 6.9 بوصة Super Retina XDR ProMotion بتردد 120Hz، كاميرا رئيسية 48MP مع تقريب بصري 5x وزر التحكم بالكاميرا الاحترافي. ضمان الوكيل المعتمد 12 شهر.",
      overview: "معالج A18 Pro · شاشة 6.9 بوصة OLED 120Hz · كاميرا احترافية 48MP · بطارية تدوم حتى 33 ساعة تشغيل فيديو · شحن MagSafe سريع",
      specifications: JSON.stringify({
        ram: "8GB",
        storage: "256GB",
        network: "5G",
        condition: "جديد",
        warranty: "ضمان الوكيل 12 شهراً استبدال",
        box_available: true,
        charger_available: false,
        battery_health: "100%",
        screen_condition: "جديدة كلياً بحالة المصنع",
        frame_condition: "تيتانيوم صحراوي بحالة المصنع",
        back_condition: "جديد كلياً",
        repair_history: "لم يتم فتح أو صيانة الجهاز مطلقاً"
      }),
      colors: JSON.stringify([
        { color_id: "gold", color_name: "تيتانيوم صحراوي", hex_code: "#D4AF37", quantity: 8 },
        { color_id: "black", color_name: "تيتانيوم أسود", hex_code: "#1F2421", quantity: 5 },
        { color_id: "white", color_name: "تيتانيوم أبيض", hex_code: "#F9FAFB", quantity: 4 },
        { color_id: "silver", color_name: "تيتانيوم طبيعي", hex_code: "#9CA3AF", quantity: 6 }
      ]),
      in_stock: 1,
      is_featured: 1
    },
    {
      id: "samsung-s24-ultra",
      name: "سامسونج جالاكسي S24 ألترا (Galaxy S24 Ultra 512GB)",
      sub: "ذكاء اصطناعي Galaxy AI · شاشة مسطحة مقاومة للانعكاس وقلم S-Pen مدمج",
      cat: "الموبايلات",
      category_id: "phones",
      subcategory: "سامسونج",
      brand_id: "samsung",
      brand: "Samsung",
      price: 61900,
      old_price: 67500,
      rating: 4.95,
      reviews: 245,
      tag: "best",
      badge_text: "الأعلى تقييماً",
      image: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Samsung_S24_Ultra_Phone.png",
      images: JSON.stringify([
        "https://upload.wikimedia.org/wikipedia/commons/e/ed/Samsung_S24_Ultra_Phone.png",
        "https://images.samsung.com/is/image/samsung/assets/latin_en/2401/smartphones/galaxy-s24-ultra/specs/163x346_Titanium-Black_Galaxy_S24_Ultra.jpg"
      ]),
      condition: "جديد",
      description: "عملاق الأندرويد بلا منازع. معالج Snapdragon 8 Gen 3 المخصص لجالاكسي، كاميرا أسطورية 200MP مع تقريب بصري مذهل، إطار تيتانيوم صلب وزجاج Gorilla Armor المقاوم للانعكاسات والخدوش. يدعم ميزات Galaxy AI للترجمة الفورية وتعديل الصور الذكي.",
      overview: "Snapdragon 8 Gen 3 · شاشة 6.8 بوصة QHD+ 120Hz · كاميرا 200MP · قلم S-Pen مدمج · بطارية 5000mAh وشحن سريع 45W",
      specifications: JSON.stringify({
        ram: "12GB",
        storage: "512GB",
        network: "5G",
        condition: "جديد",
        warranty: "ضمان محلي معتمد سنتين",
        box_available: true,
        charger_available: false,
        battery_health: "100%",
        screen_condition: "جديدة مع حماية Gorilla Armor",
        frame_condition: "تيتانيوم رمادي وكالة",
        back_condition: "جديد أصلي",
        repair_history: "جديد بالكامل مختوم"
      }),
      colors: JSON.stringify([
        { color_id: "gray", color_name: "تيتانيوم رمادي", hex_code: "#4B5563", quantity: 6 },
        { color_id: "black", color_name: "تيتانيوم أسود", hex_code: "#111827", quantity: 7 },
        { color_id: "yellow", color_name: "تيتانيوم أصفر", hex_code: "#FDE047", quantity: 3 },
        { color_id: "purple", color_name: "تيتانيوم بنفسجي", hex_code: "#8B5CF6", quantity: 4 }
      ]),
      in_stock: 1,
      is_featured: 1
    },
    {
      id: "iphone-15-pro-like-new",
      name: "آيفون 15 برو كسر زيرو (iPhone 15 Pro 128GB)",
      sub: "كسر زيرو كالجديد تماماً · بطارية 99% مع العلبة وكابل الشحن الأصلي",
      cat: "الموبايلات",
      category_id: "phones",
      subcategory: "آيفون",
      brand_id: "apple",
      brand: "Apple",
      price: 46500,
      old_price: 52000,
      rating: 4.92,
      reviews: 178,
      tag: "sale",
      badge_text: "كسر زيرو 💎",
      image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-bluetitanium?wid=1000&hei=1000&fmt=jpeg&qlt=90",
      images: JSON.stringify([
        "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-bluetitanium?wid=1000&hei=1000&fmt=jpeg&qlt=90",
        "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg"
      ]),
      condition: "كسر زيرو",
      description: "جهاز كسر زيرو استخدام أسابيع قليلة فقط، بحالة المصنع خالي من أي خدوش أو علامات استخدام. صحة البطارية 99%، الشاشة أصلية 100% مع فحص كامل لكافة أجزاء الهاتف والمستشعرات والفيس آي دي. متاح فحص ومعاينة دقيقة قبل الدفع.",
      overview: "معالج A17 Pro · شاشة 6.1 بوصة 120Hz ProMotion · صحة البطارية 99% · لم يتم فتح الجهاز نهائياً · ضمان المتجر 6 أشهر",
      specifications: JSON.stringify({
        ram: "8GB",
        storage: "128GB",
        network: "5G",
        condition: "كسر زيرو",
        warranty: "ضمان المتجر 6 أشهر استبدال",
        battery_health: "99%",
        screen_condition: "أصلية 100% بحالة المصنع بدون أي خدش",
        frame_condition: "تيتانيوم أزرق كالجديد تماماً",
        back_condition: "زجاج مطفي سليم 100%",
        repair_history: "لم يُفتح نهائياً ومفحوص بالكامل عبر برامج التشخيص",
        box_available: true,
        charger_available: true
      }),
      colors: JSON.stringify([
        { color_id: "blue", color_name: "تيتانيوم أزرق", hex_code: "#1E3A8A", quantity: 2 },
        { color_id: "gray", color_name: "تيتانيوم طبيعي", hex_code: "#6B7280", quantity: 3 }
      ]),
      in_stock: 1,
      is_featured: 1
    },
    {
      id: "xiaomi-14-ultra",
      name: "شاومي 14 ألترا (Xiaomi 14 Ultra 512GB)",
      sub: "كاميرات لايكا الأسطورية بمستشعر 1 بوصة · معالج Snapdragon 8 Gen 3",
      cat: "الموبايلات",
      category_id: "phones",
      subcategory: "شاومي",
      brand_id: "xiaomi",
      brand: "Xiaomi",
      price: 49500,
      old_price: 55000,
      rating: 4.88,
      reviews: 119,
      tag: "new",
      badge_text: "كاميرا خارقة",
      image: "https://i02.appmifile.com/255_operator_sg/22/02/2024/a4050a1a59f6b0cfa1c175c59d99d432.png",
      images: JSON.stringify(["https://i02.appmifile.com/255_operator_sg/22/02/2024/a4050a1a59f6b0cfa1c175c59d99d432.png"]),
      condition: "جديد",
      description: "الوحش المخصص لهواة التصوير الاحترافي. 4 كاميرات لايكا مع فتحة عدسة متغيرة بمستشعر LYT-900 مقاس 1 بوصة، شاشة AMOLED مذهلة بدقة WQHD+ وسطوع 3000 شمعة، وشحن فائق السرعة 90W مع شاحن في العلبة.",
      overview: "كاميرات لايكا الاحترافية · شاشة 6.73 بوصة 120Hz LTPO · معالج Snapdragon 8 Gen 3 · شاحن 90W سريع مرفق",
      specifications: JSON.stringify({
        ram: "16GB",
        storage: "512GB",
        network: "5G",
        condition: "جديد",
        warranty: "ضمان محلي 12 شهر",
        box_available: true,
        charger_available: true,
        battery_health: "100%",
        screen_condition: "جديد بحالة المصنع"
      }),
      colors: JSON.stringify([
        { color_id: "black", color_name: "أسود جلد نباتي", hex_code: "#18181B", quantity: 4 },
        { color_id: "white", color_name: "أبيض لؤلؤي", hex_code: "#FAFAFA", quantity: 3 }
      ]),
      in_stock: 1,
      is_featured: 0
    },
    {
      id: "ipad-pro-m4",
      name: "آبل آيباد برو شريحة M4 (iPad Pro 11 M4 256GB)",
      sub: "شاشة Tandem OLED ثنائية الطبقة · أنحف منتج صنعته أبل على الإطلاق",
      cat: "التابلت",
      category_id: "tablets",
      subcategory: "آيباد",
      brand_id: "apple",
      brand: "Apple",
      price: 53500,
      old_price: 58000,
      rating: 4.96,
      reviews: 142,
      tag: "best",
      badge_text: "أحدث جيل M4",
      image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/ipad-pro-model-select-gallery-2-202405_FMT_WHH?wid=1000&hei=1000&fmt=jpeg&qlt=90",
      images: JSON.stringify(["https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/ipad-pro-model-select-gallery-2-202405_FMT_WHH?wid=1000&hei=1000&fmt=jpeg&qlt=90"]),
      condition: "جديد",
      description: "قفزة ثورية في عالم الأجهزة اللوحية. معالج Apple M4 فائق الذكاء، شاشة Ultra Retina XDR بتقنية Tandem OLED لتباين وسطوع لا يضاهى، سمك فائق النحافة 5.3 ملم فقط مع دعم قلم Apple Pencil Pro الجديد كلياً.",
      overview: "معالج Apple M4 الجبار · شاشة 11 بوصة Tandem OLED ProMotion · سماعات رباعية استوديو · واي فاي 6E فائق السرعة",
      specifications: JSON.stringify({
        ram: "8GB",
        storage: "256GB",
        network: "Wi-Fi 6E",
        condition: "جديد",
        warranty: "ضمان أبل الدولي والمحلي 12 شهر",
        box_available: true,
        charger_available: true,
        screen_condition: "Tandem OLED بحالة المصنع"
      }),
      colors: JSON.stringify([
        { color_id: "black", color_name: "أسود فلكي (Space Black)", hex_code: "#1C1917", quantity: 5 },
        { color_id: "silver", color_name: "فضي أنيق", hex_code: "#E5E7EB", quantity: 4 }
      ]),
      in_stock: 1,
      is_featured: 1
    },
    {
      id: "galaxy-tab-s9-ultra",
      name: "سامسونج جالاكسي تاب S9 ألترا (Galaxy Tab S9 Ultra 256GB)",
      sub: "شاشة عملاقة 14.6 بوصة AMOLED 120Hz · مقاوم للماء IP68 مع قلم S-Pen",
      cat: "التابلت",
      category_id: "tablets",
      subcategory: "سامسونج تاب",
      brand_id: "samsung",
      brand: "Samsung",
      price: 47900,
      old_price: 53000,
      rating: 4.9,
      reviews: 98,
      tag: "new",
      badge_text: "شاشة سينمائية 14.6",
      image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-tab-s9-5g.jpg",
      images: JSON.stringify(["https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-tab-s9-5g.jpg"]),
      condition: "جديد",
      description: "التابلت الأندرويد الأضخم والأقوى للمحترفين والمصممين والمهندسين. شاشة Dynamic AMOLED 2X ضخمة بحجم لابتوب، 4 مكبرات صوت من AKG، قلم S-Pen مجاني في العلبة ومقاومة للماء والغبار IP68.",
      overview: "Snapdragon 8 Gen 2 · شاشة 14.6 بوصة Dynamic AMOLED 2X · قلم S-Pen مرفق مجاناً · بطارية ضخمة 11,200mAh",
      specifications: JSON.stringify({
        ram: "12GB",
        storage: "256GB",
        network: "5G & Wi-Fi",
        condition: "جديد",
        warranty: "ضمان محلي سنتين معتمد",
        box_available: true,
        charger_available: false
      }),
      colors: JSON.stringify([
        { color_id: "gray", color_name: "رمادي جرافيت", hex_code: "#374151", quantity: 3 }
      ]),
      in_stock: 1,
      is_featured: 0
    },
    {
      id: "airpods-pro-2-type-c",
      name: "سماعات أبل إيربودز برو 2 (AirPods Pro 2 USB-C)",
      sub: "عزل ضوضاء نشط مضاعف 2x ANC · صوت مكاني مخصص ومنفذ شحن Type-C",
      cat: "السماعات",
      category_id: "headphones",
      subcategory: "سماعات إيربودز",
      brand_id: "apple",
      brand: "Apple",
      price: 11900,
      old_price: 13500,
      rating: 4.97,
      reviews: 520,
      tag: "best",
      badge_text: "الأكثر مبيعاً 🎧",
      image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MTJV3?wid=1000&hei=1000&fmt=jpeg&qlt=90",
      images: JSON.stringify(["https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MTJV3?wid=1000&hei=1000&fmt=jpeg&qlt=90"]),
      condition: "جديد",
      description: "التجربة الصوتية الأروع من أبل مع شريحة H2 المتطورة. عزل ضوضاء نشط فائق القوة، نمط شفافية الصوت المتكيف، صوت مكاني يغمرك في الموسيقى والأفلام، ومقاومة الماء والعرق IP54.",
      overview: "شريحة Apple H2 · إلغاء الضوضاء النشط المتطور · حتى 30 ساعة استماع مع علبة MagSafe USB-C · ميزة Find My الدقيقة",
      specifications: JSON.stringify({
        connection_type: "بلوتوث 5.3",
        battery_life: "حتى 30 ساعة مع العلبة",
        headphone_type: "إيربودز داخل الأذن",
        connector_type: "USB-C & MagSafe Wireless",
        condition: "جديد",
        warranty: "ضمان أبل الدولي والمحلي 12 شهر"
      }),
      colors: JSON.stringify([
        { color_id: "white", color_name: "أبيض لامع أصلي", hex_code: "#FFFFFF", quantity: 15 }
      ]),
      in_stock: 1,
      is_featured: 1
    },
    {
      id: "sony-wh1000xm5",
      name: "سماعات رأس سوني اللاسلكية الاحترافية (Sony WH-1000XM5)",
      sub: "أقوى عزل ضوضاء في العالم بـ 8 ميكروفونات · بطارية تدوم 30 ساعة",
      cat: "السماعات",
      category_id: "headphones",
      subcategory: "سماعات رأس",
      brand_id: "sony",
      brand: "Sony",
      price: 17500,
      old_price: 19800,
      rating: 4.94,
      reviews: 167,
      tag: "best",
      badge_text: "الأعلى عزلاً",
      image: "https://helpguide.sony.net/mdr/wh1000xm5/v1/en/contents/image/Top_image_WH-1000XM5.png",
      images: JSON.stringify(["https://helpguide.sony.net/mdr/wh1000xm5/v1/en/contents/image/Top_image_WH-1000XM5.png"]),
      condition: "جديد",
      description: "سماعة الرأس الرائدة عالمياً في عزل الضوضاء من سوني. مزودة بمعالجين متقدمين و8 ميكروفونات لعزل أي صوت محيطي بالكامل، راحة فائقة على الأذن لساعات طويلة، وصوت نقي بدقة استوديو Hi-Res Audio.",
      overview: "معالجات Sony V1 & QN1 · درايفرات كربونية 30 ملم · بطارية 30 ساعة مع شحن سريع (3 دقائق تعطيك 3 ساعات) · اتصال بجهازين معاً",
      specifications: JSON.stringify({
        connection_type: "بلوتوث 5.2 + كابل AUX 3.5mm",
        battery_life: "30 ساعة مع تشغيل العزل",
        headphone_type: "سماعة فوق الأذن (Over-Ear)",
        condition: "جديد",
        warranty: "ضمان الوكيل 12 شهر"
      }),
      colors: JSON.stringify([
        { color_id: "black", color_name: "أسود مطفي", hex_code: "#18181B", quantity: 5 },
        { color_id: "silver", color_name: "فضي بلاتيني", hex_code: "#D1D5DB", quantity: 4 }
      ]),
      in_stock: 1,
      is_featured: 1
    },
    {
      id: "apple-watch-ultra-2",
      name: "ساعة أبل واتش ألترا 2 تيتانيوم (Apple Watch Ultra 2 49mm)",
      sub: "تيتانيوم فضائي مقاوم للخدش والصدمات · شاشة بسطوع 3000 شمعة وGPS مزدوج",
      cat: "الساعات الذكية",
      category_id: "smart-watches",
      subcategory: "ساعات أبل",
      brand_id: "apple",
      brand: "Apple",
      price: 43500,
      old_price: 48000,
      rating: 4.96,
      reviews: 185,
      tag: "best",
      badge_text: "تيتانيوم 49mm",
      image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/refurb-49-ultra-natural-titanium-ocean-navy?wid=1000&hei=1000&fmt=jpeg&qlt=90",
      images: JSON.stringify(["https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/refurb-49-ultra-natural-titanium-ocean-navy?wid=1000&hei=1000&fmt=jpeg&qlt=90"]),
      condition: "جديد",
      description: "الساعة الأكثر صلابة وقدرة من أبل. صممت لتحمل أقسى التحديات والرياضات الخطرة والغوص حتى عمق 40 متراً، مع معالج S9 فائق السرعة وإيماءة الضغط المزدوج Double Tap وبطارية تدوم حتى 72 ساعة في نمط توفير الطاقة.",
      overview: "تيتانيوم فضائي 49 ملم · شاشة Retina بسطوع 3000 nits · مقاومة ماء 100M · أزرار تحكم مخصصة · بطارية 36-72 ساعة",
      specifications: JSON.stringify({
        connection_type: "بلوتوث 5.3 + Wi-Fi + شريحة اتصال eSIM",
        compatibility: "متوافقة مع أجهزة iPhone",
        battery_life: "36 إلى 72 ساعة",
        condition: "جديد",
        warranty: "ضمان أبل 12 شهر"
      }),
      colors: JSON.stringify([
        { color_id: "silver", color_name: "تيتانيوم طبيعي مع سوار أوشن", hex_code: "#9CA3AF", quantity: 6 },
        { color_id: "orange", color_name: "تيتانيوم مع سوار برتقالي ألبين", hex_code: "#F97316", quantity: 4 }
      ]),
      in_stock: 1,
      is_featured: 1
    },
    {
      id: "anker-prime-65w",
      name: "شاحن أنكر برايم فائق السرعة 65W GaN (Anker Prime 65W)",
      sub: "تقنية GaN III فائقة الصغر · 3 منافذ شحن سريع للهواتف واللابتوبات والتابلت",
      cat: "الشواحن والكابلات",
      category_id: "chargers-cables",
      subcategory: "شواحن سريعة",
      brand_id: "anker",
      brand: "Anker",
      price: 2450,
      old_price: 2900,
      rating: 4.93,
      reviews: 320,
      tag: "best",
      badge_text: "شاحن GaN 65W",
      image: "https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A2663111-Anker_715_Charger_Nano_II_65W.png",
      images: JSON.stringify(["https://cdn.shopify.com/s/files/1/0493/9834/9974/products/A2663111-Anker_715_Charger_Nano_II_65W.png"]),
      condition: "جديد",
      description: "شاحن واحد يكفيك لجميع أجهزتك. يعتمد على أحدث تقنيات نيتريد الجاليوم GaN لتوفير طاقة 65W بحجم أصغر بنسبة 50% من الشواحن التقليدية، مع نظام حماية حرارية متطور ActiveShield 2.0 يحمي بطاريات أجهزتك من الحرارة الزائدة.",
      overview: "قدرة 65W · 2 منفذ USB-C + 1 منفذ USB-A · متوافق مع iPhone, Samsung, Mac, iPad · حماية ذكية متعددة",
      specifications: JSON.stringify({
        charging_power: "65W Max",
        connector_type: "2x USB-C + 1x USB-A",
        compatible_device: "جميع الهواتف والتابلت واللابتوبات",
        condition: "جديد",
        warranty: "ضمان استبدال معتمد 18 شهر"
      }),
      colors: JSON.stringify([
        { color_id: "black", color_name: "أسود تيتانيوم", hex_code: "#18181B", quantity: 20 },
        { color_id: "silver", color_name: "فضي أنيق", hex_code: "#E5E7EB", quantity: 15 }
      ]),
      in_stock: 1,
      is_featured: 0
    },
    {
      id: "joyroom-powerbank-30000",
      name: "باور بانك جويروم 30,000 مللي أمبير بقوة 65W (Joyroom 30000mAh)",
      sub: "سعة عملاقة وشحن فائق 65W · شاشة رقمية LED ومنافذ شحن متعددة",
      cat: "الشواحن والكابلات",
      category_id: "chargers-cables",
      subcategory: "باور بانك",
      brand_id: "joyroom",
      brand: "Joyroom",
      price: 2950,
      old_price: 3600,
      rating: 4.86,
      reviews: 140,
      tag: "sale",
      badge_text: "30,000 mAh",
      image: "https://www.joyroom.com/cdn/shop/files/JR-QP193.jpg?v=1786520720&width=1200",
      images: JSON.stringify(["https://www.joyroom.com/cdn/shop/files/JR-QP193.jpg?v=1786520720&width=1200"]),
      condition: "جديد",
      description: "رفيق السفر والعمل المثالي. يشحن الموبايل حتى 7 مرات، والتابلت حتى 3 مرات، واللابتوب بكفاءة عالية بفضل قدرة الخرج 65W عبر منفذ Type-C. شاشة رقمية دقيقة توضح النسبة المتبقية وقوة الشحن الحالية.",
      overview: "سعة 30,000mAh · خرج 65W عبر Type-C PD · شحن 3 أجهزة بنفس الوقت · شاشة LED رقمية دقيقة",
      specifications: JSON.stringify({
        battery_capacity: "30000mAh (111Wh)",
        charging_power: "65W PD Fast Charge",
        connector_type: "Type-C (In/Out) + 2x USB-A",
        condition: "جديد",
        warranty: "ضمان 12 شهر استبدال"
      }),
      colors: JSON.stringify([
        { color_id: "black", color_name: "أسود كربوني", hex_code: "#111827", quantity: 12 }
      ]),
      in_stock: 1,
      is_featured: 0
    },
    {
      id: "magsafe-clear-case-16pro",
      name: "جراب ماج سيف شفاف فائق الحماية لآيفون 16 برو / برو ماكس",
      sub: "مضاد للاصفرار والصدمات العسكرية · حلقة مغناطيسية N52 قوية جداً",
      cat: "الجرابات ووسائل الحماية",
      category_id: "cases-protection",
      subcategory: "جرابات مغناطيسية",
      brand_id: "apple",
      brand: "Apple",
      price: 650,
      old_price: 850,
      rating: 4.89,
      reviews: 410,
      tag: "best",
      badge_text: "ماج سيف قوي",
      image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MA6A4?wid=1000&hei=1000&fmt=jpeg&qlt=90",
      images: JSON.stringify(["https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MA6A4?wid=1000&hei=1000&fmt=jpeg&qlt=90"]),
      condition: "جديد",
      description: "جراب شفاف عالي النقاء يحافظ على لون هاتفك الأصلي، مصنوع من مادة البولي كربونات الألمانية المعالجة ضد الاصفرار مع وسائد هوائية ممتصة للصدمات في الزوايا وحواف مرتفعة لحماية الكاميرا والشاشة.",
      overview: "حماية عسكرية من السقوط حتى 3 أمتار · مغناطيس MagSafe مدمج فائق القوة · مضاد للبصمات والاصفرار",
      specifications: JSON.stringify({
        compatible_device: "iPhone 16 Pro / 16 Pro Max",
        material: "بولي كربونات ألماني + سيليكون TPU",
        protection_type: "حماية عسكرية للصدمات وسقوط 3M",
        condition: "جديد"
      }),
      colors: JSON.stringify([
        { color_id: "transparent", color_name: "شفاف كريستالي كامل", hex_code: "#F3F4F6", quantity: 30 },
        { color_id: "black", color_name: "شفاف مع إطار أسود مطفي", hex_code: "#18181B", quantity: 20 }
      ]),
      in_stock: 1,
      is_featured: 0
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO products (
      id, name, sub, cat, category_id, subcategory, brand_id, brand,
      price, old_price, rating, reviews, tag, badge_text, image, images,
      overview, description, condition, specifications, colors, variants,
      in_stock, is_featured
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?
    )
  `);

  const colorStmt = db.prepare(`
    INSERT OR REPLACE INTO product_colors (product_id, color_id, color_name, hex_code, quantity)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const item of seedItems) {
    stmt.run(
      item.id, item.name, item.sub, item.cat, item.category_id, item.subcategory,
      item.brand_id, item.brand, item.price, item.old_price, item.rating, item.reviews,
      item.tag, item.badge_text, item.image, item.images, item.overview, item.description,
      item.condition, item.specifications, item.colors, "[]", item.in_stock, item.is_featured
    );

    // Insert colors into relational table
    try {
      const parsedColors = JSON.parse(item.colors);
      for (const col of parsedColors) {
        colorStmt.run(item.id, col.color_id, col.color_name, col.hex_code, col.quantity);
      }
    } catch (e) {}
  }
}

// Helpers & Normalizers
export const BRAND_MAPPING: { id: string; ar: string; en: string }[] = [
  { id: "samsung", ar: "سامسونج", en: "Samsung" },
  { id: "apple", ar: "آبل", en: "Apple" },
  { id: "xiaomi", ar: "شاومي", en: "Xiaomi" },
  { id: "oppo", ar: "أوبو", en: "OPPO" },
  { id: "realme", ar: "ريلمي", en: "Realme" },
  { id: "vivo", ar: "فيفو", en: "Vivo" },
  { id: "honor", ar: "هونر", en: "Honor" },
  { id: "infinix", ar: "إنفينيكس", en: "Infinix" },
  { id: "tecno", ar: "تكنو", en: "Tecno" },
  { id: "huawei", ar: "هواوي", en: "Huawei" },
  { id: "anker", ar: "أنكر", en: "Anker" },
  { id: "joyroom", ar: "جويروم", en: "Joyroom" },
  { id: "baseus", ar: "بيسوس", en: "Baseus" },
  { id: "sony", ar: "سوني", en: "Sony" },
  { id: "other", ar: "أخرى", en: "Other" }
];

export function formatBrandWithEnglish(brandName: string): string {
  if (!brandName) return "";
  const trimmed = brandName.trim();
  if (trimmed.includes("(") && trimmed.includes(")")) return trimmed;
  const lower = trimmed.toLowerCase();
  for (const b of BRAND_MAPPING) {
    if (
      b.id === lower ||
      b.en.toLowerCase() === lower ||
      b.ar === trimmed ||
      b.ar.replace(/[أإآ]/g, "ا") === trimmed.replace(/[أإآ]/g, "ا")
    ) {
      return `${b.ar} (${b.en})`;
    }
  }
  return trimmed;
}

export function resolveBrandId(brandName: string): string | null {
  if (!brandName) return null;
  const lower = brandName.toLowerCase();
  for (const b of BRAND_MAPPING) {
    if (lower.includes(b.id) || lower.includes(b.en.toLowerCase()) || brandName.includes(b.ar)) {
      return b.id;
    }
  }
  return null;
}

export const CATEGORY_ID_MAP: Record<string, string> = {
  "الموبايلات": "phones",
  "التابلت": "tablets",
  "السماعات": "headphones",
  "الجرابات ووسائل الحماية": "cases-protection",
  "الشواحن والكابلات": "chargers-cables",
  "الساعات الذكية": "smart-watches",
  "إكسسوارات أخرى": "accessories"
};

export function resolveCategoryId(categoryName: string): string | null {
  if (!categoryName) return "phones";
  return CATEGORY_ID_MAP[categoryName] || null;
}

export function normalizeCondition(condition: any): "جديد" | "كسر زيرو" | "مستعمل" {
  if (!condition) return "جديد";
  const str = String(condition).trim().toLowerCase();
  if (str.includes("كسر") || str.includes("like")) return "كسر زيرو";
  if (str.includes("مستعمل") || str.includes("used") || str.includes("pre-owned")) return "مستعمل";
  return "جديد";
}

function formatProduct(r: any): Product | null {
  if (!r) return null;
  let images: string[] = [];
  if (Array.isArray(r.images)) {
    images = r.images;
  } else if (typeof r.images === "string") {
    try { images = JSON.parse(r.images); } catch (e) { images = []; }
  }
  if (!Array.isArray(images) || images.length === 0) {
    images = r.image ? [r.image] : [];
  }

  let rawColors: any[] = [];
  if (Array.isArray(r.colors)) {
    rawColors = r.colors;
  } else if (typeof r.colors === "string") {
    try { rawColors = JSON.parse(r.colors); } catch (e) { rawColors = []; }
  }

  // Normalize colors so both front-end and admin panel have unified properties
  const colors = rawColors.map((c: any) => {
    const id = c.color_id || c.id || "black";
    const name = c.color_name || c.name_ar || c.name || "أسود";
    const hex = c.hex_code || c.hex || "#111827";
    const quantity = c.quantity !== undefined ? Number(c.quantity) : 5;
    return {
      id,
      color_id: id,
      name,
      name_ar: name,
      color_name: name,
      hex,
      hex_code: hex,
      quantity
    };
  });

  let variants: any[] = [];
  if (Array.isArray(r.variants)) {
    variants = r.variants;
  } else if (typeof r.variants === "string") {
    try { variants = JSON.parse(r.variants); } catch (e) { variants = []; }
  }

  let specifications: any = {};
  if (typeof r.specifications === "object" && r.specifications !== null) {
    specifications = r.specifications;
  } else if (typeof r.specifications === "string") {
    try { specifications = JSON.parse(r.specifications); } catch (e) { specifications = {}; }
  }

  const brandFormatted = formatBrandWithEnglish(r.brand || "");
  const conditionNormalized = normalizeCondition(r.condition);

  const priceNum = Number(r.price);
  const oldPriceNum = r.old_price ? Number(r.old_price) : (r.original_price ? Number(r.original_price) : null);

  const totalColorQty = colors.reduce((sum, c) => sum + (Number(c.quantity) || 0), 0);
  const qty = totalColorQty > 0 ? totalColorQty : (r.quantity !== undefined ? Number(r.quantity) : 10);

  return {
    ...r,
    cat: r.cat || r.category || "الموبايلات",
    category: r.cat || r.category || "الموبايلات",
    brand: brandFormatted,
    condition: conditionNormalized,
    price: priceNum,
    old_price: oldPriceNum,
    original_price: oldPriceNum,
    quantity: qty,
    rating: r.rating ? Number(r.rating) : 4.9,
    reviews: r.reviews ? Number(r.reviews) : 0,
    in_stock: r.in_stock === 1 || r.in_stock === true,
    is_featured: r.is_featured === 1 || r.is_featured === true,
    image: images[0] || r.image || "/img/mobile-concept-01.png",
    images: images.slice(0, 10),
    colors,
    variants,
    specifications
  };
}

function formatOrder(r: any): Order | null {
  if (!r) return null;
  let items: any[] = [];
  if (Array.isArray(r.items)) {
    items = r.items;
  } else if (typeof r.items === "string") {
    try { items = JSON.parse(r.items); } catch (e) { items = []; }
  }
  return {
    ...r,
    subtotal: Number(r.subtotal),
    shipping: Number(r.shipping),
    total: Number(r.total),
    items
  };
}

// ==============================================================================
// Products API Operations
// ==============================================================================

export async function getAllProducts(): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin()!;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return (data || []).map(formatProduct) as Product[];
      }
      if (error && error.code !== "PGRST205" && !error.message?.includes("schema cache")) {
        console.error("[Supabase Error - getAllProducts]:", error);
        throw error;
      }
    } catch (err: any) {
      if (err.code !== "PGRST205" && !err.message?.includes("schema cache")) {
        console.error("Supabase getAllProducts error:", err);
        throw err;
      }
    }
  }

  // SQLite Fallback
  const db = getSqliteDb();
  const rows = db.prepare("SELECT * FROM products ORDER BY created_at DESC").all();
  return rows.map(formatProduct) as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin()!;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        return formatProduct(data);
      }
      if (error && error.code !== "PGRST205" && !error.message?.includes("schema cache")) {
        console.error("[Supabase Error - getProductById]:", error);
        throw error;
      }
    } catch (err: any) {
      if (err.code !== "PGRST205" && !err.message?.includes("schema cache")) {
        console.error("Supabase getProductById error:", err);
        throw err;
      }
    }
  }

  // SQLite Fallback
  const db = getSqliteDb();
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
  return formatProduct(row);
}

export async function createProduct(prod: any): Promise<Product | null> {
  const id = prod.id || "mob-" + Date.now();

  const name = (prod.name || "").trim();
  if (!name) {
    throw new Error("اسم المنتج بالكامل مطلوب");
  }

  const price = Number(prod.price);
  if (isNaN(price) || price <= 0) {
    throw new Error("السعر يجب أن يكون أكبر من صفر.");
  }

  const rawOldPrice = prod.old_price !== undefined ? prod.old_price : prod.original_price;
  let oldPrice: number | null = null;
  if (rawOldPrice !== undefined && rawOldPrice !== null && rawOldPrice !== "") {
    oldPrice = Number(rawOldPrice);
    if (isNaN(oldPrice) || oldPrice < 0) {
      throw new Error("السعر قبل الخصم لا يمكن أن يكون رقمًا سالبًا.");
    }
    if (oldPrice <= price) {
      throw new Error("السعر قبل الخصم يجب أن يكون أكبر من سعر البيع الحالي.");
    }
  }

  const catName = prod.cat || prod.category || "الموبايلات";
  const catId = resolveCategoryId(catName);
  const brandName = formatBrandWithEnglish(prod.brand || "سامسونج (Samsung)");
  const brandId = resolveBrandId(prod.brand || prod.brand_id || "");
  const condition = normalizeCondition(prod.condition);

  let imagesList = Array.isArray(prod.images)
    ? prod.images.filter(Boolean).slice(0, 10)
    : (prod.image ? [prod.image] : []);

  if (imagesList.length === 0 && prod.image) imagesList = [prod.image];
  if (imagesList.length === 0) imagesList = ["/img/mobile-concept-01.png"];

  const mainImage = imagesList[0];
  const desc = prod.description || prod.overview || "";

  let colorsList: any[] = [];
  if (Array.isArray(prod.colors)) {
    colorsList = prod.colors;
  } else if (typeof prod.colors === "string") {
    try { colorsList = JSON.parse(prod.colors); } catch (e) { colorsList = []; }
  }

  let variantsList: any[] = [];
  if (Array.isArray(prod.variants)) {
    variantsList = prod.variants;
  } else if (typeof prod.variants === "string") {
    try { variantsList = JSON.parse(prod.variants); } catch (e) { variantsList = []; }
  }

  let specsObj = prod.specifications || {};
  if (typeof specsObj === "string") {
    try { specsObj = JSON.parse(specsObj); } catch (e) { specsObj = {}; }
  }

  // Random rating and reviews algorithm for newly created products:
  // Reviews count: 20 to 150
  // Rating score: 4.0 to 5.0 (rounded to 1 decimal place)
  const randomReviews = Math.floor(Math.random() * (150 - 20 + 1)) + 20;
  const randomRating = Math.round((4.0 + Math.random() * 0.95) * 10) / 10;

  const generatedRating = prod.rating && Number(prod.rating) > 0 ? Number(prod.rating) : randomRating;
  const generatedReviews = prod.reviews && Number(prod.reviews) > 0 ? Number(prod.reviews) : randomReviews;

  const badgeText = prod.badge_text !== undefined ? (prod.badge_text ? String(prod.badge_text).trim() : null) : null;

  const newProduct = {
    id,
    name,
    sub: prod.sub || prod.overview || "",
    cat: catName,
    category_id: catId,
    subcategory: prod.subcategory || "",
    brand_id: brandId,
    brand: brandName,
    price,
    old_price: oldPrice,
    rating: generatedRating,
    reviews: generatedReviews,
    tag: prod.tag || "new",
    badge_text: badgeText,
    image: mainImage,
    images: imagesList,
    description: desc,
    overview: prod.overview || desc,
    condition,
    specifications: specsObj,
    colors: colorsList,
    variants: variantsList,
    in_stock: prod.in_stock !== undefined ? (prod.in_stock ? 1 : 0) : 1,
    is_featured: prod.is_featured ? 1 : 0
  };

  const saveToSqlite = () => {
    const db = getSqliteDb();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO products (
        id, name, sub, cat, category_id, subcategory, brand_id, brand,
        price, old_price, rating, reviews, tag, badge_text, image, images,
        overview, description, condition, specifications, colors, variants,
        in_stock, is_featured
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?
      )
    `);

    stmt.run(
      id, name, newProduct.sub, catName, catId || "",
      newProduct.subcategory, brandId || "", brandName,
      price, oldPrice,
      newProduct.rating, newProduct.reviews, newProduct.tag,
      newProduct.badge_text,
      mainImage, JSON.stringify(imagesList),
      newProduct.overview, desc, condition,
      JSON.stringify(specsObj), JSON.stringify(colorsList), JSON.stringify(variantsList),
      newProduct.in_stock, newProduct.is_featured
    );

    const colorStmt = db.prepare(`
      INSERT OR REPLACE INTO product_colors (product_id, color_id, color_name, hex_code, quantity)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const c of colorsList) {
      if (c.color_id || c.id) {
        colorStmt.run(id, c.color_id || c.id, c.color_name || c.name_ar || c.name || "", c.hex_code || c.hex || "#111827", c.quantity || 0);
      }
    }
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin()!;
      const { data, error } = await supabase
        .from("products")
        .insert([newProduct])
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
          console.warn("[Supabase] Table 'products' not found in schema cache. Saving to local SQLite.");
          saveToSqlite();
          return getProductById(id);
        }
        console.error("[Supabase Error - createProduct]:", error);
        throw error;
      }

      if (colorsList.length > 0) {
        try {
          const rows = colorsList.map((c: any) => ({
            product_id: id,
            color_id: c.color_id || c.id || "black",
            color_name: c.color_name || c.name_ar || c.name || "أسود",
            hex_code: c.hex_code || c.hex || "#111827",
            quantity: Number(c.quantity || 0)
          }));
          await supabase.from("product_colors").insert(rows);
        } catch (cErr) {
          console.warn("[Supabase] Could not sync product_colors:", cErr);
        }
      }

      try { saveToSqlite(); } catch (e) {}
      return formatProduct(data);
    } catch (err: any) {
      if (err.code === "PGRST205" || err.message?.includes("schema cache")) {
        saveToSqlite();
        return getProductById(id);
      }
      throw err;
    }
  }

  saveToSqlite();
  return getProductById(id);
}

export async function updateProduct(id: string, prod: any): Promise<Product | null> {
  const existing = await getProductById(id);
  if (!existing) return null;

  const name = prod.name !== undefined ? String(prod.name).trim() : existing.name;
  if (!name) {
    throw new Error("اسم المنتج بالكامل مطلوب");
  }

  let price = existing.price;
  if (prod.price !== undefined) {
    price = Number(prod.price);
    if (isNaN(price) || price <= 0) {
      throw new Error("السعر يجب أن يكون أكبر من صفر.");
    }
  }

  let oldPrice = existing.old_price ?? existing.original_price ?? null;
  const rawOldPrice = prod.old_price !== undefined ? prod.old_price : prod.original_price;
  if (rawOldPrice !== undefined) {
    if (rawOldPrice !== null && rawOldPrice !== "") {
      oldPrice = Number(rawOldPrice);
      if (isNaN(oldPrice) || oldPrice < 0) {
        throw new Error("السعر قبل الخصم لا يمكن أن يكون رقمًا سالبًا.");
      }
      if (oldPrice <= price) {
        throw new Error("السعر قبل الخصم يجب أن يكون أكبر من سعر البيع الحالي.");
      }
    } else {
      oldPrice = null;
    }
  }

  const catName = prod.cat !== undefined ? prod.cat : (prod.category !== undefined ? prod.category : existing.cat);
  const catId = resolveCategoryId(catName);
  const brandName = prod.brand !== undefined ? formatBrandWithEnglish(prod.brand) : existing.brand;
  const brandId = resolveBrandId(brandName);
  const condition = prod.condition !== undefined ? normalizeCondition(prod.condition) : existing.condition;

  let imagesList = prod.images !== undefined
    ? (Array.isArray(prod.images) ? prod.images.filter(Boolean).slice(0, 10) : [prod.image].filter(Boolean))
    : (existing.images || [existing.image]);

  if (imagesList.length === 0) {
    imagesList = [prod.image || existing.image || "/img/mobile-concept-01.png"];
  }

  const mainImage = imagesList[0] || prod.image || existing.image;
  const desc = prod.description !== undefined ? prod.description : (existing.description || "");

  let colorsList = existing.colors || [];
  if (prod.colors !== undefined) {
    if (Array.isArray(prod.colors)) {
      colorsList = prod.colors;
    } else if (typeof prod.colors === "string") {
      try { colorsList = JSON.parse(prod.colors); } catch (e) { colorsList = []; }
    }
  }

  let variantsList = existing.variants || [];
  if (prod.variants !== undefined) {
    if (Array.isArray(prod.variants)) {
      variantsList = prod.variants;
    } else if (typeof prod.variants === "string") {
      try { variantsList = JSON.parse(prod.variants); } catch (e) { variantsList = []; }
    }
  }

  let specsObj = prod.specifications !== undefined ? prod.specifications : (existing.specifications || {});
  if (typeof specsObj === "string") {
    try { specsObj = JSON.parse(specsObj); } catch (e) { specsObj = {}; }
  }

  const updateData = {
    name,
    sub: prod.sub !== undefined ? prod.sub : existing.sub,
    cat: catName,
    category_id: catId,
    subcategory: prod.subcategory !== undefined ? prod.subcategory : existing.subcategory,
    brand_id: brandId,
    brand: brandName,
    price,
    old_price: oldPrice,
    tag: prod.tag !== undefined ? prod.tag : existing.tag,
    badge_text: prod.badge_text !== undefined ? (prod.badge_text ? String(prod.badge_text).trim() : null) : (existing.badge_text || null),
    image: mainImage,
    images: imagesList,
    description: desc,
    overview: prod.overview !== undefined ? prod.overview : (existing.overview || desc),
    condition,
    specifications: specsObj,
    colors: colorsList,
    variants: variantsList,
    in_stock: prod.in_stock !== undefined ? (prod.in_stock ? 1 : 0) : (existing.in_stock ? 1 : 0),
    is_featured: prod.is_featured !== undefined ? (prod.is_featured ? 1 : 0) : (existing.is_featured ? 1 : 0)
  };

  const updateSqlite = () => {
    const db = getSqliteDb();
    const stmt = db.prepare(`
      UPDATE products SET
        name = ?, sub = ?, cat = ?, category_id = ?, subcategory = ?, brand_id = ?, brand = ?,
        price = ?, old_price = ?, tag = ?, badge_text = ?, image = ?, images = ?,
        overview = ?, description = ?, condition = ?, specifications = ?, colors = ?, variants = ?,
        in_stock = ?, is_featured = ?
      WHERE id = ?
    `);

    stmt.run(
      name, updateData.sub, catName, catId || "", updateData.subcategory, brandId || "", brandName,
      price, oldPrice, updateData.tag, updateData.badge_text,
      mainImage, JSON.stringify(imagesList),
      updateData.overview, desc, condition,
      JSON.stringify(specsObj), JSON.stringify(colorsList), JSON.stringify(variantsList),
      updateData.in_stock, updateData.is_featured,
      id
    );

    db.prepare("DELETE FROM product_colors WHERE product_id = ?").run(id);
    const colorStmt = db.prepare(`
      INSERT OR REPLACE INTO product_colors (product_id, color_id, color_name, hex_code, quantity)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const c of colorsList) {
      if (c.color_id || c.id) {
        colorStmt.run(id, c.color_id || c.id, c.color_name || c.name_ar || c.name || "", c.hex_code || c.hex || "#111827", c.quantity || 0);
      }
    }
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin()!;
      const { data, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
          console.warn("[Supabase] Table 'products' not found in schema cache. Updating locally in SQLite.");
          updateSqlite();
          return getProductById(id);
        }
        console.error("[Supabase Error - updateProduct]:", error);
        throw error;
      }

      if (colorsList.length > 0) {
        try {
          await supabase.from("product_colors").delete().eq("product_id", id);
          const rows = colorsList.map((c: any) => ({
            product_id: id,
            color_id: c.color_id || c.id || "black",
            color_name: c.color_name || c.name_ar || c.name || "أسود",
            hex_code: c.hex_code || c.hex || "#111827",
            quantity: Number(c.quantity || 0)
          }));
          await supabase.from("product_colors").insert(rows);
        } catch (cErr) {
          console.warn("[Supabase] Could not sync product_colors:", cErr);
        }
      }

      try { updateSqlite(); } catch (e) {}
      return formatProduct(data);
    } catch (err: any) {
      if (err.code === "PGRST205" || err.message?.includes("schema cache")) {
        updateSqlite();
        return getProductById(id);
      }
      throw err;
    }
  }

  updateSqlite();
  return getProductById(id);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const existing = await getProductById(id);
  if (!existing) return false;

  try {
    const images = Array.isArray(existing.images) ? existing.images : (existing.image ? [existing.image] : []);
    for (const imgUrl of images) {
      if (typeof imgUrl === "string" && (imgUrl.startsWith("/uploads/") || imgUrl.includes("/uploads/"))) {
        const filename = path.basename(imgUrl.split("?")[0]);
        const filePath = path.join(process.cwd(), "public", "uploads", filename);
        try { await fs.unlink(filePath); } catch (e) {}
      }
    }
  } catch (err) {
    console.error("Error cleaning up product images on delete:", err);
  }

  let deletedFromSupabase = false;
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin()!;
      try {
        await supabase.from("product_colors").delete().eq("product_id", id);
        await supabase.from("product_variants").delete().eq("product_id", id);
        await supabase.from("order_items").update({ product_id: null }).eq("product_id", id);
      } catch (e) {}

      const { error, count } = await supabase
        .from("products")
        .delete({ count: "exact" })
        .eq("id", id);

      if (error) {
        if (error.code !== "PGRST205" && !error.message?.includes("schema cache")) {
          console.error("[Supabase Error - deleteProduct]:", error);
          throw error;
        }
      } else {
        deletedFromSupabase = (count ?? 0) > 0;
      }
    } catch (err: any) {
      if (err.code !== "PGRST205" && !err.message?.includes("schema cache")) {
        throw err;
      }
    }
  }

  const db = getSqliteDb();
  try {
    db.prepare("DELETE FROM product_colors WHERE product_id = ?").run(id);
    db.prepare("UPDATE order_items SET product_id = NULL WHERE product_id = ?").run(id);
  } catch (e) {}

  const stmt = db.prepare("DELETE FROM products WHERE id = ?");
  const result = stmt.run(id);
  const deletedFromSqlite = result.changes > 0;

  return deletedFromSupabase || deletedFromSqlite;
}

// ==============================================================================
// Categories & Brands API Operations
// ==============================================================================

export async function getAllCategories(): Promise<Category[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error && data) return data as Category[];
  }

  const db = getSqliteDb();
  return db.prepare("SELECT * FROM categories ORDER BY sort_order ASC").all() as Category[];
}

export async function createCategory(cat: { id: string; name: string; parent_id?: string | null; sort_order?: number }): Promise<Category> {
  const sort = cat.sort_order || 0;
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase.from("categories").insert([{
      id: cat.id,
      name: cat.name,
      parent_id: cat.parent_id || null,
      sort_order: sort,
      is_active: true
    }]).select().single();
    if (error) throw error;
    return data as Category;
  }

  const db = getSqliteDb();
  db.prepare("INSERT INTO categories (id, name, parent_id, sort_order, is_active) VALUES (?, ?, ?, ?, 1)").run(
    cat.id, cat.name, cat.parent_id || null, sort
  );
  return db.prepare("SELECT * FROM categories WHERE id = ?").get(cat.id) as Category;
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    return !error;
  }
  const db = getSqliteDb();
  const res = db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  return res.changes > 0;
}

export async function getAllBrands(): Promise<Brand[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase.from("brands").select("*").order("name");
    if (!error && data) return data as Brand[];
  }

  const db = getSqliteDb();
  return db.prepare("SELECT * FROM brands ORDER BY name ASC").all() as Brand[];
}

export async function createBrand(brand: { id: string; name: string; category_id?: string | null }): Promise<Brand> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase.from("brands").insert([brand]).select().single();
    if (error) throw error;
    return data as Brand;
  }

  const db = getSqliteDb();
  db.prepare("INSERT INTO brands (id, name, category_id) VALUES (?, ?, ?)").run(
    brand.id, brand.name, brand.category_id || null
  );
  return db.prepare("SELECT * FROM brands WHERE id = ?").get(brand.id) as Brand;
}

export async function deleteBrand(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { error } = await supabase.from("brands").delete().eq("id", id);
    return !error;
  }
  const db = getSqliteDb();
  const res = db.prepare("DELETE FROM brands WHERE id = ?").run(id);
  return res.changes > 0;
}

// ==============================================================================
// Colors & Inventory Operations
// ==============================================================================

export async function getAllColors(): Promise<PredefinedColor[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase.from("colors").select("*").order("name");
    if (!error && data && data.length > 0) return data as PredefinedColor[];
  }

  const db = getSqliteDb();
  const rows = db.prepare("SELECT * FROM colors ORDER BY name ASC").all() as PredefinedColor[];
  return rows.length > 0 ? rows : PREDEFINED_COLORS;
}

export async function updateColorQuantity(productId: string, colorId: string, quantity: number): Promise<boolean> {
  const prod = await getProductById(productId);
  if (!prod) return false;

  const updatedColors = (prod.colors || []).map(c => {
    if (c.color_id === colorId) {
      return { ...c, quantity };
    }
    return c;
  });

  await updateProduct(productId, { colors: updatedColors });
  return true;
}

// ==============================================================================
// Orders Operations
// ==============================================================================

export async function createOrder(data: any): Promise<Order | null> {
  const year = new Date().getFullYear();
  const randNum = Math.floor(10000 + Math.random() * 90000);
  const orderRef = `MOB-${year}-${randNum}`;

  let itemsList = [];
  if (Array.isArray(data.items)) {
    itemsList = data.items;
  } else if (typeof data.items === "string") {
    try { itemsList = JSON.parse(data.items); } catch (e) { itemsList = []; }
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const orderRecord = {
      order_ref: orderRef,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      governorate: data.governorate,
      address: data.address,
      payment_method: data.payment_method || "cod",
      items: itemsList,
      subtotal: Number(data.subtotal),
      shipping: Number(data.shipping),
      total: Number(data.total),
      status: "قيد المراجعة"
    };

    const { data: created, error } = await supabase
      .from("orders")
      .insert([orderRecord])
      .select()
      .single();

    if (error) {
      console.error("[Supabase Error - createOrder]:", error);
      throw error;
    }
    return formatOrder(created);
  }

  // SQLite Fallback
  const db = getSqliteDb();
  const stmt = db.prepare(`
    INSERT INTO orders (
      order_ref, customer_name, customer_phone, governorate, address,
      payment_method, items, subtotal, shipping, total, status
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  stmt.run(
    orderRef,
    data.customer_name,
    data.customer_phone,
    data.governorate,
    data.address,
    data.payment_method || "cod",
    JSON.stringify(itemsList),
    Number(data.subtotal),
    Number(data.shipping),
    Number(data.total),
    "قيد المراجعة"
  );

  return getOrderByRef(orderRef);
}

export async function getAllOrders(): Promise<Order[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Supabase Error - getAllOrders]:", error);
      throw error;
    }
    return (data || []).map(formatOrder) as Order[];
  }

  // SQLite Fallback
  const db = getSqliteDb();
  const rows = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
  return rows.map(formatOrder) as Order[];
}

export async function getOrderByRef(orderRef: string): Promise<Order | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_ref", orderRef)
      .maybeSingle();

    if (error) {
      console.error("[Supabase Error - getOrderByRef]:", error);
      throw error;
    }
    return formatOrder(data);
  }

  // SQLite Fallback
  const db = getSqliteDb();
  const row = db.prepare("SELECT * FROM orders WHERE order_ref = ?").get(orderRef);
  return formatOrder(row);
}

export async function updateOrderStatus(orderRef: string, status: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("order_ref", orderRef);

    if (error) {
      console.error("[Supabase Error - updateOrderStatus]:", error);
      throw error;
    }
    return true;
  }

  // SQLite Fallback
  const db = getSqliteDb();
  const stmt = db.prepare("UPDATE orders SET status = ? WHERE order_ref = ?");
  const res = stmt.run(status, orderRef);
  return res.changes > 0;
}

// ==============================================================================
// Admin Auth
// ==============================================================================

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  if (
    process.env.ADMIN_PASSWORD &&
    password === process.env.ADMIN_PASSWORD &&
    username === (process.env.ADMIN_USERNAME || "admin")
  ) {
    return true;
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    if (error || !data) return false;
    if (data.password_hash === password) return true;
    try {
      return bcrypt.compareSync(password, data.password_hash);
    } catch (e) {
      return false;
    }
  }

  // SQLite Fallback
  const db = getSqliteDb();
  const row = db.prepare("SELECT * FROM admins WHERE username = ?").get(username) as any;
  if (!row) return false;
  if (row.password_hash === password) return true;
  try {
    return bcrypt.compareSync(password, row.password_hash);
  } catch (e) {
    return false;
  }
}
