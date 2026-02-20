import { NextResponse, NextRequest } from "next/server";

import { ROUTES } from "./lib/routes";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  if (session && session.length > 0 && pathname.startsWith("/sign-in")) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  const protectedPaths = [ROUTES.SETTINGS];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if ((!session || session.length === 0) && isProtected) {
    return NextResponse.redirect(new URL(`${ROUTES.AUTH}?mode=login`, request.url));
  }

  return NextResponse.next();
}
