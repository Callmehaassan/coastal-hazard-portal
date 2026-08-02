'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Waves, Satellite, BarChart3, Shield, Bot, Calendar, Globe, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed text-white flex flex-col font-sans overflow-x-hidden selection:bg-cyan-500/30 relative"
      style={{ backgroundImage: "url('/bg-sunset.jpg')" }}
    >
      {/* Dark overlay to match the deep blue style and ensure readability */}
      <div className="absolute inset-0 bg-[#070e1b]/80 backdrop-blur-[3px] pointer-events-none -z-10" />

      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-white/10 bg-[#070e1b]/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm md:text-base font-bold tracking-tight block">COASTAL HAZARD PORTAL</span>
              <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider block">Balochistan Coastline</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 glass-sm px-3.5 py-1.5 text-[11px] text-slate-300">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Data Platform:</span>
              <strong className="text-white">Google Earth Engine</strong>
            </div>

            <Link
              href="/dashboard"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500/15 to-blue-500/5 border border-cyan-500/25 hover:border-cyan-500/40 text-cyan-400 hover:text-white hover:bg-cyan-500/10 text-xs font-bold text-center block transition-all shadow-inner active:scale-95"
            >
              Explore Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center pt-32 pb-20 px-6 max-w-7xl mx-auto w-full relative">
        <div className="text-center max-w-3xl space-y-6">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold tracking-wider uppercase mx-auto animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NCGSA Summer Internship 2026</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tight text-white">
            Pakistan Coastal Hazard
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
              Monitoring & Analysis Portal
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Consolidating multi-mission Earth observation data (Sentinel-1 SAR, Sentinel-2, Landsat 8/9) and Google Earth Engine models to monitor flooding, storm surge, shoreline change, and sea-level rise along the Balochistan coastline.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm hover:shadow-2xl hover:shadow-cyan-500/50 hover:brightness-110 active:scale-95 transition-all"
            >
              <span>Launch Interactive Dashboard</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>

            <Link
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault();
                alert("The methodology documentation is available in the dashboard panel by clicking 'View Methodology' at the bottom right.");
              }}
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-sm hover:bg-white/10 hover:text-white transition-all active:scale-95"
            >
              Read Methodology
            </Link>
          </div>
        </div>

        {/* Features Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-24">
          {[
            {
              icon: Waves,
              label: 'Real-time Inundation',
              desc: 'Monitors flood extent utilizing Sentinel-1 C-band Synthetic Aperture Radar (SAR) polarization amplitude change detection.',
              color: 'border-l-cyan-400'
            },
            {
              icon: Satellite,
              label: 'Shoreline Change Analysis',
              desc: 'Compares MNDWI shoreline vectors against the 2016 baseline year to monitor land lost to erosion or gained by accretion.',
              color: 'border-l-emerald-500'
            },
            {
              icon: BarChart3,
              label: 'Sea Level Anomaly Grid',
              desc: 'Integrates radar altimeter anomalies to track regional sea-level variations and annual tide gauge indicators in real time.',
              color: 'border-l-sky-400'
            },
            {
              icon: Bot,
              label: 'Ask Coastal AI',
              desc: 'Natural language chat queries linking GEE databases directly to planners for prompt environmental decision support.',
              color: 'border-l-purple-500'
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className={`glass p-6 bg-[#0f172a]/35 hover:bg-[#0f172a]/45 transition border-l-4 ${feature.color} border-white/10 shadow-lg flex flex-col justify-between rounded-2xl`}
            >
              <div>
                <feature.icon className="w-8 h-8 text-cyan-400 mb-4" />
                <h3 className="font-bold text-sm text-white mb-2">{feature.label}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 bg-[#070e1b]/40">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>Protecting Coasts, Empowering Communities &bull; NCGSA Initiative</p>
          <p>&copy; 2025 All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}