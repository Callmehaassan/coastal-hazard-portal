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

const DISTRICT_HOTSPOTS: Record<string, Hotspot[]> = {
  Gwadar: [
    { name: "Jiwani Coastline", coordinates: [25.05, 61.77], riskOffsets: { flooding: 1.1, "storm-surge": 1.2, "coastal-erosion": 1.3, "sea-level-rise": 1.0, "tsunami-risk": 1.2, "vulnerability-index": 1.1, "safe-zones": 0.8 } },
    { name: "Gwadar Bay", coordinates: [25.12, 62.32], riskOffsets: { flooding: 0.8, "storm-surge": 0.7, "coastal-erosion": 0.6, "sea-level-rise": 1.0, "tsunami-risk": 0.8, "vulnerability-index": 0.9, "safe-zones": 1.3 } },
    { name: "Pasni Port & Harbor", coordinates: [25.26, 63.47], riskOffsets: { flooding: 1.2, "storm-surge": 1.3, "coastal-erosion": 1.1, "sea-level-rise": 1.0, "tsunami-risk": 1.5, "vulnerability-index": 1.2, "safe-zones": 0.7 } },
    { name: "Ormara Coastline", coordinates: [25.21, 64.63], riskOffsets: { flooding: 1.0, "storm-surge": 1.0, "coastal-erosion": 1.4, "sea-level-rise": 1.0, "tsunami-risk": 1.0, "vulnerability-index": 1.1, "safe-zones": 0.9 } }
  ],
  Lasbela: [
    { name: "Kund Malir Beach", coordinates: [25.39, 65.46], riskOffsets: { flooding: 0.9, "storm-surge": 1.0, "coastal-erosion": 1.2, "sea-level-rise": 1.0, "tsunami-risk": 0.9, "vulnerability-index": 1.0, "safe-zones": 1.1 } },
    { name: "Sonmiani Lagoon", coordinates: [25.42, 66.58], riskOffsets: { flooding: 1.3, "storm-surge": 1.1, "coastal-erosion": 0.8, "sea-level-rise": 1.0, "tsunami-risk": 1.1, "vulnerability-index": 1.2, "safe-zones": 0.8 } },
    { name: "Gadani Ship Breaking Yard", coordinates: [24.97, 66.73], riskOffsets: { flooding: 0.7, "storm-surge": 0.9, "coastal-erosion": 1.5, "sea-level-rise": 1.0, "tsunami-risk": 0.8, "vulnerability-index": 1.3, "safe-zones": 0.6 } },
    { name: "Uthal Estuary", coordinates: [25.80, 66.62], riskOffsets: { flooding: 1.4, "storm-surge": 1.2, "coastal-erosion": 0.5, "sea-level-rise": 1.0, "tsunami-risk": 1.0, "vulnerability-index": 1.1, "safe-zones": 0.9 } }
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
  const showDistrictBoundary = visibleLayers.includes("District Boundary");
  const showHazardLayer = visibleLayers.includes("Hazard Layer");
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
    return reading ? reading.value : 0;
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

        {regions.map((region) => {
          if (!region.geometry) return null;
          
          // Check if this region's dots should be displayed
          const showRegionDots = selectedDistrict === 'All Coastal Districts' || 
            region.district.toLowerCase() === selectedDistrict.toLowerCase();

          const baseValue = getRegionBaseValue(region.id);
          const hotspots = DISTRICT_HOTSPOTS[region.district] || [];

          return (
            <Fragment key={`${region.id}-${visibleLayers.join(",")}-${selectedAnalysis}-${selectedYear}`}>
              {/* Region Border Polygon */}
              <LeafletGeoJSON
                data={region.geometry as any}
                style={getRegionStyle(region)}
                eventHandlers={{
                  click: () => {
                    onSelectRegionId(region.id);
                  },
                }}
              />

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
                          href={`/dashboard/details/${region.district.toLowerCase()}?hazard=${selectedAnalysis}`}
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
