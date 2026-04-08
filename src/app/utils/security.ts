/**
 * GDNN-GDTX - Security Utilities (Phase 11)
 * Input sanitization, XSS prevention, rate limiting, CSRF helpers
 */

// ============================================
// XSS Prevention & Input Sanitization
// ============================================

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#96;",
};

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'`/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Strip all HTML tags from a string
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize user input - removes dangerous patterns
 */
export function sanitizeInput(input: string): string {
  let clean = input.trim();
  // Remove script tags and event handlers
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  clean = clean.replace(/javascript\s*:/gi, "");
  clean = clean.replace(/data\s*:\s*text\/html/gi, "");
  clean = clean.replace(/vbscript\s*:/gi, "");
  // Remove null bytes
  clean = clean.replace(/\0/g, "");
  return clean;
}

/**
 * Sanitize a search query
 */
export function sanitizeSearchQuery(query: string): string {
  return sanitizeInput(query)
    .replace(/[^\p{L}\p{N}\s\-_.@]/gu, "")
    .substring(0, 200);
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().substring(0, 254);
}

// ============================================
// Input Validation
// ============================================

export function isValidEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email) && email.length <= 254;
}

export function isValidPhone(phone: string): boolean {
  const re = /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/;
  return re.test(phone.replace(/\s/g, ""));
}

export function isValidPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push("Mat khau phai co it nhat 8 ky tu");
  if (password.length > 128) errors.push("Mat khau qua dai");
  if (!/[A-Z]/.test(password)) errors.push("Can co it nhat 1 chu hoa");
  if (!/[a-z]/.test(password)) errors.push("Can co it nhat 1 chu thuong");
  if (!/[0-9]/.test(password)) errors.push("Can co it nhat 1 so");
  if (/^(.)\1+$/.test(password)) errors.push("Mat khau khong duoc la ky tu lap lai");
  return { valid: errors.length === 0, errors };
}

export function isValidFullName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100 && /^[\p{L}\s'-]+$/u.test(trimmed);
}

// ============================================
// Rate Limiting (Client-side)
// ============================================

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  blockedUntil: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Client-side rate limiter
 * @param key - Unique identifier (e.g., "login", "search", "api:endpoint")
 * @param maxRequests - Max requests in the window
 * @param windowMs - Time window in milliseconds
 * @param blockDurationMs - How long to block after exceeding limit
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000,
  blockDurationMs: number = 30000
): { allowed: boolean; remainingRequests: number; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (entry && now < entry.blockedUntil) {
    return {
      allowed: false,
      remainingRequests: 0,
      retryAfterMs: entry.blockedUntil - now,
    };
  }

  if (!entry || now - entry.firstRequest > windowMs) {
    rateLimitStore.set(key, { count: 1, firstRequest: now, blockedUntil: 0 });
    return { allowed: true, remainingRequests: maxRequests - 1, retryAfterMs: 0 };
  }

  entry.count++;

  if (entry.count > maxRequests) {
    entry.blockedUntil = now + blockDurationMs;
    return { allowed: false, remainingRequests: 0, retryAfterMs: blockDurationMs };
  }

  return { allowed: true, remainingRequests: maxRequests - entry.count, retryAfterMs: 0 };
}

/**
 * Reset rate limit for a key (e.g., after successful login)
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

// ============================================
// CSRF Token (Client-side mock)
// ============================================

let csrfToken: string | null = null;

/**
 * Generate a CSRF token and store in sessionStorage
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  csrfToken = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
  try {
    sessionStorage.setItem("csrf-token", csrfToken);
  } catch {
    // sessionStorage not available
  }
  return csrfToken;
}

/**
 * Get the current CSRF token
 */
export function getCsrfToken(): string {
  if (csrfToken) return csrfToken;
  try {
    const stored = sessionStorage.getItem("csrf-token");
    if (stored) {
      csrfToken = stored;
      return stored;
    }
  } catch {
    // sessionStorage not available
  }
  return generateCsrfToken();
}

/**
 * Validate a CSRF token
 */
export function validateCsrfToken(token: string): boolean {
  const current = getCsrfToken();
  if (!current || !token) return false;
  // Constant-time comparison to prevent timing attacks
  if (current.length !== token.length) return false;
  let result = 0;
  for (let i = 0; i < current.length; i++) {
    result |= current.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return result === 0;
}

// ============================================
// Secure Storage Helpers
// ============================================

/**
 * Set item in localStorage with optional expiry
 */
export function secureStorageSet(key: string, value: unknown, expiryMs?: number): void {
  try {
    const item = {
      value,
      timestamp: Date.now(),
      expiry: expiryMs ? Date.now() + expiryMs : null,
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch {
    // Storage full or unavailable
  }
}

/**
 * Get item from localStorage, respecting expiry
 */
export function secureStorageGet<T = unknown>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const item = JSON.parse(raw);
    if (item.expiry && Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value as T;
  } catch {
    return null;
  }
}

/**
 * Remove item from localStorage
 */
export function secureStorageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage unavailable
  }
}

// ============================================
// Content Security
// ============================================

/**
 * Validate URL to prevent open redirect attacks
 */
export function isValidRedirectUrl(url: string): boolean {
  if (!url) return false;
  // Only allow relative URLs or same-origin
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Sanitize URL for safe display
 */
export function sanitizeUrl(url: string): string {
  const dangerous = /^(javascript|data|vbscript):/i;
  if (dangerous.test(url.trim())) return "#";
  return url;
}

// ============================================
// Session Security
// ============================================

/**
 * Generate a random session ID
 */
export function generateSessionId(): string {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Check for session timeout
 */
export function isSessionExpired(lastActivityMs: number, timeoutMs: number = 3600000): boolean {
  return Date.now() - lastActivityMs > timeoutMs;
}

/**
 * Update last activity timestamp
 */
export function updateLastActivity(): void {
  try {
    localStorage.setItem("ielts-pro-last-activity", Date.now().toString());
  } catch {
    // Storage unavailable
  }
}

/**
 * Get last activity timestamp
 */
export function getLastActivity(): number {
  try {
    const stored = localStorage.getItem("ielts-pro-last-activity");
    return stored ? parseInt(stored, 10) : Date.now();
  } catch {
    return Date.now();
  }
}
