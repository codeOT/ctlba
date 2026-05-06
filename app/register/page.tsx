"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Image from "next/image";

const PENDING_AUTH_KEY = "lba_pending_auth_v1";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        setLoading(false);
        return;
      }
      window.sessionStorage.setItem(
        PENDING_AUTH_KEY,
        JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        })
      );
      setSuccess("Account created. Check your email for the 6-digit verification code.");
      router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
      return;
    } catch {
      setError("Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-zinc-300 bg-white p-8 shadow-sm">
         <div className="flex justify-center">
        <Image
          src="/ct1.png"
          alt="Cardinal Torch Logo"
          width={200}
          height={70}
          className="mb-6"
        />
      </div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Create supplier account
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Register to access the supplier onboarding portal.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-zinc-700">
            Full name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600 focus:ring-2 focus:ring-zinc-200"
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Email
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600 focus:ring-2 focus:ring-zinc-200"
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Password (min 8 characters)
            <input
              required
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600 focus:ring-2 focus:ring-zinc-200"
            />
          </label>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>
        <p className="mt-4 text-sm text-zinc-600">
          Already have an account?{" "}
          <Link href="/login" className="text-zinc-900 underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
