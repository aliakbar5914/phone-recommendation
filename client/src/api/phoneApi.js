import api from './axios';

export const getPhones = (params) => api.get('/phones', { params });
export const getPhone = (id) => api.get(`/phones/${id}`);
export const getBrands = () => api.get('/phones/brands');
export const createPhone = (data) => api.post('/phones', data);
export const updatePhone = (id, data) => api.put(`/phones/${id}`, data);
export const deletePhone = (id) => api.delete(`/phones/${id}`);
