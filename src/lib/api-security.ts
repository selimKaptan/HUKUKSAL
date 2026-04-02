/**
 * API Security Middleware
 * - CSRF koruması (Origin/Referer kontrolü)
 * - Rate limiting
 * - Ortak hata handler
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "./rate-limiter";

/**
 * CSRF koruması: POST isteklerinde Origin header kontrolü.
 * Aynı origin'den gelmeyenleri reddeder.
 */
export function verifyCsrf(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Origin yoksa ve referer yoksa (curl/Postman gibi) - development'ta izin ver
  if (!origin && !referer) {
    return process.env.NODE_ENV === "development";
  }

  // Host header ile karşılaştır
  const host = request.headers.get("host");
  if (!host) return false;

  const allowedOrigins = [
    `https://${host}`,
    `http://${host}`,
    // localhost development
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];

  if (origin && allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
    return true;
  }

  if (referer && allowedOrigins.some((allowed) => referer.startsWith(allowed))) {
    return true;
  }

  return false;
}

/**
 * API endpoint güvenlik kontrolü.
 * Rate limiting + CSRF doğrulama yapar.
 * null dönerse istek güvenli, Response dönerse hata.
 */
export function apiSecurityCheck(
  request: NextRequest,
  endpoint: string
): NextResponse | null {
  // CSRF kontrolü
  if (!verifyCsrf(request)) {
    return NextResponse.json(
      { error: "Geçersiz istek kaynağı." },
      { status: 403 }
    );
  }

  // Rate limiting
  const ip = getClientIp(request.headers);
  const rateCheck = checkRateLimit(ip, endpoint);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Çok fazla istek. ${rateCheck.retryAfter} saniye sonra tekrar deneyin.` },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.retryAfter || 60) },
      }
    );
  }

  return null; // Güvenli
}

/**
 * Güvenli hata yanıtı - internal detayları gizler.
 */
export function safeErrorResponse(
  error: unknown,
  publicMessage: string = "Bir hata oluştu. Lütfen tekrar deneyin."
): NextResponse {
  // Sadece sunucu loguna yaz, client'a detay verme
  console.error("[API Error]", error instanceof Error ? error.message : error);

  return NextResponse.json(
    { error: publicMessage },
    { status: 500 }
  );
}
