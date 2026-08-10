import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    // #region debug-point B:proxy-request
    fetch("http://127.0.0.1:7777/event", { method: "POST", body: JSON.stringify({ sessionId: "export-download-failure", runId: "pre-fix", hypothesisId: "B", location: "frontend/app/api/reports/export/route.ts:POST:start", msg: "[DEBUG] proxy received export request", data: body, ts: Date.now() }) }).catch(() => {});
    // #endregion

    const backendRes = await fetch(`${BACKEND_URL}/api/reports/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      // #region debug-point B:proxy-error
      fetch("http://127.0.0.1:7777/event", { method: "POST", body: JSON.stringify({ sessionId: "export-download-failure", runId: "pre-fix", hypothesisId: "B", location: "frontend/app/api/reports/export/route.ts:POST:error", msg: "[DEBUG] proxy got backend error", data: { status: backendRes.status, errorData }, ts: Date.now() }) }).catch(() => {});
      // #endregion
      return NextResponse.json(
        { detail: errorData.detail ?? "Failed to generate report" },
        { status: backendRes.status }
      );
    }

    const contentDisposition = backendRes.headers.get("content-disposition") || "";
    const contentType = backendRes.headers.get("content-type") || "application/octet-stream";

    const arrayBuffer = await backendRes.arrayBuffer();
    // #region debug-point B:proxy-success
    fetch("http://127.0.0.1:7777/event", { method: "POST", body: JSON.stringify({ sessionId: "export-download-failure", runId: "pre-fix", hypothesisId: "B", location: "frontend/app/api/reports/export/route.ts:POST:success", msg: "[DEBUG] proxy returning export response", data: { status: backendRes.status, contentType, contentDisposition, byteLength: arrayBuffer.byteLength }, ts: Date.now() }) }).catch(() => {});
    // #endregion

    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
      },
    });
  } catch (err) {
    // #region debug-point B:proxy-catch
    fetch("http://127.0.0.1:7777/event", { method: "POST", body: JSON.stringify({ sessionId: "export-download-failure", runId: "pre-fix", hypothesisId: "B", location: "frontend/app/api/reports/export/route.ts:POST:catch", msg: "[DEBUG] proxy threw exception", data: { error: err instanceof Error ? err.message : String(err) }, ts: Date.now() }) }).catch(() => {});
    // #endregion
    return NextResponse.json(
      { detail: err instanceof Error ? err.message : "Internal server error connecting to backend" },
      { status: 500 }
    );
  }
}
