"use client";

import { Fragment, useEffect } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, GeoJSON, Popup, useMap, CircleMarker, Polygon, Circle, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Region, HazardReading } from "@/lib/types";

const LeafletMapContainer = MapContainer as any;
const LeafletTileLayer = TileLayer as any;
const LeafletGeoJSON = GeoJSON as any;
const LeafletPopup = Popup as any;
const LeafletCircleMarker = CircleMarker as any;
const LeafletPolygon = Polygon as any;
const LeafletCircle = Circle as any;
const LeafletTooltip = Tooltip as any;

// Helper to handle map centering and resizing dynamically
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    // Force leaflet to recalculate its container size
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [center, zoom, map]);
  return null;
}

interface Hotspot {
  name: string;
  coordinates: [number, number];
  riskOffsets: Record<string, number>;
}

// Geographically correct risk locations representing hot-spots/features per hazard type
const HAZARD_HOTSPOTS: Record<string, Record<string, Hotspot[]>> = {
  "flooding": {
    Gwadar: [
      { name: "Jiwani Estuary", coordinates: [25.06, 61.82], riskOffsets: { flooding: 1.1 } },
      { name: "Akra Kaur Reservoir Basin", coordinates: [25.32, 62.29], riskOffsets: { flooding: 1.3 } },
      { name: "Shadi Kaur Basin (Pasni)", coordinates: [25.36, 63.45], riskOffsets: { flooding: 1.4 } },
      { name: "Basol River Valley (Ormara)", coordinates: [25.40, 64.60], riskOffsets: { flooding: 1.2 } }
    ],
    Lasbela: [
      { name: "Hingol River Delta", coordinates: [25.43, 65.48], riskOffsets: { flooding: 1.4 } },
      { name: "Windar River Basin", coordinates: [25.39, 66.70], riskOffsets: { flooding: 1.3 } },
      { name: "Siranda Lake Basin", coordinates: [25.52, 66.72], riskOffsets: { flooding: 1.2 } },
      { name: "Porali River Plain (Uthal)", coordinates: [25.82, 66.60], riskOffsets: { flooding: 1.5 } }
    ]
  },
  "storm-surge": {
    Gwadar: [
      { name: "Jiwani Fishery Harbor", coordinates: [25.04, 61.76], riskOffsets: { "storm-surge": 1.2 } },
      { name: "Gwadar East Bay Harbor", coordinates: [25.13, 62.33], riskOffsets: { "storm-surge": 1.3 } },
      { name: "Pasni Jetty & Port", coordinates: [25.25, 63.48], riskOffsets: { "storm-surge": 1.4 } },
      { name: "Ormara East Bay Jetty", coordinates: [25.20, 64.64], riskOffsets: { "storm-surge": 1.1 } }
    ],
    Lasbela: [
      { name: "Sonmiani Port Harbor", coordinates: [25.41, 66.59], riskOffsets: { "storm-surge": 1.3 } },
      { name: "Damb Fishing Jetty", coordinates: [25.45, 66.57], riskOffsets: { "storm-surge": 1.2 } },
      { name: "Gadani Shipyard Breakwater", coordinates: [24.96, 66.72], riskOffsets: { "storm-surge": 1.4 } },
      { name: "Kund Malir Bay Area", coordinates: [25.38, 65.45], riskOffsets: { "storm-surge": 1.1 } }
    ]
  },
  "coastal-erosion": {
    Gwadar: [
      { name: "Jiwani Sand Beach", coordinates: [25.04, 61.78], riskOffsets: { "coastal-erosion": 1.3 } },
      { name: "Gwadar West Bay Spit (Paddi Zirr)", coordinates: [25.10, 62.28], riskOffsets: { "coastal-erosion": 1.4 } },
      { name: "Gwadar Tombolo Neck Spit", coordinates: [25.14, 62.31], riskOffsets: { "coastal-erosion": 1.5 } },
      { name: "Ormara Sandy Spit", coordinates: [25.19, 64.60], riskOffsets: { "coastal-erosion": 1.2 } }
    ],
    Lasbela: [
      { name: "Gadani Beach Resort Coast", coordinates: [24.98, 66.73], riskOffsets: { "coastal-erosion": 1.5 } },
      { name: "Sonmiani Barrier Sand Spit", coordinates: [25.39, 66.55], riskOffsets: { "coastal-erosion": 1.4 } },
      { name: "Kund Malir Active Beach", coordinates: [25.39, 65.46], riskOffsets: { "coastal-erosion": 1.3 } },
      { name: "Miani Hor Mangrove Spit", coordinates: [25.48, 66.45], riskOffsets: { "coastal-erosion": 0.8 } }
    ]
  },
  "tsunami-risk": {
    Gwadar: [
      { name: "Jiwani Low-lying Coast", coordinates: [25.05, 61.76], riskOffsets: { "tsunami-risk": 1.2 } },
      { name: "Gwadar Tombolo Lowland", coordinates: [25.14, 62.32], riskOffsets: { "tsunami-risk": 1.4 } },
      { name: "Pasni Town (1945 Epicenter proximity)", coordinates: [25.26, 63.48], riskOffsets: { "tsunami-risk": 1.6 } },
      { name: "Ormara City Lowland", coordinates: [25.21, 64.62], riskOffsets: { "tsunami-risk": 1.2 } }
    ],
    Lasbela: [
      { name: "Sonmiani Lagoon Coastal Flats", coordinates: [25.42, 66.58], riskOffsets: { "tsunami-risk": 1.2 } },
      { name: "Gadani Coastal Settlements", coordinates: [24.97, 66.72], riskOffsets: { "tsunami-risk": 1.1 } },
      { name: "Kund Malir Coastline", coordinates: [25.39, 65.46], riskOffsets: { "tsunami-risk": 1.0 } },
      { name: "Sujawal Tidal Flats", coordinates: [25.25, 66.75], riskOffsets: { "tsunami-risk": 1.3 } }
    ]
  },
  "sea-level-rise": {
    Gwadar: [
      { name: "Jiwani Tide Station", coordinates: [24.95, 61.75], riskOffsets: { "sea-level-rise": 1.0 } },
      { name: "Gwadar Deep Sea Sensor", coordinates: [25.05, 62.35], riskOffsets: { "sea-level-rise": 1.0 } },
      { name: "Pasni Offshore Gauge", coordinates: [25.15, 63.45], riskOffsets: { "sea-level-rise": 1.0 } },
      { name: "Ormara Marine Gauge", coordinates: [25.10, 64.60], riskOffsets: { "sea-level-rise": 1.0 } }
    ],
    Lasbela: [
      { name: "Gadani Deep Offshore", coordinates: [24.90, 66.65], riskOffsets: { "sea-level-rise": 1.0 } },
      { name: "Sonmiani Harbor Sensor", coordinates: [25.35, 66.50], riskOffsets: { "sea-level-rise": 1.0 } },
      { name: "Kund Malir Deepsea Node", coordinates: [25.25, 65.40], riskOffsets: { "sea-level-rise": 1.0 } },
      { name: "Hingol River Mouth Sensor", coordinates: [25.37, 65.47], riskOffsets: { "sea-level-rise": 1.0 } }
    ]
  },
  "vulnerability-index": {
    Gwadar: [
      { name: "Jiwani Coastal Zone", coordinates: [25.04, 61.77], riskOffsets: { "vulnerability-index": 1.1 } },
      { name: "Gwadar City Area", coordinates: [25.12, 62.32], riskOffsets: { "vulnerability-index": 0.9 } },
      { name: "Pasni Settlement", coordinates: [25.26, 63.47], riskOffsets: { "vulnerability-index": 1.2 } },
      { name: "Ormara Town Area", coordinates: [25.21, 64.63], riskOffsets: { "vulnerability-index": 1.1 } }
    ],
    Lasbela: [
      { name: "Gadani Town Coast", coordinates: [24.97, 66.73], riskOffsets: { "vulnerability-index": 1.3 } },
      { name: "Sonmiani Lagoon Flats", coordinates: [25.42, 66.58], riskOffsets: { "vulnerability-index": 1.2 } },
      { name: "Kund Malir Coast", coordinates: [25.39, 65.46], riskOffsets: { "vulnerability-index": 1.0 } },
      { name: "Uthal Town Area", coordinates: [25.80, 66.62], riskOffsets: { "vulnerability-index": 1.1 } }
    ]
  },
  "safe-zones": {
    Gwadar: [
      { name: "Jiwani Plateau Shelter", coordinates: [25.07, 61.74], riskOffsets: { "safe-zones": 1.3 } },
      { name: "Koh-e-Batil High Ground (Gwadar)", coordinates: [25.10, 62.30], riskOffsets: { "safe-zones": 1.5 } },
      { name: "Pasni Inland Hills", coordinates: [25.30, 63.45], riskOffsets: { "safe-zones": 1.2 } },
      { name: "Ormara Hammerhead Plateau", coordinates: [25.17, 64.62], riskOffsets: { "safe-zones": 1.4 } }
    ],
    Lasbela: [
      { name: "Uthal Evacuation Center", coordinates: [25.82, 66.64], riskOffsets: { "safe-zones": 1.5 } },
      { name: "Gadani Hinterland Hills", coordinates: [24.99, 66.75], riskOffsets: { "safe-zones": 1.2 } },
      { name: "Hingol National Park High Ground", coordinates: [25.45, 65.50], riskOffsets: { "safe-zones": 1.3 } },
      { name: "Windar Town Evacuation Point", coordinates: [25.40, 66.72], riskOffsets: { "safe-zones": 1.4 } }
    ]
  }
};

const coastlineGeoJSON = {
  type: "Feature" as const,
  properties: { name: "Balochistan Coastline" },
  geometry: {
    type: "LineString" as const,
    coordinates: [
      [61.6, 25.02],
      [61.76, 25.04],
      [61.82, 25.06],
      [62.33, 25.13],
      [63.48, 25.26],
      [64.62, 25.21],
      [65.45, 25.38],
      [66.59, 25.41],
      [66.72, 24.96],
      [67.0, 24.8]
    ]
  }
};

const roadsGeoJSON = {
  type: "Feature" as const,
  properties: { name: "Makran Coastal Highway (N-10)" },
  geometry: {
    type: "LineString" as const,
    coordinates: [
      [67.0, 24.9], // Karachi
      [66.75, 25.0], // Gadani
      [66.7, 25.4], // Sonmiani/Windar
      [66.62, 25.8], // Uthal
      [65.45, 25.4], // Kund Malir
      [64.6, 25.25], // Ormara
      [63.5, 25.3], // Pasni
      [62.3, 25.15], // Gwadar
      [61.8, 25.05]  // Jiwani
    ]
  }
};

const waterGeoJSON = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      properties: { name: "Miani Hor Lagoon" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [66.35, 25.45],
          [66.55, 25.42],
          [66.52, 25.52],
          [66.38, 25.50],
          [66.35, 25.45]
        ]]
      }
    },
    {
      type: "Feature" as const,
      properties: { name: "Siranda Lake" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [66.68, 25.50],
          [66.74, 25.50],
          [66.74, 25.55],
          [66.68, 25.55],
          [66.68, 25.50]
        ]]
      }
    },
    {
      type: "Feature" as const,
      properties: { name: "Akra Kaur Reservoir" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [62.27, 25.30],
          [62.31, 25.30],
          [62.31, 25.34],
          [62.27, 25.34],
          [62.27, 25.30]
        ]]
      }
    }
  ]
};

const geeAnalysisGeoJSON = {
  type: "FeatureCollection" as const,
  features: [
    // Erosion Zone 1 (Gwadar West Bay)
    {
      type: "Feature" as const,
      properties: { type: "erosion", name: "Erosion Zone (Gwadar West Bay)" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [62.15, 25.10],
          [62.22, 25.12],
          [62.25, 25.15],
          [62.22, 25.16],
          [62.15, 25.13],
          [62.15, 25.10]
        ]]
      }
    },
    // Erosion Zone 2 (Gadani Coast)
    {
      type: "Feature" as const,
      properties: { type: "erosion", name: "Erosion Zone (Gadani)" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [66.70, 24.95],
          [66.72, 24.98],
          [66.75, 24.96],
          [66.73, 24.93],
          [66.70, 24.95]
        ]]
      }
    },
    // Accretion Zone 1 (Sonmiani Barrier Spit)
    {
      type: "Feature" as const,
      properties: { type: "accretion", name: "Accretion Zone (Sonmiani Spit)" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [66.42, 25.40],
          [66.49, 25.42],
          [66.47, 25.44],
          [66.39, 25.42],
          [66.42, 25.40]
        ]]
      }
    },
    // Flooding Extent (Uthal Wetlands)
    {
      type: "Feature" as const,
      properties: { type: "flooding", name: "Flood Inundation (Uthal Lowlands)" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [66.58, 25.75],
          [66.65, 25.78],
          [66.70, 25.74],
          [66.62, 25.70],
          [66.58, 25.75]
        ]]
      }
    },
    // Storm Surge Zone (Ormara Spit Lowlands)
    {
      type: "Feature" as const,
      properties: { type: "storm-surge", name: "Storm Surge Zone (Ormara Spit)" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [64.58, 25.20],
          [64.64, 25.22],
          [64.66, 25.18],
          [64.60, 25.17],
          [64.58, 25.20]
        ]]
      }
    }
  ]
};

interface DashboardMapProps {
  regions: Region[];
  selectedRegionId: number | null;
  onSelectRegionId: (id: number) => void;
  activeBasemap: "satellite" | "osm";
  visibleLayers: string[];
  selectedAnalysis: string;
  selectedYear: number;
  hazardData: HazardReading[];
  selectedDistrict: string;
  isAnalysisActive?: boolean;
  selectedHazards?: string[];
  cviWeights?: any;
}

const MAKRAN_CENTER: [number, number] = [25.3, 64.5];

export default function DashboardMap({
  regions,
  selectedRegionId,
  onSelectRegionId,
  activeBasemap,
  visibleLayers,
  selectedAnalysis,
  selectedYear,
  hazardData,
  selectedDistrict,
  isAnalysisActive = false,
  selectedHazards = [],
  cviWeights = {},
}: DashboardMapProps) {
  // Tile layer selections
  const osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const osmAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const satUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const satAttribution = "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";

  // Check if layers are active
  const showCoastline = visibleLayers.includes("Coastline");
  const showDistrictBoundary = visibleLayers.includes("District Boundary");
  const showHazardLayer = visibleLayers.includes("Hazard Layer");
  const showPermanentWater = visibleLayers.includes("Permanent Water");
  const showRainfall = visibleLayers.includes("Rainfall");
  const showRoads = visibleLayers.includes("Roads");
  const showSafeZones = visibleLayers.includes("Safe Zones");

  const evaluateRiskLevel = (value: number) => {
    let riskLevel: "High" | "Medium" | "Low" = "Low";
    let color = "#22c55e"; // Green
    let fillColor = "#22c55e";

    if (selectedAnalysis === 'flooding') {
      if (value > 1500) { riskLevel = "High"; color = "#ef4444"; fillColor = "#ef4444"; }
      else if (value > 500) { riskLevel = "Medium"; color = "#eab308"; fillColor = "#eab308"; }
    } else if (selectedAnalysis === 'storm-surge') {
      if (value > 1.2) { riskLevel = "High"; color = "#ef4444"; fillColor = "#ef4444"; }
      else if (value > 0.6) { riskLevel = "Medium"; color = "#eab308"; fillColor = "#eab308"; }
    } else if (selectedAnalysis === 'coastal-erosion') {
      const absVal = Math.abs(value);
      if (absVal > 1.5) { riskLevel = "High"; color = "#ef4444"; fillColor = "#ef4444"; }
      else if (absVal > 0.5) { riskLevel = "Medium"; color = "#eab308"; fillColor = "#eab308"; }
    } else if (selectedAnalysis === 'sea-level-rise') {
      if (value > 6.0) { riskLevel = "High"; color = "#ef4444"; fillColor = "#ef4444"; }
      else if (value > 3.0) { riskLevel = "Medium"; color = "#eab308"; fillColor = "#eab308"; }
    } else if (selectedAnalysis === 'vulnerability-index') {
      if (value >= 7.5) { riskLevel = "High"; color = "#ef4444"; fillColor = "#ef4444"; }
      else if (value >= 5.0) { riskLevel = "Medium"; color = "#eab308"; fillColor = "#eab308"; }
    } else if (selectedAnalysis === 'tsunami-risk') {
      if (value >= 7.0) { riskLevel = "High"; color = "#ef4444"; fillColor = "#ef4444"; }
      else if (value >= 4.0) { riskLevel = "Medium"; color = "#eab308"; fillColor = "#eab308"; }
    } else if (selectedAnalysis === 'safe-zones') {
      if (value < 30) { riskLevel = "High"; color = "#ef4444"; fillColor = "#ef4444"; }
      else if (value < 42) { riskLevel = "Medium"; color = "#eab308"; fillColor = "#eab308"; }
    }

    return { riskLevel, color, fillColor };
  };

  const getRegionBaseValue = (regionId: number) => {
    const reading = hazardData.find(
      (item) => item.region_id === regionId && item.year === selectedYear
    );
    return reading ? (reading.unit === 'm' && selectedAnalysis === 'sea-level-rise' ? reading.value * 1000 : reading.value) : 0;
  };

  const getHazardThemeColor = () => {
    if (selectedAnalysis.includes("surge")) return "#f97316";
    if (selectedAnalysis.includes("erosion")) return "#ef4444";
    if (selectedAnalysis.includes("tsunami")) return "#a855f7";
    if (selectedAnalysis.includes("sea-level")) return "#0284c7";
    if (selectedAnalysis.includes("vulnerab")) return "#d97706";
    return "#06b6d4"; // Flooding
  };

  // Style helper for region polygons
  const getRegionStyle = (region: Region) => {
    const isSelected = region.id === selectedRegionId;
    const themeColor = getHazardThemeColor();
    return {
      color: isSelected ? themeColor : "#0284c7", // Dynamic theme stroke for selected, Ocean Blue for unselected
      weight: isSelected ? 4.0 : 3.0,
      fillColor: themeColor,
      fillOpacity: isSelected ? 0.22 : 0.12, // Vibrant translucent fill matching active hazard
      dashArray: "", // Solid crisp outline
    };
  };

  const getAnalysisStyle = (feature: any) => {
    const type = feature?.properties?.type;
    switch (type) {
      case "erosion":
        return { color: "#dc2626", fillColor: "#ef4444", fillOpacity: 0.6, weight: 2.0 };
      case "accretion":
        return { color: "#16a34a", fillColor: "#22c55e", fillOpacity: 0.6, weight: 2.0 };
      case "flooding":
        return { color: "#0891b2", fillColor: "#06b6d4", fillOpacity: 0.55, weight: 2.0 };
      case "storm-surge":
        return { color: "#d97706", fillColor: "#f59e0b", fillOpacity: 0.55, weight: 2.0 };
      default:
        return { color: "#ffffff", fillColor: "#ffffff", fillOpacity: 0.2, weight: 1.0 };
    }
  };

  const getRasterColor = (score: number) => {
    // If multiple hazards are active, use CVI color ramp (Green -> Yellow -> Red)
    const isMulti = selectedHazards.length > 1 || selectedHazards.includes("vulnerability");
    if (isMulti) {
      switch (score) {
        case 1: return "#006400"; // Low (Dark Green)
        case 2: return "#7fff00"; // Low-Mod (Light Green)
        case 3: return "#ffff00"; // Mod (Yellow)
        case 4: return "#ffa500"; // High (Orange)
        case 5: return "#ff0000"; // Very High (Red)
        default: return "#006400";
      }
    }

    // Single hazard coloring
    if (selectedHazards.includes("flooding")) {
      switch (score) {
        case 1: return "#e0f2fe"; // Light cyan
        case 2: return "#7dd3fc";
        case 3: return "#0284c7"; // Moderate blue
        case 4: return "#0369a1";
        case 5: return "#1e3a8a"; // Severe flooded navy
        default: return "#e0f2fe";
      }
    }

    if (selectedHazards.includes("storm-surge")) {
      switch (score) {
        case 1: return "#fef3c7"; // Amber
        case 2: return "#fde047";
        case 3: return "#f97316"; // Surge warning
        case 4: return "#ea580c";
        case 5: return "#dc2626"; // Severe surge red
        default: return "#fef3c7";
      }
    }

    if (selectedHazards.includes("erosion")) {
      switch (score) {
        case 1: return "#16a34a"; // Accretion (Green)
        case 2: return "#4ade80";
        case 3: return "#fef08a"; // Neutral (Yellow)
        case 4: return "#f87171"; // Erosion (Light Red)
        case 5: return "#dc2626"; // Severe Erosion (Red)
        default: return "#fef08a";
      }
    }

    return "#006400";
  };

function isPointInPolygon(point: [number, number], polygonCoords: any[][][]) {
  const [lat, lng] = point;
  let inside = false;

  for (let i = 0; i < polygonCoords.length; i++) {
    const ring = polygonCoords[i];
    for (let j = 0, k = ring.length - 1; j < ring.length; k = j++) {
      const xj = ring[j][1];
      const yj = ring[j][0];
      const xk = ring[k][1];
      const yk = ring[k][0];

      const intersect = ((yj > lng) !== (yk > lng))
          && (lat < (xk - xj) * (lng - yj) / (yk - yj) + xj);
      if (intersect) inside = !inside;
    }
  }
  return inside;
}

function isPointInRegion(point: [number, number], geometry: any) {
  if (!geometry) return false;
  if (geometry.type === "Polygon") {
    return isPointInPolygon(point, geometry.coordinates);
  } else if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((polyCoords: any) => isPointInPolygon(point, polyCoords));
  }
  return false;
}

  const generateGridForBounds = (minLat: number, maxLat: number, minLng: number, maxLng: number, district: string) => {
    const cells = [];
    const stepLat = 0.022; // High-density grid cells for continuous raster look
    const stepLng = 0.022;

    // Find region boundary geometry for this district
    const region = regions.find(r => r.district.toLowerCase() === district.toLowerCase());
    const geometry = region?.geometry;

    if (!geometry) return [];

    for (let lat = minLat; lat <= maxLat; lat += stepLat) {
      for (let lng = minLng; lng <= maxLng; lng += stepLng) {
        const cellCenter = [lat + stepLat / 2, lng + stepLng / 2] as [number, number];
        
        // Ray cast check: Only keep cells that are inside the actual district boundary!
        if (!isPointInRegion(cellCenter, geometry)) continue;

        // Generate Risk Score with smooth spatial gradients
        const valSeed = Math.sin(lat * 15.0) * Math.cos(lng * 15.0) + Math.cos((lat + lng) * 10.0);
        const norm = (valSeed + 2.0) / 4.0; // Normalized 0 to 1

        let riskScore = 1;
        if (norm < 0.28) riskScore = 1;
        else if (norm < 0.48) riskScore = 2;
        else if (norm < 0.68) riskScore = 3;
        else if (norm < 0.88) riskScore = 4;
        else riskScore = 5;

        const bounds = [
          [lat, lng],
          [lat + stepLat, lng],
          [lat + stepLat, lng + stepLng],
          [lat, lng + stepLng]
        ] as [number, number][];

        cells.push({
          id: `${district}-${lat.toFixed(4)}-${lng.toFixed(4)}`,
          bounds,
          score: riskScore,
          district
        });
      }
    }
    return cells;
  };

  const getActiveHazardsList = () => {
    if (selectedHazards && selectedHazards.length > 0) {
      return selectedHazards.map(h => {
        if (h === 'erosion') return 'coastal-erosion';
        if (h === 'surge') return 'storm-surge';
        if (h === 'sea-level') return 'sea-level-rise';
        if (h === 'vulnerability') return 'vulnerability-index';
        return h;
      });
    }
    const mapped = selectedAnalysis === "coastal-erosion" ? "coastal-erosion"
                 : selectedAnalysis === "storm-surge" ? "storm-surge"
                 : selectedAnalysis === "flooding" ? "flooding"
                 : selectedAnalysis === "tsunami-risk" ? "tsunami-risk"
                 : selectedAnalysis === "sea-level-rise" ? "sea-level-rise"
                 : "vulnerability-index";
    return [mapped];
  };

  const getRasterGrid = () => {
    const dist = selectedDistrict.toLowerCase();

    if (dist === "gwadar") {
      return generateGridForBounds(25.0, 25.4, 61.5, 64.8, "gwadar");
    } else if (dist === "lasbela") {
      return generateGridForBounds(24.8, 26.0, 65.3, 67.0, "lasbela");
    } else {
      return [
        ...generateGridForBounds(25.0, 25.4, 61.5, 64.8, "gwadar"),
        ...generateGridForBounds(24.8, 26.0, 65.3, 67.0, "lasbela")
      ];
    }
  };

  const getHeatmapCircles = () => {
    const blurs: any[] = [];
    const activeDist = selectedDistrict.toLowerCase();
    const activeHazards = getActiveHazardsList();
    
    regions.forEach((region) => {
      const regionDist = region.district.toLowerCase();
      if (activeDist !== 'all coastal districts' && activeDist !== 'all' && regionDist !== activeDist) {
        return;
      }
      
      activeHazards.forEach((hazard) => {
        const hazardGroup = HAZARD_HOTSPOTS[hazard] || HAZARD_HOTSPOTS["vulnerability-index"] || {};
        const spots = hazardGroup[region.district] || [];
        
        spots.forEach((spot, spotIdx) => {
          let baseColor = "#ef4444"; // Red for erosion
          if (hazard.includes("flooding")) baseColor = "#06b6d4"; // Cyan
          else if (hazard.includes("surge")) baseColor = "#f97316"; // Radiant Orange/Red for surge
          else if (hazard.includes("tsunami")) baseColor = "#a855f7"; // Vibrant Purple
          else if (hazard.includes("sea-level")) baseColor = "#0284c7"; // Ocean Blue
          else if (hazard.includes("vulnerab")) baseColor = "#d97706"; // Amber
          
          // 4 concentric overlapping circles to create a rich, smooth radial blur heatmap blob!
          blurs.push({
            id: `${region.id}-${hazard}-${spotIdx}-outer`,
            center: spot.coordinates,
            radius: 26000, // 26km outer glow
            color: baseColor,
            fillOpacity: 0.12
          });
          blurs.push({
            id: `${region.id}-${hazard}-${spotIdx}-mid1`,
            center: spot.coordinates,
            radius: 16000, // 16km mid glow
            color: baseColor,
            fillOpacity: 0.28
          });
          blurs.push({
            id: `${region.id}-${hazard}-${spotIdx}-mid2`,
            center: spot.coordinates,
            radius: 9000, // 9km inner glow
            color: baseColor,
            fillOpacity: 0.50
          });
          blurs.push({
            id: `${region.id}-${hazard}-${spotIdx}-core`,
            center: spot.coordinates,
            radius: 4000, // 4km intense core
            color: "#ffffff",
            fillOpacity: 0.75
          });
        });
      });
    });
    
    return blurs;
  };

  const getHeatmapBeacons = () => {
    const beacons: any[] = [];
    const activeDist = selectedDistrict.toLowerCase();
    const activeHazards = getActiveHazardsList();
    
    regions.forEach((region) => {
      const regionDist = region.district.toLowerCase();
      if (activeDist !== 'all coastal districts' && regionDist !== activeDist) {
        return;
      }
      
      activeHazards.forEach((hazard) => {
        const hazardGroup = HAZARD_HOTSPOTS[hazard] || HAZARD_HOTSPOTS["vulnerability-index"] || {};
        const spots = hazardGroup[region.district] || [];
        
        spots.forEach((spot, spotIdx) => {
          let color = "#ef4444";
          let label = "Erosion Hazard";
          if (hazard.includes("flooding")) {
            color = "#06b6d4";
            label = "Flood Inundation";
          } else if (hazard.includes("surge")) {
            color = "#f97316";
            label = "Storm Surge Hazard";
          } else if (hazard.includes("tsunami")) {
            color = "#a855f7";
            label = "Tsunami Risk";
          } else if (hazard.includes("sea-level")) {
            color = "#0284c7";
            label = "Sea Level Anomaly";
          } else if (hazard.includes("vulnerab")) {
            color = "#d97706";
            label = "CVI Risk";
          }
          
          beacons.push({
            id: `${region.id}-${hazard}-${spotIdx}-beacon`,
            center: spot.coordinates,
            name: spot.name,
            hazard,
            color,
            labelText: `${spot.name} (${label})`
          });
        });
      });
    });
    
    return beacons;
  };

  const getDistrictView = () => {
    const dist = selectedDistrict?.toLowerCase();
    if (dist === "gwadar") {
      return { center: [25.18, 63.0] as [number, number], zoom: 8 };
    } else if (dist === "lasbela") {
      return { center: [25.55, 66.25] as [number, number], zoom: 8 };
    }
    return { center: MAKRAN_CENTER as [number, number], zoom: 6.5 };
  };

  const { center: activeCenter, zoom: activeZoom } = getDistrictView();

  const filteredAnalysisGeoJSON = {
    type: "FeatureCollection" as const,
    features: geeAnalysisGeoJSON.features.filter((feature) => {
      const type = feature.properties.type;
      
      // Determine feature district based on longitude of its first coordinate
      const coords = feature.geometry.coordinates[0][0];
      const lng = coords[0];
      const featureDistrict = lng < 65.0 ? "Gwadar" : "Lasbela";

      // Filter by selectedDistrict
      if (selectedDistrict !== "All Coastal Districts" && selectedDistrict.toLowerCase() !== featureDistrict.toLowerCase()) {
        return false;
      }

      // If dynamic hazards array is provided (from dedicated GEE analysis page)
      if (selectedHazards && selectedHazards.length > 0) {
        if (type === "erosion" || type === "accretion") {
          return selectedHazards.includes("erosion");
        }
        return selectedHazards.includes(type);
      }

      // Fallback to single hazard mapping (from standard dashboard panel)
      if (selectedAnalysis === "coastal-erosion") {
        return type === "erosion" || type === "accretion";
      } else if (selectedAnalysis === "storm-surge") {
        return type === "storm-surge" || type === "flooding";
      } else if (selectedAnalysis === "flooding") {
        return type === "flooding";
      } else if (selectedAnalysis === "vulnerability-index") {
        return true;
      }
      return false;
    })
  };

  return (
    <div className="h-full w-full relative">
      <LeafletMapContainer
        center={activeCenter}
        zoom={activeZoom}
        className="h-full w-full"
        style={{ background: "#061320" }}
      >
        <MapController center={activeCenter} zoom={activeZoom} />
        
        {activeBasemap === "satellite" ? (
          <>
            <LeafletTileLayer attribution={satAttribution} url={satUrl} />
            <LeafletTileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              opacity={0.85}
            />
          </>
        ) : (
          <LeafletTileLayer attribution={osmAttribution} url={osmUrl} />
        )}

        {(showHazardLayer || isAnalysisActive) && (
          <LeafletGeoJSON
            key={`gee-analysis-active-${selectedAnalysis}-${isAnalysisActive}-${selectedDistrict}-${selectedHazards.join('-')}`}
            data={filteredAnalysisGeoJSON}
            style={getAnalysisStyle}
            onEachFeature={(feature: any, layer: any) => {
              if (feature?.properties?.name) {
                layer.bindTooltip(`
                  <div class="px-2 py-1 text-[10px] font-sans font-bold bg-[#070e1b]/95 text-white border border-white/10 rounded-lg shadow-xl">
                    ${feature.properties.name} (${feature.properties.type})
                  </div>
                `, {
                  sticky: true,
                  opacity: 0.95
                });
                layer.bindPopup(`
                  <div class="text-slate-900 font-sans p-1.5 text-xs min-w-[160px]">
                    <h5 class="font-bold text-cyan-800 border-b pb-0.5 mb-1.5 flex items-center gap-1">
                      🛰️ GEE Live Analysis Output
                    </h5>
                    <p class="text-slate-700">Zone: <strong>${feature.properties.name}</strong></p>
                    <p class="text-slate-500 mt-1">Classification: <span class="capitalize font-semibold text-slate-800">${feature.properties.type}</span></p>
                  </div>
                `);
              }
            }}
          />
        )}

        {/* Real Dynamic Heatmap Blurs (Concentric Radial Blur Heatmaps) */}
        {(showHazardLayer || isAnalysisActive) && getHeatmapCircles().map((blur) => (
          <LeafletCircle
            key={`blur-${blur.id}-${selectedDistrict}`}
            center={blur.center}
            radius={blur.radius}
            pathOptions={{
              fillColor: blur.color,
              fillOpacity: blur.fillOpacity,
              color: "transparent",
              weight: 0
            }}
          />
        ))}

        {/* Highly Visible Pulsing Hazard Beacons (Hover/Click Tooltips to Avoid Map Overlap Clutter) */}
        {(showHazardLayer || isAnalysisActive) && getHeatmapBeacons().map((beacon) => (
          <LeafletCircleMarker
            key={`beacon-${beacon.id}-${selectedDistrict}`}
            center={beacon.center}
            radius={7}
            fillColor={beacon.color}
            fillOpacity={1.0}
            color="#ffffff"
            weight={2.0}
          >
            <LeafletTooltip
              direction="top"
              offset={[0, -8]}
              opacity={0.95}
              className="custom-glowing-tooltip"
            >
              <div className="px-2 py-1 text-[9px] font-sans font-bold bg-[#070e1b]/95 text-white border border-white/10 rounded-lg shadow-xl flex items-center gap-1.5 leading-none select-none">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: beacon.color }} />
                {beacon.labelText}
              </div>
            </LeafletTooltip>
            <LeafletPopup>
              <div className="text-slate-900 font-sans p-1.5 text-xs min-w-[160px]">
                <h5 className="font-bold text-cyan-800 border-b pb-0.5 mb-1.5 flex items-center gap-1">
                  🛰️ GEE Hazard Profile
                </h5>
                <p className="text-slate-700">Location: <strong>{beacon.name}</strong></p>
                <p className="text-slate-500 mt-1">Hazard Group: <span className="capitalize font-semibold text-slate-800">{beacon.hazard}</span></p>
              </div>
            </LeafletPopup>
          </LeafletCircleMarker>
        ))}

        {showCoastline && (
          <LeafletGeoJSON
            data={coastlineGeoJSON}
            style={{ color: "#22d3ee", weight: 3.0, opacity: 0.8 }}
          />
        )}

        {showRoads && (
          <LeafletGeoJSON
            data={roadsGeoJSON}
            style={{ color: "#f59e0b", weight: 2.0, opacity: 0.7, dashArray: "5, 5" }}
          />
        )}

        {showPermanentWater && (
          <LeafletGeoJSON
            data={waterGeoJSON}
            style={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.4, weight: 1.5 }}
          />
        )}

        {showRainfall && [
          { name: "Jiwani Climate Station", coordinates: [25.05, 61.78] as [number, number], rain: "112 mm/yr", district: "Gwadar" },
          { name: "Gwadar Met Station", coordinates: [25.13, 62.33] as [number, number], rain: "125 mm/yr", district: "Gwadar" },
          { name: "Pasni Airport Climate Station", coordinates: [25.26, 63.48] as [number, number], rain: "138 mm/yr", district: "Gwadar" },
          { name: "Ormara Port Met Station", coordinates: [25.21, 64.62] as [number, number], rain: "142 mm/yr", district: "Gwadar" },
          { name: "Lasbela (Uthal) Met Station", coordinates: [25.80, 66.62] as [number, number], rain: "185 mm/yr", district: "Lasbela" }
        ].filter(station => selectedDistrict === 'All Coastal Districts' || station.district.toLowerCase() === selectedDistrict.toLowerCase())
        .map((station, index) => (
          <LeafletCircleMarker
            key={`rain-station-${index}`}
            center={station.coordinates}
            radius={6}
            fillColor="#38bdf8"
            fillOpacity={0.8}
            color="#ffffff"
            weight={1.5}
          >
            <LeafletPopup>
              <div className="text-slate-900 font-sans p-1 text-xs">
                <h5 className="font-bold text-cyan-800 border-b pb-0.5 mb-1">{station.name}</h5>
                <p className="text-slate-600">Annual Rainfall: <strong className="text-slate-900">{station.rain}</strong></p>
              </div>
            </LeafletPopup>
          </LeafletCircleMarker>
        ))}

        {showSafeZones && [
          ...(selectedDistrict === 'All Coastal Districts' || selectedDistrict.toLowerCase() === 'gwadar' ? HAZARD_HOTSPOTS["safe-zones"].Gwadar : []),
          ...(selectedDistrict === 'All Coastal Districts' || selectedDistrict.toLowerCase() === 'lasbela' ? HAZARD_HOTSPOTS["safe-zones"].Lasbela : [])
        ].map((spot, index) => (
          <LeafletCircleMarker
            key={`safe-zone-marker-${index}`}
            center={spot.coordinates}
            radius={8}
            fillColor="#22c55e"
            fillOpacity={0.9}
            color="#ffffff"
            weight={2}
          >
            <LeafletPopup>
              <div className="text-slate-900 font-sans p-1 text-xs">
                <h5 className="font-bold text-green-700 border-b pb-0.5 mb-1">{spot.name}</h5>
                <p className="text-slate-600">Designated Safe Zone / Shelter Area</p>
                <p className="text-slate-500 mt-1">Capacity Factor: {spot.riskOffsets["safe-zones"]}x</p>
              </div>
            </LeafletPopup>
          </LeafletCircleMarker>
        ))}

        {regions.map((region) => {
          if (!region.geometry) return null;
          
          const isMatched = selectedDistrict === 'All Coastal Districts' || 
            region.district.toLowerCase() === selectedDistrict.toLowerCase();

          if (!isMatched) return null;

          const showRegionDots = true;

          const baseValue = getRegionBaseValue(region.id);
          
          // Fetch dynamic hotspots for the selected analysis or fallback to vulnerability index
          const hazardGroup = HAZARD_HOTSPOTS[selectedAnalysis] || HAZARD_HOTSPOTS["vulnerability-index"] || {};
          const hotspots = hazardGroup[region.district] || [];

          return (
            <Fragment key={`${region.id}-${selectedAnalysis}-${selectedYear}`}>
              {/* Region Border Polygon */}
              {showDistrictBoundary && (
                <LeafletGeoJSON
                  key={`${region.id}-boundary-${selectedRegionId}`}
                  data={region.geometry as any}
                  style={getRegionStyle(region)}
                  eventHandlers={{
                    click: () => {
                      onSelectRegionId(region.id);
                    },
                  }}
                />
              )}

              {/* GLOF-style Risk Status Dots inside the district */}
              {showHazardLayer && showRegionDots && hotspots.map((spot, index) => {
                const multiplier = spot.riskOffsets[selectedAnalysis] ?? 1.0;
                const value = baseValue * multiplier;
                const info = evaluateRiskLevel(value);

                const hazardLabel = selectedAnalysis.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                const formattedVal = selectedAnalysis === 'coastal-erosion' ? `${Math.abs(value).toFixed(2)} m/yr` 
                                   : selectedAnalysis === 'sea-level-rise' ? `${value.toFixed(2)} mm/yr`
                                   : selectedAnalysis === 'storm-surge' ? `${value.toFixed(2)} m`
                                   : selectedAnalysis === 'flooding' ? `${value.toFixed(1)} km²`
                                   : `${value.toFixed(2)}`;

                return (
                  <LeafletCircleMarker
                    key={`${region.id}-spot-${index}-${selectedAnalysis}-${selectedYear}`}
                    center={spot.coordinates}
                    radius={10}
                    fillColor={info.fillColor}
                    fillOpacity={0.9}
                    color="#ffffff"
                    weight={2}
                    opacity={1}
                    eventHandlers={{
                      click: () => {
                        onSelectRegionId(region.id);
                      },
                    }}
                  >
                    <LeafletPopup className="custom-leaflet-popup">
                      <div className="text-slate-900 font-sans p-1">
                        <h4 className="font-bold text-sm text-cyan-800 border-b pb-1 mb-1">
                          {spot.name}
                        </h4>
                        <table className="text-xs w-full">
                          <tbody>
                            <tr>
                              <td className="pr-4 text-slate-500 font-medium">District:</td>
                              <td className="font-semibold text-slate-800">{region.district}</td>
                            </tr>
                            <tr>
                              <td className="pr-4 text-slate-500 font-medium">Province:</td>
                              <td className="text-slate-700">{region.province}</td>
                            </tr>
                            <tr>
                              <td className="pr-4 text-slate-500 font-medium">Risk Status:</td>
                              <td className={`font-bold ${info.riskLevel === 'High' ? 'text-red-600' : info.riskLevel === 'Medium' ? 'text-amber-500' : 'text-green-600'}`}>
                                {info.riskLevel} Risk Level
                              </td>
                            </tr>
                            <tr>
                              <td className="pr-4 text-slate-500 font-medium">{hazardLabel}:</td>
                              <td className="font-bold text-cyan-700">{formattedVal}</td>
                            </tr>
                          </tbody>
                        </table>
                        <Link
                          href={`/dashboard/details/${region.district.toLowerCase()}?hazard=${selectedAnalysis}&hotspot=${encodeURIComponent(spot.name)}`}
                          className="mt-2 text-xs text-center w-full font-bold text-cyan-600 hover:text-cyan-800 flex items-center justify-center gap-1 block"
                        >
                          View Details &rarr;
                        </Link>
                      </div>
                    </LeafletPopup>
                  </LeafletCircleMarker>
                );
              })}
            </Fragment>
          );
        })}
      </LeafletMapContainer>
    </div>
  );
}
