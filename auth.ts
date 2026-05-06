import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

function getAuthSecret(): string {
  const fromEnv =
    process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  if (process.env.NODE_ENV !== "production") {
    return "lba-dev-only-auth-secret-min-32-chars-do-not-use-in-prod!!";
  }
  throw new Error(
    "Missing AUTH_SECRET (or NEXTAUTH_SECRET). Add it to .env.local for production. See https://errors.authjs.dev#missingsecret"
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: getAuthSecret(),
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = (credentials?.email as string | undefined)?.trim();
        const password = (credentials?.password as string | undefined)?.trim();
        if (!email || !password) {
          return null;
        }

        const { connectDB } = await import("@/lib/mongodb");
        const User = (await import("@/models/User")).default;
        const bcrypt = (await import("bcryptjs")).default;

        await connectDB();
        const user = await User.findOne({ email: email.toLowerCase() }).lean();
        if (!user?.passwordHash) {
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          return null;
        }

        if (user.role === "user" && !user.emailVerifiedAt) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name ?? "",
          role: user.role as "user" | "admin",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && "role" in user) {
        token.role = user.role as "user" | "admin";
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as "user" | "admin") ?? "user";
      }
      return session;
    },
  },
});
