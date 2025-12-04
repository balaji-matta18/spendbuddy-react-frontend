import axiosInstance from "./axiosInstance";

// ----------------------
// 📘 Types
// ----------------------
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  roles: string[];
  token: string;
  monthStartDay?: number; // ✅ Added support for month start day
}

// ----------------------
// 🔐 Auth API
// ----------------------
export const authApi = {
  // ✅ Login
  signIn: async (data: SignInRequest): Promise<AuthResponse> => {
    const res = await axiosInstance.post<AuthResponse>("/auth/signin", data);
    return res.data;
  },

  // ✅ Register
  signUp: async (data: SignUpRequest): Promise<AuthResponse> => {
    const res = await axiosInstance.post<AuthResponse>("/auth/signup", data);
    return res.data;
  },
};
