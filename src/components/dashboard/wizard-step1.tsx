"use client";

import { motion } from "framer-motion";
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

export function WizardStep1({ title, category, onUpdate, onNext }: Step1Props) {
  const isValid = title.trim().length >= 3 && category !== "";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Davanızı Tanımlayın
        </h2>
        <p className="text-slate-500">
          Davanıza bir başlık verin ve hukuki kategorisini seçin.
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700">Dava Başlığı</label>
        <input
          type="text"
          placeholder="Örn: İşten haksız çıkarılma, Kira uyuşmazlığı..."
          value={title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
        />
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
