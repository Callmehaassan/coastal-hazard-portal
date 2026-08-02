"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, GeoJSON, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Region } from "@/lib/types";

const LeafletMapContainer = MapContainer as any;
const LeafletTileLayer = TileLayer as any;
const LeafletGeoJSON = GeoJSON as any;
const LeafletPopup = Popup as any;

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
}

const MAKRAN_CENTER: [number, number] = [25.3, 64.5];

export default function DashboardMap({
  regions,
  selectedRegionId,
  onSelectRegionId,
  activeBasemap,
  visibleLayers,
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

  // Style helper for region polygons
  const getRegionStyle = (region: Region) => {
    const isSelected = region.id === selectedRegionId;
    
    // Choose colors based on active layers
    let color = "#2fb8c6"; // Neon Accent Blue
    let fillColor = "#2fb8c6";
    let fillOpacity = 0.15;

    if (showHazardLayer) {
      // Simulate high risk coloring
      if (region.district === "Thatta" || region.district === "Karachi") {
        color = "#ef4444"; // Red for high flood risk
        fillColor = "#f87171";
        fillOpacity = 0.35;
      } else if (region.district === "Gwadar") {
        color = "#f59e0b"; // Orange for moderate risk
        fillColor = "#fbbf24";
        fillOpacity = 0.25;
      }
    } else if (showSafeZones) {
      if (region.district === "Lasbela" || region.district === "Sujawal") {
        color = "#10b981"; // Green for safe zones
        fillColor = "#34d399";
        fillOpacity = 0.3;
      }
    }

    if (isSelected) {
      color = "#ffffff";
      fillOpacity = (fillOpacity || 0.1) + 0.2;
    }

    return {
      color,
      weight: isSelected ? 3 : showDistrictBoundary ? 2 : 1,
      fillColor,
      fillOpacity,
      dashArray: showDistrictBoundary ? "" : "3",
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
          
          return (
            <LeafletGeoJSON
              key={`${region.id}-${visibleLayers.join(",")}`}
              data={region.geometry as any}
              style={getRegionStyle(region)}
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
                        <td className="font-bold text-red-600">
                          {region.district === "Thatta" || region.district === "Karachi" ? "High Risk" : "Moderate"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <Link
                    href={`/dashboard/details/${region.district.toLowerCase()}`}
                    className="mt-2 text-xs text-center w-full font-bold text-cyan-600 hover:text-cyan-800 flex items-center justify-center gap-1 block"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              </LeafletPopup>
            </LeafletGeoJSON>
          );
        })}
      </LeafletMapContainer>
    </div>
  );
}
