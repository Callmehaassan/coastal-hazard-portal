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

interface DashboardMapProps {
  regions: Region[];
  selectedRegionId: number | null;
  onSelectRegionId: (id: number) => void;
  activeBasemap: "satellite" | "osm";
  visibleLayers: string[];
  selectedAnalysis: string;
  selectedYear: number;
  hazardData: HazardReading[];
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
}: DashboardMapProps) {
  // Tile layer selections
  const osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const osmAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const satUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const satAttribution = "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";

  // Check if layers are active
  const showHazardLayer = visibleLayers.includes("Hazard Layer");

  const getRegionHazardInfo = (regionId: number) => {
    const reading = hazardData.find(
      (item) => item.region_id === regionId && item.year === selectedYear
    );
    const value = reading ? reading.value : 0;
    const unit = reading ? reading.unit : "";

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

    return { value, unit, riskLevel, color, fillColor };
  };

  const getRegionCenter = (region: Region): [number, number] => {
    if (region.district.toLowerCase() === "gwadar") return [25.1, 63.2];
    if (region.district.toLowerCase() === "lasbela") return [25.4, 66.95];
    return MAKRAN_CENTER;
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
          
          const info = getRegionHazardInfo(region.id);
          const center = getRegionCenter(region);
          const hazardLabel = selectedAnalysis.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          const formattedVal = selectedAnalysis === 'coastal-erosion' ? `${Math.abs(info.value).toFixed(2)} m/yr` 
                             : selectedAnalysis === 'sea-level-rise' ? `${info.value.toFixed(2)} mm/yr`
                             : selectedAnalysis === 'storm-surge' ? `${info.value.toFixed(2)} m`
                             : selectedAnalysis === 'flooding' ? `${info.value.toFixed(1)} km²`
                             : `${info.value.toFixed(2)}`;

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

              {/* Risk Status Dot / Marker in the center of the district */}
              {showHazardLayer && (
                <LeafletCircleMarker
                  center={center}
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
                        {region.name}
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
              )}
            </Fragment>
          );
        })}
      </LeafletMapContainer>
    </div>
  );
}
