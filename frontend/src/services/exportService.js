import api from './api';

export const exportService = {
  downloadCSV: async (params = {}) => {
    const res = await api.get('/export/csv', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  downloadPDF: async (params = {}) => {
    const res = await api.get('/export/pdf', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
