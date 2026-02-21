"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthInit } from "@/hooks/useAuthInit";
import { useAuthStore } from "@/store/auth.store";

// Memoized selector
const selectIsAuthenticated = (s: any) => s.isAuthenticated;

export default function Page() {
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const [isLoading, setIsLoading] = useState(true);

  useAuthInit(); // ✅ hydrate auth on app start

  const pathname = usePathname();

  useEffect(() => {
    // Avoid noisy /login redirects when the user is already on an auth page
    const isAuthRoute = (p: string | null) => {
      if (!p) return false;
      return [
        "/login",
        "/signup",
        "/verify-code",
        "/verify-link",
        "/forgot-password",
        "/reset-password",
      ].some((r) => p.startsWith(r));
    };

    if (isAuthenticated) {
      if (pathname !== "/chat") router.replace("/chat");
    } else {
      // Only navigate to /login when we're not already inside the auth flow
      if (!isAuthRoute(pathname)) router.replace("/login");
    }

    setIsLoading(false);
  }, [isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: "var(--color-bg-primary)" }}
      >
        <div className="animate-spin">
          <div
            className="w-12 h-12 border-4 border-t rounded-full"
            style={{
              borderColor: "var(--color-bg-tertiary)",
              borderTopColor: "var(--color-primary)",
            }}
          />
        </div>
      </div>
    );
  }

  return null;
}
