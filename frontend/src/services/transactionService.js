import api from './api';

export const transactionService = {
  getTransactions: async (params = {}) => {
    const res = await api.get('/transactions', { params });
    return res.data;
  },

  getTransactionById: async (id) => {
    const res = await api.get(`/transactions/${id}`);
    return res.data;
  },

  createTransaction: async (data) => {
    const res = await api.post('/transactions', data);
    return res.data;
  },

  updateTransaction: async (id, data) => {
    const res = await api.put(`/transactions/${id}`, data);
    return res.data;
  },

  deleteTransaction: async (id) => {
    const res = await api.delete(`/transactions/${id}`);
    return res.data;
  },

  importPreview: async (csvText) => {
    const res = await api.post('/transactions/import', { csvText });
    return res.data;
  },

  confirmImport: async (transactions) => {
    const res = await api.post('/transactions/import/confirm', { transactions });
    return res.data;
  },
};
