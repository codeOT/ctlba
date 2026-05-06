import { createHash } from "node:crypto";
import { sendEmailVerificationEmail } from "@/lib/email";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function generateVerificationCode() {
  return (Math.floor(100000 + Math.random() * 900000)).toString();
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();
    await connectDB();

    const user = await User.findOne({ email });
    if (!user || user.role !== "user" || user.emailVerifiedAt) {
      return NextResponse.json({ ok: true });
    }

    const verificationCode = generateVerificationCode();
    user.emailVerificationTokenHash = hashToken(verificationCode);
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();
    await sendEmailVerificationEmail(email, verificationCode);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
