import { connectDB } from "@/lib/mongodb";
import { sendEmailVerificationEmail } from "@/lib/email";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().max(120).optional(),
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
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, password, name } = parsed.data;
    await connectDB();
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationCode = generateVerificationCode();
    await User.create({
      email: normalizedEmail,
      passwordHash,
      name: name ?? "",
      role: "user",
      emailVerificationTokenHash: hashToken(verificationCode),
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await sendEmailVerificationEmail(normalizedEmail, verificationCode);

    return NextResponse.json(
      { ok: true, message: "Account created. Verify your email to continue." },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
