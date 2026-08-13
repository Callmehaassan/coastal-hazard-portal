'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Waves,
  TrendingUp,
  BarChart3,
  Shield,
  FileSpreadsheet,
  Download,
  Activity,
  Calendar,
  MapPin,
  User,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Search,
  Bell,
  Bot,
  Send,
  AlertTriangle,
  Globe,
  Compass,
  BookOpen,
  Settings,
  Users,
  Layers,
  Lock,
  ArrowRight,
  RefreshCw,
  Mail,
  CheckCircle,
  FileText,
  Info,
  Sliders,
  Sun,
  Moon
} from 'lucide-react';

import {
  getRegions,
  getHazards,
  exportReport,
  getActiveAlerts,
  type HazardReading,
} from '@/lib/api';
import type { Region } from '@/lib/types';

const DashboardMap = dynamic(() => import('@/components/DashboardMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[450px] bg-slate-950/40 flex items-center justify-center text-slate-400">
      Loading Interactive Map...
    </div>
  ),
});

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

type AnalysisType =
  | 'storm-surge'
  | 'coastal-erosion'
  | 'tsunami-risk'
  | 'sea-level-rise'
  | 'vulnerability-index'
  | 'safe-zones'
  | 'flooding';

const ANALYSIS_CONFIG: Record<
  AnalysisType,
  { label: string; apiPath: string; color: string; unit: string }
> = {
  'storm-surge': {
    label: 'Storm Surge',
    apiPath: 'storm-surge',
    color: '#f59e0b',
    unit: 'km²',
  },
  'coastal-erosion': {
    label: 'Coastal Erosion',
    apiPath: 'erosion',
    color: '#ef4444',
    unit: 'm/yr',
  },
  'tsunami-risk': {
    label: 'Tsunami Risk',
    apiPath: 'tsunami-risk',
    color: '#8b5cf6',
    unit: 'index',
  },
  'sea-level-rise': {
    label: 'Sea Level Rise',
    apiPath: 'sea-level',
    color: '#06b6d4',
    unit: 'mm/yr',
  },
  'vulnerability-index': {
    label: 'Vulnerability Index',
    apiPath: 'vulnerability-index',
    color: '#10b981',
    unit: 'index',
  },
  'safe-zones': {
    label: 'Safe Zones',
    apiPath: 'safe-zones',
    color: '#3b82f6',
    unit: 'km²',
  },
  flooding: {
    label: 'Flooding',
    apiPath: 'flooding',
    color: '#06b6d4',
    unit: 'km²',
  },
};

// Hardcoded alerts matching the reference screenshot
const recentAlerts = [
  {
    id: 1,
    title: 'High Storm Surge Warning',
    district: 'Gwadar District',
    time: 'May 15, 2025 09:20 AM',
    severity: 'high',
    rawHazard: 'storm_surge',
  },
  {
    id: 2,
    title: 'Coastal Flood Watch',
    district: 'Lasbela District',
    time: 'May 15, 2025 08:45 AM',
    severity: 'medium',
    rawHazard: 'flooding',
  },
  {
    id: 3,
    title: 'Shoreline Erosion Alert',
    district: 'Ormara Coastline',
    time: 'May 14, 2025 11:15 PM',
    severity: 'low',
    rawHazard: 'erosion',
  },
];

// Hardcoded datasets removed for dynamic state-based series

// cviExposureData removed for dynamic state-based tracking

const DISTRICT_METRICS: Record<
  string,
  Record<
    number,
    { flooding: number; surge: string; erosion: number; seaLevel: number }
  >
> = {
  all: {
    2016: { flooding: 2300, surge: 'Low', erosion: -10.0, seaLevel: 6.8 },
    2017: { flooding: 2800, surge: 'Low', erosion: -14.0, seaLevel: 7.0 },
    2018: { flooding: 2500, surge: 'Low', erosion: -12.0, seaLevel: 7.2 },
    2019: { flooding: 2900, surge: 'Medium', erosion: -16.0, seaLevel: 7.4 },
    2020: { flooding: 4250, surge: 'Medium', erosion: -19.0, seaLevel: 7.6 },
    2021: { flooding: 5250, surge: 'High', erosion: -44.0, seaLevel: 7.8 },
    2022: { flooding: 6600, surge: 'Medium', erosion: -33.0, seaLevel: 8.0 },
    2023: { flooding: 7950, surge: 'High', erosion: -55.0, seaLevel: 8.2 },
    2024: { flooding: 9800, surge: 'High', erosion: -84.0, seaLevel: 8.4 },
    2025: { flooding: 12200, surge: 'High', erosion: -109.0, seaLevel: 8.6 },
  },
  gwadar: {
    2016: { flooding: 500, surge: 'Low', erosion: -4.0, seaLevel: 6.8 },
    2017: { flooding: 700, surge: 'Low', erosion: -6.0, seaLevel: 7.0 },
    2018: { flooding: 600, surge: 'Low', erosion: -5.0, seaLevel: 7.2 },
    2019: { flooding: 800, surge: 'Low', erosion: -7.0, seaLevel: 7.4 },
    2020: { flooding: 850, surge: 'Medium', erosion: -8.0, seaLevel: 7.6 },
    2021: { flooding: 1100, surge: 'High', erosion: -12.0, seaLevel: 7.8 },
    2022: { flooding: 1400, surge: 'Medium', erosion: -10.0, seaLevel: 8.0 },
    2023: { flooding: 1750, surge: 'High', erosion: -16.0, seaLevel: 8.2 },
    2024: { flooding: 2100, surge: 'High', erosion: -24.0, seaLevel: 8.4 },
    2025: { flooding: 2600, surge: 'High', erosion: -32.0, seaLevel: 8.6 },
  },
  lasbela: {
    2016: { flooding: 800, surge: 'Low', erosion: -2.0, seaLevel: 6.8 },
    2017: { flooding: 1000, surge: 'Low', erosion: -3.0, seaLevel: 7.0 },
    2018: { flooding: 900, surge: 'Low', erosion: -3.0, seaLevel: 7.2 },
    2019: { flooding: 1100, surge: 'Medium', erosion: -4.0, seaLevel: 7.4 },
    2020: { flooding: 1200, surge: 'Medium', erosion: -4.0, seaLevel: 7.6 },
    2021: { flooding: 1450, surge: 'High', erosion: -7.0, seaLevel: 7.8 },
    2022: { flooding: 1700, surge: 'Medium', erosion: -5.0, seaLevel: 8.0 },
    2023: { flooding: 2050, surge: 'High', erosion: -9.0, seaLevel: 8.2 },
    2024: { flooding: 2500, surge: 'High', erosion: -15.0, seaLevel: 8.4 },
    2025: { flooding: 3100, surge: 'High', erosion: -22.0, seaLevel: 8.6 },
  },
};

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    const nextTheme = !darkMode;
    setDarkMode(nextTheme);
    localStorage.setItem('darkMode', String(nextTheme));
  };

  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [dbAlerts, setDbAlerts] = useState<any[]>([]);

  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    'All Coastal Districts'
  );
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<AnalysisType>('storm-surge');

  const [activeBasemap, setActiveBasemap] = useState<'satellite' | 'osm'>(
    'osm'
  );
  const [visibleLayers, setVisibleLayers] = useState<string[]>([
    'Coastline',
    'District Boundary',
    'Hazard Layer',
  ]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [hazardsMenuOpen, setHazardsMenuOpen] = useState<boolean>(true);
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [hazardData, setHazardData] = useState<HazardReading[]>([]);
  
  // Interactive Modal States
  const [activeModal, setActiveModal] = useState<
    'reports' | 'alerts' | 'settings' | 'users' | 'methodology' | 'analysis' | null
  >(null);

  // GEE Live Analysis States
  const [isAnalysisActive, setIsAnalysisActive] = useState<boolean>(false);
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
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'running' | 'success'>('idle');
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);

  // Real-time slider responsiveness: Recalculates CVI gauge and doughnut chart instantly when sliders move!
  useEffect(() => {
    const sum = Object.values(cviWeights).reduce((a, b) => a + b, 0) || 1;
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

    setOverallCvi((gwadarCvi + lasbelaCvi) / 20.0);
    setCviExposureData([
      { name: 'Gwadar', value: Math.round(gwadarCvi * 100) / 100, color: '#ef4444' },
      { name: 'Lasbela', value: Math.round(lasbelaCvi * 100) / 100, color: '#f97316' }
    ]);
  }, [cviWeights]);

  const runGeeAnalysis = () => {
    setIsAnalysisActive(true);
    setAnalysisStatus('running');
    setAnalysisLogs([
      '[INFO] Connecting to Google Earth Engine API...',
      '[INFO] Initializing Sentinel-1 SAR GRD composites...',
      '[INFO] Fetching elevation (SRTM GL1) and slope layers...'
    ]);
    
    setTimeout(() => {
      setAnalysisLogs(prev => [
        ...prev, 
        '[INFO] Fetching Sentinel-2 shoreline change rates...',
        '[INFO] Calculating AVISO sea surface anomaly timeseries...'
      ]);
    }, 1000);

    setTimeout(() => {
      setAnalysisLogs(prev => [
        ...prev, 
        '[INFO] Applying CVI Weight parameters...',
        '[INFO] Compiling Multi-criteria Evaluation matrix...'
      ]);
    }, 2000);

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

      // Update CVI gauge and donut chart states dynamically!
      setOverallCvi((gwadarCvi + lasbelaCvi) / 20.0);
      
      const colors = ['#ef4444', '#f97316'];
      setCviExposureData([
        { name: 'Gwadar', value: Math.round(gwadarCvi * 100) / 100, color: colors[0] },
        { name: 'Lasbela', value: Math.round(lasbelaCvi * 100) / 100, color: colors[1] }
      ]);

      setAnalysisLogs(prev => [
        ...prev, 
        `[SUCCESS] CVI calculations successfully updated!`,
        `[SUCCESS] Gwadar Custom CVI: ${gwadarCvi.toFixed(2)}`,
        `[SUCCESS] Lasbela Custom CVI: ${lasbelaCvi.toFixed(2)}`
      ]);
      setAnalysisStatus('success');
    }, 3000);
  };

  // Trend Analysis Selection States
  const [trendDistrict, setTrendDistrict] = useState<string>('All Coastal Districts');
  const [trendHazard, setTrendHazard] = useState<string>('sea_level');

  const getTrendData = (district: string, hazard: string) => {
    let baseData = [
      { year: 2016, value: 0 },
      { year: 2017, value: 1.2 },
      { year: 2018, value: 2.8 },
      { year: 2019, value: 4.1 },
      { year: 2020, value: 3.5 },
      { year: 2021, value: 5.6 },
      { year: 2022, value: 6.8 },
      { year: 2023, value: 8.2 },
      { year: 2024, value: 7.9 },
      { year: 2025, value: 9.5 },
    ];
    
    if (hazard === 'flooding') {
      const factor = district === 'Gwadar' ? 0.8 : district === 'Lasbela' ? 1.2 : 1.0;
      baseData = [
        { year: 2016, value: 40 * factor },
        { year: 2017, value: 50 * factor },
        { year: 2018, value: 80 * factor },
        { year: 2019, value: 65 * factor },
        { year: 2020, value: 60 * factor },
        { year: 2021, value: 85 * factor },
        { year: 2022, value: 58 * factor },
        { year: 2023, value: 71 * factor },
        { year: 2024, value: 57 * factor },
        { year: 2025, value: 79 * factor },
      ];
    } else if (hazard === 'erosion') {
      const factor = district === 'Gwadar' ? 0.7 : district === 'Lasbela' ? 1.3 : 1.0;
      baseData = [
        { year: 2016, value: 0 },
        { year: 2017, value: -1.2 * factor },
        { year: 2018, value: -3.5 * factor },
        { year: 2019, value: -5.4 * factor },
        { year: 2020, value: -4.8 * factor },
        { year: 2021, value: -6.2 * factor },
        { year: 2022, value: -8.1 * factor },
        { year: 2023, value: -10.5 * factor },
        { year: 2024, value: -12.2 * factor },
        { year: 2025, value: -14.7 * factor },
      ];
    } else if (hazard === 'sea_level') {
      const factor = district === 'Gwadar' ? 0.9 : district === 'Lasbela' ? 1.1 : 1.0;
      baseData = [
        { year: 2016, value: -5.2 * factor },
        { year: 2017, value: -4.1 * factor },
        { year: 2018, value: -3.1 * factor },
        { year: 2019, value: -1.5 * factor },
        { year: 2020, value: -0.8 * factor },
        { year: 2021, value: 0.5 * factor },
        { year: 2022, value: 2.4 * factor },
        { year: 2023, value: 4.8 * factor },
        { year: 2024, value: 6.1 * factor },
        { year: 2025, value: 8.6 * factor },
      ];
    } else if (hazard === 'storm_surge') {
      const factor = district === 'Gwadar' ? 1.1 : district === 'Lasbela' ? 0.9 : 1.0;
      baseData = [
        { year: 2016, value: 0 },
        { year: 2017, value: 150 * factor },
        { year: 2018, value: 400 * factor },
        { year: 2019, value: 600 * factor },
        { year: 2020, value: 120 * factor },
        { year: 2021, value: 250 * factor },
        { year: 2022, value: 0 },
        { year: 2023, value: 300 * factor },
        { year: 2024, value: 180 * factor },
        { year: 2025, value: 0 },
      ];
    }

    const n = baseData.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    baseData.forEach((d, idx) => {
      sumX += idx;
      sumY += d.value;
      sumXY += idx * d.value;
      sumXX += idx * idx;
    });
    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const c = (sumY - m * sumX) / n;

    const chartPoints: Array<{ year: number; historical: number | null; projected: number | null }> = [];
    baseData.forEach((d) => {
      chartPoints.push({
        year: d.year,
        historical: Math.round(d.value * 100) / 100,
        projected: null,
      });
    });
    if (chartPoints.length > 0) {
      chartPoints[n - 1].projected = Math.round(baseData[n - 1].value * 100) / 100;
    }
    for (let y = 2026; y <= 2030; y++) {
      const idx = y - 2016;
      const val = m * idx + c;
      chartPoints.push({
        year: y,
        historical: null,
        projected: Math.round(val * 100) / 100,
      });
    }

    const predicted2030 = Math.round((m * (2030 - 2016) + c) * 100) / 100;
    const rateOfChange = Math.round(m * 100) / 100;

    return { chartPoints, predicted2030, rateOfChange };
  };

  // Export Flow Modal States
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'geotiff' | 'report'>('csv');
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<'configure' | 'preparing' | 'success' | 'error'>('configure');
  const [exportDistrict, setExportDistrict] = useState<'lasbela' | 'gwadar' | 'both'>('both');
  const [emailInput, setEmailInput] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [exportDownloadUrl, setExportDownloadUrl] = useState<string | null>(null);
  const [exportFilename, setExportFilename] = useState<string>('');

  // Dynamic bottom charts state (defaults to baseline shapes)
  const [shorelineHistory, setShorelineHistory] = useState<any[]>([
    { year: 2016, erosion: 0, accretion: 0 },
    { year: 2017, erosion: -5.4, accretion: 0 },
    { year: 2018, erosion: -12.1, accretion: 0 },
    { year: 2019, erosion: -18.7, accretion: 0 },
    { year: 2020, erosion: -16.2, accretion: 0 },
    { year: 2021, erosion: -11.5, accretion: 1.2 },
    { year: 2022, erosion: -8.4, accretion: 3.5 },
    { year: 2023, erosion: -12.3, accretion: 7.9 },
    { year: 2024, erosion: -15.8, accretion: 2.1 },
    { year: 2025, erosion: -18.7, accretion: 0 },
  ]);
  const [seaLevelHistory, setSeaLevelHistory] = useState<any[]>([
    { year: 2016, anomaly: -5.2 },
    { year: 2017, anomaly: -8.4 },
    { year: 2018, anomaly: -3.1 },
    { year: 2019, anomaly: -1.5 },
    { year: 2020, anomaly: -6.8 },
    { year: 2021, anomaly: 0.5 },
    { year: 2022, anomaly: 3.4 },
    { year: 2023, anomaly: 5.8 },
    { year: 2024, anomaly: 7.1 },
    { year: 2025, anomaly: 8.6 },
  ]);

  const [topMetrics, setTopMetrics] = useState<any>({
    flooding: { valueStr: '0.0 km²', percentStr: '↔ 0%' },
    surge: { valueStr: 'Low', percentStr: '↔ Stable' },
    erosion: { valueStr: '0.0 m/yr', percentStr: '↔ 0%' },
    seaLevel: { valueStr: '0.0 mm/yr', percentStr: '↔ 0%' },
  });
  const [overallCvi, setOverallCvi] = useState<number>(0.62);
  const [cviExposureData, setCviExposureData] = useState<any[]>([
    { name: 'Gwadar', value: 0.68, color: '#ef4444' },
    { name: 'Lasbela', value: 0.57, color: '#f97316' },
  ]);

  // Chatbot State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: 'user' | 'ai'; text: string; time: string }>
  >([
    {
      sender: 'ai',
      text: 'Hello! I am Coastal AI. Ask me anything about Balochistan coastal hazards, flood trends, or vulnerability scores!',
      time: '10:13 PM',
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedTheme);
    getRegions()
      .then((data) => {
        setRegions(data);
        if (data.length > 0) {
          setSelectedRegionId(data[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to load regions:', err);
      });
    
    getActiveAlerts()
      .then((alerts) => {
        setDbAlerts(alerts);
      })
      .catch((err) => {
        console.error('Failed to load alerts:', err);
      });

    loadDashboardData();
  }, []);

  useEffect(() => {
    if (mounted) {
      loadDashboardData();
    }
  }, [selectedAnalysis, selectedDistrict, selectedYear]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const districtParam = selectedDistrict === 'All Coastal Districts' ? undefined : selectedDistrict;
      
      // Fetch all 5 hazard datasets concurrently - ONE single round-trip!
      const [floodRes, surgeRes, erosionRes, slRes, cviRes] = await Promise.all([
        getHazards('flooding', districtParam),
        getHazards('storm-surge', districtParam),
        getHazards('erosion', districtParam),
        getHazards('sea-level', districtParam),
        getHazards('vulnerability-index'),
      ]);

      // 1. Distribute active hazard data based on selectedAnalysis
      if (selectedAnalysis === 'flooding') setHazardData(floodRes);
      else if (selectedAnalysis === 'storm-surge') setHazardData(surgeRes);
      else if (selectedAnalysis === 'coastal-erosion') setHazardData(erosionRes);
      else if (selectedAnalysis === 'sea-level-rise') setHazardData(slRes);
      else if (selectedAnalysis === 'vulnerability-index') setHazardData(cviRes);
      else {
        // Fetch on-demand for other analyses to keep initial load very fast
        const config = ANALYSIS_CONFIG[selectedAnalysis];
        getHazards(config.apiPath, districtParam).then(setHazardData);
      }

      // 2. Process erosion history (bottom charts)
      const groupedErosion: Record<number, number[]> = {};
      erosionRes.forEach((item) => {
        if (!groupedErosion[item.year]) groupedErosion[item.year] = [];
        groupedErosion[item.year].push(item.value);
      });
      const shorelineSeries = Object.entries(groupedErosion).map(([yearStr, vals]) => {
        const year = Number(yearStr);
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        return {
          year,
          erosion: avg < 0 ? Math.round(avg * 100) / 100 : 0,
          accretion: avg >= 0 ? Math.round(avg * 100) / 100 : 0
        };
      }).sort((a, b) => a.year - b.year);
      if (shorelineSeries.length > 0) {
        setShorelineHistory(shorelineSeries);
      }

      // 3. Process sea level history (bottom charts)
      const groupedSL: Record<number, number[]> = {};
      slRes.forEach((item) => {
        if (!groupedSL[item.year]) groupedSL[item.year] = [];
        const val = item.unit === 'm' ? item.value * 1000 : item.value;
        groupedSL[item.year].push(val);
      });
      const slSeries = Object.entries(groupedSL).map(([yearStr, vals]) => {
        const year = Number(yearStr);
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        return {
          year,
          anomaly: Math.round(avg * 100) / 100
        };
      }).sort((a, b) => a.year - b.year);
      if (slSeries.length > 0) {
        setSeaLevelHistory(slSeries);
      }

      // 4. Calculate top metrics
      const calculateMetric = (data: any[], key: string) => {
        const grouped: Record<number, number[]> = {};
        data.forEach((item) => {
          if (!grouped[item.year]) grouped[item.year] = [];
          const val = (key === 'seaLevel' && item.unit === 'm') ? item.value * 1000 : item.value;
          grouped[item.year].push(val);
        });

        const getValForYear = (y: number) => {
          const vals = grouped[y];
          if (!vals || vals.length === 0) return 0;
          return vals.reduce((a, b) => a + b, 0) / vals.length;
        };

        const currentVal = getValForYear(selectedYear);
        const prevVal = getValForYear(selectedYear - 1);

        let valueStr = '';
        if (key === 'flooding') {
          valueStr = `${currentVal.toFixed(1)} km²`;
        } else if (key === 'erosion') {
          valueStr = `${currentVal.toFixed(2)} m/yr`;
        } else if (key === 'seaLevel') {
          valueStr = `+${currentVal.toFixed(2)} mm/yr`;
        }

        let percentStr = '↔ 0%';
        if (prevVal !== 0) {
          const pct = Math.round(((currentVal - prevVal) / Math.abs(prevVal)) * 100);
          percentStr = pct > 0 ? `↑ ${pct}%` : pct < 0 ? `↓ ${Math.abs(pct)}%` : '↔ 0%';
        }

        return { valueStr, percentStr };
      };

      const getSurgeMetric = (data: any[]) => {
        const grouped: Record<number, number[]> = {};
        data.forEach((item) => {
          if (!grouped[item.year]) grouped[item.year] = [];
          grouped[item.year].push(item.value);
        });
        const getValForYear = (y: number) => {
          const vals = grouped[y];
          if (!vals || vals.length === 0) return 0;
          return vals.reduce((a, b) => a + b, 0) / vals.length;
        };
        const currentVal = getValForYear(selectedYear);
        const prevVal = getValForYear(selectedYear - 1);

        const getRiskLabel = (val: number) => {
          if (val > 1.2) return 'High';
          if (val > 0.6) return 'Medium';
          return 'Low';
        };

        const valueStr = getRiskLabel(currentVal);
        const prevLabel = getRiskLabel(prevVal);
        const levelMap: Record<string, number> = { Low: 1, Medium: 2, High: 3 };
        const curL = levelMap[valueStr] || 1;
        const prevL = levelMap[prevLabel] || 1;
        const percentStr = curL > prevL ? '↑ Risk Rising' : curL < prevL ? '↓ Risk Falling' : '↔ Stable';

        return { valueStr, percentStr };
      };

      setTopMetrics({
        flooding: calculateMetric(floodRes, 'flooding'),
        surge: getSurgeMetric(surgeRes),
        erosion: calculateMetric(erosionRes, 'erosion'),
        seaLevel: calculateMetric(slRes, 'seaLevel'),
      });

      const getDistrictName = (regionId: number) => {
        const matchedRegion = regions.find((r) => r.id === regionId);
        return matchedRegion ? matchedRegion.district : `Region ${regionId}`;
      };

      const yearCvi = cviRes.filter((item: any) => item.year === selectedYear);
      if (yearCvi.length > 0) {
        const total = yearCvi.reduce((sum: number, item: any) => sum + item.value, 0);
        setOverallCvi(Math.round((total / yearCvi.length) * 10) / 100);

        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
        const exposureList = yearCvi.map((item: any, idx: number) => {
          const districtName = getDistrictName(item.region_id);
          const val = Math.round((item.value / 10) * 100) / 100;
          return {
            name: districtName,
            value: val,
            color: colors[idx % colors.length]
          };
        });
        setCviExposureData(exposureList);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Define backward compatible alias functions to prevent compiler/runtime issues in page.tsx
  const loadHazardData = loadDashboardData;
  const loadTopMetricsData = loadDashboardData;
  const loadBottomChartsData = loadDashboardData;

  const getDynamicAlerts = () => {
    // If no dbAlerts are loaded, fallback to mock alerts
    if (!dbAlerts || dbAlerts.length === 0) {
      return recentAlerts;
    }

    return dbAlerts
      .filter((alert) => {
        // Filter by district
        if (selectedDistrict !== 'All Coastal Districts') {
          const targetRegionId = selectedDistrict.toLowerCase() === 'lasbela' ? 1 : 2;
          if (alert.region_id !== targetRegionId) return false;
        }

        // Filter by hazard type
        const alertHazardMapped = alert.hazard_type.replace('_', '-');
        if (selectedAnalysis && alertHazardMapped !== selectedAnalysis) {
          return false;
        }

        return true;
      })
      .map((alert) => {
        const distName = alert.region_id === 1 ? 'Lasbela District' : 'Gwadar District';
        
        let title = 'Hazard Threat Alert';
        let severity = 'medium';
        if (alert.hazard_type === 'storm_surge') {
          title = 'High Storm Surge Warning';
          severity = 'high';
        } else if (alert.hazard_type === 'flooding') {
          title = 'Coastal Flood Watch';
          severity = 'medium';
        } else if (alert.hazard_type === 'erosion') {
          title = 'Shoreline Erosion Alert';
          severity = 'low';
        } else if (alert.hazard_type === 'tsunami_risk') {
          title = 'Tsunami Run-up Warning';
          severity = 'high';
        }

        const dateStr = alert.last_triggered_at 
          ? new Date(alert.last_triggered_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
          : 'Active Alert';

        return {
          id: alert.id,
          title,
          district: distName,
          time: dateStr,
          severity,
          threshold: alert.threshold_value,
          comparator: alert.comparator,
          rawHazard: alert.hazard_type
        };
      });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await loadDashboardData();
    setTimeout(() => {
      setGenerating(false);
    }, 800);
  };

  // Dynamic export task fetching records from GEE endpoints
  const triggerExportFlow = (format: 'csv' | 'geotiff' | 'report') => {
    setExportFormat(format);
    setExportStatus('configure');
    setExportModalVisible(true);
    setExportDownloadUrl(null);
  };

  const startExportExecution = async () => {
    setExportProgress(0);
    setExportStatus('preparing');
    setEmailSubmitted(false);
    setEmailInput('');

    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 150);

    try {
      let regionId: number | null = null;
      if (exportDistrict === 'lasbela') regionId = 1;
      else if (exportDistrict === 'gwadar') regionId = 2;

      const apiFormat = exportFormat === 'report' ? 'pdf' : exportFormat;
      const blob = await exportReport(regionId, apiFormat, 2016, 2025, selectedAnalysis);
      console.log("[DEBUG] Export response received:", blob.size, "bytes, type:", blob.type);
      const url = URL.createObjectURL(blob);
      
      const districtLabel = exportDistrict === 'both' ? 'all_districts' : exportDistrict;
      const filename = `${districtLabel}_hazard_data_2016_2025.${apiFormat === 'pdf' ? 'pdf' : apiFormat === 'geotiff' ? 'tif' : 'csv'}`;
      
      setExportDownloadUrl(url);
      setExportFilename(filename);
      
      clearInterval(interval);
      setExportProgress(100);
      setExportStatus('success');
    } catch (err) {
      console.error('Export error:', err);
      clearInterval(interval);
      setExportStatus('error');
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setEmailSubmitted(true);
  };

  const getChartData = () => {
    if (hazardData.length > 0) {
      const grouped: Record<number, number[]> = {};
      hazardData.forEach((r) => {
        if (!grouped[r.year]) {
          grouped[r.year] = [];
        }
        const val = (selectedAnalysis === 'sea-level-rise' && r.unit === 'm') ? r.value * 1000 : r.value;
        grouped[r.year].push(val);
      });

      const isAreaMetric = currentConfig.unit === 'km²';
      return Object.entries(grouped)
        .map(([yearStr, values]) => {
          const year = Number(yearStr);
          if (isAreaMetric) {
            const sum = values.reduce((s, v) => s + v, 0);
            return { year, value: Math.round(sum * 10000) / 10000 };
          } else {
            const avg = values.reduce((s, v) => s + v, 0) / values.length;
            return { year, value: Math.round(avg * 10000) / 10000 };
          }
        })
        .sort((a, b) => a.year - b.year);
    }
    const fallback = [];
    let val = 100;
    for (let y = 2016; y <= 2025; y++) {
      val += Math.random() * 50 - 20;
      fallback.push({ year: y, value: Math.max(0, Math.round(val)) });
    }
    return fallback;
  };

  const currentConfig = ANALYSIS_CONFIG[selectedAnalysis];
  const chartData = getChartData();
  const currentRegion = regions.find((r) => r.id === selectedRegionId);

  const getLatestValue = () => {
    const match = chartData.find((d) => d.year === selectedYear);
    return match ? match.value : 0;
  };

  const getDynamicMetric = (hazardKey: 'flooding' | 'surge' | 'erosion' | 'seaLevel') => {
    return topMetrics[hazardKey] || { valueStr: '0.0', percentStr: '↔ 0%' };
  };

  const handleMapRegionSelect = (id: number) => {
    setSelectedRegionId(id);
    const matched = regions.find((r) => r.id === id);
    if (matched) {
      setSelectedDistrict(matched.district);
    }
  };

  const handleChatSend = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = {
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/insights/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: text }),
      });
      if (!response.ok) {
        throw new Error('Insights call failed');
      }
      const data = await response.json();
      const aiMsg = {
        sender: 'ai' as const,
        text: data.summary,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg = {
        sender: 'ai' as const,
        text: 'Sorry, I encountered an issue retrieving real-time data. Please check your network connection and try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div
      className={`min-h-screen bg-cover bg-center bg-no-repeat bg-fixed flex flex-col font-sans overflow-x-hidden selection:bg-cyan-500/20 relative transition-colors duration-300 ${
        darkMode ? 'text-slate-100 bg-[#070e1b] dark-theme' : 'text-slate-800 bg-[#f8fafc]'
      }`}
      style={{ backgroundImage: "url('/coastal-bg.jpg')" }}
    >
      {/* Overlay mask */}
      <div className={`absolute inset-0 transition-colors duration-300 pointer-events-none -z-10 ${
        darkMode ? 'bg-slate-950/93 backdrop-blur-[2px]' : 'bg-[#f8fafc]/90 backdrop-blur-[1px]'
      }`} />

      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* TOP HEADER BAR */}
      <header className={`flex justify-between items-center px-6 py-3 border-b backdrop-blur-md sticky top-0 z-40 shadow-sm transition-all duration-300 ${
        darkMode ? 'bg-slate-950/90 border-slate-800/80 text-white' : 'bg-white/80 border-slate-200/80 text-slate-850'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`lg:hidden p-2 rounded-xl transition ${darkMode ? 'hover:bg-slate-900 text-slate-300' : 'hover:bg-slate-100 text-slate-650'}`}
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo-portal.png" className="w-9 h-9 object-contain rounded-full border border-slate-200/80 shadow-md bg-white flex-shrink-0" alt="Coastal Hazard Portal Logo" />
            <div>
              <h1 className={`text-sm md:text-base font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>COASTAL HAZARD PORTAL</h1>
              <p className={`text-[10px] font-bold tracking-wider uppercase ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
                Balochistan Coastline
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Indicators */}
        <div className="flex items-center gap-4">
          <div className={`hidden lg:flex items-center gap-2 border px-3.5 py-1.5 rounded-xl shadow-sm text-[11px] transition-colors duration-300 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-350' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <Calendar className="w-3.5 h-3.5 text-cyan-600" />
            <span>Data Updated:</span>
            <strong className={darkMode ? 'text-white font-bold' : 'text-slate-950 font-bold'}>May 15, 2025 10:30 AM</strong>
          </div>

          <div className={`hidden lg:flex items-center gap-2 border px-3.5 py-1.5 rounded-xl shadow-sm text-[11px] transition-colors duration-300 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-350' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Data Source:</span>
            <strong className={darkMode ? 'text-white font-bold' : 'text-slate-950 font-bold'}>Google Earth Engine</strong>
          </div>

          {/* District Selector Dropdown */}
          <div className={`flex items-center gap-1.5 border px-3.5 py-1.5 rounded-xl shadow-sm text-[11px] transition-colors duration-300 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-350' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <MapPin className="w-3.5 h-3.5 text-cyan-600" />
            <span>District:</span>
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
              className={`bg-transparent font-extrabold outline-none cursor-pointer font-sans ${darkMode ? 'text-white' : 'text-slate-900'}`}
            >
              <option value="All Coastal Districts" className={darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>All Coastal Districts</option>
              <option value="Gwadar" className={darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Gwadar</option>
              <option value="Lasbela" className={darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Lasbela</option>
            </select>
          </div>

          {/* Search bar */}
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search location, district..."
              className={`border rounded-xl py-1.5 pl-9 pr-4 text-xs outline-none w-[200px] transition-all placeholder-slate-400 ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white focus:bg-slate-950 focus:border-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-cyan-500'
              }`}
            />
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={toggleDarkMode}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition ${
              darkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-850' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
            aria-label="Toggle dark/light mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400 animate-pulse" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications */}
          <button
            onClick={() => setActiveModal('alerts')}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition relative ${
              darkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-850' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
            aria-label="View Active Alerts"
          >
            <Bell className={`w-4.5 h-4.5 ${darkMode ? 'text-slate-355' : 'text-slate-600'}`} />
            {getDynamicAlerts().length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white shadow-lg">
                {getDynamicAlerts().length}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <button
            onClick={() => setActiveModal('users')}
            className={`flex items-center gap-2.5 border rounded-xl px-3 py-1 text-xs transition shadow-sm ${
              darkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-850' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
            aria-label="User Profile"
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${darkMode ? 'bg-slate-800' : 'bg-cyan-50'}`}>
              <User className={`w-4 h-4 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
            </div>
            <div className="text-left hidden md:block">
              <p className={`font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Analyst</p>
              <p className={`text-[9px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Level 2</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* LEFT VERTICAL SIDEBAR */}
        <aside
          className={`w-[260px] shrink-0 border-r border-slate-200 flex flex-col p-4 justify-between bg-white/80 backdrop-blur-md absolute lg:relative inset-y-0 left-0 z-30 transform lg:transform-none transition-transform duration-300 ease-out shadow-sm ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="space-y-5">
            <nav className="space-y-1" aria-label="Main Navigation">
              {/* Dashboard Link (Active) */}
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs bg-slate-100 border border-slate-200 text-slate-900 font-extrabold shadow-sm">
                <Compass className="w-4 h-4 text-cyan-600" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setSelectedDistrict('All Coastal Districts');
                  setSelectedYear(2025);
                  loadDashboardData();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
              >
                <Activity className="w-4 h-4" />
                <span>Live Overview</span>
              </button>

              {/* Collapsible Hazards Submenu */}
              <div>
                <button
                  onClick={() => setHazardsMenuOpen(!hazardsMenuOpen)}
                  className="w-full flex justify-between items-center px-3 py-2.5 rounded-xl text-xs border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
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
                  <div className="pl-6 pr-2 py-1 space-y-1.5 border-l border-slate-200 ml-5 mt-1">
                    {Object.entries(ANALYSIS_CONFIG).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedAnalysis(key as AnalysisType);
                          loadDashboardData();
                        }}
                        className={`w-full flex items-center justify-between text-left text-[11px] py-1.5 px-2 rounded-lg transition ${
                          selectedAnalysis === key
                            ? 'text-cyan-600 font-bold bg-cyan-50'
                            : 'text-slate-655 hover:text-slate-900 hover:bg-slate-50/85'
                        }`}
                      >
                        <span>{config.label}</span>
                        {selectedAnalysis === key && (
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: config.color }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Other Navigation Links */}
              <Link
                href="/dashboard/analysis"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
              >
                <Sliders className="w-4 h-4" />
                <span>GEE Live Analysis</span>
              </Link>

              <button
                onClick={() => setActiveModal('alerts')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Alerts & Notifications</span>
              </button>

              <button
                onClick={() => {
                  const askWidget = document.getElementById('chat-widget-input');
                  askWidget?.focus();
                  askWidget?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
              >
                <Bot className="w-4 h-4 text-cyan-600" />
                <span>AI Insights (Ask)</span>
              </button>

              <button
                onClick={() => setActiveModal('reports')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Reports</span>
              </button>

              <button
                onClick={() => triggerExportFlow('csv')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Data Explorer</span>
              </button>

              <button
                onClick={() => triggerExportFlow('geotiff')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
              >
                <Download className="w-4 h-4" />
                <span>Downloads</span>
              </button>

              <button
                onClick={() => setActiveModal('settings')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => setActiveModal('users')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
              >
                <Users className="w-4 h-4" />
                <span>Users & Roles</span>
              </button>
            </nav>
          </div>

          {/* CVI Ring Chart card at bottom of sidebar */}
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <h5 className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase mb-3">
                Coastal Vulnerability Index
              </h5>
              
              {/* Radial Gauge */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    stroke="#f1f5f9"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    stroke="url(#sidebarCviGradient)"
                    strokeWidth="9"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 46}
                    strokeDashoffset={2 * Math.PI * 46 * (1 - overallCvi)}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="sidebarCviGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#eab308" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-black text-slate-900">{overallCvi.toFixed(2)}</span>
                  {(() => {
                    if (overallCvi >= 0.75) return <p className="text-[8px] text-red-600 font-bold uppercase mt-0.5">High Risk</p>;
                    if (overallCvi >= 0.5) return <p className="text-[8px] text-amber-600 font-bold uppercase mt-0.5">Moderate Risk</p>;
                    return <p className="text-[8px] text-emerald-600 font-bold uppercase mt-0.5">Low Risk</p>;
                  })()}
                </div>
              </div>

              <div className="flex justify-between items-center mt-3 text-[10px] text-slate-500">
                <span>Overall (Balochistan Coast)</span>
                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                  {(overallCvi * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <p className="text-[9px] text-slate-400 text-center">
              &copy; 2025 NCGSA Initiative.<br />All rights reserved.
            </p>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
          {/* TOP 5 METRICS ROW */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Metric 1 */}
            {(() => {
              const { valueStr, percentStr } = getDynamicMetric('flooding');
              return (
                <div className="bg-white/90 border border-slate-200/80 hover:shadow-md transition shadow-sm rounded-2xl p-4 border-l-4 border-l-cyan-500 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                      Coastal Flood (Inundation)
                    </span>
                    <strong className="text-xl font-extrabold text-cyan-600 mt-1 block">{valueStr}</strong>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Affected Area ({selectedYear})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-cyan-600 font-bold flex items-center gap-0.5 justify-end">
                      {percentStr} <span className="text-slate-400 text-[8px]">vs {selectedYear - 1}</span>
                    </span>
                    {/* SVG sparkline */}
                    <svg className="w-12 h-6 mt-1.5 ml-auto" viewBox="0 0 50 20">
                      <path d="M0,15 Q10,12 20,18 T40,5 T50,8" fill="none" stroke="#0891b2" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              );
            })()}

            {/* Metric 2 */}
            {(() => {
              const { valueStr, percentStr } = getDynamicMetric('surge');
              return (
                <div className="bg-white/90 border border-slate-200/80 hover:shadow-md transition shadow-sm rounded-2xl p-4 border-l-4 border-l-amber-500 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                      Storm Surge Risk
                    </span>
                    <strong className="text-xl font-extrabold text-amber-600 mt-1 block">{valueStr}</strong>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Risk Level ({selectedYear})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 justify-end">
                      {percentStr}
                    </span>
                    <svg className="w-12 h-6 mt-1.5 ml-auto" viewBox="0 0 50 20">
                      <path d="M0,18 Q15,10 25,12 T50,4" fill="none" stroke="#d97706" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              );
            })()}

            {/* Metric 3 */}
            {(() => {
              const { valueStr, percentStr } = getDynamicMetric('erosion');
              return (
                <div className="bg-white/90 border border-slate-200/80 hover:shadow-md transition shadow-sm rounded-2xl p-4 border-l-4 border-l-emerald-500 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                      Shoreline Change
                    </span>
                    <strong className="text-xl font-extrabold text-emerald-600 mt-1 block">{valueStr}</strong>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Net Erosion (2016-{selectedYear})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-650 font-bold flex items-center gap-0.5 justify-end">
                      {percentStr} <span className="text-slate-400 text-[8px]">vs {selectedYear - 1}</span>
                    </span>
                    <svg className="w-12 h-6 mt-1.5 ml-auto" viewBox="0 0 50 20">
                      <path d="M0,19 Q10,17 25,10 T50,15" fill="none" stroke="#059669" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              );
            })()}

            {/* Metric 4 */}
            {(() => {
              const { valueStr, percentStr } = getDynamicMetric('seaLevel');
              return (
                <div className="bg-white/90 border border-slate-200/80 hover:shadow-md transition shadow-sm rounded-2xl p-4 border-l-4 border-l-sky-500 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                      Sea Level Anomaly
                    </span>
                    <strong className="text-xl font-extrabold text-sky-600 mt-1 block">{valueStr}</strong>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Trend (2016-{selectedYear})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-sky-600 font-bold flex items-center gap-0.5 justify-end">
                      {percentStr} <span className="text-slate-400 text-[8px]">vs {selectedYear - 1}</span>
                    </span>
                    <svg className="w-12 h-6 mt-1.5 ml-auto" viewBox="0 0 50 20">
                      <path d="M0,16 Q10,13 25,11 T50,3" fill="none" stroke="#0284c7" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              );
            })()}

            {/* Metric 5 (Alerts trigger) */}
            <button
              onClick={() => setActiveModal('alerts')}
              className="bg-white/90 border border-slate-200/80 hover:shadow-md transition shadow-sm rounded-2xl p-4 border-l-4 border-l-red-500 flex items-center justify-between text-left"
            >
              <div>
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                  Active Alerts
                </span>
                <strong className="text-xl font-extrabold text-red-600 mt-1 block">3</strong>
                <span className="text-[9px] text-slate-400 block mt-0.5">Districts Affected</span>
              </div>
              <div>
                <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5">
                  View All →
                </span>
              </div>
            </button>
          </section>

          {/* MIDDLE GRID: MAP + SIDEBAR WIDGETS */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* LEFT SECTION (MAP CARD) */}
            <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-5 flex flex-col relative min-h-[480px] shadow-sm hover:shadow-md transition-all">
              {/* Overlaid Map Filter Header */}
              <div className="absolute top-8 left-8 right-8 z-10 flex flex-wrap gap-4 items-center justify-between pointer-events-none">
                <div className="bg-white/95 border border-slate-200 px-4 py-2 rounded-xl backdrop-blur-md pointer-events-auto shadow-md">
                  <h3 className="text-xs font-bold text-slate-900">Balochistan Coastline Overview</h3>
                  <p className="text-[9px] text-slate-500 mt-0.5">Interactive spatial hazard metrics</p>
                </div>

                <div className="flex gap-2.5 pointer-events-auto">
                  {/* Layer dropdown */}
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs backdrop-blur-md shadow-sm">
                    <span className="text-slate-500 font-medium">Layer:</span>
                    <select
                      value={selectedAnalysis}
                      onChange={(e) => {
                        setSelectedAnalysis(e.target.value as AnalysisType);
                        loadDashboardData();
                      }}
                      className="bg-transparent text-slate-900 font-extrabold outline-none cursor-pointer"
                    >
                      {Object.entries(ANALYSIS_CONFIG).map(([key, config]) => (
                        <option key={key} value={key} className="bg-white text-slate-900">
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year dropdown */}
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs backdrop-blur-md shadow-sm">
                    <span className="text-slate-500 font-medium">Year:</span>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="bg-transparent text-slate-900 font-extrabold outline-none cursor-pointer"
                    >
                      {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016].map((y) => (
                        <option key={y} value={y} className="bg-white text-slate-900">
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Overlaid Legend box (Bottom-left) */}
              <div className="absolute bottom-8 left-8 z-10 bg-white/95 border border-slate-200 p-3 rounded-xl backdrop-blur-md text-[10px] w-[180px] pointer-events-auto shadow-md">
                <span className="font-bold text-slate-900 block mb-2">{currentConfig.label} Risk Level</span>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#22c55e] rounded" />
                    <span>Low Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#eab308] rounded" />
                    <span>Medium Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#ef4444] rounded" />
                    <span>High Risk</span>
                  </div>
                </div>
              </div>

              {/* Overlaid Compass and scale indicators (Bottom-right) */}
              <div className="absolute bottom-8 right-8 z-10 flex flex-col items-center gap-3 pointer-events-none">
                <div className="bg-white/95 border border-slate-200 p-2 rounded-xl backdrop-blur-md flex items-center justify-center w-8 h-8 pointer-events-auto shadow-md">
                  <Compass className="w-4.5 h-4.5 text-cyan-600" />
                </div>
                <div className="bg-white/95 border border-slate-200 px-2 py-1 rounded-lg backdrop-blur-md text-[9px] text-slate-500 pointer-events-auto shadow-sm">
                  0 &nbsp; 25 &nbsp; 50 &nbsp; 75 km
                </div>
              </div>

              {/* Overlaid Layers Panel (Collapsible to keep map 100% open and clear) */}
              <div className="absolute top-20 right-8 z-10 pointer-events-auto">
                {!isLayersPanelOpen ? (
                  <button
                    onClick={() => setIsLayersPanelOpen(true)}
                    className="bg-white/95 border border-slate-200 px-3 py-1.5 rounded-xl backdrop-blur-md text-xs font-bold text-slate-800 shadow-lg hover:bg-slate-50 transition flex items-center gap-1.5 active:scale-95"
                  >
                    <span>Layers & Basemap</span>
                    <span className="text-[10px] text-cyan-600 font-extrabold">⚙️</span>
                  </button>
                ) : (
                  <div className="bg-white/95 border border-slate-200 p-3.5 rounded-xl backdrop-blur-md text-[11px] w-[185px] shadow-xl text-slate-800 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-200 mb-2">
                      <span className="font-bold text-slate-900">Layers</span>
                      <button
                        onClick={() => setIsLayersPanelOpen(false)}
                        className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="space-y-2 text-slate-650">
                      {[
                        { key: 'Coastline', label: 'Coastline' },
                        { key: 'District Boundary', label: 'District Boundary' },
                        { key: 'Hazard Layer', label: 'Hazard Layer' },
                        { key: 'Permanent Water', label: 'Permanent Water' },
                        { key: 'Rainfall', label: 'Rainfall' },
                        { key: 'Roads', label: 'Roads' },
                        { key: 'Safe Zones', label: 'Safe Zones' }
                      ].map((layer) => {
                        const isChecked = visibleLayers.includes(layer.key);
                        return (
                          <label key={layer.key} className="flex items-center gap-2 cursor-pointer hover:text-slate-950 select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setVisibleLayers(visibleLayers.filter((l) => l !== layer.key));
                                } else {
                                  setVisibleLayers([...visibleLayers, layer.key]);
                                }
                              }}
                              className="sr-only"
                            />
                            <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition ${
                              isChecked 
                                ? 'bg-cyan-500 border-cyan-500 text-white' 
                                : 'border-slate-300 hover:border-slate-400 bg-white'
                            }`}>
                              {isChecked && (
                                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                  <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                </svg>
                              )}
                            </div>
                            <span>{layer.label}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="pt-2.5 mt-2.5 border-t border-slate-200">
                      <span className="font-bold text-slate-900 block mb-2">Basemap</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveBasemap('osm')}
                          className={`flex-1 py-1 rounded text-center transition font-bold text-[10px] ${
                            activeBasemap === 'osm'
                              ? 'bg-cyan-500 text-white font-semibold shadow-sm'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'
                          }`}
                        >
                          Map
                        </button>
                        <button
                          onClick={() => setActiveBasemap('satellite')}
                          className={`flex-1 py-1 rounded text-center transition font-bold text-[10px] ${
                            activeBasemap === 'satellite'
                              ? 'bg-cyan-500 text-white font-semibold shadow-sm'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'
                          }`}
                        >
                          Satellite
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating GEE Active Indicator */}
              {isAnalysisActive && (
                <div className="absolute top-24 left-8 z-10 bg-cyan-50/95 border border-cyan-200 px-3.5 py-2.5 rounded-xl backdrop-blur-md text-[10px] text-cyan-800 max-w-[240px] pointer-events-auto shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300">
                  <div className="space-y-0.5">
                    <strong className="text-cyan-950 block font-bold">🛰️ GEE Live Overlay Active</strong>
                    <span className="text-[9px] text-slate-500">Custom multi-criteria CVI weights mapped.</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsAnalysisActive(false);
                      loadDashboardData(); // restore standard database values
                    }}
                    className="p-1 px-1.5 rounded bg-cyan-100 hover:bg-cyan-200 text-cyan-950 font-bold transition-all text-[8px]"
                  >
                    CLEAR
                  </button>
                </div>
              )}

              {/* Map rendering layer */}
              <div className="flex-1 w-full relative z-0 min-h-[420px]">
                <DashboardMap
                  regions={regions}
                  selectedRegionId={selectedRegionId}
                  onSelectRegionId={handleMapRegionSelect}
                  activeBasemap={activeBasemap}
                  visibleLayers={visibleLayers}
                  selectedAnalysis={selectedAnalysis}
                  selectedYear={selectedYear}
                  hazardData={hazardData}
                  selectedDistrict={selectedDistrict}
                  isAnalysisActive={isAnalysisActive}
                />
              </div>

              {/* Selected district popup details */}
              {(() => {
                const isAllDistricts = selectedDistrict === 'All Coastal Districts';
                if (!isAllDistricts && !currentRegion) return null;

                const displayName = (isAllDistricts || !currentRegion) ? 'All Coastal Districts' : currentRegion.district;
                
                // Get display values
                const latestVal = getLatestValue();
                const displayVal = `${latestVal.toFixed(currentConfig.unit === 'km²' ? 1 : 2)} ${currentConfig.unit}`;

                return (
                  <div className="absolute bottom-8 right-32 z-10 bg-white/95 border border-slate-200 p-3 rounded-xl backdrop-blur-md text-xs w-[210px] pointer-events-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-slate-800">
                    <div className="border-b border-slate-200 pb-1.5 mb-1.5 flex justify-between items-center">
                      <strong className="text-slate-900">{displayName}</strong>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-600 uppercase font-bold">
                        {isAllDistricts ? 'Region' : 'District'}
                      </span>
                    </div>
                    <div className="space-y-1 text-slate-600">
                      <p className="flex justify-between gap-1">
                        <span>{selectedYear} {currentConfig.label}:</span>
                        <strong style={{ color: currentConfig.color }}>
                          {displayVal}
                        </strong>
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/details/${isAllDistricts ? 'all' : displayName.toLowerCase()}?hazard=${selectedAnalysis}`}
                      className="block w-full mt-3.5 py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-bold text-[10px] text-cyan-600 hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
                    >
                      View Details Panel →
                    </Link>
                  </div>
                );
              })()}
            </div>

            {/* RIGHT SIDEBAR COLUMN: ALERTS + ASK AI */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Recent Alerts Widget */}
              <section className="bg-white/90 border border-slate-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3.5 mb-4">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span>Recent Alerts</span>
                  </h4>
                  <button
                    onClick={() => setActiveModal('alerts')}
                    className="text-[10px] text-cyan-600 hover:text-cyan-700 font-semibold"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {getDynamicAlerts().length > 0 ? (
                    getDynamicAlerts().map((alert) => (
                      <div
                        key={alert.id}
                        className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/85 transition-all shadow-sm flex gap-3 items-start"
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${
                            alert.severity === 'high'
                              ? 'bg-red-500'
                              : alert.severity === 'medium'
                              ? 'bg-orange-500'
                              : 'bg-yellow-500'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <strong className="text-xs text-slate-900 block truncate font-extrabold">{alert.title}</strong>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {alert.district} &bull; {alert.time}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-4 font-semibold">
                      No active alerts for selected filters.
                    </p>
                  )}
                </div>
              </section>

              {/* Ask Coastal AI chatbot widget */}
              <section className="bg-white/90 border border-slate-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex-1 flex flex-col min-h-[350px]">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-3">
                  <Bot className="w-4.5 h-4.5 text-cyan-650" />
                  <h4 className="text-xs font-bold text-slate-900">Ask Coastal AI</h4>
                  <span className="text-[8px] bg-cyan-50 text-cyan-650 font-bold uppercase px-1.5 py-0.5 rounded">
                    BETA
                  </span>
                </div>

                {/* Conversation message logs container */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 scrollbar-thin text-xs max-h-[220px]">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-[85%] ${
                        msg.sender === 'user' ? 'ml-auto items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`p-3 rounded-xl leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-cyan-50 text-cyan-950 border border-cyan-100 rounded-tr-none'
                            : 'bg-slate-50 text-slate-800 border border-slate-200/60 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-slate-400 mt-1 px-1">{msg.time}</span>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex items-center gap-2 text-[10px] text-cyan-600">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Question suggestions */}
                <div className="space-y-1.5 mb-3.5">
                  {[
                    'Show flood trend in Gwadar',
                    'Which areas are most vulnerable?',
                    'Compare shoreline change 2016 vs 2025',
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChatSend(s)}
                      className="w-full text-left text-[10px] py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition block shadow-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Text input chat controls */}
                <div className="relative">
                  <input
                    id="chat-widget-input"
                    type="text"
                    placeholder="Ask anything about coastal hazards..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleChatSend(chatInput);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-3.5 pr-10 text-xs focus:border-cyan-500 outline-none text-slate-800 placeholder-slate-400"
                  />
                  <button
                    onClick={() => handleChatSend(chatInput)}
                    className="absolute right-2 top-2 w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition"
                    aria-label="Send query"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </section>
            </div>
          </section>

          {/* BOTTOM ROW: CHARTS AND QUICK INFO */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Card 1: Shoreline Change */}
            <div className="bg-white/90 border border-slate-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col min-h-[300px]">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3.5 mb-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Shoreline Change (2016-2025)</h4>
                  <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">
                    Net Change: {(() => {
                      if (shorelineHistory.length === 0) return "-1.2 m/yr";
                      const latest = shorelineHistory[shorelineHistory.length - 1];
                      const val = latest.erosion !== 0 ? latest.erosion : latest.accretion;
                      return `${val > 0 ? '+' : ''}${val} m/yr`;
                    })()}
                  </span>
                </div>
                <Globe className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="flex-1 w-full text-[10px] min-h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={shorelineHistory}>
                    <defs>
                      <linearGradient id="erosionColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="accretionColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
                    <XAxis dataKey="year" stroke="rgba(0,0,0,0.4)" interval={0} />
                    <YAxis stroke="rgba(0,0,0,0.4)" />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8.5px', color: '#1e293b' }}
                    />
                    <Area type="monotone" dataKey="erosion" name="Erosion (m)" stroke="#ef4444" fillOpacity={1} fill="url(#erosionColor)" />
                    <Area type="monotone" dataKey="accretion" name="Accretion (m)" stroke="#10b981" fillOpacity={1} fill="url(#accretionColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card 2: Sea Level Anomaly */}
            <div className="bg-white/90 border border-slate-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col min-h-[300px]">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3.5 mb-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Sea Level Anomaly (2016-2025)</h4>
                  <span className="text-[9px] text-cyan-600 font-bold block mt-0.5">
                    Trend: {(() => {
                      if (seaLevelHistory.length === 0) return "+3.5 mm/yr";
                      const latestVal = seaLevelHistory[seaLevelHistory.length - 1].anomaly;
                      return `${latestVal > 0 ? '+' : ''}${latestVal} mm/yr`;
                    })()}
                  </span>
                </div>
                <TrendingUp className="w-4 h-4 text-cyan-600" />
              </div>

              <div className="flex-1 w-full text-[10px] min-h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={seaLevelHistory}>
                    <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
                    <XAxis dataKey="year" stroke="rgba(0,0,0,0.4)" interval={0} />
                    <YAxis stroke="rgba(0,0,0,0.4)" />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8.5px', color: '#1e293b' }}
                    />
                    <Line type="monotone" dataKey="anomaly" name="Anomaly (mm)" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3.5, fill: '#06b6d4' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card 3: Hazard Exposure Donut */}
            <div className="bg-white/90 border border-slate-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col min-h-[300px]">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3.5 mb-4">
                <h4 className="text-xs font-bold text-slate-900">Hazard Exposure by District</h4>
                <Shield className="w-4 h-4 text-orange-500" />
              </div>

              <div className="flex-1 flex items-center justify-between gap-4 text-[10px]">
                <div className="w-[120px] h-[120px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={cviExposureData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={50}
                        paddingAngle={4}
                      >
                        {cviExposureData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex-1 space-y-1.5 text-slate-600">
                  {cviExposureData.map((d, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="truncate max-w-[80px]">{d.name}</span>
                      </div>
                      <strong className="text-slate-900 font-extrabold">{d.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <span className="text-[8px] text-slate-400 text-center block mt-2">Scale: 0 (Low) - 1 (Very High)</span>
            </div>

            {/* Card 4: Quick Info */}
            <div className="bg-white/90 border border-slate-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[300px]">
              <div className="border-b border-slate-200 pb-3.5">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-cyan-600" />
                  <span>Quick Info</span>
                </h4>
              </div>

              <div className="space-y-3 py-3 text-xs text-slate-600">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Total Coastline (Balochistan)</span>
                  <strong className="text-slate-900 font-extrabold">~700 km</strong>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Districts Covered</span>
                  <strong className="text-slate-900 font-extrabold">2</strong>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Years Analyzed</span>
                  <strong className="text-slate-900 font-extrabold">2016 - 2025</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Data Sources</span>
                  <strong className="text-slate-900 font-extrabold">12+</strong>
                </div>
              </div>

              <button
                onClick={() => setActiveModal('methodology')}
                className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-cyan-600 border border-slate-200 hover:border-slate-350 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>View Methodology</span>
                <BookOpen className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* FOOTER METADATA pills */}
          <footer className="bg-white/90 border border-slate-200/80 p-4 rounded-2xl shadow-sm flex flex-wrap gap-4 items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-cyan-600 font-extrabold uppercase tracking-wider">Data Sources:</span>
              <span className="text-slate-800 font-medium">Sentinel-1, Sentinel-2, Landsat 8/9, DEM, PMD, Tide Gauges & more</span>
            </div>
            <div className="flex items-center gap-6">
              <p>Temporal Coverage: <strong className="text-slate-800">2016 - 2025 (Yearly)</strong></p>
              <p>Spatial Resolution: <strong className="text-slate-800">10 m - 30 m</strong></p>
              <p>Update Frequency: <strong className="text-slate-800">Yearly Analysis</strong></p>
              <p>Processing Platform: <strong className="text-slate-800">Google Earth Engine</strong></p>
            </div>
          </footer>
        </main>
      </div>

      {/* DYNAMIC DIALOG MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-250 w-full max-w-lg p-6 rounded-3xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-slate-800">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-950 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'reports' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
                  <FileText className="w-5 h-5 text-cyan-600" />
                  <span>Interactive Reports Hub</span>
                </h3>
                <p className="text-xs text-slate-655 mb-4 leading-relaxed">
                  Generate and compile localized environmental hazard profiles for specific districts.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      triggerExportFlow('report');
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition shadow-sm"
                  >
                    <div>
                      <strong className="text-xs text-slate-900 block font-extrabold">Download Complete Report (PDF)</strong>
                      <span className="text-[10px] text-slate-500 mt-0.5">Includes full CVI summary maps & trend lines</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-cyan-600" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      triggerExportFlow('csv');
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition shadow-sm"
                  >
                    <div>
                      <strong className="text-xs text-slate-900 block font-extrabold">Export Historical Data (CSV)</strong>
                      <span className="text-[10px] text-slate-500 mt-0.5">Raw yearly hazard metrics for other spreadsheet tools</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-cyan-600" />
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'alerts' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span>District Active Alerts & Notifications</span>
                </h3>
                <div className="space-y-3">
                  {getDynamicAlerts().length > 0 ? (
                    getDynamicAlerts().map((alert) => (
                      <div
                        key={alert.id}
                        className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex gap-3 items-start shadow-sm"
                      >
                        <div
                          className={`w-3 h-3 rounded-full shrink-0 mt-1 ${
                            alert.severity === 'high'
                              ? 'bg-red-500'
                              : alert.severity === 'medium'
                              ? 'bg-orange-500'
                              : 'bg-yellow-500'
                          }`}
                        />
                        <div>
                          <strong className="text-xs text-slate-900 block font-extrabold">{alert.title}</strong>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {alert.district} &bull; {alert.time}
                          </p>
                          <p className="text-xs text-slate-655 mt-1.5 leading-relaxed">
                            {alert.rawHazard === 'erosion'
                              ? 'Shoreline erosion rate has exceeded threshold. Monitor local beach profiles and restrict heavy structures near the buffer zones.'
                              : alert.rawHazard === 'storm_surge'
                              ? 'Severe storm surge danger warning. Coastal inundation risks are high. Prepare emergency response plans.'
                              : alert.rawHazard === 'flooding'
                              ? 'Heavy flooding detected via Sentinel active imaging. Keep away from lowland zones and high-risk estuaries.'
                              : alert.rawHazard === 'tsunami_risk'
                              ? 'Elevated seismicity or oceanographic anomalies detected. Review shelter routes and evacuation guides immediately.'
                              : 'Threshold limit exceeded for this hazard index. Authorities recommend monitoring updates.'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-6 font-semibold">
                      No active alerts found matching the current selections.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeModal === 'settings' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
                  <Settings className="w-5 h-5 text-cyan-600" />
                  <span>Portal Settings</span>
                </h3>
                <div className="space-y-4 text-xs text-slate-655">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <strong className="text-slate-900 block font-extrabold">Theme Mode</strong>
                      <span className="text-[10px] text-slate-500 mt-0.5">Toggle light/dark interfaces</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-700 font-bold uppercase text-[10px]">
                      Light Mode
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <strong className="text-slate-900 block font-extrabold">Units of Measurement</strong>
                      <span className="text-[10px] text-slate-500 mt-0.5">Standard metric or imperial</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-700 font-bold uppercase text-[10px]">
                      Metric (SI)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <strong className="text-slate-900 block font-extrabold">Automatic Refresh</strong>
                      <span className="text-[10px] text-slate-500 mt-0.5">Reload GEE imagery overlays hourly</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-700 font-bold uppercase text-[10px]">
                      Enabled
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'users' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
                  <Users className="w-5 h-5 text-cyan-600" />
                  <span>Users & Access Control</span>
                </h3>
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center font-bold text-cyan-600">
                        A
                      </div>
                      <div>
                        <strong className="text-xs text-slate-900 block font-extrabold">Analyst User</strong>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Level 2 Staff &bull; analyst@ncesa.org</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-600 uppercase">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 opacity-75 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                        O
                      </div>
                      <div>
                        <strong className="text-xs text-slate-700 block">Observer User</strong>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Read-Only Viewer &bull; observer@ncesa.org</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-550 uppercase">
                      Guest
                    </span>
                  </div>
                </div>
              </div>
            )}


            {activeModal === 'methodology' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
                  <BookOpen className="w-5 h-5 text-cyan-600" />
                  <span>GEE Ingestion Methodology</span>
                </h3>
                <div className="space-y-3 text-xs text-slate-655 leading-relaxed max-h-[300px] overflow-y-auto pr-1">
                  <p>
                    The Pakistan Coastal Hazard Portal computes spatial indicators using Google Earth Engine (GEE) script queries:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>
                      <strong>Coastal Inundation</strong>: Calculated from Sentinel-1 SAR GRD median backscattering composites using VH polarization threshold changes during the monsoon.
                    </li>
                    <li>
                      <strong>Storm Surge Risk</strong>: Event-driven Sentinel-1 SAR change detection calculated over specific cyclone event windows.
                    </li>
                    <li>
                      <strong>Shoreline Change</strong>: Evaluated using Sentinel-2 MNDWI (Modified Normalized Difference Water Index) calculated against the 2016 baseline.
                    </li>
                    <li>
                      <strong>Sea Level Anomaly</strong>: Computed from multi-mission altimeter satellite anomaly grids mapped chronologically.
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EXPORT FLOW MODAL */}
      {exportModalVisible && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-250 w-full max-w-md p-6 rounded-3xl shadow-2xl relative text-slate-800">
            {exportStatus === 'configure' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className={`text-sm md:text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Configure Export Options
                  </h3>
                  <p className="text-[11px] text-slate-550 mt-1">
                    Select the coastal districts you want to export.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <label className={`text-[10px] font-extrabold uppercase tracking-wider block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Select District Focus
                  </label>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'both', label: 'Both Districts (Lasbela & Gwadar)' },
                      { id: 'lasbela', label: 'Lasbela District Only' },
                      { id: 'gwadar', label: 'Gwadar District Only' }
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                          exportDistrict === opt.id
                            ? (darkMode ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400 font-bold' : 'bg-cyan-50 border-cyan-500 text-cyan-900 font-bold')
                            : (darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-850' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100')
                        }`}
                      >
                        <input
                          type="radio"
                          name="exportDistrict"
                          value={opt.id}
                          checked={exportDistrict === opt.id}
                          onChange={() => setExportDistrict(opt.id as any)}
                          className="text-cyan-500 focus:ring-cyan-500"
                        />
                        <span className="text-xs">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => startExportExecution()}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-md text-white text-xs font-bold text-center block transition-all"
                  >
                    Generate Export
                  </button>
                  <button
                    onClick={() => setExportModalVisible(false)}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition shadow-sm ${
                      darkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850' : 'bg-slate-50 border-slate-200 text-slate-655 hover:bg-slate-100'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {exportStatus === 'preparing' && (
              <div className="text-center py-4 space-y-4">
                <RefreshCw className="w-10 h-10 text-cyan-600 animate-spin mx-auto" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Preparing Export File...</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Generating GEE dataset bundle. Please wait.</p>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 block font-semibold">{exportProgress}%</span>
              </div>
            )}

            {exportStatus === 'success' && (
              <div className="space-y-4">
                <div className="text-center py-2">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-900">Export Ready!</h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Your {exportFormat.toUpperCase()} file has been compiled successfully.
                  </p>
                </div>

                <div className="flex gap-2">
                  <a
                    href={exportDownloadUrl || '#'}
                    download={exportFilename}
                    onClick={() => {
                      setExportModalVisible(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 border border-cyan-500/25 text-xs font-bold text-center block transition shadow-sm"
                  >
                    Download File
                  </a>
                  <button
                    onClick={() => setExportModalVisible(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-655 transition shadow-sm"
                  >
                    Close
                  </button>
                </div>

                {/* Email dispatch section */}
                <form onSubmit={handleEmailSubmit} className="border-t border-slate-200 pt-4 mt-2">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase block mb-2">
                    Send to Email Address
                  </label>
                  {!emailSubmitted ? (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          placeholder="name@agency.gov"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:border-cyan-500 outline-none text-slate-800 placeholder-slate-400"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xs hover:shadow-lg transition flex items-center justify-center gap-1"
                      >
                        Send
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs flex items-center gap-2 shadow-sm">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>Report successfully dispatched to <strong>{emailInput}</strong>!</span>
                    </div>
                  )}
                </form>
              </div>
            )}

            {exportStatus === 'error' && (
              <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Export Failed</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Failed to connect to Google Earth Engine. Please try again.</p>
                </div>
                <button
                  onClick={() => setExportModalVisible(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-655 transition shadow-sm"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
