"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useResendVerification } from "@/queries/auth.queries";
import { toast } from "@/hooks/use-toast";

export default function VerifyLinkPage() {
  const router = useRouter();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const { mutateAsync: resend, isPending } = useResendVerification();

  useEffect(() => {
    try {
      setPendingUserId(localStorage.getItem("pendingVerificationUserId"));
      setPendingEmail(localStorage.getItem("pendingVerificationEmail"));
    } catch (e) {
      /* ignore */
    }
  }, []);

  const handleResend = async () => {
    if (!pendingUserId) {
      toast({
        title: "Error",
        description: "No pending user found. Please sign up again.",
      });
      return;
    }

    try {
      await resend({ userId: pendingUserId });
      toast({
        title: "Sent",
        description: "A new verification link has been sent to your email.",
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Could not resend verification";
      toast({ title: "Resend failed", description: message });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Verify Your Email
        </h2>
        <p style={{ color: "var(--color-text-secondary)" }}>
          We sent a verification link to{" "}
          {pendingEmail ? <strong>{pendingEmail}</strong> : "your email"}. Click
          the link in your inbox to verify your account.
        </p>
      </div>

      <div className="space-y-4">
        <button
          type="button"
          onClick={handleResend}
          disabled={isPending || !pendingUserId}
          className="w-full text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--color-primary), var(--color-secondary))",
          }}
        >
          {isPending ? "Resending..." : "Resend verification link"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full text-sm font-medium py-3 px-4 rounded-lg transition"
          style={{ color: "var(--color-primary)" }}
        >
          Back to Sign In
        </button>

        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Didn't receive the email? Check spam or try resending.
        </p>
      </div>
    </div>
  );
}
