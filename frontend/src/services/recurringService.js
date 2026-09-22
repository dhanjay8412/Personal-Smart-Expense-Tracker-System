import api from './api';

export const recurringService = {
  getRecurringTransactions: async () => {
    const res = await api.get('/recurring');
    return res.data;
  },

  createRecurringTransaction: async (data) => {
    const res = await api.post('/recurring', data);
    return res.data;
  },

  updateRecurringTransaction: async (id, data) => {
    const res = await api.put(`/recurring/${id}`, data);
    return res.data;
  },

  deleteRecurringTransaction: async (id) => {
    const res = await api.delete(`/recurring/${id}`);
    return res.data;
  },
};
