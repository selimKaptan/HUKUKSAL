"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CASE_CATEGORY_LABELS, CaseCategory } from "@/types/database";
import {
  Briefcase,
  Heart,
  ShoppingCart,
  AlertTriangle,
  Home,
  BookOpen,
  Building2,
  Gavel,
  ArrowRight,
  Scale,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Step1Props {
  title: string;
  category: CaseCategory | "";
  onUpdate: (data: { title?: string; category?: CaseCategory }) => void;
  onNext: () => void;
}

const categoryIcons: Record<CaseCategory, React.ElementType> = {
  is_hukuku: Briefcase,
  aile_hukuku: Heart,
  ticaret_hukuku: Building2,
  ceza_hukuku: AlertTriangle,
  tuketici_hukuku: ShoppingCart,
  kira_hukuku: Home,
  miras_hukuku: BookOpen,
  idare_hukuku: Gavel,
  icra_iflas: Scale,
  diger: BookOpen,
};

// Kategori bazlı örnek başlık önerileri
const TITLE_SUGGESTIONS: Record<CaseCategory, string[]> = {
  is_hukuku: [
    "İşten haksız çıkarılma",
    "Kıdem tazminatı alacağı",
    "İhbar tazminatı talebi",
    "Fazla mesai ücreti alacağı",
    "İşe iade davası",
    "Mobbing (işyerinde psikolojik taciz)",
    "Maaş gecikmesi nedeniyle fesih",
    "İş kazası tazminatı",
    "Yıllık izin ücreti alacağı",
    "Haksız disiplin cezası",
  ],
  aile_hukuku: [
    "Çekişmeli boşanma davası",
    "Anlaşmalı boşanma",
    "Nafaka artırım talebi",
    "Velayet değişikliği",
    "Mal paylaşımı davası",
    "Ziynet eşyası iadesi",
    "Yoksulluk nafakası talebi",
    "Çocuk nafakası artırımı",
    "Aile içi şiddet / koruma kararı",
    "Babalık davası",
  ],
  ticaret_hukuku: [
    "Haksız rekabet davası",
    "Şirket ortaklığından çıkarma",
    "Fatura alacağı tahsili",
    "Ticari sözleşme ihlali",
    "Marka hakkı ihlali",
    "Konkordato talebi",
    "Ortaklar arası uyuşmazlık",
    "Ticari kredi uyuşmazlığı",
  ],
  ceza_hukuku: [
    "Hakaret suçu şikayeti",
    "Tehdit suçu",
    "Dolandırıcılık mağduriyeti",
    "Sosyal medyada hakaret",
    "Hırsızlık şikayeti",
    "Yaralama davası",
    "Özel hayatın gizliliği ihlali",
    "Şantaj suçu",
    "Güveni kötüye kullanma",
  ],
  tuketici_hukuku: [
    "Ayıplı mal iadesi (araç)",
    "Ayıplı mal iadesi (elektronik)",
    "Cayma hakkı kullanımı engeli",
    "Garanti kapsamında tamir reddi",
    "Abonelik iptali sorunu",
    "Haksız fiyat farkı talebi",
    "Mesafeli satış sözleşmesi ihlali",
    "Paket tur iptali/iadesi",
  ],
  kira_hukuku: [
    "Kira borcundan tahliye",
    "Kira bedelinin tespiti",
    "Depozito iadesi",
    "Kiracının tahliyesi (ihtiyaç)",
    "Kira artışı uyuşmazlığı",
    "Kiralanan yerin hasarı",
    "Alt kiralama uyuşmazlığı",
    "Kira sözleşmesi feshi",
  ],
  miras_hukuku: [
    "Miras paylaşımı davası",
    "Tenkis davası",
    "Vasiyetnamenin iptali",
    "Mirasçılıktan çıkarma",
    "Mirasın reddi",
    "Saklı pay ihlali",
    "Miras ortaklığının giderilmesi",
    "Veraset ilamı düzeltme",
  ],
  idare_hukuku: [
    "Disiplin cezası iptali",
    "İdari para cezası iptali",
    "Memur atama iptali",
    "İmar planı iptali",
    "Ruhsat iptali davası",
    "Kamulaştırma bedeli tespiti",
    "Pasaport/ehliyet iptali",
  ],
  icra_iflas: [
    "İtirazın iptali davası",
    "Menfi tespit davası",
    "Borcun tahsili (icra takibi)",
    "Haciz işlemine itiraz",
    "İstihkak davası",
    "Senet alacağı takibi",
    "Kira alacağı icra takibi",
  ],
  diger: [
    "Tazminat davası",
    "Sözleşme uyuşmazlığı",
    "Hukuki danışmanlık talebi",
  ],
};

export function WizardStep1({ title, category, onUpdate, onNext }: Step1Props) {
  const isValid = title.trim().length >= 3 && category !== "";
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Kategori ve yazılan metne göre filtrelenmiş öneriler
  const suggestions = useMemo(() => {
    if (!category) {
      const all = Object.entries(TITLE_SUGGESTIONS).flatMap(([cat, titles]) =>
        titles.map((t) => ({ title: t, category: cat as CaseCategory }))
      );
      if (!title.trim()) return all.slice(0, 8);
      return all.filter((s) => s.title.toLowerCase().includes(title.toLowerCase())).slice(0, 8);
    }
    const catSuggestions = (TITLE_SUGGESTIONS[category as CaseCategory] || []).map((t) => ({ title: t, category: category as CaseCategory }));
    if (!title.trim()) return catSuggestions;
    return catSuggestions.filter((s) => s.title.toLowerCase().includes(title.toLowerCase()));
  }, [title, category]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Davanizi Tanimlatin
        </h2>
        <p className="text-slate-500">
          Davaniza bir baslik verin ve hukuki kategorisini secin.
        </p>
      </div>

      <div className="space-y-3 relative">
        <label className="text-sm font-semibold text-slate-700">Dava Basligi</label>
        <input
          type="text"
          placeholder="Orn: Isten haksiz cikarilma, Kira uyusmazligi..."
          value={title}
          onChange={(e) => { onUpdate({ title: e.target.value }); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
        />

        {/* Öneri listesi */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute z-20 left-0 right-0 top-[76px] bg-white border-2 border-blue-200 rounded-xl shadow-xl overflow-hidden"
            >
              <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-medium text-blue-700">Oneriler {category ? `(${CASE_CATEGORY_LABELS[category as CaseCategory]})` : "- secince kategori otomatik belirlenir"}</span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {suggestions.map((s) => (
                  <button
                    key={s.title}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onUpdate({ title: s.title, category: s.category });
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between"
                  >
                    <span>{s.title}</span>
                    {!category && (
                      <span className="text-xs text-slate-400 ml-2 flex-shrink-0">{CASE_CATEGORY_LABELS[s.category]}</span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700">Hukuki Kategori</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(Object.keys(CASE_CATEGORY_LABELS) as CaseCategory[]).map((cat) => {
            const Icon = categoryIcons[cat];
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                onClick={() => onUpdate({ category: cat })}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200",
                  isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-lg shadow-blue-100"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isSelected ? "text-blue-600" : "text-slate-400")} />
                <span className="text-sm font-medium">{CASE_CATEGORY_LABELS[cat]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} disabled={!isValid} size="lg" className="group">
          Devam Et
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );
}
