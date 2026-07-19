import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
  hiddenFilters: string[];
  toggleFilter: (filter: string) => void;
  hiddenSeverities: string[];
  toggleSeverityFilter: (severity: string) => void;
  mapView: { longitude: number; latitude: number; zoom: number };
  setMapView: (view: { longitude: number; latitude: number; zoom: number }) => void;
  flyToLocation: { longitude: number; latitude: number; zoom: number } | null;
  setFlyToLocation: (view: { longitude: number; latitude: number; zoom: number } | null) => void;
  selectedIncidentId: string | null;
  setSelectedIncidentId: (id: string | null) => void;
  hoveredIncidentId: string | null;
  setHoveredIncidentId: (id: string | null) => void;
  mapType: 'street' | 'satellite';
  setMapType: (type: 'street' | 'satellite') => void;
  userLocationName: string | null;
  setUserLocationName: (name: string | null) => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      hiddenFilters: ['alert', 'fire', 'accident', 'utility', 'earthquake'],
      toggleFilter: (filter) =>
        set((state) => ({
          hiddenFilters: state.hiddenFilters.includes(filter)
            ? state.hiddenFilters.filter((f) => f !== filter)
            : [...state.hiddenFilters, filter],
        })),
      hiddenSeverities: [],
      toggleSeverityFilter: (severity) =>
        set((state) => ({
          hiddenSeverities: state.hiddenSeverities.includes(severity)
            ? state.hiddenSeverities.filter((s) => s !== severity)
            : [...state.hiddenSeverities, severity],
        })),
      mapView: { longitude: -70.64827, latitude: -33.45694, zoom: 10 },
      setMapView: (view) => set({ mapView: view }),
      flyToLocation: null,
      setFlyToLocation: (view) => set({ flyToLocation: view }),
      selectedIncidentId: null,
      setSelectedIncidentId: (id) => set({ selectedIncidentId: id }),
      hoveredIncidentId: null,
      setHoveredIncidentId: (id) => set({ hoveredIncidentId: id }),
      mapType: 'street',
      setMapType: (type) => set({ mapType: type }),
      userLocationName: null,
      setUserLocationName: (name) => set({ userLocationName: name }),
    }),
    {
      name: 'filter-storage',
      partialize: (state) => ({ hiddenFilters: state.hiddenFilters, hiddenSeverities: state.hiddenSeverities }),
    }
  )
);
