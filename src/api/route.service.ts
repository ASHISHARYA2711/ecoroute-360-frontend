import api from './axios';

export interface RouteBin {
  binId: string;
  location: {
    lat: number;
    lng: number;
  };
  status?: string;
  currentFill?: number;
}

export interface Route {
  _id: string;
  bins: RouteBin[];
  geometry?: [number, number][];
  distance: number;
  duration: number;
  driverId: string;
  status?: string;
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

  updateRouteStatus: async (routeId: string, status: string): Promise<void> => {
    await api.put(`/routes/${routeId}/status`, { status: status.toUpperCase() });
  },

  cancelDriverPendingRoutes: async (driverId: string): Promise<number> => {
    const response = await api.delete(`/routes/driver/${driverId}/pending`);
    return response.data.cancelled || 0;
  },
};
