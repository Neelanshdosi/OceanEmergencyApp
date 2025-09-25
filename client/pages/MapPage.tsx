import React, { Suspense, useEffect, useState } from "react";
import { MapView } from "@/components/MapView";
import { useMapContext } from "@/context/MapContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReportForm } from "@/components/ReportForm";

const INDIA_CENTER: [number, number] = [22.5937, 78.9629];
const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [6.462, 68.109],
  [35.513, 97.395],
];

const MapPage: React.FC = () => {
  const { activeHazardsCount, setActiveHazardsCount } = useMapContext();

  useEffect(() => {
    // Placeholder: fetch active hazards count from API when available
    // For now set a dummy value
    setActiveHazardsCount(12);
  }, [setActiveHazardsCount]);

  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [selectLocationMode, setSelectLocationMode] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = React.useState<{
    lat: number;
    lng: number;
    display_name?: string;
  } | null>(null);
  const [reportOpen, setReportOpen] = React.useState(false);
  const [pickLocation, setPickLocation] = React.useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // open filters if URL has ?panel=filters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("panel") === "filters") setFiltersOpen(true);
  }, []);

  // debounced search using Nominatim
  useEffect(() => {
    if (!searchQuery) return setSuggestions([]);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(
            searchQuery,
          )}`,
          { headers: { "Accept-Language": "en" } },
        );
        const json = await res.json();
        setSuggestions(json || []);
      } catch (e) {
        setSuggestions([]);
      }
    }, 350);
    return () => clearTimeout(id);
  }, [searchQuery]);

  function handleMapClickSelect(lat: number, lng: number) {
    if (!selectLocationMode) return;
    setPickLocation({ lat, lng });
    setSelectLocationMode(false);
    setReportOpen(true);
  }

  return (
    <div className="min-h-[80vh] relative">
      <div className="container py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Live Map & Hotspots</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="#">Copy view link</Link>
            </Button>
            <Button variant="outline" size="sm">
              Share view
            </Button>
          </div>
        </div>
        <div className="relative flex gap-4">
          {filtersOpen && (
            <aside className="w-80 p-4 rounded border bg-card">
              <h3 className="font-semibold mb-2">Filters & Report</h3>
              <div className="mb-3">
                <label className="text-sm font-medium">Search place</label>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city, state, pincode"
                  className="mt-1 w-full rounded border px-2 py-1"
                />
                <div className="mt-2 max-h-48 overflow-auto">
                  {suggestions.map((s: any) => (
                    <div
                      key={s.place_id}
                      className="p-2 hover:bg-muted-foreground/5 rounded flex justify-between items-center"
                    >
                      <div>
                        <div className="text-sm">{s.display_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {s.type} �� {s.class}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          className="text-xs px-2 py-1 rounded bg-ocean-600 text-white"
                          onClick={() => {
                            const lat = parseFloat(s.lat);
                            const lng = parseFloat(s.lon);
                            setSelectedPlace({
                              lat,
                              lng,
                              display_name: s.display_name,
                            });
                            setPickLocation({ lat, lng });
                          }}
                        >
                          Use
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectLocationMode}
                    onChange={(e) => setSelectLocationMode(e.target.checked)}
                  />
                  <span className="text-sm">Select location on map</span>
                </label>
                <div className="mt-2 text-xs text-muted-foreground">
                  When enabled, click anywhere on the map to choose report
                  location.
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={() => setReportOpen(true)}>
                  Report at Selected
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFiltersOpen(false);
                    setSearchQuery("");
                    setSuggestions([]);
                  }}
                >
                  Close
                </Button>
              </div>
            </aside>
          )}

          <div className="flex-1 h-[75vh] w-full rounded-lg overflow-hidden border">
            <Suspense
              fallback={
                <div className="h-full w-full flex items-center justify-center">
                  Loading map...
                </div>
              }
            >
              {/* MapView currently uses Leaflet/OSM by default and accepts bounds/zoom options */}
              <MapView
                defaultCenter={INDIA_CENTER}
                defaultZoom={5}
                minZoom={4}
                maxZoom={10}
                bounds={INDIA_BOUNDS}
                maxBoundsViscosity={0.8}
                onMapClick={handleMapClickSelect}
                selectedSearchLocation={selectedPlace}
              />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Floating Report CTA */}
      <div className="fixed right-6 bottom-6 md:bottom-8 z-50">
        <Button
          className="rounded-full"
          size="lg"
          onClick={() => {
            setFiltersOpen(true);
            setReportOpen(true);
          }}
        >
          Report
        </Button>
      </div>

      {/* Report dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Quick Report</DialogTitle>
          </DialogHeader>
          <ReportForm
            pickLocation={pickLocation}
            onSubmitted={(r) => {
              setReportOpen(false);
              setPickLocation(null);
              setSelectedPlace(null);
              setFiltersOpen(false);
              setActiveHazardsCount((c) => c + 1);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MapPage;
