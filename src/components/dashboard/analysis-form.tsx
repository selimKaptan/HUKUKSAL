"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CASE_CATEGORY_LABELS, type CaseCategory } from "@/types/database";
import { Upload, X, FileText, Sparkles, Check, Loader2, Zap, Scale, Paperclip, Plus } from "lucide-react";

interface FormData {
  title: string;
  category: CaseCategory | "";
  eventSummary: string;
  eventDate: string;
  opposingParty: string;
  additionalNotes: string;
}

interface Props {
  formData: FormData;
  updateForm: (data: Partial<FormData>) => void;
  isAnalyzing: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export function AnalysisForm({ formData, updateForm, isAnalyzing, onSubmit, onBack }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [aiImproving, setAiImproving] = useState(false);
  const [improvedText, setImprovedText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Dosya ekleme
  const addFiles = (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).filter((f) => f.size <= 10 * 1024 * 1024);
    setFiles((prev) => [...prev, ...arr]);
  };

  // Sürükle bırak
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  // AI İyileştir
  const handleAiImprove = async () => {
    if (formData.eventSummary.length < 20 || aiImproving) return;
    setAiImproving(true);
    try {
      const res = await fetch("/api/improve-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: formData.eventSummary, category: formData.category }),
      });
      const data = await res.json();
      if (data.improvedText) setImprovedText(data.improvedText);
    } catch { /* ignore */ }
    finally { setAiImproving(false); }
  };

  const acceptImproved = () => {
    if (improvedText) updateForm({ eventSummary: improvedText });
    setImprovedText(null);
  };

  const isValid = formData.title.length >= 3 && formData.category && formData.eventSummary.length >= 20;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-700 mb-4 flex items-center gap-1">← Panele Dön</button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Başlık + Kategori - Kompakt */}
        <div className="p-5 pb-4 border-b border-slate-100">
          <div className="grid grid-cols-5 gap-3">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateForm({ title: e.target.value })}
              placeholder="Dava başlığı yazın..."
              className="col-span-3 h-10 px-3 rounded-lg border border-slate-200 text-sm focus:border-blue-500 outline-none"
            />
            <select
              value={formData.category}
              onChange={(e) => updateForm({ category: e.target.value as CaseCategory })}
              className="col-span-2 h-10 px-3 rounded-lg border border-slate-200 text-sm focus:border-blue-500 outline-none"
            >
              <option value="">Kategori</option>
              {Object.entries(CASE_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>

        {/* Olay Anlatımı - Ana Alan */}
        <div
          className={`relative transition-colors ${isDragging ? "bg-blue-50" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <textarea
            ref={textareaRef}
            value={formData.eventSummary}
            onChange={(e) => updateForm({ eventSummary: e.target.value })}
            placeholder="Olayınızı anlatın... Ne oldu? Ne zaman? Kim tarafından? Hangi kanıtlarınız var?&#10;&#10;Belge varsa sürükleyip bırakabilirsiniz."
            rows={8}
            className="w-full px-5 py-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none resize-none border-none"
          />

          {/* Sürükle bırak overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-blue-50/90 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center z-10">
              <div className="text-center">
                <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-700">Dosyayı bırakın</p>
              </div>
            </div>
          )}
        </div>

        {/* AI İyileştirme Önerisi */}
        <AnimatePresence>
          {improvedText && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mx-5 mb-4 p-4 bg-violet-50 border border-violet-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-bold text-violet-800">AI Düzenleme Önerisi</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-3 max-h-32 overflow-y-auto">{improvedText}</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={acceptImproved} className="gap-1 bg-violet-600 hover:bg-violet-700">
                    <Check className="w-3.5 h-3.5" /> Kabul Et
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setImprovedText(null)} className="gap-1">
                    <X className="w-3.5 h-3.5" /> İptal
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Yüklenen Dosyalar */}
        {files.length > 0 && (
          <div className="px-5 pb-3 flex gap-2 flex-wrap">
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-slate-700 max-w-[120px] truncate">{f.name}</span>
                <button onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Alt Bar - Dosya ekle, tarih, karşı taraf, AI, Gönder */}
        <div className="border-t border-slate-100 px-4 py-3">
          {/* Ek bilgiler - kompakt satır */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <input type="date" value={formData.eventDate} onChange={(e) => updateForm({ eventDate: e.target.value })} className="h-8 px-2 rounded-lg border border-slate-200 text-xs focus:border-blue-500 outline-none" />
            <input type="text" value={formData.opposingParty} onChange={(e) => updateForm({ opposingParty: e.target.value })} placeholder="Karşı taraf" className="h-8 px-2 rounded-lg border border-slate-200 text-xs focus:border-blue-500 outline-none flex-1 min-w-[100px]" />
            <span className="text-xs text-slate-400">{formData.eventSummary.length} karakter</span>
          </div>

          {/* Aksiyon butonları */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Dosya Ekle */}
              <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Dosya ekle">
                <Plus className="w-4 h-4 text-slate-500" />
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Belge yükle">
                <Paperclip className="w-4 h-4 text-slate-500" />
              </button>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.docx,.doc" onChange={(e) => { if (e.target.files) addFiles(e.target.files); }} className="hidden" />

              {/* AI İyileştir */}
              {formData.eventSummary.length >= 20 && !improvedText && (
                <button onClick={handleAiImprove} disabled={aiImproving} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="AI ile metni iyileştir">
                  {aiImproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {aiImproving ? "Düzenleniyor..." : "AI İyileştir"}
                </button>
              )}
            </div>

            {/* Analiz Başlat */}
            <Button
              onClick={onSubmit}
              disabled={isAnalyzing || !isValid}
              className="h-9 px-5 text-sm gap-1.5"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {isAnalyzing ? "Analiz ediliyor..." : "Analizi Başlat"}
            </Button>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-300 animate-pulse">
                <Scale className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Davanız Analiz Ediliyor</h3>
              <p className="text-slate-500">Emsal kararlar taranıyor...</p>
              <div className="mt-6 flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="w-3 h-3 bg-blue-600 rounded-full" animate={{ y: [0, -10, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
