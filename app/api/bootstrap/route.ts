import { NextResponse } from "next/server";
import { getAllProducts, getAllCategories, getAllBrands, getAllColors, getStoreSettings } from "../../../lib/db";

export async function GET() {
  try {
    const [products, categories, brands, colors, settings] = await Promise.all([
      getAllProducts(),
      getAllCategories(),
      getAllBrands(),
      getAllColors(),
      getStoreSettings(),
    ]);

    return NextResponse.json(
      {
        success: true,
        products,
        categories,
        brands,
        colors,
        settings,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/bootstrap error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load bootstrap data" },
      { status: 500 }
    );
  }
}
