import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

export async function GET() {
  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/tsunami-zones`, {
      cache: "no-store",
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { detail: errorData.detail ?? `Failed to fetch tsunami zones: ${backendRes.statusText}` },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { detail: err instanceof Error ? err.message : "Internal server error connecting to backend" },
      { status: 500 }
    );
  }
}
