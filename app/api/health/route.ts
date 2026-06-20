import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("dim_zone").select("zone_id").limit(1);

    if (error) {
      return NextResponse.json(
        { status: "degraded", database: "error", message: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "ok",
      service: "brebiquettes-bloc3",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Health check failed";
    return NextResponse.json(
      { status: "error", database: "unavailable", message },
      { status: 503 }
    );
  }
}
