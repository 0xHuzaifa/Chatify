"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { disconnectSocket } from "@/lib/socket/socket";

// Memoized selectors
const selectForceLogout = (s: any) => s.forceLogout;
const selectClearForceLogout = (s: any) => s.clearForceLogout;

export const AuthListener = () => {
  const router = useRouter();
  const forceLogout = useAuthStore(selectForceLogout);
  const clearForceLogout = useAuthStore(selectClearForceLogout);

  useEffect(() => {
    if (forceLogout) {
      // Disconnect socket on logout
      disconnectSocket();

      clearForceLogout();
      router.replace("/login"); // replace to prevent back-button to protected page
    }
  }, [forceLogout, clearForceLogout, router]);

  return null;
};
