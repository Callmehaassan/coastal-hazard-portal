"use client";

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

// Simulated historical hazard timelines for different districts (10 years: 2016-2025)
const simulatedDistrictData: {
  [key: string]: {
    population: string;
    area: string;
    coastline: string;
    riskLevel: "High" | "Medium" | "Low";
    history: { year: number; flooding: number; surge: number; erosion: number; seaLevel: number }[];
  };
} = {
  thatta: {
    population: "1,223,456",
    area: "8,570 km²",
    coastline: "112 km",
    riskLevel: "High",
    history: [
      { year: 2016, flooding: 1500, surge: 80, erosion: 8, seaLevel: 6.8 },
      { year: 2017, flooding: 1800, surge: 100, erosion: 11, seaLevel: 7.0 },
      { year: 2018, flooding: 1600, surge: 90, erosion: 9, seaLevel: 7.2 },
      { year: 2019, flooding: 2000, surge: 110, erosion: 12, seaLevel: 7.4 },
      { year: 2020, flooding: 2200, surge: 120, erosion: 15, seaLevel: 7.6 },
      { year: 2021, flooding: 2700, surge: 180, erosion: 25, seaLevel: 7.8 },
      { year: 2022, flooding: 3500, surge: 140, erosion: 18, seaLevel: 8.0 },
      { year: 2023, flooding: 4100, surge: 250, erosion: 30, seaLevel: 8.2 },
      { year: 2024, flooding: 5200, surge: 280, erosion: 45, seaLevel: 8.4 },
      { year: 2025, flooding: 6500, surge: 310, erosion: 55, seaLevel: 8.6 },
    ],
  },
  gwadar: {
    population: "263,500",
    area: "12,637 km²",
    coastline: "280 km",
    riskLevel: "Medium",
    history: [
      { year: 2016, flooding: 500, surge: 40, erosion: 4, seaLevel: 6.8 },
      { year: 2017, flooding: 700, surge: 60, erosion: 6, seaLevel: 7.0 },
      { year: 2018, flooding: 600, surge: 50, erosion: 5, seaLevel: 7.2 },
      { year: 2019, flooding: 800, surge: 75, erosion: 7, seaLevel: 7.4 },
      { year: 2020, flooding: 850, surge: 90, erosion: 8, seaLevel: 7.6 },
      { year: 2021, flooding: 1100, surge: 130, erosion: 12, seaLevel: 7.8 },
      { year: 2022, flooding: 1400, surge: 110, erosion: 10, seaLevel: 8.0 },
      { year: 2023, flooding: 1750, surge: 190, erosion: 16, seaLevel: 8.2 },
      { year: 2024, flooding: 2100, surge: 220, erosion: 24, seaLevel: 8.4 },
      { year: 2025, flooding: 2600, surge: 245, erosion: 32, seaLevel: 8.6 },
    ],
  },
  karachi: {
    population: "16,051,500",
    area: "3,780 km²",
    coastline: "75 km",
    riskLevel: "High",
    history: [
      { year: 2016, flooding: 2200, surge: 130, erosion: 2, seaLevel: 6.8 },
      { year: 2017, flooding: 2500, surge: 150, erosion: 3, seaLevel: 7.0 },
      { year: 2018, flooding: 2400, surge: 140, erosion: 3, seaLevel: 7.2 },
      { year: 2019, flooding: 2900, surge: 180, erosion: 4, seaLevel: 7.4 },
      { year: 2020, flooding: 3100, surge: 210, erosion: 5, seaLevel: 7.6 },
      { year: 2021, flooding: 3800, surge: 280, erosion: 11, seaLevel: 7.8 },
      { year: 2022, flooding: 4200, surge: 230, erosion: 8, seaLevel: 8.0 },
      { year: 2023, flooding: 5100, surge: 340, erosion: 14, seaLevel: 8.2 },
      { year: 2024, flooding: 6300, surge: 390, erosion: 20, seaLevel: 8.4 },
      { year: 2025, flooding: 7800, surge: 430, erosion: 28, seaLevel: 8.6 },
    ],
  },
  lasbela: {
    population: "574,292",
    area: "15,153 km²",
    coastline: "150 km",
    riskLevel: "Medium",
    history: [
      { year: 2016, flooding: 800, surge: 30, erosion: 2, seaLevel: 6.8 },
      { year: 2017, flooding: 1000, surge: 50, erosion: 3, seaLevel: 7.0 },
      { year: 2018, flooding: 900, surge: 45, erosion: 3, seaLevel: 7.2 },
      { year: 2019, flooding: 1100, surge: 60, erosion: 4, seaLevel: 7.4 },
      { year: 2020, flooding: 1200, surge: 70, erosion: 4, seaLevel: 7.6 },
      { year: 2021, flooding: 1450, surge: 105, erosion: 7, seaLevel: 7.8 },
      { year: 2022, flooding: 1700, surge: 85, erosion: 5, seaLevel: 8.0 },
      { year: 2023, flooding: 2050, surge: 140, erosion: 9, seaLevel: 8.2 },
      { year: 2024, flooding: 2500, surge: 165, erosion: 15, seaLevel: 8.4 },
      { year: 2025, flooding: 3100, surge: 190, erosion: 22, seaLevel: 8.6 },
    ],
  },
};

// Fallback dynamic generator for any other districts
const getSimulatedData = (districtName: string) => {
  const key = districtName.toLowerCase();
  if (simulatedDistrictData[key]) {
    return simulatedDistrictData[key];
  }
  return {
    population: "450,000",
    area: "9,200 km²",
    coastline: "120 km",
    riskLevel: "Medium" as const,
    history: [
      { year: 2016, flooding: 600, surge: 40, erosion: 3, seaLevel: 6.8 },
      { year: 2017, flooding: 800, surge: 55, erosion: 4, seaLevel: 7.0 },
      { year: 2018, flooding: 700, surge: 50, erosion: 4, seaLevel: 7.2 },
      { year: 2019, flooding: 900, surge: 70, erosion: 5, seaLevel: 7.4 },
      { year: 2020, flooding: 1000, surge: 80, erosion: 5, seaLevel: 7.6 },
      { year: 2021, flooding: 1200, surge: 110, erosion: 8, seaLevel: 7.8 },
      { year: 2022, flooding: 1500, surge: 95, erosion: 6, seaLevel: 8.0 },
      { year: 2023, flooding: 1800, surge: 150, erosion: 11, seaLevel: 8.2 },
      { year: 2024, flooding: 2200, surge: 180, erosion: 16, seaLevel: 8.4 },
      { year: 2025, flooding: 2700, surge: 210, erosion: 23, seaLevel: 8.6 },
    ],
  }export default function DistrictDetailsPage({ params }: { params: { district: string } }) {
  const searchParams = useSearchParams();
  const rawHazard = searchParams?.get("hazard") || "flooding";
  
  const activeHazard = rawHazard;

  const getHazardConfig = (hazard: string) => {
    switch (hazard) {
      case "storm-surge":
        return {
          title: "Historical Storm Surge Inundated Area (km²)",
          color: "#f59e0b",
          dataKey: "storm-surge",
          unit: "km²",
          gradId: "surgeGradDetails",
        };
      case "coastal-erosion":
        return {
          title: "Historical Shoreline Erosion Rate (m/yr)",
          color: "#ef4444",
          dataKey: "coastal-erosion",
          unit: "m/yr",
          gradId: "erosionGradDetails",
        };
      case "sea-level-rise":
        return {
          title: "Historical Sea Level Anomaly (mm/yr)",
          color: "#06b6d4",
          dataKey: "sea-level-rise",
          unit: "mm/yr",
          gradId: "seaLevelGradDetails",
        };
      case "vulnerability-index":
        return {
          title: "Historical Vulnerability Index (CVI)",
          color: "#10b981",
          dataKey: "vulnerability-index",
          unit: "index",
          gradId: "cviGradDetails",
        };
      case "tsunami-risk":
        return {
          title: "Historical Tsunami Run-up Risk Index",
          color: "#8b5cf6",
          dataKey: "tsunami-risk",
          unit: "index",
          gradId: "tsunamiGradDetails",
        };
      case "safe-zones":
        return {
          title: "Historical Safe Zones Evacuation Capacity (km²)",
          color: "#3b82f6",
          dataKey: "safe-zones",
          unit: "km²",
          gradId: "safeZonesGradDetails",
        };
      case "flooding":
      default:
        return {
          title: "Historical Inundated Area Timeline (km²)",
          color: "#22d3ee",
          dataKey: "flooding",
          unit: "km²",
          gradId: "floodGradDetails",
        };
    }
  };

  const activeConfig = getHazardConfig(activeHazard);

  const router = useRouter();
  const districtName = decodeURIComponent(params.district);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [metaData, setMetaData] = useState({
    population: "263,500",
    area: "12,637 km²",
    coastline: "280 km",
    riskLevel: "Medium" as "High" | "Medium" | "Low",
  });

  const data = { ...metaData, history: historyData };

  const [regions, setRegions] = useState<Region[]>([]);
  const [matchedRegion, setMatchedRegion] = useState<Region | null>(null);
  const [exportLoading, setExportLoading] = useState<{ [key: string]: boolean }>({});
  const [downloadUrl, setDownloadUrl] = useState<{ [key: string]: string | null }>({});

  useEffect(() => {
    const isAll = districtName.toLowerCase() === "all";

    getRegions()
      .then((res) => {
        setRegions(res);

        // Determine district filter: undefined means fetch aggregate (all districts)
        const match = isAll
          ? null
          : res.find((r) => r.district.toLowerCase() === districtName.toLowerCase());

        if (!isAll && !match) return; // unknown single district — nothing to show

        if (match) setMatchedRegion(match);

        const districtFilter = match ? match.district : undefined;

        Promise.all([
          getHazards("flooding", districtFilter),
          getHazards("storm-surge", districtFilter),
          getHazards("erosion", districtFilter),
          getHazards("sea-level", districtFilter),
          getHazards("vulnerability-index", districtFilter),
          getHazards("tsunami-risk", districtFilter),
          getHazards("safe-zones", districtFilter),
        ]).then(([floodRes, surgeRes, erosionRes, slRes, cviRes, tsunamiRes, safeZonesRes]) => {
          const years = Array.from({ length: 10 }, (_, i) => 2016 + i);
          const compiled = years.map((year) => {
            const floodVal = floodRes.find((item) => item.year === year)?.value ?? 0;
            const surgeVal = surgeRes.find((item) => item.year === year)?.value ?? 0;
            const erosionVal = erosionRes.find((item) => item.year === year)?.value ?? 0;
            const slVal = slRes.find((item) => item.year === year)?.value ?? 0;
            const cviVal = cviRes.find((item) => item.year === year)?.value ?? 0;
            const tsunamiVal = tsunamiRes.find((item) => item.year === year)?.value ?? 0;
            const safeZonesVal = safeZonesRes.find((item) => item.year === year)?.value ?? 0;
            
            return {
              year,
              flooding: Number(floodVal.toFixed(1)),
              "storm-surge": Number(surgeVal.toFixed(2)),
              "coastal-erosion": Math.abs(Number(erosionVal.toFixed(2))),
              "sea-level-rise": Number(slVal.toFixed(2)),
              "vulnerability-index": Number(cviVal.toFixed(2)),
              "tsunami-risk": Number(tsunamiVal.toFixed(2)),
              "safe-zones": Number(safeZonesVal.toFixed(1)),
            };
          });
          setHistoryData(compiled);

          const latestCvi = cviRes.find((item) => item.year === 2025)?.value ?? 6.0;
          const riskLevel = latestCvi >= 7.5 ? "High" : latestCvi >= 5.0 ? "Medium" : "Low";

          if (isAll) {
            setMetaData({
              population: "837,792", // Gwadar + Lasbela combined
              area: "27,790 km²",   // Gwadar + Lasbela combined
              coastline: "430 km",  // Gwadar + Lasbela combined
              riskLevel,
            });
          } else if (match) {
            setMetaData({
              population: match.district.toLowerCase() === "gwadar" ? "263,500" : "574,292",
              area: match.district.toLowerCase() === "gwadar" ? "12,637 km²" : "15,153 km²",
              coastline: match.district.toLowerCase() === "gwadar" ? "280 km" : "150 km",
              riskLevel,
            });
          }
        }).catch((err) => console.error("Error loading hazard data for details:", err));
      })
      .catch((err) => console.error("Error loading regions for details:", err));
  }, [districtName]);

  const handleExport = async (format: "csv" | "pdf") => {
    const isAll = districtName.toLowerCase() === "all";
    const regionId = isAll ? null : (matchedRegion?.id ?? null);
    setExportLoading((prev) => ({ ...prev, [format]: true }));
    try {
      const blob = await exportReport(regionId, format, 2016, 2025, activeHazard);
      const url = URL.createObjectURL(blob);
      setDownloadUrl((prev) => ({ ...prev, [format]: url }));

      const a = document.createElement("a");
      a.href = url;
      const downloadName = `${districtName.toLowerCase()}_${activeHazard}_report_2016_2025.${format}`;
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

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed text-white flex flex-col font-sans overflow-x-hidden selection:bg-cyan-500/30 relative"
      style={{ backgroundImage: "url('/bg-sunset.jpg')" }}
    >
      {/* Dark tint overlay to ensure high contrast, readability, and glassmorphism highlight */}
      <div className="absolute inset-0 bg-[#070e1b]/85 backdrop-blur-[2px] pointer-events-none -z-10" />

      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* HEADER NAVBAR */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-white/10 backdrop-blur-xl sticky top-0 z-40 bg-[#070e1b]/80">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-white/5 rounded-xl border border-white/5 hover:border-white/15 transition flex items-center justify-center focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
              <Waves className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-md md:text-lg font-bold tracking-tight">
                {districtName.charAt(0).toUpperCase() + districtName.slice(1)} District Overview
              </h1>
              <p className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">
                Coastal Monitoring Detail Panel
              </p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 glass-sm px-3.5 py-1.5 text-xs text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>Detailed Report Profile</span>
        </div>
      </header>

      {/* MAIN LAYOUT WRAPPER */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
        {/* TOP ROW: Summary & Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <section className="glass p-5 md:col-span-2 flex flex-col justify-between border-white/10 bg-[#0f172a]/30 hover:bg-[#0f172a]/45 transition shadow-glass-inner">
            <div>
              <div className="flex items-center gap-2.5 text-cyan-400 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-bold tracking-widest uppercase">District Profile</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                {districtName.charAt(0).toUpperCase() + districtName.slice(1)} Coastline
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mt-2.5 max-w-xl">
                Comprehensive environmental risk assessment profile, consolidating Sentinel SAR
                inundation maps, shoreline DSAS calculations, and weather station rainfall trends.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4 mt-5">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Population</span>
                <strong className="text-sm font-bold text-white">{data.population}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">District Area</span>
                <strong className="text-sm font-bold text-white">{data.area}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Coastline Length</span>
                <strong className="text-sm font-bold text-white">{data.coastline}</strong>
              </div>
            </div>
          </section>

          {/* Risk Level & Warning Card */}
          <section
            className={`glass p-5 flex flex-col justify-between border-white/10 shadow-glass-inner transition ${
              data.riskLevel === "High"
                ? "border-l-4 border-l-red-500 bg-red-950/5 hover:bg-red-950/10"
                : "border-l-4 border-l-amber-500 bg-amber-950/5 hover:bg-amber-950/10"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">
                  Vulnerability Status
                </span>
                <h3
                  className={`text-2xl font-bold mt-1 ${
                    data.riskLevel === "High" ? "text-red-400" : "text-amber-400"
                  }`}
                >
                  {data.riskLevel} Risk Level
                </h3>
              </div>
              <AlertTriangle
                className={`w-6 h-6 ${
                  data.riskLevel === "High" ? "text-red-500" : "text-amber-500"
                }`}
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed my-3">
              {data.riskLevel === "High"
                ? "This region presents high hazard exposure due to dense coastal population centers, elevated storm surge history, and recurring heavy monsoon rainfall cycles."
                : "Moderate vulnerabilities monitored. High tide storm events present seasonal flooding hazards along shoreline buffers. Recommended mitigation buffers apply."}
            </p>

            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Continuous Sentinel observations active</span>
            </div>
          </section>
        </div>

        {/* GRAPH COLUMN: Historical timelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dynamic Hazard Timeline */}
          <section className="glass p-5 flex flex-col border-white/10 bg-[#0f172a]/30 hover:bg-[#0f172a]/45 transition shadow-glass-inner min-h-[300px]">
            <h4 className="text-xs font-bold text-slate-300 tracking-wider uppercase mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: activeConfig.color }} />
              <span>{activeConfig.title}</span>
            </h4>
            <div className="flex-1 w-full text-[10px] min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.history} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                  <defs>
                    <linearGradient id={activeConfig.gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeConfig.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={activeConfig.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" interval={0} />
                  <YAxis stroke="rgba(255,255,255,0.3)" />
                  <Tooltip contentStyle={{ backgroundColor: "#070e1b", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                  <Area
                    type="monotone"
                    dataKey={activeConfig.dataKey}
                    stroke={activeConfig.color}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#${activeConfig.gradId})`}
                    dot={{ r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Dynamic Comparison Timeline */}
          {(() => {
            const isWetHazard = ['flooding', 'storm-surge', 'tsunami-risk', 'safe-zones'].includes(activeHazard);
            const compTitle = isWetHazard
              ? "Long-Term Trends: Shoreline Erosion (m/yr) vs Sea Level (mm/yr)"
              : "Extreme Event Trends: Flooding (km²) vs Storm Surge (km²)";
            
            return (
              <section className="glass p-5 flex flex-col border-white/10 bg-[#0f172a]/30 hover:bg-[#0f172a]/45 transition shadow-glass-inner min-h-[300px]">
                <h4 className="text-xs font-bold text-slate-300 tracking-wider uppercase mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span>{compTitle}</span>
                </h4>
                <div className="flex-1 w-full text-[10px] min-h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.history} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" interval={0} />
                      <YAxis stroke="rgba(255,255,255,0.3)" />
                      <Tooltip contentStyle={{ backgroundColor: "#070e1b", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                      {isWetHazard ? (
                        <>
                          <Bar dataKey="coastal-erosion" fill="#ef4444" name="Erosion Rate (m/yr)" fillOpacity={0.75} radius={[2, 2, 0, 0]} />
                          <Bar dataKey="sea-level-rise" fill="#06b6d4" name="Sea Level (mm/yr)" fillOpacity={0.75} radius={[2, 2, 0, 0]} />
                        </>
                      ) : (
                        <>
                          <Bar dataKey="flooding" fill="#06b6d4" name="Flooding (km²)" fillOpacity={0.75} radius={[2, 2, 0, 0]} />
                          <Bar dataKey="storm-surge" fill="#f59e0b" name="Storm Surge Area (km²)" fillOpacity={0.75} radius={[2, 2, 0, 0]} />
                        </>
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            );
          })()}
        </div>

        {/* BOTTOM ROW: Export Data Controls */}
        <section className="glass p-5 border-white/10 bg-[#0f172a]/30 hover:bg-[#0f172a]/45 transition shadow-glass-inner">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Generate Local Reports</h4>
              <p className="text-xs text-slate-400 mt-1">
                Compile historical records and hazard metrics for {districtName} into structured downloads.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleExport("csv")}
                disabled={exportLoading.csv}
                className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-xs font-semibold text-white shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{exportLoading.csv ? "Running..." : "Export CSV Report"}</span>
              </button>

              <button
                onClick={() => handleExport("pdf")}
                disabled={exportLoading.pdf}
                className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 text-xs font-semibold text-white shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{exportLoading.pdf ? "Generating..." : "Download PDF Report"}</span>
              </button>
            </div>
          </div>

          {/* Export Links */}
          {(downloadUrl.csv || downloadUrl.pdf) && (
            <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-2 text-xs">
              {downloadUrl.csv && (
                <p className="flex items-center gap-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  CSV Generated: &nbsp;
                  <a
                    href={downloadUrl.csv}
                    download={`${districtName.toLowerCase()}_${activeHazard}_report_2016_2025.csv`}
                    className="text-cyan-400 underline hover:text-cyan-300 font-medium"
                  >
                    {`${districtName.toLowerCase()}_${activeHazard}_report_2016_2025.csv`}
                  </a>
                </p>
              )}
              {downloadUrl.pdf && (
                <p className="flex items-center gap-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  PDF Report Generated: &nbsp;
                  <a
                    href={downloadUrl.pdf}
                    download={`${districtName.toLowerCase()}_${activeHazard}_report_2016_2025.pdf`}
                    className="text-cyan-400 underline hover:text-cyan-300 font-medium"
                  >
                    {`${districtName.toLowerCase()}_${activeHazard}_report_2016_2025.pdf`}
                  </a>
                </p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
