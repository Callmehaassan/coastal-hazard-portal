import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";

  const backendRes = await fetch(`${BACKEND_URL}/api/auth/logout`, {
    method: "POST",
    headers: { cookie },
  });

  const data = await backendRes.json();
  const response = NextResponse.json(data, { status: backendRes.status });

  // Relay the backend's cookie-clearing Set-Cookie header so the browser
  // actually drops access_token on this origin too.
  const setCookie = backendRes.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}