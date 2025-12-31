import api from './axios';

export interface RouteBin {
  latitude: number;
  longitude: number;
}

export interface Route {
  _id: string;
  bins: RouteBin[];
  distance: number;
  createdAt: string;
}

export const RouteService = {
  generateOptimizedRoute: async () => {
    const response = await api.post('/routes/optimize');
    return response.data;
  },

  getRouteHistory: async (): Promise<Route[]> => {
    const response = await api.get('/routes/history');
    return response.data;
  },
};
