"use client";

import { Fragment, useEffect } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, GeoJSON, Popup, useMap, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Region, HazardReading } from "@/lib/types";

const LeafletMapContainer = MapContainer as any;
const LeafletTileLayer = TileLayer as any;
const LeafletGeoJSON = GeoJSON as any;
const LeafletPopup = Popup as any;
const LeafletCircleMarker = CircleMarker as any;

// Helper to handle map centering and resizing dynamically
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
    // Force leaflet to recalculate its container size
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [center, map]);
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

  // Style helper for region polygons
  const getRegionStyle = (region: Region) => {
    const isSelected = region.id === selectedRegionId;
    return {
      color: isSelected ? "#ffffff" : "#2fb8c6", // Neon cyan boundary
      weight: isSelected ? 2.5 : 1.5,
      fillColor: "#2fb8c6",
      fillOpacity: isSelected ? 0.08 : 0.02, // Clean translucent fill
      dashArray: "",
    };
  };

  return (
    <div className="h-full w-full relative">
      <LeafletMapContainer
        center={MAKRAN_CENTER as any}
        zoom={6.5 as any}
        className="h-full w-full"
        style={{ background: "#061320" }}
      >
        <MapController center={MAKRAN_CENTER as any} />
        
        {activeBasemap === "satellite" ? (
          <LeafletTileLayer attribution={satAttribution} url={satUrl} />
        ) : (
          <LeafletTileLayer attribution={osmAttribution} url={osmUrl} />
        )}

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
          { name: "Jiwani Climate Station", coordinates: [25.05, 61.78] as [number, number], rain: "112 mm/yr" },
          { name: "Gwadar Met Station", coordinates: [25.13, 62.33] as [number, number], rain: "125 mm/yr" },
          { name: "Pasni Airport Climate Station", coordinates: [25.26, 63.48] as [number, number], rain: "138 mm/yr" },
          { name: "Ormara Port Met Station", coordinates: [25.21, 64.62] as [number, number], rain: "142 mm/yr" },
          { name: "Lasbela (Uthal) Met Station", coordinates: [25.80, 66.62] as [number, number], rain: "185 mm/yr" }
        ].map((station, index) => (
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
          ...HAZARD_HOTSPOTS["safe-zones"].Gwadar,
          ...HAZARD_HOTSPOTS["safe-zones"].Lasbela
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
          
          // Check if this region's dots should be displayed
          const showRegionDots = selectedDistrict === 'All Coastal Districts' || 
            region.district.toLowerCase() === selectedDistrict.toLowerCase();

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
