/**
 * Input sanitization and validation utilities
 */

// Tehlikeli HTML/script tag'lerini temizle
export function sanitizeText(input: string): string {
  if (!input) return "";
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Prompt injection koruması - AI'a gönderilecek kullanıcı inputu temizle
export function sanitizeForPrompt(input: string): string {
  if (!input) return "";

  // Prompt injection pattern'leri
  const dangerousPatterns = [
    /ignore\s+(all\s+)?previous\s+instructions/gi,
    /ignore\s+(all\s+)?above/gi,
    /disregard\s+(all\s+)?previous/gi,
    /forget\s+(all\s+)?previous/gi,
    /you\s+are\s+now/gi,
    /act\s+as\s+if/gi,
    /pretend\s+(to\s+be|you\s+are)/gi,
    /override\s+(system|instructions)/gi,
    /new\s+instructions?:/gi,
    /system\s*prompt/gi,
    /\[SYSTEM\]/gi,
    /\[INST\]/gi,
    /<\|.*?\|>/g,
    /```\s*(system|assistant)/gi,
  ];

  let cleaned = input;
  for (const pattern of dangerousPatterns) {
    cleaned = cleaned.replace(pattern, "[FILTERED]");
  }

  // Maksimum uzunluk sınırı
  return cleaned.slice(0, 10000);
}

// Kategori whitelist doğrulaması
const VALID_CATEGORIES = [
  "is_hukuku", "aile_hukuku", "ticaret_hukuku", "ceza_hukuku",
  "tuketici_hukuku", "kira_hukuku", "miras_hukuku", "idare_hukuku",
  "icra_iflas", "diger",
];

export function isValidCategory(category: string): boolean {
  return VALID_CATEGORIES.includes(category);
}

// Tarih format doğrulaması (DD/MM/YYYY)
export function isValidDate(date: string): boolean {
  if (!date) return true; // Optional field
  return /^\d{2}\/\d{2}\/\d{4}$/.test(date);
}

// Genel input doğrulama
export function validateAnalysisInput(body: {
  eventSummary?: string;
  category?: string;
  additionalNotes?: string;
}): { valid: boolean; error?: string } {
  if (!body.eventSummary || typeof body.eventSummary !== "string") {
    return { valid: false, error: "Olay özeti gereklidir." };
  }
  if (body.eventSummary.length < 20) {
    return { valid: false, error: "Olay özeti en az 20 karakter olmalıdır." };
  }
  if (body.eventSummary.length > 10000) {
    return { valid: false, error: "Olay özeti en fazla 10000 karakter olabilir." };
  }
  if (!body.category || !isValidCategory(body.category)) {
    return { valid: false, error: "Geçerli bir kategori seçiniz." };
  }
  if (body.additionalNotes && typeof body.additionalNotes !== "string") {
    return { valid: false, error: "Ek notlar metin formatında olmalıdır." };
  }
  if (body.additionalNotes && body.additionalNotes.length > 5000) {
    return { valid: false, error: "Ek notlar en fazla 5000 karakter olabilir." };
  }
  return { valid: true };
}
