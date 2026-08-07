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
        className="absolute top-0 left-0 right-0 h-[680px] bg-cover bg-center pointer-events-none z-0 opacity-100"
        style={{ backgroundImage: "url('/coastal-bg.jpg')" }}
      />
      {/* Soft dark-warm shading and bottom gradient overlay to match mockup's dark-warm visible look */}
      <div className="absolute top-0 left-0 right-0 h-[680px] bg-slate-900/[0.04] z-0 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[680px] bg-gradient-to-b from-transparent via-[#f8fafc]/30 to-[#f8fafc] z-0 pointer-events-none" />
      
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
          <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all h-64 flex group">
            {/* Left Content (Text) */}
            <div className="w-[55%] p-5 flex flex-col justify-between h-full bg-white border-r border-slate-100 relative z-10">
              <div>
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3.5 border border-blue-100">
                  <Waves className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 mb-1.5 uppercase tracking-tight">Coastal Flooding</h4>
                <p className="text-[10.5px] text-slate-500 leading-relaxed font-medium">
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
          <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all h-64 flex group">
            {/* Left Content (Text) */}
            <div className="w-[55%] p-5 flex flex-col justify-between h-full bg-white border-r border-slate-100 relative z-10">
              <div>
                <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mb-3.5 border border-orange-100">
                  <Waves className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 mb-1.5 uppercase tracking-tight">Storm Surge</h4>
                <p className="text-[10.5px] text-slate-500 leading-relaxed font-medium">
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
          <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all h-64 flex group relative">
            {/* Left Content (Text) */}
            <div className="w-[55%] p-5 flex flex-col justify-between h-full bg-white border-r border-slate-100 relative z-10">
              <div>
                <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-3.5 border border-amber-100">
                  <Waves className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 mb-1.5 uppercase tracking-tight">Shoreline Erosion</h4>
                <p className="text-[10.5px] text-slate-500 leading-relaxed font-medium">
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
            {/* Split Slider Handle Visual overlay to match mockup exactly */}
            <div className="absolute top-0 bottom-0 left-[55%] w-0.5 bg-white/80 z-20 pointer-events-none" />
            <div className="absolute top-[50%] left-[55%] -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-[7px] font-bold text-slate-500 z-30 select-none pointer-events-none">
              ◀ ▶
            </div>
          </div>

          {/* Card 4: Sea Level Rise */}
          <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all h-64 flex group">
            {/* Left Content (Text) */}
            <div className="w-[55%] p-5 flex flex-col justify-between h-full bg-white border-r border-slate-100 relative z-10">
              <div>
                <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3.5 border border-emerald-100">
                  <Waves className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 mb-1.5 uppercase tracking-tight">Sea Level Rise</h4>
                <p className="text-[10.5px] text-slate-500 leading-relaxed font-medium">
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
            {/* Right Chart (with ocean background image) */}
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
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">Historical Timeline (2016-2025)</h5>
              <span className="text-[10px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full">{selectedTimelineYear}</span>
            </div>
            
            {/* Interactive Timeline Track Visual */}
            <div className="relative mb-5 mt-2 px-1 select-none">
              {/* Slider Track Line */}
              <div className="absolute left-1 right-1 top-[5px] h-1 bg-slate-100 rounded-full" />
              {/* Highlight Track Line */}
              <div 
                className="absolute left-1 h-1 bg-[#132c25] rounded-full transition-all duration-300"
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
                        ? 'bg-[#132c25] border-white scale-125 shadow-md shadow-[#132c25]/30' 
                        : 'bg-white border-slate-300 group-hover:border-slate-500 hover:scale-110'
                    }`} />
                    <span className={`text-[8px] font-black mt-1 transition-all ${
                      selectedTimelineYear === yr ? 'text-slate-900 font-extrabold' : 'text-slate-400'
                    }`}>{yr % 100}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of 5 Satellite map thumbnails matching the mockup reference */}
            <div className="grid grid-cols-5 gap-1.5 mt-4">
              {[
                { name: 'Jiwani' },
                { name: 'Gwadar' },
                { name: 'Pasni' },
                { name: 'Ormara' },
                { name: 'Sonmiani' }
              ].map((loc, idx) => (
                <div key={idx} className="h-14 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group/thumb shadow-sm">
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-85 transition-transform duration-500 group-hover/thumb:scale-110" 
                    style={{ backgroundImage: "url('/coastal-bg.jpg')" }} 
                  />
                  {/* Subtle dark bottom gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 to-transparent opacity-85" />
                  <span className="absolute bottom-1.5 left-1.5 text-[7px] text-white font-extrabold leading-none">{loc.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 mt-4">
            <Link href="/dashboard" className="text-[9.5px] font-extrabold text-[#132c25] hover:text-[#255044] flex items-center gap-1">
              <span>View full timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Column 2: Coastal Vulnerability Index */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[320px]">
          <div>
            <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider mb-3">Coastal Vulnerability Index (CVI)</h5>
            
            {/* Ring progress and side metrics */}
            <div className="flex gap-4 items-center mb-4">
              {/* Ring metric */}
              <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center drop-shadow-[0_2px_8px_rgba(234,179,8,0.15)]">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="32" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                  <circle cx="40" cy="40" r="32" stroke="url(#cviGrad)" strokeWidth="6.5" strokeLinecap="round" fill="transparent" strokeDasharray={2 * Math.PI * 32} strokeDashoffset={2 * Math.PI * 32 * (1 - 0.62)} />
                  <defs>
                    <linearGradient id="cviGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="block text-sm font-black text-slate-900 tracking-tighter">0.62</span>
                  <span className="text-[7px] text-amber-600 font-extrabold block uppercase leading-none">Moderate Risk</span>
                </div>
              </div>

              {/* Mini progress list with all 6 items from mockup */}
              <div className="flex-1 space-y-1">
                {[
                  { label: 'Population Exposure', val: 0.58, color: 'bg-emerald-500' },
                  { label: 'Infrastructure Exposure', val: 0.64, color: 'bg-yellow-500' },
                  { label: 'Elevation (Low Lying)', val: 0.71, color: 'bg-orange-500' },
                  { label: 'Storm Surge Risk', val: 0.66, color: 'bg-yellow-500' },
                  { label: 'Flood Risk', val: 0.59, color: 'bg-emerald-500' },
                  { label: 'Sea Level Rise', val: 0.63, color: 'bg-yellow-500' }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-[7px] font-extrabold text-slate-500 leading-none mb-0.5">
                      <span>{item.label}</span>
                      <span className="text-slate-800">{item.val}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.val * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 mt-4">
            <Link href="/dashboard/analysis" className="text-[9.5px] font-extrabold text-[#132c25] hover:text-[#255044] flex items-center gap-1">
              <span>View full assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Column 3: Live Alerts */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">Live Alerts</h5>
              <Link href="/dashboard" className="text-[9px] font-bold text-slate-500 hover:text-slate-900 transition">View all alerts</Link>
            </div>

            {/* Alerts stack aligned left-title right-date matching mockup */}
            <div className="space-y-3">
              {[
                { icon: AlertTriangle, title: 'Storm Surge Watch', loc: 'Gwadar Coast', date: 'May 15, 09:20 AM', color: 'text-red-500' },
                { icon: AlertTriangle, title: 'High Flood Risk', loc: 'Lasbela District', date: 'May 15, 08:45 AM', color: 'text-amber-500' },
                { icon: AlertTriangle, title: 'Shoreline Erosion Warning', loc: 'Ormara Coast', date: 'May 14, 11:15 PM', color: 'text-amber-500' },
                { icon: Info, title: 'Sea Level Rise Trend', loc: 'Increasing +8.6 mm/yr', date: 'May 14, 2025', color: 'text-cyan-500' }
              ].map((alert, idx) => (
                <div key={idx} className="flex justify-between items-start text-[9.5px] py-1.5 border-b border-slate-100 last:border-0">
                  <div className="flex gap-2.5 items-start">
                    <alert.icon className={`w-4 h-4 ${alert.color} mt-0.5`} />
                    <div>
                      <span className="font-extrabold text-slate-800 block">{alert.title}</span>
                      <span className="text-[7.5px] text-slate-400 font-semibold">{alert.loc}</span>
                    </div>
                  </div>
                  <span className="text-[8px] text-slate-400 font-medium whitespace-nowrap">{alert.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 mt-4">
            <Link href="/dashboard" className="text-[9.5px] font-extrabold text-[#132c25] hover:text-[#255044] flex items-center gap-1">
              <span>View all alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Column 4: Data Sources */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">Data Sources</h5>
              <Link href="/dashboard" className="text-[9px] font-bold text-slate-500 hover:text-slate-900 transition">View all sources</Link>
            </div>
            
            {/* Single column list with 6 checkmark items matching mockup */}
            <div className="space-y-2.5 text-[9.5px] font-bold text-slate-700">
              {[
                { label: 'Sentinel-1 / Sentinel-2' },
                { label: 'Landsat 8/9' },
                { label: 'DEM (SRTM)' },
                { label: 'PMD Tide Gauges' },
                { label: 'In-situ & Historical Data' },
                { label: 'Cyclone Track Data' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 py-1 hover:text-emerald-800 transition">
                  <span className="text-emerald-600 font-extrabold text-xs">☑</span>
                  <span className="text-[9px] text-slate-700 font-semibold">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 mt-4">
            <Link href="/dashboard" className="text-[9.5px] font-extrabold text-[#132c25] hover:text-[#255044] flex items-center gap-1">
              <span>View all sources</span>
              <ArrowRight className="w-3.5 h-3.5" />
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