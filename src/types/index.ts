// Type definitions
export interface Incident {
  id: string;
  title: string;
  description: string;
  type: string;
  category?: string; // Some news feeds use category instead of type
  link?: string; // Link to the original news article
  severity: 'low' | 'medium' | 'high' | 'critical';
  coordinates: [number, number]; // [longitude, latitude]
  line?: [number, number][]; // Array of [longitude, latitude] for Waze Jams polylines
  radius?: number; // radio de afectación en metros
  timestamp: string;
  details?: {
    status: 'En curso' | 'Controlado' | 'Pendiente';
    reportedBy: string;
    unitsDispatched: number;
    affectedArea: string;
    lastUpdate: string;
  }
}
