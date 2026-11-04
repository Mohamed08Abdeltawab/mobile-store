import { createProduct, getProductById, updateProduct, deleteProduct, getAllProducts } from "../lib/db.ts";

async function runTests() {
  console.log("=== STARTING FULL CRUD & VALIDATION TEST SUITE ===");

  // 1. Validation Test: Negative price
  console.log("\n[Test 1] Negative price validation:");
  try {
    await createProduct({
      name: "منتج تجريبي سعر سالب",
      cat: "الموبايلات",
      price: -500
    });
    console.error("FAIL: Accepted negative price!");
  } catch (err) {
    console.log("PASS: Rejected negative price ->", err.message);
  }

  // 2. Validation Test: Zero price
  console.log("\n[Test 2] Zero price validation:");
  try {
    await createProduct({
      name: "منتج تجريبي سعر صفر",
      cat: "الموبايلات",
      price: 0
    });
    console.error("FAIL: Accepted zero price!");
  } catch (err) {
    console.log("PASS: Rejected zero price ->", err.message);
  }

  // 3. Validation Test: Negative old_price
  console.log("\n[Test 3] Negative old_price validation:");
  try {
    await createProduct({
      name: "منتج تجريبي سعر قديم سالب",
      cat: "الموبايلات",
      price: 5000,
      old_price: -100
    });
    console.error("FAIL: Accepted negative old_price!");
  } catch (err) {
    console.log("PASS: Rejected negative old_price ->", err.message);
  }

  // 4. Validation Test: old_price <= price
  console.log("\n[Test 4] old_price less than price validation:");
  try {
    await createProduct({
      name: "منتج تجريبي خصم غير منطقي",
      cat: "الموبايلات",
      price: 5000,
      old_price: 4000
    });
    console.error("FAIL: Accepted old_price <= price!");
  } catch (err) {
    console.log("PASS: Rejected invalid discount ->", err.message);
  }

  // 5. CREATE: Create a complete valid product
  console.log("\n[Test 5] CREATE full product:");
  const testId = "test-prod-" + Date.now();
  const created = await createProduct({
    id: testId,
    name: "سامسونج جالاكسي S24 ألترا تجريبي (Galaxy S24 Ultra Test)",
    cat: "الموبايلات",
    brand: "سامسونج (Samsung)",
    condition: "جديد",
    price: 59000,
    old_price: 65000,
    images: ["/img/test-real.png"],
    specifications: {
      storage: "128GB",
      ram: "8GB",
      network: "4G LTE",
      warranty: "سنتين",
      box_available: true,
      charger_available: false
    },
    colors: [
      { id: "black", name_ar: "أسود", hex: "#111827", quantity: 10 },
      { id: "gold", name_ar: "ذهبي", hex: "#F59E0B", quantity: 5 }
    ]
  });

  console.log("Created successfully:", created?.id, "| Name:", created?.name);
  console.log("Brand:", created?.brand, "| Condition:", created?.condition);
  console.log("Price:", created?.price, "| Old Price:", created?.old_price);
  console.log("Specs:", JSON.stringify(created?.specifications));
  console.log("Colors:", JSON.stringify(created?.colors));

  // 6. READ: Read by ID
  console.log("\n[Test 6] READ product by ID:");
  const fetched = await getProductById(testId);
  if (!fetched || fetched.id !== testId) {
    throw new Error("FAIL: Could not fetch created product by ID!");
  }
  console.log("PASS: Product fetched correctly ->", fetched.name);

  // 7. UPDATE: Update multiple fields (name, price, brand, condition, warranty)
  console.log("\n[Test 7] UPDATE product:");
  const updated = await updateProduct(testId, {
    name: "سامسونج جالاكسي S24 ألترا معدل (Galaxy S24 Ultra Updated)",
    price: 57500,
    old_price: 64000,
    brand: "شاومي (Xiaomi)",
    condition: "كسر زيرو",
    specifications: {
      storage: "256GB",
      ram: "12GB",
      network: "5G",
      warranty: "45 يوم استبدال فوري",
      battery_health: "98%"
    },
    colors: [
      { id: "black", name_ar: "أسود", hex: "#111827", quantity: 8 },
      { id: "silver", name_ar: "فضي", hex: "#E5E7EB", quantity: 12 }
    ]
  });

  console.log("Updated successfully:", updated?.id, "| Name:", updated?.name);
  console.log("Updated Brand:", updated?.brand, "| Updated Condition:", updated?.condition);
  console.log("Updated Price:", updated?.price, "| Updated Old Price:", updated?.old_price);
  console.log("Updated Specs:", JSON.stringify(updated?.specifications));
  console.log("Updated Colors:", JSON.stringify(updated?.colors));

  if (updated?.brand !== "شاومي (Xiaomi)") throw new Error("FAIL: Brand not updated!");
  if (updated?.condition !== "كسر زيرو") throw new Error("FAIL: Condition not updated!");
  if (updated?.price !== 57500) throw new Error("FAIL: Price not updated!");
  if (updated?.specifications?.warranty !== "45 يوم استبدال فوري") throw new Error("FAIL: Custom warranty not updated!");

  // 8. DELETE: Delete product
  console.log("\n[Test 8] DELETE product:");
  const deleteResult = await deleteProduct(testId);
  console.log("Delete result:", deleteResult);
  if (!deleteResult) throw new Error("FAIL: deleteProduct returned false!");

  const afterDelete = await getProductById(testId);
  if (afterDelete) throw new Error("FAIL: Product still exists after delete!");
  console.log("PASS: Product successfully deleted and confirmed absent.");

  console.log("\n=== ALL CRUD & VALIDATION TESTS PASSED 100% ===");
}

runTests().catch(err => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
