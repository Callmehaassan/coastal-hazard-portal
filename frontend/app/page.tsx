'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { 
  Waves, 
  Search, 
  Sun, 
  Moon,
  User, 
  Play, 
  ArrowRight, 
  AlertTriangle, 
  Info, 
  Check, 
  Sparkles, 
  ChevronDown,
  Menu,
  X,
  LogOut
} from 'lucide-react';

export default function LandingPage() {
  const { user, loading, logout, login, signup, loginWithGoogle } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  function formatFirebaseError(err: any): string {
    const code = err?.code || "";
    if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
      return "Invalid email or password. Please try again.";
    }
    if (code === "auth/email-already-in-use") {
      return "An account with this email already exists. Please sign in.";
    }
    if (code === "auth/weak-password") {
      return "Password should be at least 6 characters long.";
    }
    if (code === "auth/popup-closed-by-user") {
      return "Sign in popup was closed before completing.";
    }
    return err?.message || "Authentication failed. Please check your credentials.";
  }

  async function handleAuthSubmit(e: FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      if (authMode === 'signup') {
        await signup(authEmail, authPassword);
      } else {
        await login(authEmail, authPassword);
      }
    } catch (err: any) {
      setAuthError(formatFirebaseError(err));
    } finally {
      setAuthSubmitting(false);
    }
  }

  async function handleGoogleAuth() {
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setAuthError(formatFirebaseError(err));
    } finally {
      setAuthSubmitting(false);
    }
  }
  const [isHazardsOpen, setIsHazardsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTimelineYear, setSelectedTimelineYear] = useState(2025);

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedTheme);
  }, []);

  const toggleDarkMode = () => {
    const nextTheme = !darkMode;
    setDarkMode(nextTheme);
    localStorage.setItem('darkMode', String(nextTheme));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070e1b] text-white">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"></div>
          <div className="text-center">
            <p className="text-sm font-bold tracking-wide text-white">Coastal Hazard Portal</p>
            <p className="text-xs text-cyan-400/80 mt-1">Verifying authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#070e1b] font-sans p-4 select-none">
        {/* Full-Bleed Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none"
          style={{ backgroundImage: "url('/coastal-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070e1b]/80 via-[#070e1b]/90 to-[#070e1b] pointer-events-none" />

        {/* Glow Effects */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-slate-900/85 p-8 shadow-2xl backdrop-blur-2xl">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Balochistan Coastline</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              COASTAL HAZARD PORTAL
            </h1>
            <p className="mt-1.5 text-xs text-slate-400">
              {authMode === 'signup' 
                ? "Create an account to access real-time hazard data & maps" 
                : "Sign in to access satellite monitoring, live analysis & early warnings"}
            </p>
          </div>

          {/* Google One-Click Auth */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={authSubmitting}
            className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 py-2.5 px-4 text-xs font-semibold text-white transition hover:bg-white/10 hover:border-cyan-400/50 disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-5 flex items-center justify-center">
            <div className="w-full border-t border-white/10" />
            <span className="absolute bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider">or with email</span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Email Address</label>
              <input
                type="email"
                required
                placeholder="analyst@coastalhazard.pk"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:bg-white/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:bg-white/10"
              />
            </div>

            {authError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:opacity-95 disabled:opacity-50"
            >
              {authSubmitting 
                ? (authMode === 'signup' ? "Creating account..." : "Signing in...") 
                : (authMode === 'signup' ? "Create Account & Access Portal" : "Sign In to Portal")}
            </button>
          </form>

          {/* Toggle between Sign In & Sign Up */}
          <div className="mt-6 text-center text-xs text-slate-400">
            {authMode === 'signup' ? "Already have an account? " : "New to the portal? "}
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'signup' ? 'signin' : 'signup');
                setAuthError(null);
              }}
              className="font-bold text-cyan-400 hover:underline"
            >
              {authMode === 'signup' ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col font-sans selection:bg-cyan-500/20 relative ${
      darkMode ? 'bg-[#070e1b] text-slate-100 dark-theme' : 'bg-[#f8fafc] text-slate-800'
    }`}>
      
      {/* Root Full-Bleed Hero Background Image */}
      <div 
        className="absolute top-0 left-0 right-0 h-[680px] bg-cover bg-center pointer-events-none z-0 opacity-100"
        style={{ backgroundImage: "url('/coastal-bg.jpg')" }}
      />
      {/* Soft dark-warm shading and bottom gradient overlay */}
      <div className={`absolute top-0 left-0 right-0 h-[680px] z-0 pointer-events-none transition-colors duration-300 ${
        darkMode ? 'bg-slate-950/80 backdrop-blur-[1px]' : 'bg-slate-900/[0.04]'
      }`} />
      <div className={`absolute top-0 left-0 right-0 h-[680px] bg-gradient-to-b z-0 pointer-events-none transition-colors duration-300 ${
        darkMode ? 'from-transparent via-[#070e1b]/30 to-[#070e1b]' : 'from-transparent via-[#f8fafc]/30 to-[#f8fafc]'
      }`} />
      
      {/* Navigation Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 border-b shadow-sm ${
        darkMode ? 'bg-slate-950/90 border-slate-800/80 backdrop-blur-md text-white' : 'bg-white/80 border-slate-100 backdrop-blur-md text-slate-800'
      }`}>
        <div className="max-w-[1400px] mx-auto px-6 py-3.5 flex justify-between items-center">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <img src="/logo-portal.png" className="w-10 h-10 object-contain rounded-full border border-slate-200/80 shadow-md bg-white flex-shrink-0" alt="Coastal Hazard Portal Logo" />
            <div>
              <span className={`text-sm font-black tracking-tight block uppercase ${darkMode ? 'text-white' : 'text-slate-900'}`}>COASTAL HAZARD PORTAL</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Balochistan Coastline</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/" className={`text-xs font-bold border-b-2 pb-1 transition ${
              darkMode ? 'text-cyan-400 border-cyan-400' : 'text-slate-900 border-slate-900'
            }`}>
              Home
            </Link>
            <Link href="/dashboard" className={`text-xs font-semibold transition ${
              darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
            }`}>
              Dashboard
            </Link>
            <Link href="/about" className={`text-xs font-semibold transition ${
              darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
            }`}>
              About
            </Link>
          </nav>

          {/* Right Header Section */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search Input */}
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search locations, districts..." 
                className={`w-56 text-xs px-3 py-2 pl-8 border rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={toggleDarkMode}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center transition ${
                darkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-850' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
              aria-label="Toggle dark/light mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400 animate-pulse" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User State & Logout Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className={`hidden sm:inline text-xs font-medium px-2.5 py-1 rounded-lg border ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-cyan-400' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  {user.email?.split('@')[0] || "Analyst"}
                </span>
                <button
                  onClick={() => logout()}
                  title="Log out of portal"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                  darkMode ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/10' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className={`absolute top-full left-0 right-0 border-b p-4 flex flex-col gap-3 shadow-lg lg:hidden z-50 ${
            darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <Link 
              href="/" 
              onClick={() => setMobileMenuOpen(false)}
              className={`text-xs font-semibold p-2.5 rounded-xl block ${darkMode ? 'bg-slate-900 text-cyan-400' : 'bg-slate-50 text-slate-900'}`}
            >
              Home
            </Link>
            <Link 
              href="/dashboard" 
              onClick={() => setMobileMenuOpen(false)}
              className={`text-xs font-semibold p-2.5 rounded-xl block ${darkMode ? 'hover:bg-slate-900 text-slate-350' : 'hover:bg-slate-50 text-slate-700'}`}
            >
              Dashboard
            </Link>
            <Link 
              href="/about" 
              onClick={() => setMobileMenuOpen(false)}
              className={`text-xs font-semibold p-2.5 rounded-xl block ${darkMode ? 'hover:bg-slate-900 text-slate-350' : 'hover:bg-slate-50 text-slate-700'}`}
            >
              About
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 pb-12 px-6 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1 z-10">

        {/* Hero Left Column (Info & Actions) */}
        <div className="lg:col-span-6 space-y-6">
          <h1 className={`text-4xl md:text-5.5xl font-black tracking-tight leading-[1.1] font-sans ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Better Intelligence.
            <br />
            <span className={darkMode ? 'text-cyan-400 font-black drop-shadow-sm' : 'text-[#132c25]'}>Safer Coastlines.</span>
          </h1>

          <p className={`text-sm md:text-base leading-relaxed max-w-xl ${
            darkMode ? 'text-slate-300 font-medium' : 'text-slate-600'
          }`}>
            Monitoring coastal flooding, storm surge, shoreline change and sea-level rise along Pakistan's Balochistan coastline using satellite data and AI-driven insights.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              href="/dashboard"
              className={`px-6 py-3.5 rounded-xl text-xs font-black flex items-center gap-2 transition active:scale-95 shadow-lg ${
                darkMode ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20' : 'bg-[#132c25] hover:bg-[#1a3a32] text-white shadow-[#132c25]/10'
              }`}
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault();
                alert("Playing Overview Video. For detailed live data updates, please click on Explore Dashboard.");
              }}
              className={`px-6 py-3.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition active:scale-95 border ${
                darkMode ? 'bg-slate-900/80 border-slate-700 hover:bg-slate-800 text-white' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${darkMode ? 'text-slate-300 fill-slate-300' : 'text-slate-500 fill-slate-500'}`} />
              <span>Watch Overview</span>
            </Link>
          </div>
        </div>

        {/* Hero Right Column (Balochistan Coastline Overview Card) */}
        <div className={`lg:col-span-6 border rounded-3xl p-6 shadow-xl transition-all ${
          darkMode ? 'bg-slate-900/90 border-slate-800/90 shadow-slate-950/80 text-white backdrop-blur-xl' : 'bg-white border-slate-200/60 shadow-slate-100/50 text-slate-900'
        }`}>
          <div className={`flex justify-between items-center border-b pb-4 mb-4 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <h3 className={`font-extrabold text-sm font-sans uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Balochistan Coastline Overview</h3>
          </div>

          {/* Metric Stats Banner */}
          <div className={`grid grid-cols-5 gap-2 text-center rounded-2xl p-3 mb-4 border ${
            darkMode ? 'bg-slate-950/90 border-slate-800/80 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'
          }`}>
            <div>
              <span className={`block text-xs font-black font-sans ${darkMode ? 'text-white' : 'text-slate-900'}`}>~700 km</span>
              <span className={`text-[8px] font-semibold block leading-tight ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Coastline Monitored</span>
            </div>
            <div>
              <span className={`block text-xs font-black font-sans ${darkMode ? 'text-white' : 'text-slate-900'}`}>2</span>
              <span className={`text-[8px] font-semibold block leading-tight ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Districts Covered</span>
            </div>
            <div>
              <span className={`block text-xs font-black font-sans ${darkMode ? 'text-white' : 'text-slate-900'}`}>4</span>
              <span className={`text-[8px] font-semibold block leading-tight ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Coastal Hazards</span>
            </div>
            <div>
              <span className={`block text-xs font-black font-sans ${darkMode ? 'text-white' : 'text-slate-900'}`}>10+</span>
              <span className={`text-[8px] font-semibold block leading-tight ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Satellite Datasets</span>
            </div>
            <div>
              <span className={`block text-xs font-black font-sans ${darkMode ? 'text-white' : 'text-slate-900'}`}>2016-2025</span>
              <span className={`text-[8px] font-semibold block leading-tight ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Historical Analysis</span>
            </div>
          </div>

          {/* Map Preview area */}
          <div className="relative h-60 rounded-2xl overflow-hidden border border-slate-100 bg-[#e5e9f0]">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/coastal-map.jpg')" }}
            />
            {/* Translucent overlay mask */}
            <div className="absolute inset-0 bg-slate-950/10 backdrop-blur-[0.5px]" />
            
            {/* Custom Location Pins */}
            <div className="absolute top-[35%] left-[25%] flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-white border border-slate-900 animate-ping absolute" />
              <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-900 relative" />
              <span className="text-[8px] font-bold text-white bg-slate-950/80 px-1 py-0.5 rounded shadow mt-1">Sonmiani</span>
            </div>

            <div className="absolute top-[48%] left-[45%] flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-900" />
              <span className="text-[8px] font-bold text-white bg-slate-950/80 px-1 py-0.5 rounded shadow mt-1">Ormara</span>
            </div>

            <div className="absolute top-[52%] left-[65%] flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-900" />
              <span className="text-[8px] font-bold text-white bg-slate-950/80 px-1 py-0.5 rounded shadow mt-1">Pasni</span>
            </div>

            <div className="absolute top-[60%] left-[80%] flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-900" />
              <span className="text-[8px] font-bold text-white bg-slate-950/80 px-1 py-0.5 rounded shadow mt-1">Gwadar</span>
            </div>

            {/* Layers Overlay Checkbox list */}
            <div className="absolute bottom-4 right-4 bg-white/95 border border-slate-100 rounded-xl p-2.5 text-[9px] text-slate-700 shadow-xl flex flex-col gap-1.5 w-[130px] backdrop-blur">
              <div className="flex items-center justify-between font-bold text-slate-900 border-b pb-1 mb-1">
                <span>Active Layers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-cyan-600 stroke-[3]" />
                <span>Coastal Flooding</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-cyan-600 stroke-[3]" />
                <span>Storm Surge</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-cyan-600 stroke-[3]" />
                <span>Shoreline Erosion</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-cyan-600 stroke-[3]" />
                <span>Sea Level Rise</span>
              </div>
            </div>

            {/* View Live Map overlay CTA */}
            <Link 
              href="/dashboard"
              className="absolute bottom-4 left-4 bg-[#132c25] hover:bg-[#1a3a32] text-white px-3.5 py-2 rounded-lg text-[9px] font-bold shadow-lg transition"
            >
              View Live Map
            </Link>
          </div>
        </div>

      </section>

      {/* Hazards Grid Section */}
      <section className="max-w-[1400px] mx-auto px-6 py-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Flooding */}
          <div className={`border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-64 flex group ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/60'
          }`}>
            {/* Left Content (Text) */}
            <div className={`w-[55%] p-5 flex flex-col justify-between h-full border-r relative z-10 transition-colors duration-300 ${
              darkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-100'
            }`}>
              <div>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-3.5 border ${
                  darkMode ? 'bg-blue-950 border-blue-900 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'
                }`}>
                  <Waves className="w-5 h-5" />
                </div>
                <h4 className={`font-extrabold text-xs mb-1.5 uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Coastal Flooding</h4>
                <p className={`text-[10.5px] leading-relaxed font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Detect and analyze inundation using Sentinel-1 & Sentinel-2 satellite imagery.
                </p>
              </div>
              <div>
                <Link href="/dashboard" className="text-[10px] font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-1.5">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
            {/* Right Image */}
            <div className="w-[45%] h-full relative overflow-hidden bg-slate-50">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: "url('/flooding-bg.jpg')" }}
              />
            </div>
          </div>

          {/* Card 2: Storm Surge */}
          <div className={`border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-64 flex group ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/60'
          }`}>
            {/* Left Content (Text) */}
            <div className={`w-[55%] p-5 flex flex-col justify-between h-full border-r relative z-10 transition-colors duration-300 ${
              darkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-100'
            }`}>
              <div>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-3.5 border ${
                  darkMode ? 'bg-orange-950 border-orange-900 text-orange-400' : 'bg-orange-50 border-orange-100 text-orange-600'
                }`}>
                  <Waves className="w-5 h-5" />
                </div>
                <h4 className={`font-extrabold text-xs mb-1.5 uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Storm Surge</h4>
                <p className={`text-[10.5px] leading-relaxed font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Monitor historical storm surge events associated with Arabian Sea cyclones.
                </p>
              </div>
              <div>
                <Link href="/dashboard" className="text-[10px] font-extrabold text-orange-600 hover:text-orange-800 flex items-center gap-1.5">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
            {/* Right Image */}
            <div className="w-[45%] h-full relative overflow-hidden bg-slate-50">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: "url('/surge-bg.jpg')" }}
              />
            </div>
          </div>

          {/* Card 3: Shoreline Erosion */}
          <div className={`border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-64 flex group relative ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/60'
          }`}>
            {/* Left Content (Text) */}
            <div className={`w-[55%] p-5 flex flex-col justify-between h-full border-r relative z-10 transition-colors duration-300 ${
              darkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-100'
            }`}>
              <div>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-3.5 border ${
                  darkMode ? 'bg-amber-950 border-amber-900 text-amber-400' : 'bg-amber-50 border-amber-100 text-amber-600'
                }`}>
                  <Waves className="w-5 h-5" />
                </div>
                <h4 className={`font-extrabold text-xs mb-1.5 uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Shoreline Erosion</h4>
                <p className={`text-[10.5px] leading-relaxed font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Long-term shoreline change analysis using DSAS methodology.
                </p>
              </div>
              <div>
                <Link href="/dashboard" className="text-[10px] font-extrabold text-amber-600 hover:text-amber-800 flex items-center gap-1.5">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
            {/* Right Image */}
            <div className="w-[45%] h-full relative overflow-hidden bg-slate-50">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: "url('/erosion-bg.jpg')" }}
              />
            </div>
            {/* Split Slider Handle Visual overlay */}
            <div className="absolute top-0 bottom-0 left-[55%] w-0.5 bg-white/80 z-20 pointer-events-none" />
            <div className="absolute top-[50%] left-[55%] -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-[7px] font-bold text-slate-500 z-30 select-none pointer-events-none">
              ◀ ▶
            </div>
          </div>

          {/* Card 4: Sea Level Rise */}
          <div className={`border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-64 flex group ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/60'
          }`}>
            {/* Left Content (Text) */}
            <div className={`w-[55%] p-5 flex flex-col justify-between h-full border-r relative z-10 transition-colors duration-300 ${
              darkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-100'
            }`}>
              <div>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-3.5 border ${
                  darkMode ? 'bg-emerald-950 border-emerald-900 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                }`}>
                  <Waves className="w-5 h-5" />
                </div>
                <h4 className={`font-extrabold text-xs mb-1.5 uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Sea Level Rise</h4>
                <p className={`text-[10.5px] leading-relaxed font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Track sea level anomalies and long-term rise across the coast.
                </p>
              </div>
              <div>
                <Link href="/dashboard" className="text-[10px] font-extrabold text-emerald-600 hover:text-emerald-800 flex items-center gap-1.5">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
            {/* Right Chart */}
            <div className="w-[45%] h-full relative overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: "url('/slr-bg.jpg')" }}
              />
              <div className="absolute inset-0 bg-teal-950/15 pointer-events-none" />
              {/* SVG line graph path overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none opacity-80 select-none z-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 0 90 Q 20 70, 40 75 T 80 35 T 100 10 L 100 100 L 0 100 Z" fill="url(#slrGrad2)" />
                  <path d="M 0 90 Q 20 70, 40 75 T 80 35 T 100 10" fill="transparent" stroke="#22c55e" strokeWidth="2.5" />
                  <defs>
                    <linearGradient id="slrGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Ask Coastal AI section */}
      <section className="max-w-[1400px] mx-auto px-6 py-6 w-full">
        <div className={`border rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 transition-all duration-300 ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          
          {/* AI Banner Title */}
          <div className="flex items-center gap-4 w-full lg:w-[30%]">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border flex-shrink-0 ${
              darkMode ? 'bg-cyan-950 border-cyan-900 text-cyan-400' : 'bg-cyan-50 border-cyan-100 text-cyan-600'
            }`}>
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className={`font-black text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>Ask Coastal AI</h4>
                <span className="text-[8px] bg-cyan-100 text-cyan-700 font-bold px-1.5 py-0.5 rounded-full uppercase">Beta</span>
              </div>
              <p className={`text-[10px] leading-tight ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Ask questions, get insights, and explore coastal hazards using natural language.
              </p>
            </div>
          </div>

          {/* Quick Suggestions Pills */}
          <div className="flex flex-wrap gap-2 w-full lg:w-[45%] justify-start lg:justify-center">
            {[
              'Show erosion hotspots in Gwadar district',
              'Compare flooding 2019 vs 2025',
              'Which areas are most vulnerable?',
              'Show storm surge impact of Cyclone Biparjoy'
            ].map((query, index) => (
              <button 
                key={index}
                onClick={() => alert(`Forwarding query to GEE analysis terminal: "${query}"`)}
                className={`text-[9px] font-bold border px-3 py-1.5 rounded-full transition ${
                  darkMode ? 'text-slate-300 bg-slate-900 border-slate-800 hover:bg-slate-850' : 'text-slate-655 bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {query}
              </button>
            ))}
          </div>

          {/* Input field */}
          <div className="relative w-full lg:w-[25%]">
            <input 
              type="text" 
              placeholder="Ask anything about coastal hazards..."
              className={`w-full text-xs px-3 py-2.5 pr-10 border rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                darkMode ? 'bg-slate-950 border-slate-850 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  alert(`AI Search submitted: "${(e.target as HTMLInputElement).value}"`);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <button 
              onClick={() => alert("AI Search submitted.")}
              className={`absolute right-2.5 top-2.5 w-6 h-6 rounded-lg flex items-center justify-center text-white transition ${
                darkMode ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* Historical, CVI, Alerts, and Data Sources Bottom Grid */}
      <section className="max-w-[1400px] mx-auto px-6 py-6 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Column 1: Historical Timeline */}
        <div className={`backdrop-blur-sm border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[320px] relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-cyan-500 before:to-blue-600 ${
          darkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white/90 border-slate-200/60 text-slate-800'
        }`}>
          <div>
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">Historical Timeline (2016-2025)</h5>
              <span className="text-[10px] bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black px-2.5 py-0.5 rounded-full shadow-sm">{selectedTimelineYear}</span>
            </div>
            
            {/* Interactive Timeline Track Visual */}
            <div className="relative mb-5 mt-3 px-1 select-none">
              {/* Slider Track Line */}
              <div className={`absolute left-1 right-1 top-[5px] h-1.5 rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
              {/* Highlight Track Line */}
              <div 
                className="absolute left-1 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${((selectedTimelineYear - 2016) / 9) * 98}%` }}
              />
              {/* Nodes and Dots */}
              <div className="relative flex justify-between items-center z-10">
                {[2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map((yr) => (
                  <button 
                    key={yr}
                    onClick={() => setSelectedTimelineYear(yr)}
                    className="flex flex-col items-center group relative focus:outline-none"
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all flex items-center justify-center ${
                      selectedTimelineYear === yr 
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-white scale-125 shadow-md shadow-blue-500/30' 
                        : (darkMode ? 'bg-slate-900 border-slate-700 hover:border-slate-500' : 'bg-white border-slate-300 hover:border-slate-500')
                    }`} />
                    <span className={`text-[8px] font-black mt-1 transition-all ${
                      selectedTimelineYear === yr ? (darkMode ? 'text-white font-extrabold' : 'text-slate-950 font-extrabold') : 'text-slate-400'
                    }`}>{yr % 100}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of 5 Satellite map thumbnails */}
            <div className="grid grid-cols-5 gap-1.5 mt-4">
              {[
                { name: 'Jiwani' },
                { name: 'Gwadar' },
                { name: 'Pasni' },
                { name: 'Ormara' },
                { name: 'Sonmiani' }
              ].map((loc, idx) => (
                <div key={idx} className={`h-14 rounded-xl overflow-hidden border relative group/thumb shadow-sm transition-all ${
                  darkMode ? 'bg-slate-900 border-slate-800 hover:border-cyan-400' : 'bg-slate-100 border-slate-200 hover:border-cyan-400'
                }`}>
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-85 transition-transform duration-500 group-hover/thumb:scale-110" 
                    style={{ backgroundImage: "url('/coastal-bg.jpg')" }} 
                  />
                  {/* Subtle dark bottom gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent opacity-90" />
                  <span className="absolute bottom-1.5 left-1.5 text-[7px] text-white font-extrabold leading-none tracking-tight">{loc.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100/10 pt-3 mt-4">
            <Link href="/dashboard" className={`text-[9.5px] font-extrabold flex items-center gap-1 ${
              darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-[#132c25] hover:text-[#255044]'
            }`}>
              <span>View full timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Column 2: Coastal Vulnerability Index */}
        <div className={`backdrop-blur-sm border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[320px] relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-400 before:to-orange-500 ${
          darkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white/90 border-slate-200/80 text-slate-800'
        }`}>
          <div>
            <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider mb-3">Coastal Vulnerability Index (CVI)</h5>
            
            {/* Ring progress and side metrics */}
            <div className="flex gap-4 items-center mb-4">
              {/* Ring metric */}
              <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="32" stroke={darkMode ? '#1e293b' : '#f1f5f9'} strokeWidth="6" fill="transparent" />
                  <circle cx="40" cy="40" r="32" stroke="url(#cviGrad)" strokeWidth="6.5" strokeLinecap="round" fill="transparent" strokeDasharray={2 * Math.PI * 32} strokeDashoffset={2 * Math.PI * 32 * (1 - 0.62)} />
                  <defs>
                    <linearGradient id="cviGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className={`block text-sm font-black tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>0.62</span>
                  <span className="text-[7px] text-amber-600 font-extrabold block uppercase leading-none">Moderate Risk</span>
                </div>
              </div>

              {/* Mini progress list */}
              <div className="flex-1 space-y-1">
                {[
                  { label: 'Population Exposure', val: 0.58, color: 'bg-gradient-to-r from-emerald-400 to-teal-500' },
                  { label: 'Infrastructure Exposure', val: 0.64, color: 'bg-gradient-to-r from-yellow-400 to-amber-500' },
                  { label: 'Elevation (Low Lying)', val: 0.71, color: 'bg-gradient-to-r from-orange-400 to-red-500' },
                  { label: 'Storm Surge Risk', val: 0.66, color: 'bg-gradient-to-r from-yellow-400 to-amber-500' },
                  { label: 'Flood Risk', val: 0.59, color: 'bg-gradient-to-r from-emerald-400 to-teal-500' },
                  { label: 'Sea Level Rise', val: 0.63, color: 'bg-gradient-to-r from-yellow-400 to-amber-500' }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-[7px] font-extrabold text-slate-500 leading-none mb-0.5">
                      <span>{item.label}</span>
                      <span className={darkMode ? 'text-white' : 'text-slate-850'}>{item.val}</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden shadow-inner ${darkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
                      <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.val * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100/10 pt-3 mt-4">
            <Link href="/dashboard/analysis" className={`text-[9.5px] font-extrabold flex items-center gap-1 ${
              darkMode ? 'text-amber-500 hover:text-amber-400' : 'text-[#132c25] hover:text-[#255044]'
            }`}>
              <span>View full assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Column 3: Live Alerts */}
        <div className={`backdrop-blur-sm border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[320px] relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-red-500 before:to-rose-600 ${
          darkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white/90 border-slate-200/80 text-slate-800'
        }`}>
          <div>
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">Live Alerts</h5>
              <Link href="/dashboard" className="text-[9px] font-bold text-red-650 hover:text-red-800 transition">View all alerts</Link>
            </div>

            {/* Alerts stack */}
            <div className="space-y-2">
              {[
                { icon: AlertTriangle, title: 'Storm Surge Watch', loc: 'Gwadar Coast', date: 'May 15, 09:20 AM', color: 'text-red-500', border: 'border-l-4 border-red-500 bg-red-50/20' },
                { icon: AlertTriangle, title: 'High Flood Risk', loc: 'Lasbela District', date: 'May 15, 08:45 AM', color: 'text-amber-500', border: 'border-l-4 border-amber-500 bg-amber-50/20' },
                { icon: AlertTriangle, title: 'Shoreline Erosion Warning', loc: 'Ormara Coast', date: 'May 14, 11:15 PM', color: 'text-amber-500', border: 'border-l-4 border-amber-500 bg-amber-50/20' },
                { icon: Info, title: 'Sea Level Rise Trend', loc: 'Increasing +8.6 mm/yr', date: 'May 14, 2025', color: 'text-cyan-500', border: 'border-l-4 border-cyan-500 bg-cyan-50/20' }
              ].map((alert, idx) => (
                <div key={idx} className={`flex justify-between items-start text-[9.5px] p-2 rounded-xl border transition shadow-sm ${
                  darkMode ? 'border-slate-850 hover:bg-slate-950/40 bg-slate-950/20' : 'border-transparent hover:bg-slate-100/40 bg-slate-50/20'
                }`}>
                  <div className="flex gap-2 items-start">
                    <alert.icon className={`w-4 h-4 ${alert.color} mt-0.5`} />
                    <div>
                      <span className={`font-extrabold block leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{alert.title}</span>
                      <span className="text-[7.5px] text-slate-500 font-semibold">{alert.loc}</span>
                    </div>
                  </div>
                  <span className="text-[8px] text-slate-400 font-bold whitespace-nowrap ml-2">{alert.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100/10 pt-3 mt-4">
            <Link href="/dashboard" className={`text-[9.5px] font-extrabold flex items-center gap-1 ${
              darkMode ? 'text-rose-500 hover:text-rose-400' : 'text-[#132c25] hover:text-[#255044]'
            }`}>
              <span>View all alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Column 4: Data Sources */}
        <div className={`backdrop-blur-sm border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[320px] relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-emerald-500 before:to-teal-600 ${
          darkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white/90 border-slate-200/80 text-slate-800'
        }`}>
          <div>
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">Data Sources</h5>
              <Link href="/dashboard" className="text-[9px] font-bold text-slate-500 hover:text-slate-900 transition">View all sources</Link>
            </div>
            
            {/* List with 6 checkmark items */}
            <div className="space-y-2 text-[9.5px] font-bold">
              {[
                { label: 'Sentinel-1 / Sentinel-2' },
                { label: 'Landsat 8/9' },
                { label: 'DEM (SRTM)' },
                { label: 'PMD Tide Gauges' },
                { label: 'In-situ & Historical Data' },
                { label: 'Cyclone Track Data' }
              ].map((item, idx) => (
                <div key={idx} className={`flex items-center gap-2.5 p-2 rounded-xl transition shadow-sm border ${
                  darkMode 
                    ? 'hover:bg-emerald-950/50 hover:text-emerald-400 border-slate-850 bg-slate-950/20' 
                    : 'hover:bg-emerald-50/50 hover:text-emerald-800 border-transparent bg-slate-50/50'
                }`}>
                  <span className="text-emerald-600 font-extrabold text-xs">☑</span>
                  <span className={`text-[9px] font-extrabold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100/10 pt-3 mt-4">
            <Link href="/dashboard" className={`text-[9.5px] font-extrabold flex items-center gap-1 ${
              darkMode ? 'text-emerald-505 hover:text-emerald-400' : 'text-[#132c25] hover:text-[#255044]'
            }`}>
              <span>View all sources</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </section>

      {/* Footer Branding Banner */}
      <footer className={`backdrop-blur-md border-t pt-12 pb-6 mt-16 shadow-lg z-10 relative transition-colors duration-300 ${
        darkMode ? 'bg-slate-950/95 border-slate-800/80 text-slate-300' : 'bg-white/90 border-slate-200/80 text-slate-800'
      }`}>
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
          
          {/* Column 1: Brand & Logo */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo-portal.png" className="w-10 h-10 object-contain rounded-full border border-slate-200 shadow-md bg-white" alt="Portal Logo" />
              <div>
                <span className="text-xs font-black tracking-tight block uppercase">COASTAL HAZARD PORTAL</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Balochistan Coastline</span>
              </div>
            </div>
            <p className={`text-[11px] leading-relaxed max-w-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              A state-of-the-art decision support system leveraging real-time satellite imagery, SAR backscatter models, and Google Earth Engine (GEE) algorithms to map and monitor coastal vulnerability.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="md:col-span-2 space-y-3">
            <h6 className={`text-[10px] font-extrabold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Navigation</h6>
            <ul className={`space-y-2 text-[11px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              <li><Link href="/" className="hover:text-cyan-600 transition">Home</Link></li>
              <li><Link href="/dashboard" className="hover:text-cyan-600 transition">Dashboard</Link></li>
              <li><Link href="/dashboard/analysis" className="hover:text-cyan-600 transition">GEE Live Analysis</Link></li>
              <li><Link href="/dashboard" className="hover:text-cyan-600 transition">Map Explorer</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="md:col-span-3 space-y-3">
            <h6 className={`text-[10px] font-extrabold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Resources</h6>
            <ul className={`space-y-2 text-[11px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              <li><a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 transition">API Documentation</a></li>
              <li><Link href="/dashboard" className="hover:text-cyan-600 transition">Methodology Guide</Link></li>
              <li><a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 transition">GEE Platform Console</a></li>
            </ul>
          </div>

          {/* Column 4: Partners */}
          <div className="md:col-span-3 space-y-4">
            <h6 className={`text-[10px] font-extrabold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Partners</h6>
            <div className="space-y-3">
              <div className={`flex items-center gap-2.5 p-2 rounded-xl border shadow-sm ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50/50 border-slate-100'
              }`}>
                <img src="/ncgsa-logo.png" alt="NCGSA Logo" className="h-7 w-auto object-contain flex-shrink-0" />
                <div>
                  <span className="text-[9px] font-bold block uppercase leading-none">NCGSA Initiative</span>
                  <span className={`text-[7.5px] font-semibold block leading-tight ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>National Center of GIS & Space Applications</span>
                </div>
              </div>
              <div className={`flex items-center gap-2.5 p-2 rounded-xl border shadow-sm ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50/50 border-slate-100'
              }`}>
                <img src="/ist-logo.png" alt="IST Logo" className="h-7 w-auto object-contain flex-shrink-0" />
                <div>
                  <span className="text-[9px] font-bold block uppercase leading-none">IST Islamabad</span>
                  <span className={`text-[7.5px] font-semibold block leading-tight ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Institute of Space Technology</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className={`max-w-[1400px] mx-auto px-6 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4 ${
          darkMode ? 'border-slate-800' : 'border-slate-200/80'
        }`}>
          <div className="text-[10px] text-slate-400 font-bold">
            &copy; {new Date().getFullYear()} Coastal Hazard Portal. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[9px] font-extrabold text-slate-500">
            <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Powered by:</span>
            {['Google Earth Engine', 'PostGIS', 'FastAPI', 'React', 'Tailwind CSS', 'Groq AI'].map((tech, idx) => (
              <span key={idx} className={`px-2 py-0.5 rounded-full border shadow-sm ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-655'
              }`}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}