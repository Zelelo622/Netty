import { NextResponse, NextRequest } from "next/server";

import { ROUTES } from "./lib/routes";

export function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  if (session && pathname.startsWith("/sign-in")) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  const protectedPaths = [ROUTES.SETTINGS];
  if (!session && protectedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL(`${ROUTES.AUTH}?mode=login`, request.url));
  }

  return NextResponse.next();
}
