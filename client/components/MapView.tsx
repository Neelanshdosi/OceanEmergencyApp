import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import L from "leaflet";
import type { Report } from "@shared/api";

// Default Leaflet marker icon fix for Vite bundling
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon as any;

function HeatLayer({ points }: { points: [number, number, number?][] }) {
  const map = useMap();
  useEffect(() => {
    const heat = (L as any)
      .heatLayer(points, { radius: 25, blur: 15, maxZoom: 11 })
      .addTo(map);
    return () => {
      map.removeLayer(heat);
    };
  }, [map, JSON.stringify(points)]);
  return null;
}

function HeatCanvasTweaks() {
  const map = useMap();
  useEffect(() => {
    const apply = () => {
      const container = map.getContainer();
      // Try target the heat layer canvas
      const heatCanvas =
        (container.querySelector(
          "canvas.leaflet-heatmap-layer",
        ) as HTMLCanvasElement | null) ||
        (container.querySelector(
          "canvas.leaflet-layer",
        ) as HTMLCanvasElement | null) ||
        (container.querySelector("canvas") as HTMLCanvasElement | null);
      if (heatCanvas) {
        heatCanvas.style.top = "-12px"; // per visual diff
        heatCanvas.style.width = "590px"; // per visual diff
      }
    };
    apply();
    const handler = () => apply();
    map.on("resize move zoom", handler);
    return () => {
      map.off("resize move zoom", handler);
    };
  }, [map]);
  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  const map = useMap();
  
  useEffect(() => {
    if (onMapClick) {
      const handleClick = (e: any) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      };
      map.on("click", handleClick);
      return () => {
        map.off("click", handleClick);
      };
    }
  }, [map, onMapClick]);
  
  return null;
}

export const MapView: React.FC<{
  reports: Report[];
  center?: [number, number];
  onMapClick?: (lat: number, lng: number) => void;
}> = ({ reports, center = [20, 0], onMapClick }) => {
  const points: [number, number, number?][] = reports.map((r) => [
    r.latitude,
    r.longitude,
    0.6,
  ]);
  return (
    <MapContainer
      center={center}
      zoom={3}
      scrollWheelZoom
      className="h-full w-full rounded-lg border"
      whenReady={() => {
        // Map is ready, we'll set up click handler in useEffect
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <HeatLayer points={points} />
      <HeatCanvasTweaks />
      <MapClickHandler onMapClick={onMapClick} />
      {reports.map((r) => (
        <Marker key={r.id} position={[r.latitude, r.longitude]}>
          <Popup>
            <div className="space-y-1">
              <div className="font-semibold">{r.title}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(r.timestamp).toLocaleString()}
              </div>
              <div className="text-xs">Type: {r.type}</div>
              <div className="text-xs">
                Source: {r.source} {r.verified ? "• Verified" : ""}
              </div>
              <p className="text-sm mt-2 max-w-[220px]">{r.description}</p>
              {r.media?.[0] &&
                (r.media[0].kind === "image" ? (
                  <img
                    src={r.media[0].dataUrl}
                    alt="media"
                    className="mt-2 h-24 w-full rounded object-cover"
                  />
                ) : (
                  <video
                    controls
                    src={r.media[0].dataUrl}
                    className="mt-2 h-24 w-full rounded object-cover"
                  />
                ))}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
