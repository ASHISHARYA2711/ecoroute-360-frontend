import api from './axios';

export interface Driver {
  _id: string;
  driverId: string;
  name: string;
  email: string;
  phone?: string;
  truckId?: string;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  lastLocationUpdate?: string;
  status: 'ACTIVE' | 'OFFLINE';
  isActive: boolean;
  lastLogin?: string;
}

export const DriverService = {
  getAllDrivers: async (): Promise<Driver[]> => {
    const response = await api.get('/users/drivers');
    return response.data.drivers || [];
  },

  getDriverById: async (driverId: string): Promise<Driver> => {
    const response = await api.get(`/users/drivers/${driverId}`);
    return response.data.driver;
  },

  updateDriverStatus: async (driverId: string, isActive: boolean) => {
    const response = await api.put(`/users/${driverId}`, { isActive });
    return response.data;
  },
};
