import api from './axios';

export const getShortlist = () => api.get('/shortlist');
export const addToShortlist = (phoneId) => api.post(`/shortlist/${phoneId}`);
export const removeFromShortlist = (phoneId) => api.delete(`/shortlist/${phoneId}`);
