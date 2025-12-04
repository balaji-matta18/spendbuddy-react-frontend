// src/api/paymenttype.ts
import axiosInstance from './axiosInstance';

export const paymentTypeApi = {
  getAll: async () => (await axiosInstance.get('/paymenttype')).data,
  create: async (payload:any) => (await axiosInstance.post('/paymenttype', payload)).data,
  update: async (id:number|string, payload:any) => (await axiosInstance.put(`/paymenttype/${id}`, payload)).data,
  remove: async (id:number|string) => (await axiosInstance.delete(`/paymenttype/${id}`)).data,
};
