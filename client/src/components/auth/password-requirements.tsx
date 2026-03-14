import React from "react";
import { CheckIcon, X } from "lucide-react";

export type PasswordChecks = {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  valid: boolean;
};

export function passwordChecks(password: string): PasswordChecks {
  const length = password.length >= 8;
  const uppercase = /[A-Z]/.test(password);
  const lowercase = /[a-z]/.test(password);
  const number = /\d/.test(password);
  const special = /[@$!%*?&]/.test(password);
  const valid = length && uppercase && lowercase && number && special;

  return { length, uppercase, lowercase, number, special, valid };
}

type Props = {
  password: string;
  className?: string;
};

export default function PasswordRequirements({ password, className }: Props) {
  const checks = passwordChecks(password || "");

  const items: { key: keyof PasswordChecks; label: string }[] = [
    { key: "length", label: "At least 8 characters" },
    { key: "uppercase", label: "One uppercase letter (A–Z)" },
    { key: "lowercase", label: "One lowercase letter (a–z)" },
    { key: "number", label: "One number (0–9)" },
    { key: "special", label: "One special character (@$!%*?&)" },
  ];

  return (
    <div className={className} aria-live="polite">
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((it) => {
          const ok = checks[it.key as keyof PasswordChecks] as boolean;
          return (
            <li key={it.key} className="flex items-center gap-2">
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                  ok
                    ? "bg-green-50 border-green-200 text-green-600"
                    : "bg-transparent border-gray-200 text-gray-400"
                }`}
                aria-hidden
              >
                {ok ? (
                  <CheckIcon className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </span>

              <span
                style={{
                  color: ok
                    ? "var(--color-text-primary)"
                    : "var(--color-text-tertiary)",
                }}
              >
                {it.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
