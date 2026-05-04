"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const resetOk = searchParams.get("reset") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
     
      <div className="w-full max-w-md rounded-lg border border-zinc-300 bg-white p-8 shadow-sm">
        <div className="flex justify-center">
          <Image src="/ct1.png" alt="Cardinal Torch Logo" width={200} height={70} className="mb-6" />
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900">Supplier sign in</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Sign in to submit your supplier and guarantor application.
        </p>
        {resetOk ? (
          <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Your password was updated. You can sign in below.
          </p>
        ) : null}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
            Password
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-600 focus:ring-2 focus:ring-zinc-200"
            />
          </label>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className="mt-4 flex flex-col gap-2 text-sm text-zinc-600">
          <Link href="/register" className="text-zinc-900 underline">
            Create an account
          </Link>
          <Link href="/forgot-password" className="text-zinc-900 underline">
            Forgot password?
          </Link>
         
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
