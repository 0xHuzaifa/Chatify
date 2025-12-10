import { type NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login", "/signup", "/verify-code", "/forgot-password"];
const authRoutes = ["/login", "/signup", "/verify-code", "/forgot-password"];

export function proxy(request: NextRequest) {
  // const { pathname } = request.nextUrl
  // const authToken = request.cookies.get("authToken")?.value

  // // Redirect authenticated users away from auth pages
  // if (authRoutes.includes(pathname) && authToken) {
  //   return NextResponse.redirect(new URL("/chat", request.url))
  // }

  // // Redirect unauthenticated users to login
  // if (!publicRoutes.includes(pathname) && !authToken) {
  //   return NextResponse.redirect(new URL("/login", request.url))
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
