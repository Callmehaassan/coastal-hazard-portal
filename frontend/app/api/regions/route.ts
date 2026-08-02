import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

export async function GET() {
  const backendRes = await fetch(`${BACKEND_URL}/api/regions`, {
    // Public endpoint, no cookie forwarding needed - but cache: "no-store"
    // keeps this from being statically cached across requests.
    cache: "no-store",
  });
  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}
