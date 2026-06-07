import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "brebiquettes-bloc3",
    timestamp: new Date().toISOString(),
  });
}
