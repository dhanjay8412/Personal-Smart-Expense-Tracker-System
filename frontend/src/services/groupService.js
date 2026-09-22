import api from './api';

export const groupService = {
  getGroups: async () => {
    const res = await api.get('/groups');
    return res.data;
  },

  getGroupById: async (id) => {
    const res = await api.get(`/groups/${id}`);
    return res.data;
  },

  createGroup: async (data) => {
    const res = await api.post('/groups', data);
    return res.data;
  },

  addMember: async (groupId, email) => {
    const res = await api.post(`/groups/${groupId}/members`, { email });
    return res.data;
  },

  removeMember: async (groupId, userId) => {
    const res = await api.delete(`/groups/${groupId}/members/${userId}`);
    return res.data;
  },

  getSharedExpenses: async (groupId) => {
    const res = await api.get(`/groups/${groupId}/expenses`);
    return res.data;
  },

  createSharedExpense: async (groupId, data) => {
    const res = await api.post(`/groups/${groupId}/expenses`, data);
    return res.data;
  },

  deleteSharedExpense: async (groupId, expenseId) => {
    const res = await api.delete(`/groups/${groupId}/expenses/${expenseId}`);
    return res.data;
  },

  getBalances: async (groupId) => {
    const res = await api.get(`/groups/${groupId}/balances`);
    return res.data;
  },

  addSettlement: async (groupId, data) => {
    const res = await api.post(`/groups/${groupId}/settlements`, data);
    return res.data;
  },
};
