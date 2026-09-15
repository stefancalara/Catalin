/* ---------- Utilitare comune ---------- */

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extraHeaders },
  });
}

export function html(body, status = 200, extraHeaders = {}) {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', ...extraHeaders },
  });
}

export function redirect(location, status = 302) {
  return new Response(null, { status, headers: { location } });
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Pentru text inserat în interiorul unui <script> ca literal JSON
export function jsonForScript(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

// Tipul MIME după extensie — galeriile de telefon trimit deseori
// "application/octet-stream" sau nimic, mai ales pentru videoclipuri.
const EXT_TYPES = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
  webp: 'image/webp', heic: 'image/heic', heif: 'image/heif', avif: 'image/avif',
  bmp: 'image/bmp', tif: 'image/tiff', tiff: 'image/tiff', dng: 'image/x-adobe-dng',
  mp4: 'video/mp4', m4v: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm',
  mkv: 'video/x-matroska', avi: 'video/x-msvideo', '3gp': 'video/3gpp', ts: 'video/mp2t',
  mts: 'video/mp2t', m2ts: 'video/mp2t', mpg: 'video/mpeg', mpeg: 'video/mpeg',
  wmv: 'video/x-ms-wmv',
};

export function guessType(name, fallback) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  return EXT_TYPES[ext] || fallback || 'application/octet-stream';
}

export function sanitizeName(name) {
  return name
    .replace(/[^\w.\-ăâîșțĂÂÎȘȚ ]+/g, '_')
    .replace(/\s+/g, '_')
    .slice(-80) || 'amintire';
}

// Câte poze de telefon încap, aproximativ (≈3,5 MB per poză), rotunjit la zeci
export function approxPhotos(bytes) {
  const n = Math.floor(bytes / (3.5 * 1048576) / 10) * 10;
  return n.toLocaleString('ro-RO');
}

export function fmtBytes(b) {
  if (b >= 1073741824) return (b / 1073741824).toFixed(2) + ' GB';
  if (b >= 1048576) return (b / 1048576).toFixed(1) + ' MB';
  return Math.round(b / 1024) + ' KB';
}

export function timingSafeEqual(a, b) {
  const enc = new TextEncoder();
  const ba = enc.encode(a);
  const bb = enc.encode(b);
  if (ba.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ba.length; i++) diff |= ba[i] ^ bb[i];
  return diff === 0;
}

/* ---------- Criptografie (parole, sesiuni) ---------- */

export async function hmacHex(secret, msg) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// Parola se păstrează ca "salt$hmac(secret, salt:parola)". Secretul serverului
// face inutil un atac offline chiar dacă cineva ar copia config-urile.
export async function hashPassword(secret, password, salt) {
  salt = salt || crypto.randomUUID().replace(/-/g, '');
  return salt + '$' + await hmacHex(secret, salt + ':' + password);
}

export async function verifyPassword(secret, password, stored) {
  if (!stored || !stored.includes('$')) return false;
  const salt = stored.split('$')[0];
  const h = await hashPassword(secret, password, salt);
  return timingSafeEqual(h, stored);
}

export function serverSecret(env) {
  return env.SECRET || ('fallback:' + (env.OWNER_PASS || env.ADMIN_PASS || 'schimba-secretul'));
}

/* ---------- Culori ---------- */

export function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

export function isHex(hex) {
  return !!hexToRgb(hex);
}

// Amestecă o culoare cu alb (amt > 0) sau cu negru (amt < 0), amt în [-1, 1]
export function shade(hex, amt) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const target = amt > 0 ? 255 : 0;
  const t = Math.abs(amt);
  return rgbToHex(rgb.map(v => v + (target - v) * t));
}

export function luminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 1;
  const [r, g, b] = rgb.map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function isDark(hex) {
  return luminance(hex) < 0.35;
}

export function rgbaFromHex(hex, alpha) {
  const rgb = hexToRgb(hex) || [0, 0, 0];
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

/* ---------- Slug-uri ---------- */

export const RESERVED_SLUGS = new Set([
  'admin', 'api', 'owner', 'creeaza', 'create', 'e', 'print', 'demo', 'static', 'assets',
  'login', 'logout', 'galerie', 'gallery', 'cover', 'qr', 'preturi', 'contact', 'termeni',
  'confidentialitate', 'despre', 'blog', 'www', 'mail', 'test', 'null', 'undefined',
]);

export function isValidSlug(slug) {
  return typeof slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) &&
    slug.length >= 3 && slug.length <= 40 && !RESERVED_SLUGS.has(slug);
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/ă/g, 'a').replace(/â/g, 'a').replace(/î/g, 'i').replace(/ș|ş/g, 's').replace(/ț|ţ/g, 't')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' si ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
}

/* ---------- Cookie-uri ---------- */

export function parseCookies(request) {
  const out = {};
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function cookieHeader(name, value, { path = '/', maxAge = 2592000, secure = true } = {}) {
  return `${name}=${encodeURIComponent(value)}; Path=${path}; Max-Age=${maxAge}; HttpOnly; SameSite=Lax` + (secure ? '; Secure' : '');
}

export function isSecure(request) {
  return new URL(request.url).protocol === 'https:';
}
