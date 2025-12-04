// ✅ src/api/expense.ts
import axiosInstance from "./axiosInstance";

export interface Expense {
  id?: number;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
  userId?: number;
}

export const expenseApi = {
  // 🔹 Get current month’s transactions
  getCurrentMonth: async (): Promise<Expense[]> => {
    const res = await axiosInstance.get("/expense/currentmonth");
    return res.data;
  },

  // 🔹 Get all transactions (admin or user history)
  getAll: async (): Promise<Expense[]> => {
    const res = await axiosInstance.get("/expense");
    return res.data;
  },

  // 🔹 Get expense by ID
  getById: async (id: number | string): Promise<Expense> => {
    const res = await axiosInstance.get(`/expense/${id}`);
    return res.data;
  },

  // 🔹 Add new expense/income
  create: async (payload: Expense): Promise<Expense> => {
    const res = await axiosInstance.post("/expense", payload);
    return res.data;
  },

  // 🔹 Update existing expense
  update: async (id: number | string, payload: Partial<Expense>): Promise<Expense> => {
    const res = await axiosInstance.put(`/expense/${id}`, payload);
    return res.data;
  },

  // 🔹 Delete expense
  remove: async (id: number | string): Promise<void> => {
    await axiosInstance.delete(`/expense/${id}`);
  },
};
