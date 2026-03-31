"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Image,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DocumentUploadProps {
  onTextExtracted: (text: string, summary: string, documentType: string) => void;
}

interface ExtractionResult {
  extractedText: string;
  documentType: string;
  summary: string;
  keyPoints: string[];
}

type UploadState = "idle" | "preview" | "loading" | "success" | "error";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function DocumentUpload({ onTextExtracted }: DocumentUploadProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [editedText, setEditedText] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((selectedFile: File) => {
    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      setError("Desteklenmeyen dosya formatı. JPG, PNG, WebP veya PDF yükleyin.");
      setState("error");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Dosya boyutu 10MB sınırını aşıyor.");
      setState("error");
      return;
    }

    setFile(selectedFile);
    setError("");
    setResult(null);

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }

    setState("preview");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const handleExtract = async () => {
    if (!file) return;

    setState("loading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Belge analizi başarısız oldu");
      }

      setResult(data);
      setEditedText(data.extractedText);
      setState("success");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu"
      );
      setState("error");
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setEditedText("");
    setError("");
    setState("idle");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddToAnalysis = () => {
    if (result) {
      onTextExtracted(editedText, result.summary, result.documentType);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">
            AI Belge Okuyucu
          </h3>
        </div>

        <AnimatePresence mode="wait">
          {/* Idle / Drop Zone */}
          {state === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative cursor-pointer rounded-xl border-2 border-dashed p-8
                  transition-all duration-200 text-center
                  ${
                    isDragging
                      ? "border-blue-500 bg-blue-50 scale-[1.02]"
                      : "border-slate-300 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/50"
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  onChange={handleInputChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Belgeyi sürükleyip bırakın veya tıklayın
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      JPG, PNG, WebP veya PDF - Maks. 10MB
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Preview State */}
          {state === "preview" && file && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                {preview ? (
                  <img
                    src={preview}
                    alt="Belge önizleme"
                    className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-red-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <Button onClick={handleExtract} className="w-full gap-2">
                <Sparkles className="w-4 h-4" />
                Belge Yükle & AI ile Oku
              </Button>
            </motion.div>
          )}

          {/* Loading State */}
          {state === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">
                  AI belgeyi okuyor...
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Metin çıkarma ve hukuki analiz yapılıyor
                </p>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {state === "success" && result && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-700">
                    Belge başarıyla okundu
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Yeni belge
                </button>
              </div>

              {/* Document Type */}
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Belge Türü:</span>
                <Badge>{result.documentType}</Badge>
              </div>

              {/* Summary */}
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-xs font-semibold text-blue-700 mb-1">
                  Özet
                </p>
                <p className="text-sm text-blue-900">{result.summary}</p>
              </div>

              {/* Key Points */}
              {result.keyPoints.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    Anahtar Noktalar
                  </p>
                  <ul className="space-y-1.5">
                    {result.keyPoints.map((point, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-600"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Extracted Text */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Image className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-700">
                    Çıkarılan Metin
                  </span>
                  <span className="text-xs text-slate-400">
                    (düzenleyebilirsiniz)
                  </span>
                </div>
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={8}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                    resize-y transition-colors"
                />
              </div>

              {/* Add to Analysis Button */}
              <Button onClick={handleAddToAnalysis} className="w-full gap-2">
                <Sparkles className="w-4 h-4" />
                Analize Ekle
              </Button>
            </motion.div>
          )}

          {/* Error State */}
          {state === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-red-700">
                    Hata Oluştu
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{error}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Yeni Belge
                </Button>
                {file && (
                  <Button onClick={handleExtract} className="flex-1 gap-2">
                    <Loader2 className="w-4 h-4" />
                    Tekrar Dene
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
