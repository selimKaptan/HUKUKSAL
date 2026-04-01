/**
 * Input Sanitizasyonu - XSS koruması
 */

// HTML tag'lerini temizle
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Script injection'ı temizle
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/data\s*:/gi, "")
    .replace(/vbscript\s*:/gi, "")
    .trim();
}

// SQL injection'a karşı temizle
export function sanitizeForDB(input: string): string {
  return input
    .replace(/['";\\]/g, "")
    .replace(/--/g, "")
    .replace(/\/\*/g, "")
    .replace(/\*\//g, "")
    .trim();
}

// E-posta validasyonu
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Telefon validasyonu (Türkiye)
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  return /^(\+90|0)?[5][0-9]{9}$/.test(cleaned);
}

// Genel form input temizleme
export function cleanFormInput(input: string, maxLength: number = 5000): string {
  return sanitizeInput(input).substring(0, maxLength);
}
