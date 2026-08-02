import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  const body = await request.json();

  const backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();
  const response = NextResponse.json(data, { status: backendRes.status });

  // Relay the backend's httpOnly access_token cookie to the browser, but
  // scoped to THIS origin (localhost:3000) instead of the backend's
  // (127.0.0.1:8000) - that's the whole point of proxying through here.
  // NOTE: this only handles a single Set-Cookie header correctly. If a
  // later phase adds a second cookie (e.g. a refresh token), switch to
  // backendRes.headers.getSetCookie() (Node 18.14+) and set each one
  // individually - a naive single .get("set-cookie") call merges multiple
  // cookies into one invalid string.
  const setCookie = backendRes.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}
