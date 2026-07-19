// Type definitions
export interface Incident {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  coordinates: [number, number]; // [longitude, latitude]
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
