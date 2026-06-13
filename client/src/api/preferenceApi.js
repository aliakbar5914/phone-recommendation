import api from './axios';

export const getPreferences = () => api.get('/preferences/me');
export const savePreferences = (data) => api.post('/preferences', data);
export const updatePreferences = (data) => api.put('/preferences', data);
