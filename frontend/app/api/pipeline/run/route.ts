import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const body = await request.json().catch(() => ({}));

  const backendRes = await fetch(`${BACKEND_URL}/api/pipeline/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}