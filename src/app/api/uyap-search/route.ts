import { NextRequest, NextResponse } from "next/server";
import { searchUyapPrecedents, getCategoryKeywords } from "@/lib/uyap-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, category, startDate, endDate } = body;

    if (!keyword && !category) {
      return NextResponse.json(
        { error: "keyword veya category gereklidir" },
        { status: 400 }
      );
    }

    // Kategori bazlı anahtar kelimeler ile zenginleştir
    let searchKeyword = keyword || "";
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
    console.error("UYAP search error:", error);
    return NextResponse.json(
      {
        decisions: [],
        totalCount: 0,
        success: false,
        error: "UYAP arama sırasında bir hata oluştu. Yerel emsal veritabanı kullanılacak.",
      },
      { status: 200 }
    );
  }
}
