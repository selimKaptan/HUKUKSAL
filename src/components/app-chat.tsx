"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale, Send, Mic, MicOff, X, Crown, ChevronRight,
  EyeOff, User, FileText, Sparkles,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getUserPlan, canDoAnalysis, incrementAnalysisCount } from "@/lib/feature-gate";
import { trackEvent, EVENTS } from "@/lib/analytics";

type AppMode = "normal" | "incognito" | "lawyer";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AppChat() {
  const router = useRouter();
  const { user } = useAuth();
  const plan = getUserPlan(user);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AppMode>("normal");
  const [isListening, setIsListening] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showProPage, setShowProPage] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Speech Recognition
  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "tr-TR";
    recognition.continuous = false;
    recognition.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const handleSend = async (text?: string) => {
    const question = (text || input).trim();
    if (!question || loading) return;

    const status = canDoAnalysis(plan);
    if (!status.allowed) {
      setShowProPage(true);
      return;
    }

    setInput("");
    trackEvent(EVENTS.ANALYSIS_STARTED);

    setMessages((prev) => [...prev, { id: `u_${Date.now()}`, role: "user", content: question }]);
    setLoading(true);

    try {
      // Mod'a göre farklı sistem prompt'u
      const systemContext = mode === "lawyer"
        ? "AI_LAWYER_MODE"
        : mode === "incognito"
        ? "INCOGNITO_MODE"
        : "NORMAL_MODE";

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSummary: question,
          category: "diger",
          additionalNotes: systemContext,
        }),
      });

      if (!response.ok) throw new Error("Hata");
      const result = await response.json();
      incrementAnalysisCount();
      trackEvent(EVENTS.ANALYSIS_COMPLETED);

      const aiText = formatResult(result, mode);
      setMessages((prev) => [...prev, { id: `a_${Date.now()}`, role: "assistant", content: aiText }]);

      // Sonucu kaydet (gizli modda kaydetme)
      if (mode !== "incognito") {
        sessionStorage.setItem("analysisResult", JSON.stringify({
          result, caseTitle: question.slice(0, 50), category: "diger",
        }));
      }
    } catch {
      setMessages((prev) => [...prev, { id: `e_${Date.now()}`, role: "assistant", content: "Bir hata oluştu. Lütfen tekrar deneyin." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const analysisStatus = canDoAnalysis(plan);
  const isEmpty = messages.length === 0;

  const modeConfig = {
    normal: { label: "Haklarım", icon: Scale, color: "text-blue-600", bg: "bg-blue-50" },
    incognito: { label: "Gizli Mod", icon: EyeOff, color: "text-slate-600", bg: "bg-slate-800" },
    lawyer: { label: "AI Avukat", icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50" },
  };

  const currentMode = modeConfig[mode];

  return (
    <div className={`h-[100dvh] flex flex-col ${mode === "incognito" ? "bg-slate-900" : "bg-[#f5f4ef]"}`}>

      {/* Header - Perplexity Style */}
      <header className="flex items-center justify-between px-4 pt-2 pb-1 safe-area-top">
        {/* Sol: Logo/Menü */}
        <Link href="/dashboard" className="w-10 h-10 rounded-full bg-white/90 shadow-sm flex items-center justify-center">
          <span className="text-base font-black text-slate-800">H</span>
        </Link>

        {/* Orta: Pro butonu */}
        {plan !== "pro" && (
          <button
            onClick={() => setShowProPage(true)}
            className="flex items-center gap-1.5 bg-white/90 shadow-sm rounded-full px-4 py-2"
          >
            <span className="text-sm font-semibold text-slate-700">Pro&apos;ya geç</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        )}
        {plan === "pro" && (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full px-4 py-2">
            <Crown className="w-3.5 h-3.5 text-white" />
            <span className="text-sm font-semibold text-white">Pro</span>
          </div>
        )}

        {/* Sağ: Profil */}
        <Link href={user ? "/settings" : "/auth/login"} className="w-10 h-10 rounded-full bg-white/90 shadow-sm flex items-center justify-center overflow-hidden">
          {user ? (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">{(user.name || user.email)[0].toUpperCase()}</span>
            </div>
          ) : (
            <User className="w-5 h-5 text-slate-500" />
          )}
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4">
        {isEmpty ? (
          /* Empty State - Perplexity Style */
          <div className="flex flex-col items-center justify-center h-full -mt-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <h2 className={`text-3xl font-bold mb-8 ${mode === "incognito" ? "text-white" : "text-slate-800"}`}>
                Haklarım
              </h2>
            </motion.div>
          </div>
        ) : (
          /* Messages */
          <div className="py-4 space-y-4 max-w-2xl mx-auto">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0 ${mode === "incognito" ? "bg-slate-700" : "bg-blue-100"}`}>
                    <Scale className={`w-4 h-4 ${mode === "incognito" ? "text-slate-300" : "text-blue-600"}`} />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? mode === "incognito" ? "bg-slate-700 text-white rounded-br-md" : "bg-blue-600 text-white rounded-br-md"
                    : mode === "incognito" ? "bg-slate-800 text-slate-200 rounded-bl-md border border-slate-700" : "bg-white text-slate-800 rounded-bl-md shadow-sm border border-slate-100"
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 mt-1 ${mode === "incognito" ? "bg-slate-700" : "bg-blue-100"}`}>
                  <Scale className={`w-4 h-4 ${mode === "incognito" ? "text-slate-300" : "text-blue-600"}`} />
                </div>
                <div className={`rounded-2xl rounded-bl-md px-4 py-3 ${mode === "incognito" ? "bg-slate-800 border border-slate-700" : "bg-white shadow-sm border border-slate-100"}`}>
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div key={i} className={`w-2 h-2 rounded-full ${mode === "incognito" ? "bg-slate-500" : "bg-blue-400"}`}
                        animate={{ y: [0, -6, 0] }} transition={{ duration: 0.5, delay: i * 0.12, repeat: Infinity }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {!loading && messages.length > 0 && messages[messages.length - 1].role === "assistant" && mode !== "incognito" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-2">
                <button onClick={() => router.push("/results")} className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline">
                  <FileText className="w-3.5 h-3.5" /> Detaylı raporu görüntüle
                </button>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Perplexity Style */}
      <div className="px-4 pb-3 safe-area-bottom">
        <div className={`rounded-2xl shadow-lg px-4 py-3 ${mode === "incognito" ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200/50"}`}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === "lawyer" ? "Avukatınıza sorun..." : mode === "incognito" ? "Gizli soru sorun..." : "Hukuki sorununuzu yazın..."}
            rows={1}
            className={`w-full text-sm outline-none resize-none bg-transparent max-h-24 ${mode === "incognito" ? "text-white placeholder:text-slate-500" : "text-slate-800 placeholder:text-slate-400"}`}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {/* Mod Selector */}
              <button
                onClick={() => setShowModeSelector(!showModeSelector)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  mode === "incognito" ? "bg-slate-700 text-slate-300" :
                  mode === "lawyer" ? "bg-emerald-100 text-emerald-700" :
                  "bg-slate-100 text-slate-600"
                }`}
              >
                <currentMode.icon className="w-3.5 h-3.5" />
                {currentMode.label}
              </button>

              {/* Analiz hakkı */}
              {plan !== "pro" && (
                <span className={`text-[10px] ${mode === "incognito" ? "text-slate-500" : "text-slate-400"}`}>
                  {analysisStatus.remaining} hak
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Ses butonu */}
              <button
                onClick={isListening ? stopListening : startListening}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : mode === "incognito" ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Gönder */}
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selector Dropdown */}
      <AnimatePresence>
        {showModeSelector && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" onClick={() => setShowModeSelector(false)} />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2"
            >
              <ModeButton
                icon={<Scale className="w-5 h-5 text-blue-600" />}
                label="Normal"
                desc="Standart hukuki analiz"
                active={mode === "normal"}
                onClick={() => { setMode("normal"); setShowModeSelector(false); setMessages([]); }}
              />
              <ModeButton
                icon={<EyeOff className="w-5 h-5 text-slate-600" />}
                label="Gizli Mod"
                desc="Geçmiş kaydedilmez"
                active={mode === "incognito"}
                onClick={() => { setMode("incognito"); setShowModeSelector(false); setMessages([]); }}
              />
              <ModeButton
                icon={<Shield className="w-5 h-5 text-emerald-600" />}
                label="AI Avukat"
                desc="Avukat gibi konuşan AI"
                active={mode === "lawyer"}
                pro={plan !== "pro"}
                onClick={() => {
                  if (plan !== "pro") { setShowProPage(true); setShowModeSelector(false); return; }
                  setMode("lawyer"); setShowModeSelector(false); setMessages([]);
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Pro Page - Perplexity Style Bottom Sheet */}
      <AnimatePresence>
        {showProPage && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowProPage(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto safe-area-bottom"
            >
              <div className="p-6">
                {/* Handle */}
                <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4" />

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setShowProPage(false)} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                  <button className="text-sm font-semibold text-slate-500">Geri Yükle</button>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">
                  Tüm haklar cebinizde
                </h2>

                {/* Feature Table */}
                <div className="bg-slate-50 rounded-2xl p-5 mb-6">
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <span className="text-sm font-semibold text-slate-700">Özellikler</span>
                    <span className="text-sm text-slate-400 text-center">Ücretsiz</span>
                    <span className="text-sm font-bold text-teal-600 text-center">Pro</span>
                  </div>

                  <ProFeatureRow label="Dava Analizi" free="3/ay" pro />
                  <ProFeatureRow label="Emsal Kararlar" free pro />
                  <ProFeatureRow label="Hukuk Araçları" free pro />
                  <ProFeatureRow label="AI Avukat Modu" pro />
                  <ProFeatureRow label="PDF Rapor İndirme" pro />
                  <ProFeatureRow label="Belge Analizi (OCR)" pro />
                  <ProFeatureRow label="Sınırsız Analiz" pro />
                  <ProFeatureRow label="Öncelikli Destek" pro />
                </div>

                {/* Price Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="border-2 border-teal-500 rounded-2xl p-4 relative">
                    <div className="absolute -top-2.5 left-3 bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-33%</div>
                    <p className="text-xs text-slate-500">Yıllık</p>
                    <p className="text-2xl font-black text-slate-900">₺99<span className="text-sm font-normal text-slate-400">/ay</span></p>
                    <p className="text-[10px] text-slate-400">₺1.199/yıl</p>
                  </div>
                  <div className="border-2 border-slate-200 rounded-2xl p-4">
                    <p className="text-xs text-slate-500">Aylık</p>
                    <p className="text-2xl font-black text-slate-900">₺149<span className="text-sm font-normal text-slate-400">/ay</span></p>
                    <p className="text-[10px] text-slate-400">₺1.788/yıl</p>
                  </div>
                </div>

                {/* CTA */}
                <button className="w-full bg-teal-600 hover:bg-teal-700 text-white text-base font-bold py-4 rounded-2xl transition-colors">
                  Pro&apos;ya geç
                </button>

                <p className="text-[10px] text-slate-400 text-center mt-3">
                  App Store üzerinden satın alınır. İstediğiniz zaman iptal edebilirsiniz.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModeButton({ icon, label, desc, active, pro, onClick }: {
  icon: React.ReactNode; label: string; desc: string; active?: boolean; pro?: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${active ? "bg-slate-100" : "hover:bg-slate-50"}`}>
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">{icon}</div>
      <div className="text-left flex-1">
        <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          {label}
          {pro && <span className="text-[10px] bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">PRO</span>}
        </p>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
      {active && <div className="w-2 h-2 bg-teal-500 rounded-full" />}
    </button>
  );
}

function ProFeatureRow({ label, free, pro }: { label: string; free?: boolean | string; pro?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2.5 border-t border-slate-200">
      <span className="text-sm text-slate-700">{label}</span>
      <div className="flex justify-center">
        {free === true ? <Sparkles className="w-4 h-4 text-slate-400" /> :
         typeof free === "string" ? <span className="text-xs text-slate-400">{free}</span> :
         <span className="text-slate-300">—</span>}
      </div>
      <div className="flex justify-center">
        {pro ? <Sparkles className="w-4 h-4 text-teal-500" /> : <span className="text-slate-300">—</span>}
      </div>
    </div>
  );
}

function formatResult(result: { winProbability?: number; strengths?: string[]; weaknesses?: string[]; recommendation?: string; suggestedActions?: string[]; analysisReport?: string }, mode: AppMode): string {
  const lines: string[] = [];

  if (mode === "lawyer") {
    lines.push("Sayın müvekkilim,\n");
  }

  if (result.winProbability !== undefined) {
    const emoji = result.winProbability >= 65 ? "🟢" : result.winProbability >= 40 ? "🟡" : "🔴";
    lines.push(`${emoji} Kazanma İhtimali: %${result.winProbability}\n`);
  }

  if (result.strengths?.length) {
    lines.push(mode === "lawyer" ? "Lehinize olan hususlar:" : "Güçlü Yanlarınız:");
    result.strengths.forEach((s) => lines.push(`  + ${s}`));
    lines.push("");
  }

  if (result.weaknesses?.length) {
    lines.push(mode === "lawyer" ? "Aleyhte değerlendirilecek hususlar:" : "Zayıf Yanlar:");
    result.weaknesses.forEach((w) => lines.push(`  - ${w}`));
    lines.push("");
  }

  if (result.suggestedActions?.length) {
    lines.push(mode === "lawyer" ? "Hukuki tavsiyelerim:" : "Önerilen Adımlar:");
    result.suggestedActions.forEach((a, i) => lines.push(`  ${i + 1}. ${a}`));
    lines.push("");
  }

  if (result.recommendation) {
    const rec = result.recommendation === "file_case"
      ? mode === "lawyer" ? "Dava açmanızı tavsiye ederim." : "Dava açmanız önerilir."
      : result.recommendation === "do_not_file"
      ? mode === "lawyer" ? "Bu aşamada dava açmanızı tavsiye etmem." : "Dava açmanız önerilmez."
      : mode === "lawyer" ? "Detaylı bir görüşme yaparak stratejimizi belirleyelim." : "Bir avukata danışmanız önerilir.";
    lines.push(`\n${rec}`);
  }

  if (mode === "lawyer") {
    lines.push("\nSaygılarımla,\nHaklarım AI Avukat");
  }

  return lines.join("\n") || (result.analysisReport || "Analiz tamamlandı.");
}

