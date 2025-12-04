// ✅ src/api/category.ts
import axiosInstance from "./axiosInstance";

export interface Category {
  id?: number;
  name: string;
  description?: string;
}

export const categoryApi = {
  // 🔹 Get all categories
  getAll: async (): Promise<Category[]> => {
    const res = await axiosInstance.get("/category");
    return res.data;
  },

  // 🔹 Get category by ID
  getById: async (id: number | string): Promise<Category> => {
    const res = await axiosInstance.get(`/category/${id}`);
    return res.data;
  },

  // 🔹 Create new category
  create: async (payload: Category): Promise<Category> => {
    const res = await axiosInstance.post("/category", payload);
    return res.data;
  },

  // 🔹 Update existing category
  update: async (id: number | string, payload: Partial<Category>): Promise<Category> => {
    const res = await axiosInstance.put(`/category/${id}`, payload);
    return res.data;
  },

  // 🔹 Delete category
  remove: async (id: number | string): Promise<void> => {
    await axiosInstance.delete(`/category/${id}`);
  },
};
