# Coastal Hazard Portal - Frontend Skeleton
# Run this from D:\coastal-hazard-portal\  (the project root, NOT inside backend\)
# Fixed: uses .NET WriteAllText for true no-BOM UTF-8, which works on
# Windows PowerShell 5.1 (utf8NoBOM as a Set-Content -Encoding value doesn't).

New-Item -ItemType Directory -Force -Path "frontend\app\api\regions","frontend\app\api\auth\login","frontend\app\login","frontend\components","frontend\lib" | Out-Null

$Utf8NoBom = New-Object System.Text.UTF8Encoding $false

$content = @'
{
  "name": "coastal-hazard-portal-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/leaflet": "^1.9.12",
    "@types/geojson": "^7946.0.14",
    "tailwindcss": "^3.4.10",
    "postcss": "^8.4.41",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.15"
  }
}

'@
[System.IO.File]::WriteAllText("frontend\package.json", $content, $Utf8NoBom)

$content = @'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;

'@
[System.IO.File]::WriteAllText("frontend\next.config.mjs", $content, $Utf8NoBom)

$content = @'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

'@
[System.IO.File]::WriteAllText("frontend\tsconfig.json", $content, $Utf8NoBom)

$content = @'
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep coastal-night palette for the glassmorphism UI direction (SRS)
        "coastal-deep": "#0b1f2e",
        "coastal-mid": "#123a52",
        "coastal-accent": "#2fb8c6",
      },
      backdropBlur: {
        glass: "16px",
      },
    },
  },
  plugins: [],
};

export default config;

'@
[System.IO.File]::WriteAllText("frontend\tailwind.config.ts", $content, $Utf8NoBom)

$content = @'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

'@
[System.IO.File]::WriteAllText("frontend\postcss.config.js", $content, $Utf8NoBom)

$content = @'
# Copy this file to .env.local
# Server-side only (no NEXT_PUBLIC_ prefix) - the browser never talks to
# the backend directly, only to this Next.js app's own /api/* routes,
# which proxy to this URL. Keeps cookies same-origin and avoids CORS.
BACKEND_URL=http://127.0.0.1:8000

'@
[System.IO.File]::WriteAllText("frontend\.env.local.example", $content, $Utf8NoBom)

$content = @'
node_modules/
.next/
out/
.env.local
*.log

'@
[System.IO.File]::WriteAllText("frontend\.gitignore", $content, $Utf8NoBom)

$content = @'
// Mirrors backend/schemas/region.py RegionOut. Keep in sync manually for now -
// consider generating this from the OpenAPI schema once the API stabilizes.
export interface Region {
  id: number;
  name: string;
  district: string;
  province: string;
  geometry: GeoJSON.Geometry | null;
}

// Mirrors backend/schemas/hazard.py HazardReadingOut
export type HazardType = "flooding" | "storm_surge" | "erosion" | "sea_level_rise";
export type DataQuality = "good" | "partial" | "poor";

export interface HazardReading {
  id: number;
  region_id: number;
  hazard_type: HazardType;
  year: number;
  value: number;
  unit: string;
  source_scene_date: string | null;
  data_quality: DataQuality;
}

'@
[System.IO.File]::WriteAllText("frontend\lib\types.ts", $content, $Utf8NoBom)

$content = @'
import type { Region } from "./types";

// Every call here hits THIS Next.js app's own /api/* routes (see app/api/),
// never the FastAPI backend directly - that keeps the auth cookie same-origin
// and avoids CORS entirely. The Next.js route handlers are the only thing
// that knows BACKEND_URL.

export async function getRegions(): Promise<Region[]> {
  const res = await fetch("/api/regions", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load regions: ${res.status}`);
  }
  return res.json();
}

export async function login(email: string, password: string): Promise<{ access_token: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    // credentials: "include" isn't needed here since this is a same-origin
    // request to our own Next.js route, which forwards the Set-Cookie itself.
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail ?? `Login failed: ${res.status}`);
  }
  return data;
}

'@
[System.IO.File]::WriteAllText("frontend\lib\api.ts", $content, $Utf8NoBom)

$content = @'
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

'@
[System.IO.File]::WriteAllText("frontend\app\api\regions\route.ts", $content, $Utf8NoBom)

$content = @'
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

'@
[System.IO.File]::WriteAllText("frontend\app\api\auth\login\route.ts", $content, $Utf8NoBom)

$content = @'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-coastal-deep text-slate-100;
}

/* Reusable glass panel - used for the navbar, side panels, and popups per
   the SRS's glassmorphism UI direction. */
.glass-panel {
  @apply bg-white/10 backdrop-blur-glass border border-white/20 shadow-lg rounded-xl;
}

/* Leaflet needs its own CSS import - done in MapView.tsx - but the default
   Leaflet popup/control styling clashes with the dark glass theme, so a
   few overrides live here. */
.leaflet-popup-content-wrapper {
  @apply bg-coastal-mid text-slate-100 rounded-lg;
}
.leaflet-popup-tip {
  @apply bg-coastal-mid;
}

'@
[System.IO.File]::WriteAllText("frontend\app\globals.css", $content, $Utf8NoBom)

$content = @'
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coastal Hazard Portal - Balochistan",
  description: "Multi-hazard coastal monitoring for the Balochistan (Makran) coastline.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

'@
[System.IO.File]::WriteAllText("frontend\app\layout.tsx", $content, $Utf8NoBom)

$content = @'
"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";

// Leaflet touches `window` at import time, so it can never be
// server-rendered - ssr: false is required here, not optional.
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="glass-panel m-4 flex h-[70vh] items-center justify-center text-sm">
      Loading map...
    </div>
  ),
});

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <MapView />
      {/* Hazard layer toggles, year slider, and the PromptBar land here once
          /api/hazards/* is wired up in the next phase. */}
    </main>
  );
}

'@
[System.IO.File]::WriteAllText("frontend\app\page.tsx", $content, $Utf8NoBom)

$content = @'
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="glass-panel w-full max-w-sm p-8">
        <h1 className="mb-6 text-lg font-semibold">Sign in</h1>

        <label className="mb-1 block text-sm text-slate-300">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm outline-none focus:border-coastal-accent"
        />

        <label className="mb-1 block text-sm text-slate-300">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm outline-none focus:border-coastal-accent"
        />

        {error && <p className="mb-4 text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-coastal-accent px-4 py-2 text-sm font-medium text-coastal-deep disabled:opacity-50"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}

'@
[System.IO.File]::WriteAllText("frontend\app\login\page.tsx", $content, $Utf8NoBom)

$content = @'
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="glass-panel m-4 flex items-center justify-between px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold">Coastal Hazard Portal</h1>
        <p className="text-xs text-slate-300">Balochistan (Makran) coastline</p>
      </div>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/" className="hover:text-coastal-accent">
          Map
        </Link>
        <Link href="/login" className="hover:text-coastal-accent">
          Login
        </Link>
      </nav>
    </header>
  );
}

'@
[System.IO.File]::WriteAllText("frontend\components\Navbar.tsx", $content, $Utf8NoBom)

$content = @'
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { getRegions } from "@/lib/api";
import type { Region } from "@/lib/types";

// Roughly centered on the Makran coast, between Lasbela and Gwadar.
const AOI_CENTER: [number, number] = [25.3, 64.5];
const AOI_DEFAULT_ZOOM = 6;

export default function MapView() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRegions()
      .then(setRegions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="glass-panel relative m-4 h-[70vh] overflow-hidden">
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-coastal-deep/60 text-sm">
          Loading regions...
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-coastal-deep/60 text-sm text-red-300">
          Failed to load regions: {error}
        </div>
      )}

      <MapContainer center={AOI_CENTER} zoom={AOI_DEFAULT_ZOOM} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {regions.map(
          (region) =>
            region.geometry && (
              <GeoJSON
                key={region.id}
                data={region.geometry as GeoJSON.Geometry}
                style={{ color: "#2fb8c6", weight: 2, fillOpacity: 0.15 }}
              >
                <Popup>
                  <strong>{region.name}</strong>
                  <br />
                  {region.district}, {region.province}
                </Popup>
              </GeoJSON>
            )
        )}
      </MapContainer>
    </div>
  );
}

'@
[System.IO.File]::WriteAllText("frontend\components\MapView.tsx", $content, $Utf8NoBom)

