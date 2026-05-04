import { randomBytes, createHash } from "node:crypto";
import { connectDB } from "@/lib/mongodb";
import { sendPasswordResetEmail } from "@/lib/email";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
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
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const token = randomBytes(32).toString("hex");
    user.passwordResetTokenHash = hashToken(token);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const baseUrl =
      process.env.NEXTAUTH_URL ??
      process.env.AUTH_URL ??
      "http://localhost:3000";
    const resetUrl = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${token}`;

    await sendPasswordResetEmail(
      user.email,
      resetUrl,
      user.role === "admin" ? "admin" : "user"
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
