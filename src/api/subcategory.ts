// src/api/subcategory.ts
import axiosInstance from './axiosInstance';

export const subcategoryApi = {
  getAll: async () => (await axiosInstance.get('/subcategory')).data,
  getById: async (id: number|string) => (await axiosInstance.get(`/subcategory/${id}`)).data,
  create: async (payload:any) => (await axiosInstance.post('/subcategory', payload)).data,
  update: async (id:number|string, payload:any) => (await axiosInstance.put(`/subcategory/${id}`, payload)).data,
  remove: async (id:number|string) => (await axiosInstance.delete(`/subcategory/${id}`)).data,
};
