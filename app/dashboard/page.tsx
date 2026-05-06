import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Submission from "@/models/Submission";
import Image from "next/image";
import mongoose from "mongoose";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (session.user.role !== "user") {
    redirect("/admin");
  }

  await connectDB();
  const submissions = await Submission.find({
    userId: new mongoose.Types.ObjectId(session.user.id),
  })
    .sort({ submittedAt: -1 })
    .lean();

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-8 md:pb-12">
      <div className="sticky top-0 z-30 -mx-4 mb-6 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Image src="/ct1.png" alt="Cardinal Torch Logo" width={34} height={34} />
            <span className="text-lg font-semibold text-zinc-900">LBA Portal</span>
          </div>
          <div className="hidden min-w-[220px] flex-1 rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-zinc-600 md:block">
            Supplier Dashboard
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
            >
              New Submission
            </Link>
          </div>
        </div>
      </div>
      <section className="mx-auto w-full max-w-6xl rounded-lg border border-zinc-300 bg-white p-6 shadow-sm md:p-10">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              LBA Portal
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
              My Dashboard
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              View submitted forms and edit pending submissions.
            </p>
          </div>
        </header>

        {submissions.length === 0 ? (
          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-600">
            You have not submitted any forms yet.
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((item) => (
              <article
                key={item._id.toString()}
                className="rounded-md border border-zinc-200 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-900">
                      {(item.supplierData as { registeredCompanyName?: string })
                        ?.registeredCompanyName || "Unnamed Supplier"}
                    </h2>
                    <p className="text-sm text-zinc-600">
                      Submitted: {new Date(item.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded border px-3 py-1 text-xs font-semibold uppercase ${
                        item.status === "accepted"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : item.status === "rejected"
                          ? "border-rose-300 bg-rose-50 text-rose-700"
                          : "border-amber-300 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {item.status}
                    </span>
                    {item.status === "pending" ? (
                      <Link
                        href={`/submissions/${item._id.toString()}/edit`}
                        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                      >
                        Edit
                      </Link>
                    ) : (
                      <span className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500">
                        Locked
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
