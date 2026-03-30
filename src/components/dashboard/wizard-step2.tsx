"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Lightbulb } from "lucide-react";

interface Step2Props {
  eventSummary: string;
  eventDate: string;
  opposingParty: string;
  onUpdate: (data: { eventSummary?: string; eventDate?: string; opposingParty?: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

export function WizardStep2({
  eventSummary,
  eventDate,
  opposingParty,
  onUpdate,
  onNext,
  onBack,
}: Step2Props) {
  const isValid = eventSummary.trim().length >= 20;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Olayı Anlatın
        </h2>
        <p className="text-slate-500">
          Yaşadığınız olayı mümkün olduğunca detaylı anlatın. Ne kadar detay verirseniz, analiz o kadar doğru olur.
        </p>
      </div>

      {/* Tip box */}
      <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>İpucu:</strong> Olayın tarihlerini, karşı tarafı, elinizde hangi belgelerin olduğunu ve yaşananları kronolojik sırayla yazın. Tanık, belge veya sözleşme varsa belirtin.
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            Olay Özeti <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Yaşadığınız olayı detaylı bir şekilde anlatın. Ne oldu? Ne zaman oldu? Kim tarafından yapıldı? Hangi kanıtlarınız var?"
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
              Karşı Taraf
            </label>
            <input
              type="text"
              placeholder="Kişi veya kurum adı"
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
