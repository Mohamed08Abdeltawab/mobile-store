import { NextResponse } from "next/server";
import { getAllProducts, getAllCategories, getAllBrands, getAllColors } from "../../../lib/db";

export async function GET() {
  try {
    const [products, categories, brands, colors] = await Promise.all([
      getAllProducts(),
      getAllCategories(),
      getAllBrands(),
      getAllColors(),
    ]);

    return NextResponse.json(
      {
        success: true,
        products,
        categories,
        brands,
        colors,
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
