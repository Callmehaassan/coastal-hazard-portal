'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Sun, 
  User, 
  Mail, 
  Cpu,
  Menu,
  X,
  Compass,
  Activity
} from 'lucide-react';

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed text-slate-800 flex flex-col font-sans overflow-x-hidden relative selection:bg-cyan-500/20"
      style={{ backgroundImage: "url('/coastal-bg.jpg')" }}
    >
      {/* Soft light tint overlay to match homepage */}
      <div className="absolute inset-0 bg-[#f8fafc]/90 backdrop-blur-[1px] pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-3.5 flex justify-between items-center">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <img src="/logo-portal.png" className="w-10 h-10 object-contain rounded-full border border-slate-200/80 shadow-md bg-white flex-shrink-0" alt="Coastal Hazard Portal Logo" />
            <div>
              <span className="text-sm font-black tracking-tight text-slate-900 block uppercase">COASTAL HAZARD PORTAL</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Balochistan Coastline</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-slate-950 transition">
              Home
            </Link>
            <Link href="/dashboard" className="text-xs font-semibold text-slate-600 hover:text-slate-950 transition">
              Dashboard
            </Link>
            <Link href="/about" className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1">
              About
            </Link>
          </nav>

          {/* Right Header Section */}
          <div className="flex items-center gap-2 md:gap-4">
            <button className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition">
              <Sun className="w-4 h-4 text-slate-600" />
            </button>

            <Link 
              href="/login"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-slate-900/10"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Login</span>
            </Link>

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
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-4 flex flex-col gap-3 shadow-lg lg:hidden z-50">
            <Link 
              href="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold text-slate-700 hover:text-slate-950 p-2.5 hover:bg-slate-50 rounded-xl block"
            >
              Home
            </Link>
            <Link 
              href="/dashboard" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold text-slate-700 hover:text-slate-950 p-2.5 hover:bg-slate-50 rounded-xl block"
            >
              Dashboard
            </Link>
            <Link 
              href="/about" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-bold text-slate-900 bg-slate-50 p-2.5 rounded-xl block"
            >
              About
            </Link>
          </div>
        )}
      </header>

      {/* Main Content Workspace */}
      <main className="max-w-[1000px] mx-auto px-6 pt-32 pb-16 flex-1 w-full space-y-12 z-10 relative">
        
        {/* Page Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 font-extrabold text-[10px] uppercase tracking-wider shadow-sm">
            About the Initiative
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Advanced Environmental Intelligence for Pakistan's Makran Coastline
          </h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            The Coastal Hazard Portal is a state-of-the-art decision support platform built to monitor, assess, and simulate geological and oceanographic risks along the Balochistan coast.
          </p>
        </div>

        {/* Dynamic Multi-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: GEE Data Pipeline */}
          <div className="bg-white/95 backdrop-blur-sm border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition duration-300 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-600" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">GEE Cloud Compute</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Leverages Google Earth Engine pipelines to calculate Sentinel-2 MNDWI coastal erosion rates and Sentinel-1 SAR Otsu water threshold inundation extents on demand.
            </p>
          </div>

          {/* Card 2: CVI Indexing */}
          <div className="bg-white/95 backdrop-blur-sm border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition duration-300 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Multi-Hazard Weighting</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Calculates a dynamic Coastal Vulnerability Index (CVI) by combining geographic parameters (Slope, Elevation) with temporal parameters (Sea Level Rise, Storm Surge, Tsunami risk).
            </p>
          </div>

          {/* Card 3: GIS Leaflet Analytics */}
          <div className="bg-white/95 backdrop-blur-sm border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition duration-300 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Compass className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Interactive GIS Canvas</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Visualizes risk heatmaps shape-clipped to local district boundaries (Gwadar and Lasbela), alongside glowing safe shelters, highway routes, and hazard beacons.
            </p>
          </div>

        </div>

        {/* Development Team Profile Cards */}
        <div className="space-y-6 pt-6 border-t border-slate-200/80">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black text-slate-900">Development Team</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">The brains behind this portal</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            
            {/* Ali Hassan */}
            <div className="bg-white/95 backdrop-blur-sm border border-slate-200/80 p-6 rounded-3xl shadow-lg text-center space-y-4 hover:scale-[1.02] transition duration-300 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-gradient-to-r before:from-cyan-500 before:to-blue-600">
              <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center border-2 border-slate-200 shadow-sm font-black text-xl text-slate-700 uppercase">
                AH
              </div>
              <div>
                <h4 className="font-extrabold text-slate-955 text-base">Ali Hassan</h4>
                <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider mt-0.5">Full-Stack Developer</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Worked on backend development, API infrastructure, custom rate-limiting middleware, database schema modeling, and secure authentication systems.
              </p>
            </div>

            {/* Laiba Rafi */}
            <div className="bg-white/95 backdrop-blur-sm border border-slate-200/80 p-6 rounded-3xl shadow-lg text-center space-y-4 hover:scale-[1.02] transition duration-300 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-gradient-to-r before:from-emerald-500 before:to-teal-600">
              <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center border-2 border-slate-200 shadow-sm font-black text-xl text-slate-700 uppercase">
                LR
              </div>
              <div>
                <h4 className="font-extrabold text-slate-955 text-base">Laiba Rafi</h4>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">GEE & GIS Specialist</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Worked on Google Earth Engine (GEE) algorithms, Sentinel satellite image classification pipelines, and administrative district boundary mapping in ArcMap/QGIS.
              </p>
            </div>

          </div>
        </div>

      </main>

      {/* Footer Branding Banner */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-slate-200/80 pt-12 pb-6 mt-auto shadow-lg z-10 relative">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
          
          {/* Column 1: Brand & Logo */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo-portal.png" className="w-10 h-10 object-contain rounded-full border border-slate-200 shadow-md bg-white" alt="Portal Logo" />
              <div>
                <span className="text-xs font-black tracking-tight text-slate-900 block uppercase">COASTAL HAZARD PORTAL</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Balochistan Coastline</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs font-semibold">
              A state-of-the-art decision support system leveraging real-time satellite imagery, SAR backscatter models, and Google Earth Engine (GEE) algorithms to map and monitor coastal vulnerability.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="md:col-span-2 space-y-3">
            <h6 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Navigation</h6>
            <ul className="space-y-2 text-[11px] font-bold text-slate-600">
              <li><Link href="/" className="hover:text-cyan-600 transition">Home</Link></li>
              <li><Link href="/dashboard" className="hover:text-cyan-600 transition">Dashboard</Link></li>
              <li><Link href="/dashboard/analysis" className="hover:text-cyan-600 transition">GEE Live Analysis</Link></li>
              <li><Link href="/dashboard" className="hover:text-cyan-600 transition">Map Explorer</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="md:col-span-3 space-y-3">
            <h6 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Resources</h6>
            <ul className="space-y-2 text-[11px] font-bold text-slate-600">
              <li><a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 transition">API Documentation</a></li>
              <li><Link href="/dashboard" className="hover:text-cyan-600 transition">Methodology Guide</Link></li>
              <li><a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 transition">GEE Platform Console</a></li>
            </ul>
          </div>

          {/* Column 4: Partners */}
          <div className="md:col-span-3 space-y-4">
            <h6 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Partners</h6>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 bg-slate-50/50 p-2 rounded-xl border border-slate-100 shadow-sm">
                <img src="/ncgsa-logo.png" alt="NCGSA Logo" className="h-7 w-auto object-contain flex-shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-slate-800 block uppercase leading-none">NCGSA Initiative</span>
                  <span className="text-[7.5px] text-slate-500 font-semibold block leading-tight">National Center of GIS & Space Applications</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-50/50 p-2 rounded-xl border border-slate-100 shadow-sm">
                <img src="/ist-logo.png" alt="IST Logo" className="h-7 w-auto object-contain flex-shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-slate-800 block uppercase leading-none">IST Islamabad</span>
                  <span className="text-[7.5px] text-slate-500 font-semibold block leading-tight">Institute of Space Technology</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="max-w-[1400px] mx-auto px-6 pt-6 border-t border-slate-200/80 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[10px] text-slate-400 font-bold">
            &copy; {new Date().getFullYear()} Coastal Hazard Portal. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[9px] font-extrabold text-slate-500">
            <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Powered by:</span>
            {['Google Earth Engine', 'PostGIS', 'FastAPI', 'React', 'Tailwind CSS', 'Groq AI'].map((tech, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-655 shadow-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
