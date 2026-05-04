import { auth } from "@/auth";
import { NextResponse } from "next/server";

const adminPublicPaths = new Set(["/admin/login", "/admin/forgot-password"]);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = session?.user?.role;

  if (pathname.startsWith("/admin")) {
    if (adminPublicPaths.has(pathname)) {
      if (session && role === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.next();
    }

    if (!session || role !== "admin") {
      const login = new URL("/admin/login", req.url);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  if (pathname === "/") {
    if (!session) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", "/");
      return NextResponse.redirect(login);
    }
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (role !== "user") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/admin/:path*", "/dashboard", "/submissions/:path*"],
};
