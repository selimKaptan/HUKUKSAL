import { NextRequest, NextResponse } from "next/server";
import { searchUyapPrecedents, getCategoryKeywords } from "@/lib/uyap-client";
import { apiSecurityCheck, safeErrorResponse } from "@/lib/api-security";
import { isValidCategory, isValidDate, sanitizeForPrompt } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  try {
    // Güvenlik kontrolü (CSRF + Rate Limit)
    const securityError = apiSecurityCheck(request, "/api/uyap-search");
    if (securityError) return securityError;

    const body = await request.json();
    const { keyword, category, startDate, endDate } = body;

    if (!keyword && !category) {
      return NextResponse.json(
        { error: "keyword veya category gereklidir" },
        { status: 400 }
      );
    }

    // Kategori doğrulama
    if (category && !isValidCategory(category)) {
      return NextResponse.json(
        { error: "Geçersiz kategori." },
        { status: 400 }
      );
    }

    // Tarih format doğrulama
    if (startDate && !isValidDate(startDate)) {
      return NextResponse.json(
        { error: "Geçersiz başlangıç tarihi formatı (DD/MM/YYYY)." },
        { status: 400 }
      );
    }
    if (endDate && !isValidDate(endDate)) {
      return NextResponse.json(
        { error: "Geçersiz bitiş tarihi formatı (DD/MM/YYYY)." },
        { status: 400 }
      );
    }

    // Arama kelimesi sanitizasyonu
    let searchKeyword = keyword ? sanitizeForPrompt(keyword).slice(0, 200) : "";
    if (category && !keyword) {
      const keywords = getCategoryKeywords(category);
      searchKeyword = keywords[0] || "dava";
    }

    const result = await searchUyapPrecedents({
      aranacakKelime: searchKeyword,
      baslangicTarihi: startDate || "",
      bitisTarihi: endDate || "",
      pageSize: 10,
      pageNumber: 1,
    });

    return NextResponse.json(result);
  } catch (error) {
    return safeErrorResponse(error, "UYAP arama sırasında bir hata oluştu.");
  }
}
