import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/authMiddleware";

export async function GET(request) {
  const authResult = await verifyAuth(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  return NextResponse.json({ status: "ok" });
}

export async function POST(request) {
  const authResult = await verifyAuth(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  return NextResponse.json({ status: "ok" });
}
