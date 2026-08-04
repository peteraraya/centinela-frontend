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
  panicMode: boolean;
  setPanicMode: (active: boolean) => void;
  showStatusBoard: boolean;
  setShowStatusBoard: (show: boolean) => void;
  timeFilterHours: number; // 0 means all time (or default limit), else max hours ago
  setTimeFilterHours: (hours: number) => void;
  userLocation: { latitude: number; longitude: number } | null;
  setUserLocation: (loc: { latitude: number; longitude: number } | null) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  safeZoneRadiusKm: number;
  setSafeZoneRadiusKm: (km: number) => void;
  isHeatmap: boolean;
  setIsHeatmap: (active: boolean) => void;
  showFarmacias: boolean;
  setShowFarmacias: (show: boolean) => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      hiddenFilters: [], 
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
      mapType: 'satellite',
      setMapType: (type) => set({ mapType: type }),
      userLocationName: null,
      setUserLocationName: (name) => set({ userLocationName: name }),
      panicMode: false,
      setPanicMode: (active) => set({ panicMode: active }),
      showStatusBoard: false,
      setShowStatusBoard: (show) => set({ showStatusBoard: show }),
      timeFilterHours: 24 * 30, // Default to 30 days (what USGS returns by default mostly)
      setTimeFilterHours: (hours) => set({ timeFilterHours: hours }),
      userLocation: null,
      setUserLocation: (loc) => set({ userLocation: loc }),
      soundEnabled: true,
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      safeZoneRadiusKm: 5,
      setSafeZoneRadiusKm: (km) => set({ safeZoneRadiusKm: km }),
      isHeatmap: false,
      setIsHeatmap: (active) => set({ isHeatmap: active }),
      showFarmacias: false,
      setShowFarmacias: (show) => set({ showFarmacias: show }),
    }),
    {
      name: 'filter-storage',
      partialize: (state) => ({ 
        hiddenFilters: state.hiddenFilters, 
        hiddenSeverities: state.hiddenSeverities,
        soundEnabled: state.soundEnabled,
        timeFilterHours: state.timeFilterHours,
        safeZoneRadiusKm: state.safeZoneRadiusKm
      }),
    }
  )
);
