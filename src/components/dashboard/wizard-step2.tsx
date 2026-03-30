"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Lightbulb, Sparkles, Loader2, Check, X, RotateCcw } from "lucide-react";

interface Step2Props {
  eventSummary: string;
  eventDate: string;
  opposingParty: string;
  category?: string;
  onUpdate: (data: { eventSummary?: string; eventDate?: string; opposingParty?: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

export function WizardStep2({
  eventSummary,
  eventDate,
  opposingParty,
  category,
  onUpdate,
  onNext,
  onBack,
}: Step2Props) {
  const isValid = eventSummary.trim().length >= 20;
  const [isImproving, setIsImproving] = useState(false);
  const [improvedText, setImprovedText] = useState<string | null>(null);

  const handleImprove = async () => {
    if (eventSummary.trim().length < 20) return;
    setIsImproving(true);
    try {
      const res = await fetch("/api/improve-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: eventSummary, category }),
      });

      const data = await res.json();
      if (data.improvedText) {
        setImprovedText(data.improvedText);
      } else {
        alert(data.error || "Metin iyileştirilemedi.");
      }
    } catch {
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsImproving(false);
    }
  };

  const acceptImproved = () => {
    if (improvedText) {
      onUpdate({ eventSummary: improvedText });
    }
    setImprovedText(null);
  };

  const rejectImproved = () => {
    setImprovedText(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Olayi Anlatin
        </h2>
        <p className="text-slate-500">
          Yasadiginiz olayi mumkun oldugunca detayli anlatin. Ne kadar detay verirseniz, analiz o kadar dogru olur.
        </p>
      </div>

      {/* Tip box */}
      <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Ipucu:</strong> Olayin tarihlerini, karsi tarafi, elinizde hangi belgelerin oldugunu ve yasananlari kronolojik sirayla yazin. Tanik, belge veya sozlesme varsa belirtin.
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">
              Olay Ozeti <span className="text-red-500">*</span>
            </label>
            {eventSummary.trim().length >= 20 && !improvedText && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleImprove}
                disabled={isImproving}
                className="gap-1.5 text-violet-600 border-violet-200 hover:bg-violet-50 hover:border-violet-300"
              >
                {isImproving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {isImproving ? "Duzenleniyor..." : "AI ile Iyilestir"}
              </Button>
            )}
          </div>

          {/* İyileştirilmiş metin önizleme */}
          <AnimatePresence>
            {improvedText && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="border-2 border-violet-300 bg-violet-50 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-semibold text-violet-800">AI Duzenleme Onerisi</span>
                </div>

                <div className="bg-white rounded-lg p-3 text-sm text-slate-700 leading-relaxed max-h-48 overflow-y-auto border border-violet-200">
                  {improvedText}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={acceptImproved}
                    className="gap-1.5 bg-violet-600 hover:bg-violet-700"
                  >
                    <Check className="w-3.5 h-3.5" /> Kabul Et
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={rejectImproved}
                    className="gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" /> Orijinali Koru
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleImprove}
                    disabled={isImproving}
                    className="gap-1.5 text-slate-500"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Tekrar Dene
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <textarea
            placeholder="Yasadiginiz olayi detayli bir sekilde anlatin. Ne oldu? Ne zaman oldu? Kim tarafindan yapildi? Hangi kanitlariniz var?"
            value={eventSummary}
            onChange={(e) => onUpdate({ eventSummary: e.target.value })}
            rows={8}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>
              {eventSummary.length < 20
                ? `En az 20 karakter gerekli (${eventSummary.length}/20)`
                : "Yeterli detay"}
            </span>
            <span>{eventSummary.length} karakter</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Olay Tarihi
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => onUpdate({ eventDate: e.target.value })}
              className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Karsi Taraf
            </label>
            <input
              type="text"
              placeholder="Kisi veya kurum adi"
              value={opposingParty}
              onChange={(e) => onUpdate({ opposingParty: e.target.value })}
              className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} size="lg">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Geri
        </Button>
        <Button onClick={onNext} disabled={!isValid} size="lg" className="group">
          Devam Et
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );
}
