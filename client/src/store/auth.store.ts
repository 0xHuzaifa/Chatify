import { create } from "zustand";
import { AuthState } from "@/types/auth.type";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,

  setUser: (user) => set({ user }),
  setAccessToken: (token) => set({ accessToken: token }),
  resetAuth: () => set({ user: null, accessToken: null }),
}));
