"use client";
import { useEffect } from "react";
import { authApi } from "@/apis/auth.api";
import { useAuthStore } from "@/store/auth.store";

export const useAuthInit = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const setIsAuthenticated = useAuthStore((s) => s.setIsAuthenticated);
  const resetAuth = useAuthStore((s) => s.resetAuth);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await authApi.getProfile();

        setUser(data.user);
        setIsAuthenticated(true);
      } catch (err) {
        resetAuth();
      }
    };

    initAuth();
  }, [setUser, setIsAuthenticated, resetAuth]);
};
