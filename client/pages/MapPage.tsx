import React, { Suspense, useEffect } from 'react';
import { MapView } from '@/components/MapView';
import { useMapContext } from '@/context/MapContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const INDIA_CENTER: [number, number] = [22.5937, 78.9629];
const INDIA_BOUNDS: [[number, number], [number, number]] = [[6.462, 68.109], [35.513, 97.395]];

const MapPage: React.FC = () => {
  const { setActiveHazardsCount } = useMapContext();

  useEffect(() => {
    // Placeholder: fetch active hazards count from API when available
    // For now set a dummy value
    setActiveHazardsCount(12);
  }, [setActiveHazardsCount]);

  return (
    <div className="min-h-[80vh] relative">
      <div className="container py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Live Map & Hotspots</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="#">Copy view link</Link>
            </Button>
            <Button variant="outline" size="sm">Share view</Button>
          </div>
        </div>
        <div className="h-[75vh] w-full rounded-lg overflow-hidden border">
          <Suspense fallback={<div className="h-full w-full flex items-center justify-center">Loading map...</div>}>
            {/* MapView currently uses Leaflet/OSM by default and accepts bounds/zoom options */}
            <MapView
              defaultCenter={INDIA_CENTER}
              defaultZoom={5}
              minZoom={4}
              maxZoom={10}
              bounds={INDIA_BOUNDS}
              maxBoundsViscosity={0.8}
            />
          </Suspense>
        </div>
      </div>

      {/* Floating Report CTA */}
      <div className="fixed right-6 bottom-6 md:bottom-8 z-50">
        <Button className="rounded-full" size="lg">Report</Button>
      </div>
    </div>
  );
};

export default MapPage;
