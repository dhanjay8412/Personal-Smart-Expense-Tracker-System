import api from './api';

export const calendarService = {
  getCalendarData: async (month, year) => {
    const res = await api.get('/calendar', { params: { month, year } });
    return res.data;
  },
};
