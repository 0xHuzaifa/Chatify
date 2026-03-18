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
    },

    onError: () => {
      // Even if logout API fails, clear local auth
      useAuthStore.getState().resetAuth();
      useAuthStore.getState().triggerForceLogout();
    },
  });
};

// --------------------- GET PROFILE ---------------------
export const useGetProfile = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: authApi.getProfile,
    select: (res) => res.data.data,
    retry: false,
  });
};

// --------------------- REGISTER ---------------------
export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
  });
};

// --------------------- VERIFY ---------------------
export const useVerify = () => {
  return useMutation({
    mutationFn: authApi.verify,
  });
};

// --------------------- RESEND VERIFICATION ---------------------
export const useResendVerification = () => {
  return useMutation({
    mutationFn: authApi.resendVerification,
  });
};

// --------------------- CURRENT USER ---------------------
export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: authApi.getProfile,
    select: (res) => res.data.data,
  });
};

// --------------------- SEARCH USERS ---------------------
export const useSearchUsers = (search: string) => {
  const normalized = search.trim();

  return useQuery({
    queryKey: ["search-users", normalized],
    enabled: normalized.length >= 2,
    queryFn: () => authApi.searchUsers(normalized),
    select: (res) => res.data.data as any[],
    staleTime: 10_000,
  });
};
