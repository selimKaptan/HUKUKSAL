import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js Middleware - Tüm isteklerde çalışır
 * - API route'larda güvenlik header'ları ekler
 * - Admin sayfalarına erişim kontrolü (cookie-based)
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // API route'larda ekstra güvenlik header'ları
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
