import { authApi } from "@/apis/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { useMutation, useQuery } from "@tanstack/react-query";

// --------------------- LOGIN ---------------------
export const useLogin = () => {
  return useMutation({
    mutationKey: ["login"],
    mutationFn: authApi.login,
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setAccessToken(accessToken);
      useAuthStore.getState().setIsAuthenticated(true);
    },
  });
};

// --------------------- LOGOUT ---------------------
export const useLogout = () => {
  return useMutation({
    mutationFn: authApi.logout,

    onSuccess: () => {
      useAuthStore.getState().resetAuth();
      useAuthStore.getState().triggerForceLogout();
      document.cookie = `accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    },

    onError: () => {
      // Even if logout API fails, clear local auth
      useAuthStore.getState().resetAuth();
      useAuthStore.getState().triggerForceLogout();
      document.cookie = `accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    },
  });
};
