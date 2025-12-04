// src/api/reports.ts
import axiosInstance from "./axiosInstance";

/**
 * All report endpoints from SpendBuddy backend.
 * These endpoints return aggregated data ready for charts.
 * Each response is an array of objects: [{ label: string, value: number }]
 */
export const reportsApi = {
  // 🥧 Expense Breakdown by Category
  getExpenseByCategory: async (range: string = "6m") =>
    (await axiosInstance.get(`/reports/expense-by-category?range=${range}`)).data,

  // 📊 Monthly Spending Trend (chronological)
  getMonthlySummary: async (range: string = "6m") =>
    (await axiosInstance.get(`/reports/monthly-summary?range=${range}`)).data,

  // 💳 Payment Type Distribution
  getPaymentTypeSummary: async (range: string = "6m") =>
    (await axiosInstance.get(`/reports/payment-type-summary?range=${range}`)).data,
};
