'use client';

import { AuthGuard } from '@/components/AuthGuard';


import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Waves,
  ArrowLeft,
  Calendar,
  MapPin,
  TrendingUp,
  BarChart3,
  Shield,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  Sun,
  Moon,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { getRegions, exportReport, getHazards } from "@/lib/api";
import type { Region } from "@/lib/types";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Hotspot Metadata Helper
function getHotspotMeta(name: string, district: string, hazard: string) {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes("jiwani")) {
    return {
      description: "Jiwani coastal estuary and fishery harbor zone located near the Pakistan-Iran border. Monitored for estuarine flood inundation, monsoon wave erosion, and tsunami run-up vulnerability.",
      population: "31,200",
      vulnerableArea: "14.5 km²",
      shorelineBuffer: "3.2 km"
    };
  } else if (nameLower.includes("tombolo") || nameLower.includes("spit")) {
    return {
      description: "Gwadar Tombolo sand spit connecting Koh-e-Batil headland to mainland Gwadar. Highly sensitive low-lying sand neck subject to rapid shoreline erosion and storm wave overwash.",
      population: "42,800",
      vulnerableArea: "8.2 km²",
      shorelineBuffer: "1.8 km"
    };
  } else if (nameLower.includes("pasni")) {
    return {
      description: "Pasni coastal town and Shadi Kaur river basin. Proximity to the 1945 Makran tsunami epicenter makes this a high-priority monitoring zone for seismic tsunami run-up and flash floods.",
      population: "64,100",
      vulnerableArea: "22.4 km²",
      shorelineBuffer: "4.5 km"
    };
  } else if (nameLower.includes("ormara")) {
    return {
      description: "Ormara hammerhead peninsula and East Bay naval jetty area. Vulnerable to tropical cyclone storm surge inundation, high tide flooding, and sea-level rise anomalies.",
      population: "28,600",
      vulnerableArea: "11.7 km²",
      shorelineBuffer: "2.6 km"
    };
  } else if (nameLower.includes("sonmiani") || nameLower.includes("damb")) {
    return {
      description: "Sonmiani Bay and Miani Hor mangrove estuary in Lasbela district. Characterized by extensive mudflats, active barrier sand spits, and severe estuarine flood inundation.",
      population: "53,400",
      vulnerableArea: "34.8 km²",
      shorelineBuffer: "6.1 km"
    };
  } else if (nameLower.includes("gadani")) {
    return {
      description: "Gadani coastal resort and shipbreaking coast. High wave energy concentration causing annual coastal erosion retreat rates exceeding 2.0 meters/year.",
      population: "24,900",
      vulnerableArea: "9.6 km²",
      shorelineBuffer: "2.1 km"
    };
  } else if (nameLower.includes("kund malir") || nameLower.includes("hingol")) {
    return {
      description: "Kund Malir coastal beach and Hingol River delta mouth. Active deltaic flood basin exposed to flash flooding during Arabian Sea monsoon cyclones.",
      population: "14,300",
      vulnerableArea: "18.1 km²",
      shorelineBuffer: "3.8 km"
    };
  }

  return {
    description: `Comprehensive environmental risk assessment profile for ${name} in ${district} district, consolidating Sentinel SAR flood maps, shoreline DSAS calculations, and weather station metrics.`,
    population: district.toLowerCase() === "gwadar" ? "263,500" : "574,292",
    vulnerableArea: district.toLowerCase() === "gwadar" ? "12,637 km²" : "15,153 km²",
    shorelineBuffer: district.toLowerCase() === "gwadar" ? "280 km" : "150 km"
  };
}

export default function DistrictDetailPage({ params }: { params: { district: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const districtName = params.district || "gwadar";
  const activeHazard = searchParams.get("hazard") || "coastal-erosion";
  const hotspotName = searchParams.get("hotspot") || "";

  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [matchedRegion, setMatchedRegion] = useState<Region | null>(null);

  const [exportLoading, setExportLoading] = useState<{ csv: boolean; pdf: boolean }>({
    csv: false,
    pdf: false,
  });
  const [downloadUrl, setDownloadUrl] = useState<{ csv: string | null; pdf: string | null }>({
    csv: null,
    pdf: null,
  });

  const [data, setData] = useState<{
    population: string;
    area: string;
    coastline: string;
    riskLevel: "High" | "Medium" | "Low";
    history: { year: number; flooding: number; surge: number; erosion: number; seaLevel: number; [key: string]: number }[];
  }>({
    population: districtName.toLowerCase() === "gwadar" ? "263,500" : "574,292",
    area: districtName.toLowerCase() === "gwadar" ? "12,637 km²" : "15,153 km²",
    coastline: districtName.toLowerCase() === "gwadar" ? "280 km" : "150 km",
    riskLevel: "High",
    history: [
      { year: 2016, flooding: 500, surge: 0.4, erosion: -0.8, seaLevel: 2.1, "coastal-erosion": -0.8, "storm-surge": 0.4, "sea-level-rise": 2.1 },
      { year: 2017, flooding: 700, surge: 0.6, erosion: -1.1, seaLevel: 2.4, "coastal-erosion": -1.1, "storm-surge": 0.6, "sea-level-rise": 2.4 },
      { year: 2018, flooding: 600, surge: 0.5, erosion: -0.9, seaLevel: 2.6, "coastal-erosion": -0.9, "storm-surge": 0.5, "sea-level-rise": 2.6 },
      { year: 2019, flooding: 800, surge: 0.8, erosion: -1.4, seaLevel: 2.8, "coastal-erosion": -1.4, "storm-surge": 0.8, "sea-level-rise": 2.8 },
      { year: 2020, flooding: 850, surge: 0.9, erosion: -2.1, seaLevel: 3.0, "coastal-erosion": -2.1, "storm-surge": 0.9, "sea-level-rise": 3.0 },
      { year: 2021, flooding: 1100, surge: 1.2, erosion: -1.8, seaLevel: 3.2, "coastal-erosion": -1.8, "storm-surge": 1.2, "sea-level-rise": 3.2 },
      { year: 2022, flooding: 1400, surge: 1.1, erosion: -1.6, seaLevel: 3.4, "coastal-erosion": -1.6, "storm-surge": 1.1, "sea-level-rise": 3.4 },
      { year: 2023, flooding: 1750, surge: 1.5, erosion: -2.4, seaLevel: 3.6, "coastal-erosion": -2.4, "storm-surge": 1.5, "sea-level-rise": 3.6 },
      { year: 2024, flooding: 2100, surge: 1.7, erosion: -2.0, seaLevel: 3.8, "coastal-erosion": -2.0, "storm-surge": 1.7, "sea-level-rise": 3.8 },
      { year: 2025, flooding: 2600, surge: 1.8, erosion: -2.5, seaLevel: 4.2, "coastal-erosion": -2.5, "storm-surge": 1.8, "sea-level-rise": 4.2 },
    ],
  });

  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setDarkMode(saved);

    getRegions()
      .then((regList) => {
        setRegions(regList);
        const match = regList.find(
          (r) => r.district.toLowerCase() === districtName.toLowerCase()
        );
        if (match) setMatchedRegion(match);

        // Fetch real historical hazard data from backend
        getHazards(activeHazard, match ? match.district : undefined, 2016, 2025).then((readings) => {
          if (readings && readings.length > 0) {
            const mappedHistory = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map((yr) => {
              const r = readings.find((item) => item.year === yr);
              const val = r ? r.value : 0;
              const floodingVal = activeHazard === "flooding" ? val : 500 + (yr - 2016) * 200;
              const surgeVal = activeHazard === "storm-surge" ? val : 0.4 + (yr - 2016) * 0.15;
              const erosionVal = activeHazard === "coastal-erosion" ? Math.abs(val) : 0.8 + (yr - 2016) * 0.18;
              const seaLevelVal = activeHazard === "sea-level-rise" ? val : 2.1 + (yr - 2016) * 0.2;

              return {
                year: yr,
                flooding: floodingVal,
                surge: surgeVal,
                erosion: erosionVal,
                seaLevel: seaLevelVal,
                "coastal-erosion": erosionVal,
                "sea-level-rise": seaLevelVal,
                "storm-surge": surgeVal,
                [activeHazard]: val,
              };
            });

            const lastVal = readings[readings.length - 1]?.value ?? 0;
            let riskLevel: "High" | "Medium" | "Low" = "High";
            if (activeHazard === "flooding" && lastVal < 1000) riskLevel = "Medium";
            if (activeHazard === "storm-surge" && lastVal < 1.0) riskLevel = "Medium";
            if (activeHazard === "coastal-erosion" && Math.abs(lastVal) < 1.5) riskLevel = "Medium";

            const meta = hotspotName ? getHotspotMeta(hotspotName, match ? match.district : districtName, activeHazard) : null;

            setData({
              population: meta ? meta.population : (districtName.toLowerCase() === "gwadar" ? "263,500" : "574,292"),
              area: meta ? meta.vulnerableArea : (districtName.toLowerCase() === "gwadar" ? "12,637 km²" : "15,153 km²"),
              coastline: meta ? meta.shorelineBuffer : (districtName.toLowerCase() === "gwadar" ? "280 km" : "150 km"),
              riskLevel,
              history: mappedHistory,
            });
          }
        }).catch((err) => console.error("Error loading hazard data:", err));
      })
      .catch((err) => console.error("Error loading regions:", err));
  }, [districtName, hotspotName, activeHazard]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("darkMode", String(next));
  };

  const handleExport = async (format: "csv" | "pdf") => {
    const isAll = districtName.toLowerCase() === "all";
    const regionId = isAll ? null : (matchedRegion?.id ?? null);
    setExportLoading((prev) => ({ ...prev, [format]: true }));
    try {
      const blob = await exportReport(regionId, format, 2016, 2025, activeHazard, hotspotName || undefined);
      const url = URL.createObjectURL(blob);
      setDownloadUrl((prev) => ({ ...prev, [format]: url }));

      const a = document.createElement("a");
      a.href = url;
      const hostSlug = hotspotName ? `_${hotspotName.toLowerCase().replace(/ /g, '_')}` : "";
      const downloadName = `${districtName.toLowerCase()}${hostSlug}_${activeHazard}_report_2016_2025.${format}`;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("Failed to export report.");
    } finally {
      setExportLoading((prev) => ({ ...prev, [format]: false }));
    }
  };

  const getHazardConfig = () => {
    switch (activeHazard) {
      case "flooding":
        return { title: "Coastal Flood Inundation Trend (km²)", color: "#06b6d4", dataKey: "flooding", gradId: "floodGrad" };
      case "storm-surge":
        return { title: "Storm Surge Inundation Height (m)", color: "#f97316", dataKey: "surge", gradId: "surgeGrad" };
      case "sea-level-rise":
        return { title: "Sea Surface Height Anomaly (mm/yr)", color: "#0284c7", dataKey: "seaLevel", gradId: "slrGrad" };
      case "coastal-erosion":
      default:
        return { title: "Shoreline Erosion Rate (m/yr)", color: "#ef4444", dataKey: "erosion", gradId: "erosionGrad" };
    }
  };

  const activeConfig = getHazardConfig();
  const hostSlug = hotspotName ? `_${hotspotName.toLowerCase().replace(/ /g, '_')}` : "";
  const hotspotMeta = hotspotName ? getHotspotMeta(hotspotName, matchedRegion?.district || districtName, activeHazard) : null;

  return (
        <AuthGuard>
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>

      {/* HEADER NAVBAR */}
      <header className={`px-6 py-4 border-b sticky top-0 z-40 backdrop-blur-xl flex justify-between items-center transition-colors ${
        darkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white/90 border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className={`p-2 rounded-xl border transition flex items-center justify-center ${
              darkMode 
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white' 
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
            }`}
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
              <Waves className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight font-sans">
                {hotspotName ? hotspotName : `${districtName.charAt(0).toUpperCase() + districtName.slice(1)} District Overview`}
              </h1>
              <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider">
                NCGSA Coastal Monitoring Node
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-xl border transition flex items-center justify-center ${
              darkMode 
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
            title="Toggle Light/Dark Theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
            darkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            <Calendar className="w-3.5 h-3.5 text-cyan-600" />
            <span>2016 – 2025 Analysis Profile</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-6 flex flex-col gap-6">

        {/* TOP ROW: SUMMARY & STATUS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* MAIN PROFILE CARD */}
          <section className={`md:col-span-2 p-6 rounded-2xl border transition shadow-sm flex flex-col justify-between ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
          }`}>
            <div>
              <div className="flex items-center gap-2 text-cyan-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-extrabold tracking-wider uppercase">
                  {hotspotName ? "Hotspot Risk Profile" : "District Risk Profile"}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black tracking-tight font-sans">
                {hotspotName ? hotspotName : `${districtName.charAt(0).toUpperCase() + districtName.slice(1)} Coastline`}
              </h2>

              <p className={`text-xs md:text-sm leading-relaxed mt-3 ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {hotspotMeta 
                  ? hotspotMeta.description 
                  : "Comprehensive environmental risk assessment profile, consolidating Sentinel SAR inundation maps, shoreline DSAS calculations, and weather station rainfall trends."}
              </p>
            </div>

            <div className={`grid grid-cols-3 gap-4 border-t pt-4 mt-6 ${
              darkMode ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div>
                <span className={`text-[10px] font-medium block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Population</span>
                <strong className="text-sm font-extrabold">{data.population}</strong>
              </div>
              <div>
                <span className={`text-[10px] font-medium block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{hotspotName ? "Vulnerable Area" : "District Area"}</span>
                <strong className="text-sm font-extrabold">{data.area}</strong>
              </div>
              <div>
                <span className={`text-[10px] font-medium block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{hotspotName ? "Shoreline Buffer" : "Coastline Length"}</span>
                <strong className="text-sm font-extrabold">{data.coastline}</strong>
              </div>
            </div>
          </section>

          {/* VULNERABILITY STATUS CARD */}
          <section className={`p-6 rounded-2xl border transition shadow-sm flex flex-col justify-between ${
            data.riskLevel === "High"
              ? (darkMode ? 'bg-red-950/20 border-red-900/40' : 'bg-red-50/60 border-red-200')
              : (darkMode ? 'bg-amber-950/20 border-amber-900/40' : 'bg-amber-50/60 border-amber-200')
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-[10px] font-black tracking-wider uppercase block ${
                  data.riskLevel === "High" ? "text-red-600" : "text-amber-600"
                }`}>
                  Vulnerability Status
                </span>
                <h3 className={`text-2xl font-black mt-1 font-sans ${
                  data.riskLevel === "High" ? "text-red-600" : "text-amber-600"
                }`}>
                  {data.riskLevel} Risk Level
                </h3>
              </div>
              <AlertTriangle className={`w-6 h-6 ${
                data.riskLevel === "High" ? "text-red-500" : "text-amber-500"
              }`} />
            </div>

            <p className={`text-xs leading-relaxed my-4 ${
              darkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              {data.riskLevel === "High"
                ? "This region presents high hazard exposure due to low-lying coastal topographies, active wave attack history, and monsoon surge vulnerability."
                : "Moderate vulnerabilities monitored. High tide storm events present seasonal flooding hazards along shoreline buffers."}
            </p>

            <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Continuous Sentinel observations active</span>
            </div>
          </section>
        </div>

        {/* GRAPH ROW: HISTORICAL TRENDS & COMPARISONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* DYNAMIC HAZARD TIMELINE CHART */}
          <section className={`p-6 rounded-2xl border transition shadow-sm flex flex-col min-h-[340px] ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
          }`}>
            <h4 className="text-xs font-black tracking-wider uppercase mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: activeConfig.color }} />
              <span>{activeConfig.title}</span>
            </h4>
            <div className="flex-1 w-full text-[10px] min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.history} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                  <defs>
                    <linearGradient id={activeConfig.gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeConfig.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={activeConfig.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} vertical={false} />
                  <XAxis dataKey="year" stroke={darkMode ? "#64748b" : "#94a3b8"} interval={0} />
                  <YAxis stroke={darkMode ? "#64748b" : "#94a3b8"} />
                  <Tooltip contentStyle={{ 
                    backgroundColor: darkMode ? "#0f172a" : "#ffffff", 
                    borderColor: darkMode ? "#1e293b" : "#e2e8f0", 
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    color: darkMode ? "#f8fafc" : "#0f172a"
                  }} />
                  <Area
                    type="monotone"
                    dataKey={activeConfig.dataKey}
                    stroke={activeConfig.color}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill={`url(#${activeConfig.gradId})`}
                    dot={{ r: 4, fill: activeConfig.color }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* DYNAMIC COMPARISON CHART */}
          {(() => {
            const isWetHazard = ['flooding', 'storm-surge', 'tsunami-risk', 'safe-zones'].includes(activeHazard);
            const compTitle = isWetHazard
              ? "Long-Term Trends: Shoreline Erosion (m/yr) vs Sea Level (mm/yr)"
              : "Extreme Event Trends: Flooding (km²) vs Storm Surge (km²)";
            
            return (
              <section className={`p-6 rounded-2xl border transition shadow-sm flex flex-col min-h-[340px] ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
              }`}>
                <h4 className="text-xs font-black tracking-wider uppercase mb-4 flex items-center gap-2 text-slate-700">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                  <span className={darkMode ? 'text-slate-200' : 'text-slate-800'}>{compTitle}</span>
                </h4>
                <div className="flex-1 w-full text-[10px] min-h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.history} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                      <CartesianGrid stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} vertical={false} />
                      <XAxis dataKey="year" stroke={darkMode ? "#64748b" : "#94a3b8"} interval={0} />
                      <YAxis stroke={darkMode ? "#64748b" : "#94a3b8"} />
                      <Tooltip contentStyle={{ 
                        backgroundColor: darkMode ? "#0f172a" : "#ffffff", 
                        borderColor: darkMode ? "#1e293b" : "#e2e8f0", 
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        color: darkMode ? "#f8fafc" : "#0f172a"
                      }} />
                      {isWetHazard ? (
                        <>
                          <Bar dataKey="erosion" fill="#ef4444" name="Erosion Rate (m/yr)" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                          <Bar dataKey="seaLevel" fill="#06b6d4" name="Sea Level (mm/yr)" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                        </>
                      ) : (
                        <>
                          <Bar dataKey="flooding" fill="#06b6d4" name="Flooding (km²)" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                          <Bar dataKey="surge" fill="#f59e0b" name="Storm Surge (m)" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                        </>
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            );
          })()}
        </div>

        {/* BOTTOM ROW: EXPORT CONTROLS */}
        <section className={`p-6 rounded-2xl border transition shadow-sm ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h4 className="text-sm font-black tracking-tight font-sans">Generate Local Reports</h4>
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Compile historical records and hazard metrics for {districtName} into structured downloads.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleExport("csv")}
                disabled={exportLoading.csv}
                className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-extrabold text-white shadow-md active:scale-95 transition disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{exportLoading.csv ? "Running..." : "Export CSV Report"}</span>
              </button>

              <button
                onClick={() => handleExport("pdf")}
                disabled={exportLoading.pdf}
                className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-extrabold text-white shadow-md active:scale-95 transition disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{exportLoading.pdf ? "Generating..." : "Download PDF Report"}</span>
              </button>
            </div>
          </div>

          {/* Export Links */}
          {(downloadUrl.csv || downloadUrl.pdf) && (
            <div className={`mt-4 pt-3 border-t flex flex-col gap-2 text-xs ${
              darkMode ? 'border-slate-800' : 'border-slate-100'
            }`}>
              {downloadUrl.csv && (
                <p className="flex items-center gap-2 text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  CSV Generated: &nbsp;
                  <a
                    href={downloadUrl.csv}
                    download={`${districtName.toLowerCase()}${hostSlug}_${activeHazard}_report_2016_2025.csv`}
                    className="text-cyan-600 underline font-bold hover:text-cyan-700"
                  >
                    {`${districtName.toLowerCase()}${hostSlug}_${activeHazard}_report_2016_2025.csv`}
                  </a>
                </p>
              )}
              {downloadUrl.pdf && (
                <p className="flex items-center gap-2 text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  PDF Report Generated: &nbsp;
                  <a
                    href={downloadUrl.pdf}
                    download={`${districtName.toLowerCase()}${hostSlug}_${activeHazard}_report_2016_2025.pdf`}
                    className="text-cyan-600 underline font-bold hover:text-cyan-700"
                  >
                    {`${districtName.toLowerCase()}${hostSlug}_${activeHazard}_report_2016_2025.pdf`}
                  </a>
                </p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
    </AuthGuard>
  );
}