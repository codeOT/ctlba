"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

const PENDING_AUTH_KEY = "lba_pending_auth_v1";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("Enter the 6-digit code sent to your email.");
  const [verifying, setVerifying] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const verifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setVerifying(true);
    setStatus("idle");
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus("error");
        setMessage(body.error ?? "Verification failed.");
        setVerifying(false);
        return;
      }
      const normalizedEmail = email.trim().toLowerCase();
      const rawPending = window.sessionStorage.getItem(PENDING_AUTH_KEY);
      if (rawPending) {
        try {
          const pending = JSON.parse(rawPending) as {
            email?: string;
            password?: string;
          };
          if (
            pending.email?.toLowerCase() === normalizedEmail &&
            typeof pending.password === "string" &&
            pending.password.length > 0
          ) {
            const signInResult = await signIn("credentials", {
              email: normalizedEmail,
              password: pending.password,
              redirect: false,
            });
            if (!signInResult?.error) {
              window.sessionStorage.removeItem(PENDING_AUTH_KEY);
              router.push("/");
              router.refresh();
              return;
            }
          }
        } catch {
          window.sessionStorage.removeItem(PENDING_AUTH_KEY);
        }
      }

      setStatus("success");
      setMessage("Email verified successfully. Redirecting to sign in...");
      router.push("/login");
    } catch {
      setStatus("error");
      setMessage("Could not verify email. Please try again.");
    }
    setVerifying(false);
  };

  const resend = async () => {
    if (!email) {
      setMessage("Enter your email address first.");
      return;
    }
    setResendLoading(true);
    setStatus("idle");
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!response.ok) {
        setMessage("Could not resend verification email right now.");
        setResendLoading(false);
        return;
      }
      setMessage("A new verification code has been sent to your email.");
    } catch {
      setMessage("Could not resend verification email right now.");
    }
    setResendLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-zinc-300 bg-white p-8 shadow-sm">
        <div className="flex justify-center">
                <Image src="/ct1.png" alt="Cardinal Torch Logo" width={200} height={70} className="mb-8" />
              </div>
        <h1 className="text-2xl font-semibold text-zinc-900">Email verification</h1>
        <p
          className={`mt-4 text-sm ${
            status === "error"
              ? "text-rose-600"
              : status === "success"
              ? "text-emerald-700"
              : "text-zinc-700"
          }`}
        >
          {message}
        </p>
        <form className="mt-6 space-y-4" onSubmit={verifyCode}>
          <label className="block text-sm font-medium text-zinc-700">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600 focus:ring-2 focus:ring-zinc-200"
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Verification code
            <input
              required
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit code"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm tracking-[0.2em] outline-none focus:border-zinc-600 focus:ring-2 focus:ring-zinc-200"
            />
          </label>
          <button
            type="submit"
            disabled={verifying}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {verifying ? "Verifying..." : "Verify code"}
          </button>
        </form>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={resend}
            disabled={resendLoading || !email.trim()}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-60"
          >
            {resendLoading ? "Resending..." : "Resend verification code"}
          </button>
        
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm">Loading…</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
