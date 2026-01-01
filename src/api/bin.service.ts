import api from './axios';

export interface Bin {
  _id: string;
  binId: string;
  currentFill: number;
  gasLevel: number;
  status: 'CRITICAL' | 'NORMAL';
  location: {
    lat: number;
    lng: number;
  };
  lastWasteType?: 'dry' | 'wet' | null;
  wasteConfidence?: number | null;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface BinResponse {
  success: boolean;
  bins: any[];
  count: number;
}

export const BinService = {
  getAllBins: async (): Promise<Bin[]> => {
    const response = await api.get<BinResponse>('/bins');
    return response.data.bins || [];
  },

  getCriticalBins: async (): Promise<Bin[]> => {
    const response = await api.get<BinResponse>('/bins/critical');
    return response.data.bins || [];
  },

  getBinById: async (id: string): Promise<Bin> => {
    const response = await api.get(`/bins/${id}`);
    return response.data.bin;
  },

  createBin: async (binData: Partial<Bin>) => {
    const response = await api.post('/bins', binData);
    return response.data;
  },

  updateBin: async (id: string, updates: Partial<Bin>) => {
    const response = await api.put(`/bins/${id}`, updates);
    return response.data;
  },

  deleteBin: async (id: string) => {
    const response = await api.delete(`/bins/${id}`);
    return response.data;
  },

  classifyWaste: async (binId: string, wasteType: 'dry' | 'wet', confidence: number) => {
    const response = await api.post(`/bins/${binId}/classify-waste`, {
      wasteType,
      confidence,
    });
    return response.data;
  },

  getPrediction: async (binId: string) => {
    const response = await api.get(`/bins/${binId}/prediction`);
    return response.data;
  },
};

