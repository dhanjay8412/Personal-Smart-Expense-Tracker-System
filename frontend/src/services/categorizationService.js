import api from './api';

export const categorizationService = {
  suggestCategory: async (description, amount) => {
    const res = await api.post('/categorization/suggest', { description, amount });
    return res.data;
  },
  saveCorrection: async (description, category) => {
    const res = await api.post('/categorization/correct', { description, category });
    return res.data;
  },
};
