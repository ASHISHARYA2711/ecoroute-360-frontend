import api from './axios';

export interface Bin {
  _id: string;
  fillLevel: number;
  status: 'FULL' | 'HALF' | 'EMPTY';
  location: {
    latitude: number;
    longitude: number;
  };
  updatedAt: string;
}

export const BinService = {
  getAllBins: async (): Promise<Bin[]> => {
    const response = await api.get('/bins');
    return response.data;
  },
};
