'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Waves, 
  Search, 
  Sun, 
  User, 
  Play, 
  ArrowRight, 
  AlertTriangle, 
  Info, 
  Check, 
  Sparkles, 
  ChevronDown 
} from 'lucide-react';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isHazardsOpen, setIsHazardsOpen] = useState(false);
  const [selectedTimelineYear, setSelectedTimelineYear] = useState(2025);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-cyan-500/20 relative">
      
      {/* Root Full-Bleed Hero Background Image */}
      <div 
        className="absolute top-0 left-0 right-0 h-[680px] bg-cover bg-center pointer-events-none z-0 opacity-85"
        style={{ backgroundImage: "url('/coastal-bg.jpg')" }}
      />
      {/* Gradient overlays to fade to white on the right and bottom */}
      <div className="absolute top-0 left-0 right-0 h-[680px] bg-gradient-to-r from-white/10 via-white/45 to-[#f8fafc] z-0 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[680px] bg-gradient-to-b from-transparent via-transparent to-[#f8fafc] z-0 pointer-events-none" />
      
      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-3.5 flex justify-between items-center">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-md">
              <Waves className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-slate-900 block uppercase">COASTAL HAZARD PORTAL</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Balochistan Coastline</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/" className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1">
              Home
            </Link>
            <Link href="/dashboard" className="text-xs font-semibold text-slate-600 hover:text-slate-950 transition">
              Dashboard
            </Link>
            
            {/* Hazards Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsHazardsOpen(!isHazardsOpen)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-950 flex items-center gap-1 transition"
              >
                <span>Hazards</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {isHazardsOpen && (
                <div className="absolute top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl p-2 flex flex-col gap-1 z-50">
                  <Link href="/dashboard" className="text-[11px] p-2 hover:bg-slate-50 rounded-lg font-medium text-slate-700">Coastal Flooding</Link>
                  <Link href="/dashboard" className="text-[11px] p-2 hover:bg-slate-50 rounded-lg font-medium text-slate-700">Storm Surge</Link>
                  <Link href="/dashboard" className="text-[11px] p-2 hover:bg-slate-50 rounded-lg font-medium text-slate-700">Coastal Erosion</Link>
                  <Link href="/dashboard/analysis" className="text-[11px] p-2 hover:bg-slate-50 rounded-lg font-medium text-slate-700">Coastal Vulnerability</Link>
                </div>
              )}
            </div>

            <Link href="/dashboard" className="text-xs font-semibold text-slate-600 hover:text-slate-950 transition">
              Map Explorer
            </Link>
            <Link href="/dashboard" className="text-xs font-semibold text-slate-600 hover:text-slate-950 transition">
              Trends
            </Link>
            <Link href="/dashboard" className="text-xs font-semibold text-slate-600 hover:text-slate-950 transition">
              Reports
            </Link>
            <Link href="/dashboard/analysis" className="text-xs font-semibold text-slate-600 hover:text-slate-950 transition">
              AI Insights
            </Link>
            <Link href="/dashboard" className="text-xs font-semibold text-slate-600 hover:text-slate-950 transition">
              About
            </Link>
          </nav>

          {/* Right Header Section */}
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search locations, districts..." 
                className="w-56 bg-slate-50 text-slate-800 placeholder-slate-400 text-xs px-3 py-2 pl-8 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Theme Toggle */}
            <button className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition">
              <Sun className="w-4 h-4 text-slate-600" />
            </button>

            {/* Login Button */}
            <Link 
              href="/login"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-slate-900/10"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 pb-12 px-6 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1 z-10">

        {/* Hero Left Column (Info & Actions) */}
        <div className="lg:col-span-6 space-y-6">
          <h1 className="text-4xl md:text-5.5xl font-black text-slate-900 tracking-tight leading-[1.1] font-sans">
            Better Intelligence.
            <br />
            <span className="text-[#132c25]">Safer Coastlines.</span>
          </h1>

          <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-xl">
            Monitoring coastal flooding, storm surge, shoreline change and sea-level rise along Pakistan's Balochistan coastline using satellite data and AI-driven insights.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              href="/dashboard"
              className="px-6 py-3.5 bg-[#132c25] hover:bg-[#1a3a32] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-[#132c25]/10 active:scale-95"
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
              className="px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition active:scale-95 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 text-slate-500 fill-slate-500" />
              <span>Watch Overview</span>
            </Link>
          </div>
        </div>

        {/* Hero Right Column (Balochistan Coastline Overview Card) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xl shadow-slate-100/50">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
            <h3 className="font-extrabold text-sm text-slate-900 font-sans uppercase tracking-tight">Balochistan Coastline Overview</h3>
          </div>

          {/* Metric Stats Banner */}
          <div className="grid grid-cols-5 gap-2 text-center bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-4">
            <div>
              <span className="block text-xs font-black text-slate-900 font-sans">~700 km</span>
              <span className="text-[8px] text-slate-500 font-semibold block leading-tight">Coastline Monitored</span>
            </div>
            <div>
              <span className="block text-xs font-black text-slate-900 font-sans">2</span>
              <span className="text-[8px] text-slate-500 font-semibold block leading-tight">Districts Covered</span>
            </div>
            <div>
              <span className="block text-xs font-black text-slate-900 font-sans">4</span>
              <span className="text-[8px] text-slate-500 font-semibold block block leading-tight">Coastal Hazards</span>
            </div>
            <div>
              <span className="block text-xs font-black text-slate-900 font-sans">10+</span>
              <span className="text-[8px] text-slate-500 font-semibold block leading-tight">Satellite Datasets</span>
            </div>
            <div>
              <span className="block text-xs font-black text-slate-900 font-sans">2016-2025</span>
              <span className="text-[8px] text-slate-500 font-semibold block leading-tight">Historical Analysis</span>
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
          <div className="bg-slate-50 border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all h-64 relative group">
            {/* Full-opacity background image */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-100"
              style={{ backgroundImage: "url('/flooding-bg.jpg')" }}
            />
            {/* Floating glass content panel on the left */}
            <div className="relative z-10 w-[72%] h-full bg-white/95 border-r border-slate-200/50 p-5 flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3.5 border border-blue-100">
                  <Waves className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 mb-1.5 uppercase tracking-tight">Coastal Flooding</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">
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
          </div>

          {/* Card 2: Storm Surge */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all h-64 relative group">
            {/* Full-opacity background image */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-100"
              style={{ backgroundImage: "url('/surge-bg.jpg')" }}
            />
            {/* Floating glass content panel on the left */}
            <div className="relative z-10 w-[72%] h-full bg-white/95 border-r border-slate-200/50 p-5 flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mb-3.5 border border-orange-100">
                  <Waves className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 mb-1.5 uppercase tracking-tight">Storm Surge</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">
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
          </div>

          {/* Card 3: Shoreline Erosion */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all h-64 relative group">
            {/* Full-opacity background image */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-100"
              style={{ backgroundImage: "url('/erosion-bg.jpg')" }}
            />
            {/* Split Slider Handle Visual overlay to match mockup */}
            <div className="absolute top-0 bottom-0 left-[70%] w-0.5 bg-white/70 z-20 pointer-events-none" />
            <div className="absolute top-[50%] left-[70%] -translate-y-1/2 -translate-x-1/2 w-5.5 h-5.5 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-[7px] font-bold text-slate-500 z-30 select-none pointer-events-none">
              ◀ ▶
            </div>
            
            {/* Floating glass content panel on the left */}
            <div className="relative z-10 w-[70%] h-full bg-white/95 border-r border-slate-200/50 p-5 flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-3.5 border border-amber-100">
                  <Waves className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 mb-1.5 uppercase tracking-tight">Shoreline Erosion</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">
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
          </div>

          {/* Card 4: Sea Level Rise */}
          <div className="bg-gradient-to-br from-emerald-800 to-teal-950 border border-slate-200/20 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all h-64 relative group text-white">
            <div className="absolute inset-0 opacity-[0.12] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
            {/* SVG line graph path overlay */}
            <div className="absolute bottom-0 left-[70%] right-0 h-32 pointer-events-none opacity-40 select-none z-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M 0 90 Q 20 70, 40 75 T 80 35 T 100 10 L 100 100 L 0 100 Z" fill="url(#slrGrad)" />
                <path d="M 0 90 Q 20 70, 40 75 T 80 35 T 100 10" fill="transparent" stroke="#22c55e" strokeWidth="2.5" />
                <defs>
                  <linearGradient id="slrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="1" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {/* Floating glass content panel on the left */}
            <div className="relative z-20 w-[72%] h-full bg-white/95 border-r border-slate-200/50 p-5 flex flex-col justify-between shadow-xl text-slate-800">
              <div>
                <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3.5 border border-emerald-100">
                  <Waves className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 mb-1.5 uppercase tracking-tight">Sea Level Rise</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">
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
          </div>

        </div>
      </section>

      {/* Ask Coastal AI section */}
      <section className="max-w-[1400px] mx-auto px-6 py-6 w-full">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* AI Banner Title */}
          <div className="flex items-center gap-4 w-full lg:w-[30%]">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100 flex-shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-black text-sm text-slate-900">Ask Coastal AI</h4>
                <span className="text-[8px] bg-cyan-100 text-cyan-700 font-bold px-1.5 py-0.5 rounded-full uppercase">Beta</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">Ask questions, get insights, and explore coastal hazards using natural language.</p>
            </div>
          </div>

          {/* Quick Suggestions Pills */}
          <div className="flex flex-wrap gap-2 w-full lg:w-[45%] justify-start lg:justify-center">
            <button 
              onClick={() => alert("Forwarding query to GEE analysis terminal: 'Show erosion hotspots in Gwadar district'.")}
              className="text-[9px] font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full transition"
            >
              Show erosion hotspots in Gwadar district
            </button>
            <button 
              onClick={() => alert("Forwarding query to GEE analysis terminal: 'Compare flooding 2019 vs 2025'.")}
              className="text-[9px] font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full transition"
            >
              Compare flooding 2019 vs 2025
            </button>
            <button 
              onClick={() => alert("Forwarding query to GEE analysis terminal: 'Which areas are most vulnerable?'.")}
              className="text-[9px] font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full transition"
            >
              Which areas are most vulnerable?
            </button>
            <button 
              onClick={() => alert("Forwarding query to GEE analysis terminal: 'Show storm surge impact of Cyclone Biparjoy'.")}
              className="text-[9px] font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full transition"
            >
              Show storm surge impact of Cyclone Biparjoy
            </button>
          </div>

          {/* Input field */}
          <div className="relative w-full lg:w-[25%]">
            <input 
              type="text" 
              placeholder="Ask anything about coastal hazards..."
              className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 text-xs px-3 py-2.5 pr-10 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  alert(`AI Search submitted: "${(e.target as HTMLInputElement).value}"`);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <button 
              onClick={() => alert("AI Search submitted.")}
              className="absolute right-2.5 top-2.5 w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-white"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* Historical, CVI, Alerts, and Data Sources Bottom Grid */}
      <section className="max-w-[1400px] mx-auto px-6 py-6 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Column 1: Historical Timeline */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col justify-between min-h-[300px]">
          <div>
            <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider mb-3">Historical Timeline (2016-2025)</h5>
            
            {/* Years timeline dots scrollable */}
            <div className="flex gap-2.5 border-b border-slate-100 pb-3 mb-3 overflow-x-auto select-none">
              {[2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map((yr) => (
                <button 
                  key={yr}
                  onClick={() => setSelectedTimelineYear(yr)}
                  className={`text-[9px] font-bold pb-1 transition flex-shrink-0 ${
                    selectedTimelineYear === yr ? 'text-slate-900 border-b border-slate-900' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            {/* Grid of Satellite map thumbnails */}
            <div className="grid grid-cols-3 gap-2">
              <div className="h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
                <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('/coastal-bg.jpg')" }} />
                <span className="absolute bottom-1 right-1 text-[8px] bg-slate-950/70 text-white px-1 rounded font-bold">Jiwani</span>
              </div>
              <div className="h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
                <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('/coastal-bg.jpg')" }} />
                <span className="absolute bottom-1 right-1 text-[8px] bg-slate-950/70 text-white px-1 rounded font-bold">Gwadar</span>
              </div>
              <div className="h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
                <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('/coastal-bg.jpg')" }} />
                <span className="absolute bottom-1 right-1 text-[8px] bg-slate-950/70 text-white px-1 rounded font-bold">Pasni</span>
              </div>
              <div className="h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
                <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('/coastal-bg.jpg')" }} />
                <span className="absolute bottom-1 right-1 text-[8px] bg-slate-950/70 text-white px-1 rounded font-bold">Ormara</span>
              </div>
              <div className="h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
                <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('/coastal-bg.jpg')" }} />
                <span className="absolute bottom-1 right-1 text-[8px] bg-slate-950/70 text-white px-1 rounded font-bold">Kund M.</span>
              </div>
              <div className="h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
                <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('/coastal-bg.jpg')" }} />
                <span className="absolute bottom-1 right-1 text-[8px] bg-slate-950/70 text-white px-1 rounded font-bold">Sonmiani</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 mt-3">
            <Link href="/dashboard" className="text-[9px] font-extrabold text-slate-600 hover:text-slate-900 flex items-center gap-1">
              <span>View full timeline</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Column 2: Coastal Vulnerability Index */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col justify-between min-h-[300px]">
          <div>
            <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider mb-3">Coastal Vulnerability Index (CVI)</h5>
            
            {/* Ring progress and side metrics */}
            <div className="flex gap-4 items-center">
              {/* Ring metric */}
              <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="32" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                  <circle cx="40" cy="40" r="32" stroke="#eab308" strokeWidth="6" fill="transparent" strokeDasharray={2 * Math.PI * 32} strokeDashoffset={2 * Math.PI * 32 * (1 - 0.62)} />
                </svg>
                <div className="absolute text-center">
                  <span className="block text-sm font-black text-slate-900">0.62</span>
                  <span className="text-[7px] text-slate-400 font-bold block uppercase leading-none">Mod Risk</span>
                </div>
              </div>

              {/* Mini progress list */}
              <div className="flex-1 space-y-1.5">
                <div>
                  <div className="flex justify-between text-[7px] font-bold text-slate-500 leading-none mb-0.5">
                    <span>Population Exposure</span>
                    <span>0.58</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full" style={{ width: '58%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[7px] font-bold text-slate-500 leading-none mb-0.5">
                    <span>Infrastructure Exp</span>
                    <span>0.64</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full" style={{ width: '64%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[7px] font-bold text-slate-500 leading-none mb-0.5">
                    <span>Elevation (Low Lying)</span>
                    <span>0.71</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full" style={{ width: '71%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Remaining metrics */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-1.5">
                <span className="block text-[8px] text-slate-500 font-bold leading-tight">Storm Surge</span>
                <span className="text-xs font-black text-slate-900">0.66</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-1.5">
                <span className="block text-[8px] text-slate-500 font-bold leading-tight">Flood Risk</span>
                <span className="text-xs font-black text-slate-900">0.59</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-1.5">
                <span className="block text-[8px] text-slate-500 font-bold leading-tight">Sea Level Rise</span>
                <span className="text-xs font-black text-slate-900">0.63</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 mt-3">
            <Link href="/dashboard/analysis" className="text-[9px] font-extrabold text-slate-600 hover:text-slate-900 flex items-center gap-1">
              <span>View full assessment</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Column 3: Live Alerts */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
              <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">Live Alerts</h5>
            </div>

            {/* Alerts stack */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[9px] font-bold text-slate-800 leading-tight">Storm Surge Watch</span>
                  <span className="text-[8px] text-slate-400 block leading-tight">Gwadar Coast &bull; May 15, 09:20 AM</span>
                </div>
              </div>

              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[9px] font-bold text-slate-800 leading-tight">High Flood Risk</span>
                  <span className="text-[8px] text-slate-400 block leading-tight">Lasbela District &bull; May 15, 08:45 AM</span>
                </div>
              </div>

              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[9px] font-bold text-slate-800 leading-tight">Shoreline Erosion Warning</span>
                  <span className="text-[8px] text-slate-400 block leading-tight">Ormara Coast &bull; May 14, 11:15 PM</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Info className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[9px] font-bold text-slate-800 leading-tight">Sea Level Rise Trend</span>
                  <span className="text-[8px] text-slate-400 block leading-tight">Increasing +8.6 mm/yr &bull; May 14, 2025</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 mt-3">
            <Link href="/dashboard" className="text-[9px] font-extrabold text-slate-600 hover:text-slate-900 flex items-center gap-1">
              <span>View all alerts</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Column 4: Data Sources */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col justify-between min-h-[300px]">
          <div>
            <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider mb-3">Data Sources</h5>
            
            {/* List with styled text tags */}
            <div className="grid grid-cols-2 gap-2 text-[9px] font-semibold text-slate-700">
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center gap-1">
                <span>🛰️ Sentinel-1/2</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center gap-1">
                <span>🛰️ Landsat 8/9</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center gap-1">
                <span>⛰️ DEM (SRTM)</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center gap-1">
                <span>📊 PMD Tide Gauges</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center gap-1">
                <span>📁 In-situ Data</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center gap-1">
                <span>🌀 Cyclone Track</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 mt-3">
            <Link href="/dashboard" className="text-[9px] font-extrabold text-slate-600 hover:text-slate-900 flex items-center gap-1">
              <span>View all sources</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

      </section>

      {/* Footer Branding Banner */}
      <footer className="bg-slate-100 border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* NCGSA */}
          <div className="flex items-center gap-3 justify-start">
            <img src="/ncgsa-logo.png" alt="NCGSA Logo" className="h-10 w-auto object-contain flex-shrink-0" />
            <div>
              <span className="text-[9px] font-black text-slate-900 block uppercase">A Project of NCGSA Initiative</span>
              <span className="text-[8px] text-slate-500 font-semibold block uppercase tracking-wider leading-none">National Center of GIS & Space Applications</span>
              <span className="text-[8px] text-slate-400 block leading-tight">National Cloud & Geo-Spatial Analytics</span>
            </div>
          </div>

          {/* Built With logos */}
          <div className="flex flex-col items-center justify-center gap-1.5">
            <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Built with</span>
            <div className="flex flex-wrap items-center justify-center gap-4 text-[9px] font-bold text-slate-600 select-none">
              <span>Google Earth Engine</span>
              <span>PostGIS</span>
              <span>FastAPI</span>
              <span>React</span>
              <span>Tailwind CSS</span>
              <span>Groq AI</span>
            </div>
          </div>

          {/* IST */}
          <div className="flex items-center gap-3 justify-end">
            <div className="text-right">
              <span className="text-[9px] font-black text-slate-900 block uppercase">Institute of Space Technology (IST)</span>
              <span className="text-[8px] text-slate-500 font-semibold block uppercase tracking-wider leading-none">Islamabad, Pakistan</span>
              <span className="text-[8px] text-slate-400 block leading-tight">Space Science & Geoinformatics</span>
            </div>
            <img src="/ist-logo.png" alt="IST Logo" className="h-10 w-auto object-contain flex-shrink-0" />
          </div>

        </div>
      </footer>

    </div>
  );
}