import React, { createContext, useContext, useState } from 'react';

type MapContextType = {
  activeHazardsCount: number;
  setActiveHazardsCount: (n: number) => void;
};

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeHazardsCount, setActiveHazardsCount] = useState(0);
  return (
    <MapContext.Provider value={{ activeHazardsCount, setActiveHazardsCount }}>
      {children}
    </MapContext.Provider>
  );
};

export function useMapContext() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMapContext must be used within MapProvider');
  return ctx;
}
