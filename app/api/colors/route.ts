import { NextResponse } from "next/server";
import { getAllColors } from "../../../lib/db";

export async function GET() {
  try {
    const colors = await getAllColors();
    return NextResponse.json(
      { success: true, colors },
      {
        headers: {
          "Cache-Control": "public, max-age=120, stale-while-revalidate=600",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
