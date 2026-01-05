import api from './axios';

export interface RouteBin {
  binId: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface Route {
  _id: string;
  bins: RouteBin[];
  geometry?: [number, number][]; // Mapbox route geometry
  distance: number;
  duration: number;
  driverId: string;
  createdAt: string;
}

export const RouteService = {
  generateOptimizedRoute: async (startLat: number, startLng: number, driverId?: string) => {
    const response = await api.post('/routes/optimize', {
      startLocation: { lat: startLat, lng: startLng },
      driverId: driverId || localStorage.getItem('userId') || 'DRIVER_001',
    });
    return response.data;
  },

  getRouteHistory: async (): Promise<Route[]> => {
    const response = await api.get('/routes/history');
    return response.data.routes || [];
  },

  getDriverActiveRoute: async (driverId: string): Promise<Route | null> => {
    try {
      const response = await api.get(`/routes/driver/${driverId}/active`);
      return response.data.route;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};
