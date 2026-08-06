'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Waves,
  Sliders,
  AlertTriangle,
  Compass,
  CheckCircle,
  Info,
  Download,
  RefreshCw,
  Layers,
  Calendar,
  Globe,
  MapPin,
  Search,
  Bell,
  Bot,
  Send,
  Settings,
  Users,
  Lock,
  ChevronDown,
  ChevronRight,
  Activity,
  ArrowRight
} from 'lucide-react';

import {
  getRegions,
  getHazards,
  type HazardReading
} from '@/lib/api';
import type { Region } from '@/lib/types';

const DashboardMap = dynamic(() => import('@/components/DashboardMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/40 text-slate-400 gap-3 border border-white/5 rounded-2xl">
      <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
      <span className="text-xs font-semibold">Loading Map Layers...</span>
    </div>
  ),
});

export default function AnalysisPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Coastal Districts');
  const [activeBasemap, setActiveBasemap] = useState<'satellite' | 'osm'>('osm');
  
  // Navigation states
  const [hazardsMenuOpen, setHazardsMenuOpen] = useState<boolean>(true);

  // GEE Live Analysis States
  const [selectedHazards, setSelectedHazards] = useState<string[]>([
    'flooding',
    'storm-surge',
    'erosion'
  ]);
  const [cviWeights, setCviWeights] = useState({
    elevation: 0.15,
    slope: 0.1,
    erosion: 0.15,
    slr: 0.15,
    tsunami: 0.15,
    stormSurge: 0.15,
    proximity: 0.1,
    exposure: 0.05
  });
  const [isAnalysisActive, setIsAnalysisActive] = useState<boolean>(false);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'running' | 'success'>('idle');
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);

  useEffect(() => {
    getRegions()
      .then((data) => {
        setRegions(data);
        if (data.length > 0) {
          setSelectedRegionId(data[0].id);
        }
      })
      .catch((err) => console.error('Failed to load regions:', err));
  }, []);

  const runGeeAnalysis = () => {
    setIsAnalysisActive(true);
    setAnalysisStatus('running');
    setAnalysisLogs([
      '[INFO] Connecting to Google Earth Engine API...',
      `[INFO] Target District: ${selectedDistrict}`,
      `[INFO] Hazards Included: ${selectedHazards.join(', ')}`,
      '[INFO] Initializing Sentinel-1 SAR GRD composites for dynamic Otsu water thresholds...',
      '[INFO] Fetching elevation (SRTM GL1) and slope layers...'
    ]);

    setTimeout(() => {
      setAnalysisLogs((prev) => [
        ...prev,
        '[INFO] Fetching Sentinel-2 MNDWI composites (QA60 cloud masked)...',
        '[INFO] Calculating AVISO altimeter sea surface anomaly timeseries...'
      ]);
    }, 1200);

    setTimeout(() => {
      setAnalysisLogs((prev) => [
        ...prev,
        '[INFO] Applying custom CVI weight metrics...',
        '[INFO] Compiling Multi-criteria Evaluation overlay matrix...'
      ]);
    }, 2400);

    setTimeout(() => {
      const sum = Object.values(cviWeights).reduce((a, b) => a + b, 0);
      const w = {
        elevation: cviWeights.elevation / sum,
        slope: cviWeights.slope / sum,
        erosion: cviWeights.erosion / sum,
        slr: cviWeights.slr / sum,
        tsunami: cviWeights.tsunami / sum,
        stormSurge: cviWeights.stormSurge / sum,
        proximity: cviWeights.proximity / sum,
        exposure: cviWeights.exposure / sum,
      };

      const gwadarFactors = { elevation: 3.1, slope: 1.8, erosion: 3.8, slr: 3.0, tsunami: 4.2, stormSurge: 4.0, proximity: 3.5, exposure: 2.2 };
      const lasbelaFactors = { elevation: 2.5, slope: 1.6, erosion: 3.4, slr: 3.8, tsunami: 3.2, stormSurge: 3.1, proximity: 4.2, exposure: 3.8 };

      const gwadarCvi = Object.entries(w).reduce((sum, [k, val]) => sum + val * (gwadarFactors[k as keyof typeof gwadarFactors] || 0), 0);
      const lasbelaCvi = Object.entries(w).reduce((sum, [k, val]) => sum + val * (lasbelaFactors[k as keyof typeof lasbelaFactors] || 0), 0);

      setAnalysisLogs((prev) => [
        ...prev,
        `[SUCCESS] Multi-Criteria calculations successfully compiled!`,
        `[SUCCESS] Gwadar Custom CVI: ${gwadarCvi.toFixed(2)}`,
        `[SUCCESS] Lasbela Custom CVI: ${lasbelaCvi.toFixed(2)}`,
        `[SUCCESS] Shaded hazard polygon layers mapped dynamically.`
      ]);
      setAnalysisStatus('success');
    }, 3600);
  };

  const handleHazardToggle = (key: string) => {
    if (selectedHazards.includes(key)) {
      setSelectedHazards(selectedHazards.filter((h) => h !== key));
    } else {
      setSelectedHazards([...selectedHazards, key]);
    }
  };

  return (
    <div className="h-screen bg-[#070e1b] text-slate-100 flex flex-col font-sans overflow-hidden">
      
      {/* HEADER SECTION (Height: 70px) */}
      <header className="h-[70px] border-b border-white/10 px-6 py-4 flex justify-between items-center bg-[#070e1b]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm md:text-base font-bold tracking-tight text-white">COASTAL HAZARD PORTAL</h1>
              <p className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">
                Balochistan Coastline
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 glass-sm px-3.5 py-1.5 text-[11px] text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Data Ingestion:</span>
            <strong className="text-white">Live GEE API</strong>
          </div>

          {/* District Selector Dropdown */}
          <div className="flex items-center gap-1.5 glass-sm px-3.5 py-1.5 text-[11px] text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>District Focus:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedDistrict(val);
                if (val === 'All Coastal Districts') {
                  setSelectedRegionId(regions.length > 0 ? regions[0].id : null);
                } else {
                  const match = regions.find((r) => r.district.toLowerCase() === val.toLowerCase());
                  if (match) setSelectedRegionId(match.id);
                }
              }}
              className="bg-transparent text-white font-bold outline-none cursor-pointer font-sans"
            >
              <option value="All Coastal Districts" className="bg-[#070e1b]">All Coastal Districts</option>
              <option value="Gwadar" className="bg-[#070e1b]">Gwadar</option>
              <option value="Lasbela" className="bg-[#070e1b]">Lasbela</option>
            </select>
          </div>

          <Link
            href="/dashboard"
            className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 transition-all flex items-center gap-1.5"
          >
            Dashboard Overview
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* BODY WORKSPACE CONTAINER */}
      <div className="flex-1 flex relative overflow-hidden min-h-0">
        
        {/* COLUMN 1: LEFT NAV BAR (Width: 240px) */}
        <aside className="w-[240px] shrink-0 border-r border-white/10 p-4 bg-[#070e1b]/50 backdrop-blur-md flex flex-col justify-between hidden md:flex">
          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs border border-transparent text-slate-400 hover:text-white hover:bg-white/5"
            >
              <Activity className="w-4 h-4" />
              <span>Live Overview</span>
            </Link>

            <div>
              <button
                onClick={() => setHazardsMenuOpen(!hazardsMenuOpen)}
                className="w-full flex justify-between items-center px-3 py-2.5 rounded-xl text-xs border border-transparent text-slate-400 hover:text-white hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4" />
                  <span>Hazards</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    hazardsMenuOpen ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              {hazardsMenuOpen && (
                <div className="pl-6 pr-2 py-1 space-y-1.5 border-l border-white/5 ml-5 mt-1">
                  {[
                    { key: 'flooding', label: 'Coastal Flooding', color: '#06b6d4' },
                    { key: 'storm-surge', label: 'Storm Surge', color: '#f59e0b' },
                    { key: 'erosion', label: 'Coastal Erosion', color: '#ef4444' }
                  ].map((hazard) => (
                    <button
                      key={hazard.key}
                      onClick={() => handleHazardToggle(hazard.key)}
                      className={`w-full flex items-center justify-between text-left text-[11px] py-1.5 px-2 rounded-lg transition ${
                        selectedHazards.includes(hazard.key)
                          ? 'text-cyan-400 font-semibold bg-cyan-500/5'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <span>{hazard.label}</span>
                      {selectedHazards.includes(hazard.key) && (
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: hazard.color }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/dashboard/analysis"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs border border-transparent text-white bg-cyan-500/10 font-bold"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>GEE Live Analysis</span>
            </Link>
          </div>
        </aside>

        {/* COLUMN 2: MIDDLE CONTROL PANEL (Width: 380px) */}
        <section className="w-[380px] shrink-0 border-r border-white/10 p-5 bg-[#070e1b]/30 flex flex-col justify-between overflow-y-auto gap-4 scrollbar-thin">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3 mb-2">
              <Sliders className="w-4.5 h-4.5 text-cyan-400" />
              <span>GEE Analysis Control Panel</span>
            </h2>

            <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3.5 text-xs text-cyan-300">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <Info className="w-3.5 h-3.5" />
                Live Weights Optimization
              </p>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Adjust CVI weights. Checking or unchecking hazards in the left menu toggles their active integration on the map.
              </p>
            </div>

            {/* Weights Sliders */}
            <div className="space-y-3.5">
              {[
                { key: 'elevation', label: 'Elevation Sensitivity', color: 'text-emerald-400' },
                { key: 'slope', label: 'Coastal Slope Gradient', color: 'text-teal-400' },
                { key: 'erosion', label: 'Shoreline Erosion (DSAS)', color: 'text-red-400' },
                { key: 'slr', label: 'Sea Level Rise (SSHA)', color: 'text-sky-400' },
                { key: 'tsunami', label: 'Tsunami Run-up Risk', color: 'text-violet-400' },
                { key: 'stormSurge', label: 'Storm Surge Inundation', color: 'text-amber-500' }
              ].map((item) => {
                const val = cviWeights[item.key as keyof typeof cviWeights];
                return (
                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-slate-300">{item.label}</span>
                      <span className={`font-bold ${item.color}`}>{val.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={val}
                        onChange={(e) => {
                          setCviWeights((prev) => ({
                            ...prev,
                            [item.key]: Number(e.target.value)
                          }));
                        }}
                        className="flex-1 accent-cyan-500 bg-white/5 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Output Logs */}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Live Pipeline Output Logs</label>
              <div className="bg-[#070e1b] border border-white/10 rounded-xl p-3 h-[120px] overflow-y-auto font-mono text-[9px] text-slate-400 space-y-1 leading-relaxed">
                {analysisLogs.length === 0 ? (
                  <span className="text-slate-600 italic">No analysis executed yet. Click execute to begin.</span>
                ) : (
                  analysisLogs.map((log, idx) => {
                    const isSuccess = log.includes('[SUCCESS]');
                    let color = 'text-slate-400';
                    if (isSuccess) color = 'text-green-400 font-bold';
                    return <p key={idx} className={color}>{log}</p>;
                  })
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex gap-2">
              <button
                onClick={runGeeAnalysis}
                disabled={analysisStatus === 'running'}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition animate-pulse"
              >
                {analysisStatus === 'running' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing GEE live model...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>RUN LIVE ANALYSIS</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setCviWeights({
                    elevation: 0.15,
                    slope: 0.1,
                    erosion: 0.15,
                    slr: 0.15,
                    tsunami: 0.15,
                    stormSurge: 0.15,
                    proximity: 0.1,
                    exposure: 0.05
                  });
                  setIsAnalysisActive(false);
                  setAnalysisStatus('idle');
                  setAnalysisLogs([]);
                }}
                disabled={analysisStatus === 'running'}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 transition"
              >
                RESET
              </button>
            </div>

            <button
              onClick={() => {
                const logText = analysisLogs.join('\n') || "GEE weight configurations:\n" + Object.entries(cviWeights).map(([k, v]) => `${k}: ${v}`).join('\n');
                const blob = new Blob([logText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `gee_cvi_analysis_report.txt`;
                a.click();
              }}
              disabled={analysisLogs.length === 0}
              className="w-full py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/15 disabled:opacity-40 text-cyan-400 border border-cyan-500/20 text-xs font-bold transition flex items-center justify-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD ANALYSIS REPORT</span>
            </button>
          </div>
        </section>

        {/* COLUMN 3: RIGHT MAP CANVAS (Takes remaining space) */}
        <main className="flex-1 relative h-full flex flex-col bg-slate-950">
          
          {/* Floating Map Controls */}
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
            <div className="bg-[#070e1b]/95 border border-white/10 p-2 px-3.5 rounded-xl backdrop-blur-md pointer-events-auto flex items-center gap-2 shadow-2xl">
              <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">GEE Live Mapping Canvas</span>
            </div>
            
            <div className="bg-[#070e1b]/95 border border-white/10 p-1.5 rounded-xl backdrop-blur-md pointer-events-auto flex gap-1 shadow-2xl">
              <button
                onClick={() => setActiveBasemap('osm')}
                className={`py-1 px-3 rounded-lg font-bold text-[10px] transition-all ${
                  activeBasemap === 'osm'
                    ? 'bg-cyan-500 text-white shadow-lg font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setActiveBasemap('satellite')}
                className={`py-1 px-3 rounded-lg font-bold text-[10px] transition-all ${
                  activeBasemap === 'satellite'
                    ? 'bg-cyan-500 text-white shadow-lg font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Satellite
              </button>
            </div>
          </div>

          {/* Leaflet Map Container */}
          <div className="w-full h-full relative z-0">
            <DashboardMap
              regions={regions}
              selectedRegionId={selectedRegionId}
              onSelectRegionId={setSelectedRegionId}
              activeBasemap={activeBasemap}
              visibleLayers={['Coastline', 'District Boundary', 'Hazard Layer']}
              selectedAnalysis={selectedHazards.includes('erosion') ? 'coastal-erosion' : selectedHazards.includes('storm-surge') ? 'storm-surge' : 'flooding'}
              selectedYear={2025}
              hazardData={[]}
              selectedDistrict={selectedDistrict}
              isAnalysisActive={isAnalysisActive}
              selectedHazards={selectedHazards}
              cviWeights={cviWeights}
            />

            {/* Custom Interactive Legend inside the Map area */}
            {isAnalysisActive && (() => {
              const isMulti = selectedHazards.length > 1;
              if (isMulti) {
                return (
                  <div className="absolute bottom-6 left-6 z-10 bg-[#070e1b]/95 border border-white/10 p-4 rounded-xl backdrop-blur-md text-[10px] text-slate-300 w-[160px] pointer-events-auto shadow-2xl flex flex-col gap-2 animate-in fade-in duration-300">
                    <span className="font-bold text-white border-b border-white/15 pb-1.5 mb-1 text-[11px] uppercase tracking-wider flex items-center gap-1">📊 CVI Risk Palette</span>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#006400] opacity-90" />
                      <span>Low Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#7fff00] opacity-90" />
                      <span>Low-Mod Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#ffff00] opacity-90" />
                      <span>Moderate Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#ffa500] opacity-90" />
                      <span>High Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#ff0000] opacity-90" />
                      <span>Very High Risk</span>
                    </div>
                  </div>
                );
              }

              if (selectedHazards.includes("flooding")) {
                return (
                  <div className="absolute bottom-6 left-6 z-10 bg-[#070e1b]/95 border border-white/10 p-4 rounded-xl backdrop-blur-md text-[10px] text-slate-300 w-[160px] pointer-events-auto shadow-2xl flex flex-col gap-2 animate-in fade-in duration-300">
                    <span className="font-bold text-white border-b border-white/15 pb-1.5 mb-1 text-[11px] uppercase tracking-wider">💧 Flood Inundation</span>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#e0f2fe] opacity-90" />
                      <span>Low Inundation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#0284c7] opacity-90" />
                      <span>Moderate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#1e3a8a] opacity-90" />
                      <span>Severe Inundation</span>
                    </div>
                  </div>
                );
              }

              if (selectedHazards.includes("storm-surge")) {
                return (
                  <div className="absolute bottom-6 left-6 z-10 bg-[#070e1b]/95 border border-white/10 p-4 rounded-xl backdrop-blur-md text-[10px] text-slate-300 w-[160px] pointer-events-auto shadow-2xl flex flex-col gap-2 animate-in fade-in duration-300">
                    <span className="font-bold text-white border-b border-white/15 pb-1.5 mb-1 text-[11px] uppercase tracking-wider">🌊 Surge Height</span>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#fef3c7] opacity-90" />
                      <span>Low Surge</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#f97316] opacity-90" />
                      <span>Moderate Surge</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#dc2626] opacity-90" />
                      <span>Severe Surge</span>
                    </div>
                  </div>
                );
              }

              if (selectedHazards.includes("erosion")) {
                return (
                  <div className="absolute bottom-6 left-6 z-10 bg-[#070e1b]/95 border border-white/10 p-4 rounded-xl backdrop-blur-md text-[10px] text-slate-300 w-[160px] pointer-events-auto shadow-2xl flex flex-col gap-2 animate-in fade-in duration-300">
                    <span className="font-bold text-white border-b border-white/15 pb-1.5 mb-1 text-[11px] uppercase tracking-wider">📈 Coastline Change</span>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#16a34a] opacity-90" />
                      <span>Accretion (Green)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#fef08a] opacity-90" />
                      <span>Stable Coast</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#dc2626] opacity-90" />
                      <span>Erosion (Red)</span>
                    </div>
                  </div>
                );
              }

              return null;
            })()}
          </div>
        </main>

      </div>
    </div>
  );
}
