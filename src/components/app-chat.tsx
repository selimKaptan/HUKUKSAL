"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale, Send, Mic, X, Crown, ChevronRight,
  EyeOff, User, Sparkles, Search,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getUserPlan, canDoAnalysis, incrementAnalysisCount } from "@/lib/feature-gate";
import { trackEvent, EVENTS } from "@/lib/analytics";

type AppMode = "lawyer" | "incognito" | "emsal";

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
  const [mode, setMode] = useState<AppMode>("lawyer");
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

  // Speech Recognition - mikrofon izni düzgün istenir
  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert("Tarayıcınız sesli yazmayı desteklemiyor.");
      return;
    }

    // Önce mikrofon izni iste
    navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = "tr-TR";
      recognition.continuous = true;
      recognition.interimResults = true;

      let finalTranscript = "";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setInput(finalTranscript + interim);
      };

      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    }).catch(() => {
      alert("Mikrofon erişimi reddedildi. Ayarlardan izin verin.");
    });
  }, [isListening]);

  const handleSend = async (text?: string) => {
    const question = (text || input).trim();
    if (!question || loading) return;

    // Emsal modunda analiz sayfasına yönlendir
    if (mode === "emsal") {
      if (plan !== "pro") { setShowProPage(true); return; }
      const status = canDoAnalysis(plan);
      if (!status.allowed) { setShowProPage(true); return; }
      // Emsal analiz akışı
      setInput("");
      setMessages((prev) => [...prev, { id: `u_${Date.now()}`, role: "user", content: question }]);
      setLoading(true);

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventSummary: question, category: "diger", additionalNotes: "" }),
        });
        if (!response.ok) throw new Error("Hata");
        const result = await response.json();
        incrementAnalysisCount();
        trackEvent(EVENTS.ANALYSIS_COMPLETED);

        const emsalText = formatEmsalResult(result);
        setMessages((prev) => [...prev, { id: `a_${Date.now()}`, role: "assistant", content: emsalText }]);

        sessionStorage.setItem("analysisResult", JSON.stringify({
          result, caseTitle: question.slice(0, 50), category: "diger",
        }));
      } catch {
        setMessages((prev) => [...prev, { id: `e_${Date.now()}`, role: "assistant", content: "Emsal analizi sırasında bir hata oluştu." }]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // AI Avukat modu - /api/ask ile konuşma
    setInput("");
    trackEvent(EVENTS.ANALYSIS_STARTED);

    const newUserMsg: ChatMessage = { id: `u_${Date.now()}`, role: "user", content: question };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Tüm mesaj geçmişini gönder (avukat bağlamı korunsun)
      const apiMessages = updatedMessages.map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          incognito: mode === "incognito",
        }),
      });

      if (!response.ok) throw new Error("Hata");
      const data = await response.json();

      setMessages((prev) => [...prev, {
        id: `a_${Date.now()}`,
        role: "assistant",
        content: data.content || "Bir hata oluştu.",
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: `e_${Date.now()}`,
        role: "assistant",
        content: "Bağlantı hatası. Lütfen tekrar deneyin.",
      }]);
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
    lawyer: { label: "AI Avukat", icon: Scale, desc: "Avukatınıza sorun" },
    incognito: { label: "Gizli Mod", icon: EyeOff, desc: "Kayıt tutulmaz" },
    emsal: { label: "AI Emsal", icon: Search, desc: "Emsal karar analizi" },
  };

  const current = modeConfig[mode];

  return (
    <div className={`h-[100dvh] flex flex-col ${mode === "incognito" ? "bg-slate-900" : "bg-[#f5f4ef]"}`}>

      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-2 pb-1 safe-area-top">
        <Link href="/dashboard" className="w-10 h-10 rounded-full bg-white/90 shadow-sm flex items-center justify-center">
          <span className="text-base font-black text-slate-800">H</span>
        </Link>

        {plan !== "pro" ? (
          <button onClick={() => setShowProPage(true)} className="flex items-center gap-1.5 bg-white/90 shadow-sm rounded-full px-4 py-2">
            <span className="text-sm font-semibold text-slate-700">Pro&apos;ya geç</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full px-4 py-2">
            <Crown className="w-3.5 h-3.5 text-white" />
            <span className="text-sm font-semibold text-white">Pro</span>
          </div>
        )}

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

      {/* Main */}
      <div className="flex-1 overflow-y-auto px-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full -mt-16">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <h2 className={`text-3xl font-bold mb-3 ${mode === "incognito" ? "text-white" : "text-slate-800"}`}>
                Haklarım
              </h2>
              <p className={`text-sm mb-8 ${mode === "incognito" ? "text-slate-400" : "text-slate-400"}`}>
                {mode === "emsal" ? "Davanızı anlatın, emsal kararları bulalım" : "Hukuki sorununuzu anlatın, avukatınız dinliyor"}
              </p>
            </motion.div>
          </div>
        ) : (
          <div className="py-4 space-y-4 max-w-2xl mx-auto">
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
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

            {/* Emsal modunda detaylı rapor linki */}
            {!loading && messages.length > 0 && messages[messages.length - 1].role === "assistant" && mode === "emsal" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-2">
                <button onClick={() => router.push("/results")} className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline">
                  <Search className="w-3.5 h-3.5" /> Detaylı emsal raporu
                </button>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-4 pb-3 safe-area-bottom">
        <div className={`rounded-2xl shadow-lg px-4 py-3 ${mode === "incognito" ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200/50"}`}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === "emsal" ? "Davanızı anlatın..." : mode === "incognito" ? "Gizli soru sorun..." : "Avukatınıza sorun..."}
            rows={1}
            className={`w-full text-sm outline-none resize-none bg-transparent max-h-24 ${mode === "incognito" ? "text-white placeholder:text-slate-500" : "text-slate-800 placeholder:text-slate-400"}`}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowModeSelector(!showModeSelector)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  mode === "incognito" ? "bg-slate-700 text-slate-300" :
                  mode === "emsal" ? "bg-teal-100 text-teal-700" :
                  "bg-slate-100 text-slate-600"
                }`}
              >
                <current.icon className="w-3.5 h-3.5" />
                {current.label}
              </button>

              {mode === "emsal" && plan !== "pro" && (
                <span className="text-[10px] text-slate-400">
                  {analysisStatus.remaining} hak
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Mikrofon */}
              <button
                onClick={toggleListening}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-teal-500 text-white shadow-lg shadow-teal-200"
                    : mode === "incognito" ? "bg-slate-700 text-slate-400 hover:bg-slate-600" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                <Mic className={`w-4 h-4 ${isListening ? "animate-pulse" : ""}`} />
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

      {/* Mode Selector */}
      <AnimatePresence>
        {showModeSelector && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" onClick={() => setShowModeSelector(false)} />
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2"
            >
              <ModeBtn icon={<Scale className="w-5 h-5 text-blue-600" />} label="AI Avukat" desc="Avukatınız soru sorar, dinler, tavsiye verir"
                active={mode === "lawyer"} onClick={() => { setMode("lawyer"); setShowModeSelector(false); setMessages([]); }} />
              <ModeBtn icon={<EyeOff className="w-5 h-5 text-slate-600" />} label="Gizli Mod" desc="Sohbet geçmişi kaydedilmez"
                active={mode === "incognito"} onClick={() => { setMode("incognito"); setShowModeSelector(false); setMessages([]); }} />
              <ModeBtn icon={<Search className="w-5 h-5 text-teal-600" />} label="AI Emsal" desc="Emsal karar analizi + kazanma oranı"
                active={mode === "emsal"} pro={plan !== "pro"}
                onClick={() => {
                  if (plan !== "pro") { setShowProPage(true); setShowModeSelector(false); return; }
                  setMode("emsal"); setShowModeSelector(false); setMessages([]);
                }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Pro Bottom Sheet */}
      <AnimatePresence>
        {showProPage && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowProPage(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto safe-area-bottom"
            >
              <div className="p-6">
                <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setShowProPage(false)} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                  <button className="text-sm font-semibold text-slate-500">Geri Yükle</button>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">Tüm haklar cebinizde</h2>

                <div className="bg-slate-50 rounded-2xl p-5 mb-6">
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <span className="text-sm font-semibold text-slate-700">Özellikler</span>
                    <span className="text-sm text-slate-400 text-center">Ücretsiz</span>
                    <span className="text-sm font-bold text-teal-600 text-center">Pro</span>
                  </div>
                  <ProRow label="AI Avukat Sohbet" free pro />
                  <ProRow label="Gizli Mod" free pro />
                  <ProRow label="Hukuk Araçları" free pro />
                  <ProRow label="AI Emsal Analizi" pro />
                  <ProRow label="Kazanma Oranı" pro />
                  <ProRow label="PDF Rapor İndirme" pro />
                  <ProRow label="Belge Analizi (OCR)" pro />
                  <ProRow label="Sınırsız Sohbet" pro />
                  <ProRow label="Öncelikli Destek" pro />
                </div>

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

function ModeBtn({ icon, label, desc, active, pro, onClick }: {
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

function ProRow({ label, free, pro }: { label: string; free?: boolean; pro?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2.5 border-t border-slate-200">
      <span className="text-sm text-slate-700">{label}</span>
      <div className="flex justify-center">
        {free ? <Sparkles className="w-4 h-4 text-slate-400" /> : <span className="text-slate-300">—</span>}
      </div>
      <div className="flex justify-center">
        {pro ? <Sparkles className="w-4 h-4 text-teal-500" /> : <span className="text-slate-300">—</span>}
      </div>
    </div>
  );
}

function formatEmsalResult(result: { winProbability?: number; strengths?: string[]; weaknesses?: string[]; recommendation?: string; suggestedActions?: string[]; analysisReport?: string }): string {
  const lines: string[] = [];
  if (result.winProbability !== undefined) {
    const emoji = result.winProbability >= 65 ? "🟢" : result.winProbability >= 40 ? "🟡" : "🔴";
    lines.push(`${emoji} Kazanma İhtimali: %${result.winProbability}\n`);
  }
  if (result.strengths?.length) {
    lines.push("Güçlü Yanlar:");
    result.strengths.forEach((s) => lines.push(`  + ${s}`));
    lines.push("");
  }
  if (result.weaknesses?.length) {
    lines.push("Zayıf Yanlar:");
    result.weaknesses.forEach((w) => lines.push(`  - ${w}`));
    lines.push("");
  }
  if (result.suggestedActions?.length) {
    lines.push("Önerilen Adımlar:");
    result.suggestedActions.forEach((a, i) => lines.push(`  ${i + 1}. ${a}`));
    lines.push("");
  }
  if (result.recommendation) {
    const rec = result.recommendation === "file_case" ? "Dava açmanız önerilir."
      : result.recommendation === "do_not_file" ? "Dava açmanız önerilmez."
      : "Bir avukata danışmanız önerilir.";
    lines.push(rec);
  }
  return lines.join("\n") || (result.analysisReport || "Analiz tamamlandı.");
}
