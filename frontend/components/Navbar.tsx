"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.refresh();
  }

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

        {loading ? null : user ? (
          <>
            <span className="text-slate-300">
              {user.email || user.displayName || "Analyst"} <span className="text-coastal-accent">(Authenticated)</span>
            </span>
            <button onClick={handleLogout} className="hover:text-coastal-accent text-red-400">
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="hover:text-coastal-accent">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
