"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout, type CurrentUser } from "@/lib/api";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await logout();
    setUser(null);
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
              {user.email} <span className="text-coastal-accent">({user.role})</span>
            </span>
            <button onClick={handleLogout} className="hover:text-coastal-accent">
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