import { create } from "zustand";
import { AuthState } from "@/types/auth.type";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setUser: (user) => set({ user }),
  setAccessToken: (token) => set({ accessToken: token }),
  setIsAuthenticated: (status) => set({ isAuthenticated: status }),
  triggerForceLogout: () => {
    set({ user: null, accessToken: null, isAuthenticated: false });
    // You can also emit an event or call a callback here if needed to redirect
  },
  resetAuth: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),
}));
