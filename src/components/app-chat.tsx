"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale, Send, Mic, X, Crown, ChevronRight,
  User, Sparkles, Search, Copy, Check,
  UserSearch, Share2, BookOpen, Camera, FileText,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getUserPlan, canDoAnalysis, incrementAnalysisCount } from "@/lib/feature-gate";
import { trackEvent, EVENTS } from "@/lib/analytics";
import { getChatHistory, saveChat, deleteChat, generateChatTitle, type SavedChat } from "@/lib/chat-history";
import { getTodaysCase } from "@/lib/daily-cases";
import { shareApp, recordShare } from "@/lib/referral";
import { trackMilestone } from "@/lib/milestones";

// Hazır soru şablonları
const QUICK_TEMPLATES = [
  { emoji: "💼", text: "İşten haksız çıkarıldım", category: "İş Hukuku" },
  { emoji: "🏠", text: "Ev sahibim kiramı artırmak istiyor", category: "Kira Hukuku" },
  { emoji: "🛒", text: "İnternetten aldığım ürün bozuk çıktı", category: "Tüketici" },
  { emoji: "🚗", text: "Trafik kazasında haklarım neler?", category: "Tazminat" },
  { emoji: "👨‍👩‍👧", text: "Boşanma davası açmak istiyorum", category: "Aile Hukuku" },
  { emoji: "📝", text: "Sözleşmemi incelemek istiyorum", category: "Borçlar" },
];

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
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showProPage, setShowProPage] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<SavedChat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>(`chat_${Date.now()}`);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState("");
  const [milestoneToast, setMilestoneToast] = useState("");
  const [scanningDoc, setScanningDoc] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const todaysCase = getTodaysCase();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
    setChatHistory(getChatHistory());
  }, []);

  // Sohbeti kaydet (gizli mod hariç)
  useEffect(() => {
    if (mode === "incognito" || messages.length === 0) return;
    const chat: SavedChat = {
      id: currentChatId,
      title: generateChatTitle(messages[0].content),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      mode,
      createdAt: chatHistory.find((c) => c.id === currentChatId)?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveChat(chat);
    setChatHistory(getChatHistory());
  }, [messages, mode, currentChatId, chatHistory]);

  // Mesaj kopyalama
  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Paylaş ve kazan
  const handleShare = async () => {
    const shared = await shareApp();
    if (shared) {
      const result = recordShare();
      setShareToast(result.bonusGranted ? "1 bonus analiz hakkı kazandınız!" : "Paylaşıldı! 3 paylaşımda 1 analiz hakkı");
      setTimeout(() => setShareToast(""), 3000);
    }
  };

  // Yeni sohbet başlat
  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(`chat_${Date.now()}`);
    setShowHistory(false);
  };

  // Geçmiş sohbeti yükle
  const loadChat = (chat: SavedChat) => {
    setMessages(chat.messages.map((m, i) => ({ id: `${chat.id}_${i}`, ...m })));
    setCurrentChatId(chat.id);
    setMode(chat.mode === "incognito" ? "lawyer" : chat.mode);
    setShowHistory(false);
  };

  // Belge tarama (kamera / dosya)
  const handleDocScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (plan !== "pro") { setShowProPage(true); return; }

    setScanningDoc(true);
    setMessages((prev) => [...prev, { id: `u_doc_${Date.now()}`, role: "user", content: `📄 Belge yüklendi: ${file.name}` }]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract-text", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Hata");
      const data = await response.json();

      const docAnalysis = [
        `📋 **Belge Türü:** ${data.documentType}`,
        "",
        `**Özet:** ${data.summary}`,
        "",
        data.keyPoints?.length ? `**Önemli Noktalar:**\n${data.keyPoints.map((p: string) => `  • ${p}`).join("\n")}` : "",
        "",
        data.extractedText ? `Bu belge hakkında soru sormak isterseniz yazabilirsiniz.` : "",
      ].filter(Boolean).join("\n");

      setMessages((prev) => [...prev, { id: `a_doc_${Date.now()}`, role: "assistant", content: docAnalysis }]);

      // Belge metnini context olarak tut
      if (data.extractedText) {
        setInput(`Bu belge hakkında: `);
        inputRef.current?.focus();
      }
    } catch {
      setMessages((prev) => [...prev, { id: `e_doc_${Date.now()}`, role: "assistant", content: "Belge analizi sırasında bir hata oluştu. Lütfen tekrar deneyin." }]);
    } finally {
      setScanningDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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

    // AI Avukat modu - streaming ile konuşma
    setInput("");
    trackEvent(EVENTS.ANALYSIS_STARTED);

    const newUserMsg: ChatMessage = { id: `u_${Date.now()}`, role: "user", content: question };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setLoading(true);

    const aiMsgId = `a_${Date.now()}`;

    try {
      const apiMessages = updatedMessages.map((m) => ({ role: m.role, content: m.content }));

      // Streaming dene, başarısız olursa normal endpoint'e düş
      const response = await fetch("/api/ask-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, incognito: mode === "incognito" }),
      });

      if (response.ok && response.body) {
        // Streaming yanıt - kelime kelime göster
        setMessages((prev) => [...prev, { id: aiMsgId, role: "assistant", content: "" }]);
        setLoading(false);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const payload = line.slice(6);
              if (payload === "[DONE]") break;
              try {
                const data = JSON.parse(payload);
                if (data.text) {
                  setMessages((prev) => prev.map((m) =>
                    m.id === aiMsgId ? { ...m, content: m.content + data.text } : m
                  ));
                }
              } catch { /* parse error */ }
            }
          }
        }
      } else {
        // Fallback: normal endpoint
        const fallback = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, incognito: mode === "incognito" }),
        });
        const data = await fallback.json();
        setMessages((prev) => [...prev, { id: aiMsgId, role: "assistant", content: data.content || "Bir hata oluştu." }]);
        setLoading(false);
      }

      // Milestone kontrolü
      const ms = trackMilestone("questions");
      if (ms) {
        setMilestoneToast(`${ms.emoji} ${ms.title}: ${ms.description}`);
        setTimeout(() => setMilestoneToast(""), 4000);
      }
    } catch {
      setMessages((prev) => [...prev, { id: aiMsgId, role: "assistant", content: "Bağlantı hatası. Lütfen tekrar deneyin." }]);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const isEmpty = messages.length === 0;


  return (
    <div className={`h-[100dvh] flex flex-col ${mode === "incognito" ? "bg-slate-900" : "bg-[#f5f4ef]"}`}>

      {/* Header - Perplexity Style */}
      <header className="flex items-center justify-between px-4 pt-2 pb-1 safe-area-top">
        {/* Sol: H + Profil menüsü birleşik */}
        <button onClick={() => setShowHistory(true)} className="w-10 h-10 rounded-full bg-white/90 shadow-sm flex items-center justify-center">
          {user ? (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">{(user.name || user.email)[0].toUpperCase()}</span>
            </div>
          ) : (
            <span className="text-base font-black text-slate-800">H</span>
          )}
        </button>

        {/* Orta: Pro'ya geç */}
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

        {/* Sağ: Dilekçelerim */}
        <Link href="/dilekce" className="w-10 h-10 rounded-full bg-white/90 shadow-sm flex items-center justify-center">
          <FileText className="w-5 h-5 text-slate-600" />
        </Link>
      </header>

      {/* Main */}
      <div className="flex-1 overflow-y-auto px-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full pb-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full max-w-md">
              <h2 className={`text-3xl font-bold mb-2 ${mode === "incognito" ? "text-white" : "text-slate-800"}`}>
                Haklarım
              </h2>
              <p className={`text-sm mb-6 ${mode === "incognito" ? "text-slate-400" : "text-slate-400"}`}>
                {mode === "emsal" ? "Davanızı anlatın, emsal kararları bulalım" : "Hukuki sorununuzu anlatın"}
              </p>

              {/* Hazır Şablonlar */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {QUICK_TEMPLATES.map((t) => (
                  <motion.button key={t.text} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleSend(t.text)}
                    className={`text-left p-3 rounded-xl text-xs transition-all ${
                      mode === "incognito" ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                      : "bg-white/80 text-slate-600 hover:bg-white hover:shadow-sm border border-slate-200/50"
                    }`}>
                    <span className="text-lg block mb-1">{t.emoji}</span>
                    <span className="font-medium leading-tight">{t.text}</span>
                  </motion.button>
                ))}
              </div>

              {/* Bugünün Davası */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className={`text-left rounded-2xl p-4 mb-4 ${mode === "incognito" ? "bg-slate-800 border border-slate-700" : "bg-amber-50/80 border border-amber-200/50"}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${mode === "incognito" ? "text-amber-400" : "text-amber-600"}`}>
                  Bugünün Davası
                </p>
                <p className={`text-sm font-semibold mb-1 ${mode === "incognito" ? "text-white" : "text-slate-800"}`}>{todaysCase.title}</p>
                <p className={`text-xs leading-relaxed ${mode === "incognito" ? "text-slate-400" : "text-slate-500"}`}>{todaysCase.lesson}</p>
              </motion.div>

              {/* Paylaş & Kazan */}
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                onClick={handleShare}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  mode === "incognito" ? "bg-slate-800 text-slate-400 border border-slate-700" : "bg-blue-50 text-blue-600 border border-blue-200/50"
                }`}>
                <Share2 className="w-3.5 h-3.5" /> Paylaş, analiz hakkı kazan
              </motion.button>
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
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 group/msg ${
                  msg.role === "user"
                    ? mode === "incognito" ? "bg-slate-700 text-white rounded-br-md" : "bg-blue-600 text-white rounded-br-md"
                    : mode === "incognito" ? "bg-slate-800 text-slate-200 rounded-bl-md border border-slate-700" : "bg-white text-slate-800 rounded-bl-md shadow-sm border border-slate-100"
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  {/* Kopyala + Avukata sor */}
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100/50">
                      <button onClick={() => copyMessage(msg.id, msg.content)}
                        className={`text-[10px] flex items-center gap-1 ${mode === "incognito" ? "text-slate-500" : "text-slate-400"} hover:text-slate-600`}>
                        {copiedId === msg.id ? <><Check className="w-3 h-3 text-emerald-500" /> Kopyalandı</> : <><Copy className="w-3 h-3" /> Kopyala</>}
                      </button>
                      {mode !== "incognito" && (
                        <Link href="/tools/find-lawyer" className="text-[10px] flex items-center gap-1 text-blue-500 hover:text-blue-600">
                          <UserSearch className="w-3 h-3" /> Avukata sor
                        </Link>
                      )}
                    </div>
                  )}
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
              {/* + butonu → Seçenekler bottom sheet */}
              <button
                onClick={() => setShowPlusMenu(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-light transition-all bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Belge Tarama */}
              <button
                onClick={() => { if (plan !== "pro") { setShowProPage(true); return; } fileInputRef.current?.click(); }}
                disabled={scanningDoc}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  scanningDoc ? "bg-teal-500 text-white animate-pulse"
                  : mode === "incognito" ? "bg-slate-700 text-slate-400 hover:bg-slate-600" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                <Camera className="w-4 h-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*,application/pdf" capture="environment" className="hidden" onChange={handleDocScan} />

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

      {/* + Menu Bottom Sheet - Perplexity Style */}
      <AnimatePresence>
        {showPlusMenu && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowPlusMenu(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl safe-area-bottom"
            >
              <div className="p-5">
                <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Seçenekler</h3>
                  <button onClick={() => setShowPlusMenu(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                {/* Grid butonlar */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <button onClick={() => { setShowPlusMenu(false); if (plan !== "pro") { setShowProPage(true); return; } fileInputRef.current?.click(); }}
                    className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                    <Camera className="w-6 h-6 text-slate-600" />
                    <span className="text-xs font-semibold text-slate-700">Kamera</span>
                  </button>
                  <button onClick={() => { setShowPlusMenu(false); if (plan !== "pro") { setShowProPage(true); return; } fileInputRef.current?.click(); }}
                    className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                    <FileText className="w-6 h-6 text-slate-600" />
                    <span className="text-xs font-semibold text-slate-700">Dosya</span>
                  </button>
                  <button onClick={() => { setShowPlusMenu(false); if (plan !== "pro") { setShowProPage(true); return; } setMode("emsal"); setMessages([]); }}
                    className="flex flex-col items-center gap-2 p-4 bg-teal-50 rounded-2xl hover:bg-teal-100 transition-colors border border-teal-200">
                    <Search className="w-6 h-6 text-teal-600" />
                    <span className="text-xs font-semibold text-teal-700">AI Emsal</span>
                  </button>
                </div>

                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Search className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-semibold text-slate-800">AI Emsal Analizi</span>
                    {plan !== "pro" && <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full font-bold">PRO</span>}
                  </div>
                  <p className="text-xs text-slate-500">Emsal kararlarla davanızı analiz edin. Kazanma oranı ve eşleştirme.</p>
                </div>
              </div>
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
      {/* Sohbet Geçmişi Panel */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowHistory(false)} />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl safe-area-left flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <span className="text-lg font-black text-slate-900">Sohbetler</span>
                <button onClick={() => setShowHistory(false)} className="p-1"><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <button onClick={startNewChat}
                className="mx-3 mt-3 px-4 py-2.5 bg-teal-50 text-teal-700 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-teal-100">
                <Scale className="w-4 h-4" /> Yeni Sohbet
              </button>

              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {chatHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">Henüz sohbet yok</p>
                ) : (
                  chatHistory.map((chat) => (
                    <div key={chat.id} className={`flex items-center gap-2 group ${currentChatId === chat.id ? "bg-slate-100" : "hover:bg-slate-50"} rounded-xl`}>
                      <button onClick={() => loadChat(chat)} className="flex-1 text-left px-3 py-2.5 min-w-0">
                        <p className="text-sm text-slate-700 truncate font-medium">{chat.title}</p>
                        <p className="text-[10px] text-slate-400">{new Date(chat.updatedAt).toLocaleDateString("tr-TR")}</p>
                      </button>
                      <button onClick={() => { deleteChat(chat.id); setChatHistory(getChatHistory()); }}
                        className="p-1.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Araçlar + Profil */}
              <div className="border-t border-slate-100 p-3 space-y-1">
                <Link href="/dilekce" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setShowHistory(false)}>
                  <FileText className="w-4 h-4" /> Dilekçelerim
                </Link>
                <Link href="/tools/find-lawyer" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setShowHistory(false)}>
                  <UserSearch className="w-4 h-4" /> Avukat Bul
                </Link>
                <Link href="/tools/glossary" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setShowHistory(false)}>
                  <BookOpen className="w-4 h-4" /> Hukuk Sözlüğü
                </Link>
                <button onClick={handleShare} className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg w-full">
                  <Share2 className="w-4 h-4" /> Paylaş & Kazan
                </button>
                <div className="border-t border-slate-100 mt-2 pt-2">
                  <Link href={user ? "/settings" : "/auth/login"} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 rounded-lg" onClick={() => setShowHistory(false)}>
                    <User className="w-4 h-4" /> {user ? "Profil & Ayarlar" : "Giriş Yap"}
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toasts */}
      <AnimatePresence>
        {(shareToast || milestoneToast) && (
          <motion.div
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-20 left-4 right-4 z-50 text-white text-sm font-semibold py-3 px-4 rounded-2xl text-center shadow-lg ${milestoneToast ? "bg-indigo-600" : "bg-emerald-600"}`}
          >
            {milestoneToast || shareToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
