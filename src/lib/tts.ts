"use client";

/**
 * Text-to-Speech (TTS) - AI yanıtını sesli okuma
 * Web Speech API kullanır (ücretsiz, cihaz üzerinde)
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let _currentUtterance: SpeechSynthesisUtterance | null = null;

export function speak(text: string, onEnd?: () => void): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;

  // Mevcut konuşmayı durdur
  stop();

  // Markdown/özel karakterleri temizle
  const cleanText = text
    .replace(/[🟢🟡🔴📄📋⚖️💼🏠🛒🚗👨‍👩‍👧📝⚠️💰🎉📚🔥⭐🤝🛠️]/g, "")
    .replace(/\*\*/g, "")
    .replace(/\+\s/g, "")
    .replace(/-\s/g, "")
    .replace(/\d+\.\s/g, "")
    .replace(/\n+/g, ". ")
    .trim();

  if (!cleanText) return false;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "tr-TR";
  utterance.rate = 0.95;
  utterance.pitch = 1;

  // Türkçe ses bul
  const voices = window.speechSynthesis.getVoices();
  const turkishVoice = voices.find((v) => v.lang.startsWith("tr"));
  if (turkishVoice) utterance.voice = turkishVoice;

  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = () => { _currentUtterance = null; };

  _currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stop(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  _currentUtterance = null;
}

export function isSpeaking(): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  return window.speechSynthesis.speaking;
}
