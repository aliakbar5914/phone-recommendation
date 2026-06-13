import api from './axios';

export const getStats = () => api.get('/stats');
export const getUsers = () => api.get('/users');
export const updateUserStatus = (id, isActive) => api.patch(`/users/${id}`, { isActive });
export const updateUserRole = (id, role) => api.patch(`/users/${id}`, { role });
