import api from './axios';

export const comparePhones = (phoneIds) => api.post('/compare', { phoneIds });
