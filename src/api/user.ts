import axiosInstance from "./axiosInstance";

// ----------------------
// 👤 User API
// ----------------------
export const userApi = {
  // ✅ Get current user profile
  getProfile: async () => {
    const res = await axiosInstance.get("/user/me"); // <-- removed leading /api
    return res.data;
  },

  // ✅ Update full profile
  updateProfile: async (payload: any) => {
    const res = await axiosInstance.put("/user/me", payload);
    return res.data;
  },

  // ✅ Update user's month start day
  updateMonthStartDay: async (day: number) => {
    const res = await axiosInstance.put(`/user/preferences/month-start-day?day=${day}`);
    return res.data;
  },
};
