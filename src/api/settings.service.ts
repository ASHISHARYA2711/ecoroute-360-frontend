import api from './axios';

export interface SystemSettings {
  preAlertThreshold: number;
  criticalThreshold: number;
  autoRouteGeneration: boolean;
  maxBinsPerRoute: number;
  refreshIntervalMinutes: number;
}

export const SettingsService = {
  getSettings: async (): Promise<SystemSettings> => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateSettings: async (settings: SystemSettings) => {
    const response = await api.put('/settings', settings);
    return response.data;
  },
};
