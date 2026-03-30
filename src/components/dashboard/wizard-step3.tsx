"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, X, FileText, Loader2 } from "lucide-react";
import { useState } from "react";

interface Step3Props {
  additionalNotes: string;
  onUpdate: (data: { additionalNotes?: string }) => void;
  onBack: () => void;
  onSubmit: () => void;
  isAnalyzing: boolean;
}

export function WizardStep3({
  additionalNotes,
  onUpdate,
  onBack,
  onSubmit,
  isAnalyzing,
}: Step3Props) {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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
          Belgeler ve Ek Bilgiler
        </h2>
        <p className="text-slate-500">
          Varsa belgelerinizi yükleyin ve eklemek istediğiniz notları yazın.
        </p>
      </div>

      {/* File upload */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700">
          Belge Yükleme (Opsiyonel)
        </label>
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-all">
          <Upload className="w-8 h-8 text-slate-400 mb-3" />
          <span className="text-sm text-slate-500 font-medium">
            Belge yüklemek için tıklayın
          </span>
          <span className="text-xs text-slate-400 mt-1">
            PDF, JPG, PNG, DOCX (Maks. 10MB)
          </span>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2 mt-3">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{file.name}</p>
                    <p className="text-xs text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional notes */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">
          Ek Notlar (Opsiyonel)
        </label>
        <textarea
          placeholder="Eklemek istediğiniz ek bilgiler, tanık bilgileri, önceki hukuki süreçler vs."
          value={additionalNotes}
          onChange={(e) => onUpdate({ additionalNotes: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} size="lg" disabled={isAnalyzing}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          Geri
        </Button>
        <Button onClick={onSubmit} size="lg" disabled={isAnalyzing} className="group min-w-[200px]">
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              Analiz Ediliyor...
            </>
          ) : (
            <>
              Analizi Başlat
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
