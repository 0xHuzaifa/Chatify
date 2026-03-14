"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetProfile } from "@/queries/auth.queries";
import { useAuthStore } from "@/store/auth.store";
import useSocket from "@/hooks/useSocket";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  // Initialize socket connection and event listeners
  useSocket();

  const { data: user, isLoading, isError } = useGetProfile();

  useEffect(() => {
    if (!isLoading) {
      if (isError || !user) {
        router.replace("/login");
      } else {
        setUser(user);
        setIsAuthenticated(true);
      }
    }
  }, [user, isLoading, isError, router, setUser, setIsAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--color-bg-primary)">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-(--color-bg-tertiary) border-t-(--color-primary) rounded-full"></div>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return null;
  }

  return children;
}
