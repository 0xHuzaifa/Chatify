import { authApi } from "@/apis/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { useMutation } from "@tanstack/react-query";

// --------------------- LOGIN ---------------------
export const useLogin = () => {
  return useMutation({
    mutationKey: ["login"],
    mutationFn: authApi.login,
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setAccessToken(accessToken);
    },
  });
};
