"use client";

import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import type { AnalysisResult } from "@/types/database";

interface PDFGeneratorProps {
  result: AnalysisResult;
  caseTitle: string;
  category: string;
}

export function PDFGenerator({ result, caseTitle, category }: PDFGeneratorProps) {
  const handleDownload = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let y = 20;

    const addText = (text: string, size: number, style: string = "normal", color: [number, number, number] = [0, 0, 0]) => {
      doc.setFontSize(size);
      doc.setFont("helvetica", style);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, contentWidth);
      for (const line of lines) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += size * 0.5;
      }
      y += 3;
    };

    const addLine = () => {
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
    };

    // Header
    addText("JUSTICEGUARD", 20, "bold", [37, 99, 235]);
    addText("Hukuki Analiz Raporu - Avukat Dosyasi", 12, "normal", [100, 100, 100]);
    y += 5;
    addLine();

    // Case info
    addText(`Dava: ${caseTitle}`, 14, "bold");
    addText(`Kategori: ${category}`, 11, "normal", [100, 100, 100]);
    addText(`Tarih: ${new Date().toLocaleDateString("tr-TR")}`, 11, "normal", [100, 100, 100]);
    y += 5;
    addLine();

    // Win probability
    addText(`KAZANMA OLASILIGI: %${result.winProbability}`, 16, "bold",
      result.winProbability >= 65 ? [16, 185, 129] : result.winProbability >= 40 ? [245, 158, 11] : [239, 68, 68]
    );
    y += 3;

    const recText = result.recommendation === "file_case"
      ? "TAVSIYE: Dava Acilmasi Tavsiye Edilir"
      : result.recommendation === "needs_review"
      ? "TAVSIYE: Avukat Degerlendirmesi Gereklidir"
      : "TAVSIYE: Dava Acilmasi Onerilmez";
    addText(recText, 12, "bold");
    y += 5;
    addLine();

    // Strengths
    addText("GUCLU YANLAR", 13, "bold", [16, 185, 129]);
    result.strengths.forEach((s) => {
      addText(`  + ${s}`, 10);
    });
    y += 5;

    // Weaknesses
    addText("ZAYIF YANLAR VE RISKLER", 13, "bold", [239, 68, 68]);
    result.weaknesses.forEach((w) => {
      addText(`  - ${w}`, 10);
    });
    y += 5;
    addLine();

    // Precedents
    addText("EMSAL KARAR ANALIZI", 13, "bold", [37, 99, 235]);
    y += 3;
    result.matchedPrecedents.forEach((p, i) => {
      addText(`${i + 1}. ${p.court} - ${p.case_number}`, 11, "bold");
      addText(`Ozet: ${p.summary}`, 9);
      addText(`Karar: ${p.ruling}`, 9);
      addText(`Benzerlik: %${Math.round(p.relevance_score * 100)} | Sonuc: ${
        p.outcome === "plaintiff_won" ? "Davaci Lehine" : p.outcome === "defendant_won" ? "Davali Lehine" : "Uzlasma"
      }`, 9, "normal", [100, 100, 100]);
      y += 3;
    });

    addLine();

    // Suggested actions
    addText("ONERILEN ADIMLAR", 13, "bold");
    result.suggestedActions.forEach((a, i) => {
      addText(`${i + 1}. ${a}`, 10);
    });

    y += 10;
    addLine();
    addText("Bu rapor JusticeGuard AI tarafindan olusturulmustur.", 8, "normal", [150, 150, 150]);
    addText("Kesin hukuki tavsiye niteliginde degildir. Profesyonel hukuki danismanlik almaniz tavsiye edilir.", 8, "normal", [150, 150, 150]);

    doc.save(`JusticeGuard_Avukat_Dosyasi_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button onClick={handleDownload} size="lg" className="group">
        <Download className="mr-2 w-5 h-5" />
        Avukat Dosyasını İndir (PDF)
      </Button>
      <Button
        variant="outline"
        size="lg"
        onClick={() => {
          const blob = new Blob([result.analysisReport], { type: "text/markdown" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `JusticeGuard_Rapor_${new Date().toISOString().slice(0, 10)}.md`;
          a.click();
          URL.revokeObjectURL(url);
        }}
      >
        <FileText className="mr-2 w-5 h-5" />
        Raporu İndir (MD)
      </Button>
    </div>
  );
}
