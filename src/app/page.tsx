"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale, Send, Menu, X, MessageCircle, History,
  Calculator, Clock, UserSearch, BookOpen, Banknote,
  Settings, Crown, ChevronRight, Sparkles, User,
  FileText, Flame,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getTodaysTip, updateStreak } from "@/lib/daily-tips";
import { getUserPlan, canDoAnalysis, incrementAnalysisCount } from "@/lib/feature-gate";
import { trackEvent, EVENTS } from "@/lib/analytics";

// Örnek sorular
const SUGGESTIONS = [
  "İşten haksız çıkarıldım, haklarım neler?",
  "Ev sahibim kiramı artırmak istiyor",
  "İnternetten aldığım ürün bozuk çıktı",
  "Trafik kazasında haklarım neler?",
  "Boşanma davası açmak istiyorum",
  "Komşum gürültü yapıyor, ne yapabilirim?",
];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const plan = getUserPlan(user);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const tip = getTodaysTip();

  useEffect(() => {
    const s = updateStreak();
    setStreak(s.currentStreak);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const question = (text || input).trim();
    if (!question || loading) return;

    // Analiz limiti kontrolü
    const status = canDoAnalysis(plan);
    if (!status.allowed) {
      router.push("/pricing");
      return;
    }

    setInput("");
    trackEvent(EVENTS.ANALYSIS_STARTED);

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSummary: question,
          category: "diger",
          additionalNotes: "",
        }),
      });

      if (!response.ok) throw new Error("Analiz hatası");
      const result = await response.json();
      incrementAnalysisCount();
      trackEvent(EVENTS.ANALYSIS_COMPLETED);

      // Sonucu formatlı mesaj olarak göster
      const analysisText = formatAnalysisResult(result);

      const aiMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        role: "assistant",
        content: analysisText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Detaylı sonucu sessionStorage'a kaydet
      sessionStorage.setItem("analysisResult", JSON.stringify({
        result,
        caseTitle: question.slice(0, 50),
        category: result.category || "diger",
      }));
    } catch {
      const errorMsg: ChatMessage = {
        id: `e_${Date.now()}`,
        role: "assistant",
        content: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmptyChat = messages.length === 0;

  return (
    <div className="h-[100dvh] flex flex-col bg-[#f5f4ef]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 safe-area-top">
        <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
          <Menu className="w-5 h-5 text-slate-600" />
        </button>

        <div className="text-center">
          <h1 className="text-base font-bold text-slate-800">Haklarım</h1>
          <p className="text-[11px] text-slate-400">AI Hukuk Asistanı</p>
        </div>

        <Link href={user ? "/settings" : "/auth/login"} className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
          {user ? (
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">{(user.name || user.email)[0].toUpperCase()}</span>
            </div>
          ) : (
            <User className="w-5 h-5 text-slate-600" />
          )}
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4">
        {isEmptyChat ? (
          /* Empty State - Claude Style */
          <div className="flex flex-col items-center justify-center h-full -mt-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-14 h-14 flex items-center justify-center mb-6 mx-auto">
                <Scale className="w-10 h-10 text-blue-600/70" />
              </div>

              <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">
                Hukuki sorununuzu anlatın
              </h2>
              <p className="text-sm text-slate-400 text-center mb-10 max-w-xs mx-auto">
                Haklarınızı öğrenin, emsal kararları görün
              </p>
            </motion.div>

            {/* Suggestion Chips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-md space-y-2"
            >
              {SUGGESTIONS.slice(0, 4).map((suggestion, i) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  onClick={() => handleSend(suggestion)}
                  className="w-full text-left px-4 py-3 bg-white/70 hover:bg-white rounded-2xl text-sm text-slate-600 hover:text-slate-900 transition-all border border-slate-200/50 hover:border-slate-300 hover:shadow-sm"
                >
                  {suggestion}
                </motion.button>
              ))}
            </motion.div>

            {/* Günlük ipucu */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 max-w-md w-full"
            >
              <div className="bg-amber-50/80 border border-amber-200/50 rounded-2xl px-4 py-3">
                <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider mb-1">Günün İpucu</p>
                <p className="text-xs text-slate-600 leading-relaxed">{tip.content}</p>
              </div>
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
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    <Scale className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-white text-slate-800 rounded-bl-md shadow-sm border border-slate-100"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                  <Scale className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-slate-100">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-blue-400 rounded-full"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.5, delay: i * 0.12, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Detaylı sonuç butonu */}
            {messages.length > 0 && !loading && messages[messages.length - 1].role === "assistant" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-2">
                <button
                  onClick={() => router.push("/results")}
                  className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline"
                >
                  <FileText className="w-3.5 h-3.5" /> Detaylı raporu görüntüle
                </button>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-4 pb-4 safe-area-bottom">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 px-4 py-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hukuki sorununuzu yazın..."
            rows={1}
            className="w-full text-sm text-slate-800 placeholder:text-slate-400 outline-none resize-none bg-transparent max-h-32"
            style={{ minHeight: "24px" }}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {streak > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-orange-500 font-semibold">
                  <Flame className="w-3 h-3" /> {streak} gün
                </span>
              )}
              {plan !== "pro" && (
                <span className="text-[10px] text-slate-400">
                  {canDoAnalysis(plan).remaining} analiz hakkı
                </span>
              )}
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl safe-area-left"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Scale className="w-6 h-6 text-blue-600" />
                  <span className="text-lg font-black text-slate-900">Haklarım</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <nav className="p-3 space-y-1">
                <SidebarLink icon={<MessageCircle className="w-4 h-4" />} label="Yeni Soru" href="/" onClick={() => { setMessages([]); setSidebarOpen(false); }} />
                <SidebarLink icon={<Sparkles className="w-4 h-4" />} label="Dava Analizi" href="/dashboard" onClick={() => setSidebarOpen(false)} />
                <SidebarLink icon={<History className="w-4 h-4" />} label="Geçmiş" href="/history" onClick={() => setSidebarOpen(false)} />
                <SidebarLink icon={<MessageCircle className="w-4 h-4" />} label="Mesajlar" href="/messages" onClick={() => setSidebarOpen(false)} />

                <div className="border-t border-slate-100 my-3" />
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Araçlar</p>
                <SidebarLink icon={<UserSearch className="w-4 h-4" />} label="Avukat Bul" href="/tools/find-lawyer" onClick={() => setSidebarOpen(false)} />
                <SidebarLink icon={<Calculator className="w-4 h-4" />} label="Arabuluculuk" href="/tools/mediation" onClick={() => setSidebarOpen(false)} />
                <SidebarLink icon={<Clock className="w-4 h-4" />} label="Zamanaşımı" href="/tools/statute-of-limitations" onClick={() => setSidebarOpen(false)} />
                <SidebarLink icon={<Banknote className="w-4 h-4" />} label="Harç Hesaplama" href="/tools/court-fees" onClick={() => setSidebarOpen(false)} />
                <SidebarLink icon={<BookOpen className="w-4 h-4" />} label="Hukuk Sözlüğü" href="/tools/glossary" onClick={() => setSidebarOpen(false)} />

                <div className="border-t border-slate-100 my-3" />
                {plan !== "pro" && (
                  <Link href="/pricing" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
                    <Crown className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-semibold text-indigo-700">Pro&apos;ya Geç</span>
                    <ChevronRight className="w-4 h-4 text-indigo-400 ml-auto" />
                  </Link>
                )}
                {user && (
                  <SidebarLink icon={<Settings className="w-4 h-4" />} label="Ayarlar" href="/settings" onClick={() => setSidebarOpen(false)} />
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarLink({ icon, label, href, onClick }: { icon: React.ReactNode; label: string; href: string; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
      {icon}
      {label}
    </Link>
  );
}

function formatAnalysisResult(result: {
  winProbability?: number;
  strengths?: string[];
  weaknesses?: string[];
  recommendation?: string;
  suggestedActions?: string[];
  analysisReport?: string;
}): string {
  const lines: string[] = [];

  if (result.winProbability !== undefined) {
    const emoji = result.winProbability >= 65 ? "🟢" : result.winProbability >= 40 ? "🟡" : "🔴";
    lines.push(`${emoji} Kazanma İhtimali: %${result.winProbability}\n`);
  }

  if (result.strengths?.length) {
    lines.push("Güçlü Yanlarınız:");
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
    lines.push(`Sonuç: ${rec}`);
  }

  return lines.join("\n") || (result.analysisReport || "Analiz tamamlandı.");
}
