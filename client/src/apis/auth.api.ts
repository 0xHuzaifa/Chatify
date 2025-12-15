import api from "@/lib/axios/axios-instance";

export const authApi = {
  register: (payload: any) => api.post("/auth/register", payload),
  login: (payload: any) => api.post("/auth/login", payload),
  logout: () => api.post("/auth/logout"),
  verify: (payload: { token: string }) => api.post("/auth/verify", payload),
  resendVerification: (payload: any) =>
    api.post("/auth/resend-verification", payload),
  getProfile: () => api.get("/auth/profile"),
  refreshToken: () => api.get("/auth/refresh-token"),
};
