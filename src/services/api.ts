import axios from "axios";
import { auth } from "@/src/config/firebase";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor — attach Firebase access token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor — on 401, refresh Firebase ID token and retry once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const newToken = await currentUser.getIdToken(true);
          localStorage.setItem("access_token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch {}

      // ถ้ามาถึงตรงนี้แปลว่าไม่มี Token หรือขอ Token ใหม่ไม่สำเร็จ
      localStorage.removeItem("access_token");

      // ดึง path ปัจจุบันมาเช็ค
      const currentPath = window.location.pathname;
      const isHomePage = currentPath === "/";

      // ถ้า "ไม่ใช่" หน้า Home ค่อยสั่งเด้ง
      if (!isHomePage) {
        window.location.href = "/auth/signin";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
