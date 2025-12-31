import api from './axios';

export interface Driver {
  _id: string;
  name: string;
  phone: string;
  status: 'ACTIVE' | 'OFFLINE';
}

export const DriverService = {
  getAllDrivers: async (): Promise<Driver[]> => {
    const response = await api.get('/drivers');
    return response.data;
  },
};
