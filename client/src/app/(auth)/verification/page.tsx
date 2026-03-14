"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useResendVerification } from "@/queries/auth.queries";
import { toast } from "@/hooks/use-toast";

export default function VerificationResultPage() {
  const search = useSearchParams();
  const router = useRouter();
  const status = search?.get("status");
  const reason = search?.get("reason");

  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(3);
  const { mutateAsync: resend, isPending } = useResendVerification();

  useEffect(() => {
    try {
    const userId = search?.get("userId") || localStorage.getItem("pendingVerificationUserId");
    setPendingUserId(userId);
  } catch (e) {
      setPendingUserId(null);
    }

    // show a brief loading state before revealing result
    const t = window.setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  // when verification is successful, start 3s countdown (navigation happens in a separate effect)
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!loading && status === "success") {
      try {
        localStorage.removeItem("pendingVerificationUserId");
      } catch (e) {
        /* ignore */
      }

      setCountdown(3);

      // store interval id in ref so we can clear it from other effects
      intervalRef.current = window.setInterval(() => {
        setCountdown((c) => Math.max(0, c - 1));
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }

    return undefined;
  }, [loading, status]);

  // perform navigation as a side-effect when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && !loading && status === "success") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // navigate in an effect (safe) instead of inside the state updater
      router.push("/login");
    }
  }, [countdown, loading, status, router]);

  const handleResend = async () => {
    if (!pendingUserId) {
      toast({ title: "Error", description: "No pending user found." });
      return;
    }

    try {
      await resend({ userId: pendingUserId });
      toast({ title: "Sent", description: "Verification resent." });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to resend";
      toast({ title: "Resend failed", description: message });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-56">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
            style={{
              borderColor: "var(--color-primary)",
              borderTopColor: "transparent",
            }}
            aria-hidden
          />
          <p style={{ color: "var(--color-text-secondary)" }}>Verifying...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-md">
      <div>
        <h2
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          {status === "success" ? "Email verified" : "Verification"}
        </h2>

        <p style={{ color: "var(--color-text-secondary)" }}>
          {status === "success" ? (
            <>
              Your email has been successfully verified. You will be redirected
              to the sign in page in <strong>{countdown}</strong> second
              {countdown !== 1 ? "s" : ""}.
            </>
          ) : status === "failed" ? (
            <>
              Verification failed{reason ? ` — ${reason}` : "."}
              <br /> If you didn't receive a valid link, you can resend below.
            </>
          ) : (
            "Verification status unknown."
          )}
        </p>
      </div>

      <div className="space-y-4">
        {status !== "success" && (
          <div>
            <button
              onClick={handleResend}
              disabled={isPending || !pendingUserId}
              className="w-full text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--color-primary), var(--color-secondary))",
              }}
            >
              {isPending ? "Resending..." : "Resend verification"}
            </button>
          </div>
        )}

        <div>
          <button
            onClick={() => router.push("/login")}
            className="w-full text-sm font-medium py-3 px-4 rounded-lg transition"
            style={{ color: "var(--color-primary)" }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
