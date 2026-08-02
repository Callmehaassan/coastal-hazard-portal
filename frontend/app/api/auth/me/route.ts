import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

export async function GET(request: Request) {
  // The browser's request carries the httpOnly access_token cookie (since
  // this is a same-origin call to our own Next.js route) - forward it to
  // the backend so /api/auth/me knows who's asking.
  const cookie = request.headers.get("cookie") ?? "";

  const backendRes = await fetch(`${BACKEND_URL}/api/auth/me`, {
    headers: { cookie },
    cache: "no-store",
  });

  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}