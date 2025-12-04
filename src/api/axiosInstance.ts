// src/api/axiosInstance.ts
import axios from "axios";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------------------------------------------------
 * REQUEST INTERCEPTOR — Attach JWT
 * -------------------------------------------------- */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt_token");

    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ---------------------------------------------------
 * RESPONSE INTERCEPTOR — auto logout on 401
 * -------------------------------------------------- */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.warn("[axiosInstance] 401 — Token expired or invalid");

      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user");

      // Use replace() → avoids full reload & avoids adding to history
      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
