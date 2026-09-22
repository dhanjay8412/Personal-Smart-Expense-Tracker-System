import api from './api';

export const analyticsService = {
  getDashboardOverview: async () => {
    const res = await api.get('/analytics/dashboard');
    return res.data;
  },

  getMonthlySummary: async (params = {}) => {
    const res = await api.get('/analytics/monthly', { params });
    return res.data;
  },

  getAnalyticsTrends: async (params = {}) => {
    const res = await api.get('/analytics/trends', { params });
    return res.data;
  },

  getPaymentMethods: async (params = {}) => {
    const res = await api.get('/analytics/payment-methods', { params });
    return res.data;
  },

  getSpendingTrends: async (params = {}) => {
    const res = await api.get('/analytics/spending-trends', { params });
    return res.data;
  },
};
