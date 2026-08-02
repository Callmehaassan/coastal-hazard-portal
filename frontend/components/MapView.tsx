"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const LeafletMapContainer = MapContainer as any;
const LeafletTileLayer = TileLayer as any;
const LeafletGeoJSON = GeoJSON as any;
const LeafletPopup = Popup as any;

import { getRegions } from "@/lib/api";
import type { Region } from "@/lib/types";

// Roughly centered on the Makran coast, between Lasbela and Gwadar.
const AOI_CENTER: [number, number] = [25.3, 64.5];
const AOI_DEFAULT_ZOOM = 6;

export default function MapView() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRegions()
      .then(setRegions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="glass-panel relative m-4 h-[70vh] overflow-hidden">
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-coastal-deep/60 text-sm">
          Loading regions...
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-coastal-deep/60 text-sm text-red-300">
          Failed to load regions: {error}
        </div>
      )}

      <LeafletMapContainer center={AOI_CENTER as any} zoom={AOI_DEFAULT_ZOOM as any} className="h-full w-full">
        <LeafletTileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {regions.map(
          (region) =>
            region.geometry && (
              <LeafletGeoJSON
                key={region.id}
                data={region.geometry as any}
                style={{ color: "#2fb8c6", weight: 2, fillOpacity: 0.15 }}
              >
                <LeafletPopup>
                  <strong>{region.name}</strong>
                  <br />
                  {region.district}, {region.province}
                </LeafletPopup>
              </LeafletGeoJSON>
            )
        )}
      </LeafletMapContainer>
    </div>
  );
}
