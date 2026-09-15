/**
 * Nunta Larisa și Cătălin — aplicație de încărcat amintiri (poze + clipuri)
 *
 * Rute:
 *   GET  /                    — pagina principală (fișier static din ./public)
 *   GET  /api/couple          — poza mirilor (din R2, cheia "_couple"), 404 dacă nu e setată
 *   GET  /api/usage           — spațiul folosit / limita totală
 *   POST /api/upload?name=... — încarcă un fișier (corpul cererii = fișierul)
 *
 *   GET    /admin             — panou de administrare (Basic Auth)
 *   GET    /admin/list        — lista fișierelor încărcate (JSON)
 *   GET    /admin/file/<key>  — servește un fișier din R2
 *   DELETE /admin/file/<key>  — șterge un fișier
 *   POST   /admin/couple      — setează poza mirilor de pe pagina principală
 */

const COUPLE_KEY = '_couple';

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

function guessType(name, fallback) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  return EXT_TYPES[ext] || fallback || 'application/octet-stream';
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path.startsWith('/admin')) {
        return await handleAdmin(request, env, url);
      }
      if (path === '/api/couple' && request.method === 'GET') {
        return await serveObject(env, COUPLE_KEY, false, request);
      }
      if (path === '/api/usage' && request.method === 'GET') {
        const used = await totalUsage(env);
        return json({ used, max: maxTotal(env) });
      }
      if (path === '/api/upload' && request.method === 'POST') {
        return await handleUpload(request, env, url);
      }
      // Orice altceva: fișierele statice din ./public
      return env.ASSETS.fetch(request);
    } catch (err) {
      return json({ error: 'Eroare internă: ' + err.message }, 500);
    }
  },
};

/* ---------- Încărcare fișiere (invitați) ---------- */

async function handleUpload(request, env, url) {
  const size = Number(request.headers.get('content-length') || 0);
  const maxFile = Number(env.MAX_FILE_BYTES || 104857600);

  if (!size) {
    return json({ error: 'Fișier gol sau mărime necunoscută.' }, 411);
  }
  if (size > maxFile) {
    return json({ error: 'Fișierul depășește limita de 100 MB.' }, 413);
  }

  const used = await totalUsage(env);
  if (used + size > maxTotal(env)) {
    return json({ error: 'Spațiul de stocare (10 GB) este plin. Mulțumim pentru toate amintirile!' }, 507);
  }

  const original = sanitizeName(url.searchParams.get('name') || 'amintire');
  const key = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${original}`;

  let contentType = request.headers.get('content-type') || '';
  if (!contentType || contentType === 'application/octet-stream') {
    contentType = guessType(original);
  }

  await env.PHOTOS.put(key, request.body, {
    httpMetadata: { contentType },
  });

  return json({ ok: true, key });
}

function sanitizeName(name) {
  return name
    .replace(/[^\w.\-ăâîșțĂÂÎȘȚ ]+/g, '_')
    .replace(/\s+/g, '_')
    .slice(-80) || 'amintire';
}

/* ---------- Panoul de administrare ---------- */

async function handleAdmin(request, env, url) {
  const denied = checkAuth(request, env);
  if (denied) return denied;

  const path = url.pathname;

  if (path === '/admin' && request.method === 'GET') {
    return new Response(ADMIN_HTML, {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  if (path === '/admin/list' && request.method === 'GET') {
    const items = [];
    let cursor;
    do {
      const page = await env.PHOTOS.list({ cursor, include: ['httpMetadata'] });
      for (const obj of page.objects) {
        if (obj.key === COUPLE_KEY) continue;
        items.push({
          key: obj.key,
          size: obj.size,
          uploaded: obj.uploaded,
          contentType: obj.httpMetadata?.contentType || '',
        });
      }
      cursor = page.truncated ? page.cursor : undefined;
    } while (cursor);
    items.sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));
    const used = items.reduce((s, o) => s + o.size, 0);
    return json({ items, used, max: maxTotal(env) });
  }

  if (path.startsWith('/admin/file/')) {
    const key = decodeURIComponent(path.slice('/admin/file/'.length));
    if (!key || key === COUPLE_KEY) return json({ error: 'Cheie invalidă.' }, 400);
    if (request.method === 'GET') {
      return await serveObject(env, key, url.searchParams.has('download'), request);
    }
    if (request.method === 'DELETE') {
      await env.PHOTOS.delete(key);
      return json({ ok: true });
    }
  }

  if (path === '/admin/couple' && request.method === 'POST') {
    const size = Number(request.headers.get('content-length') || 0);
    if (!size) return json({ error: 'Fișier gol.' }, 411);
    await env.PHOTOS.put(COUPLE_KEY, request.body, {
      httpMetadata: {
        contentType: request.headers.get('content-type') || 'image/jpeg',
      },
    });
    return json({ ok: true });
  }

  return json({ error: 'Rută necunoscută.' }, 404);
}

function checkAuth(request, env) {
  const header = request.headers.get('authorization') || '';
  const expected = 'Basic ' + btoa(`${env.ADMIN_USER}:${env.ADMIN_PASS}`);
  if (timingSafeEqual(header, expected)) return null;
  return new Response('Autentificare necesară', {
    status: 401,
    headers: { 'www-authenticate': 'Basic realm="Admin Nunta", charset="UTF-8"' },
  });
}

function timingSafeEqual(a, b) {
  const enc = new TextEncoder();
  const ba = enc.encode(a);
  const bb = enc.encode(b);
  if (ba.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ba.length; i++) diff |= ba[i] ^ bb[i];
  return diff === 0;
}

/* ---------- Utilitare ---------- */

async function serveObject(env, key, forceDownload = false, request = null) {
  // Suport pentru cereri Range — obligatoriu ca video-urile să poată fi
  // redate (mai ales pe iPhone/Safari) și derulate.
  const rangeHeader = request && request.headers.get('range');
  let obj = null;
  if (rangeHeader && !forceDownload) {
    try { obj = await env.PHOTOS.get(key, { range: request.headers }); } catch (e) { obj = null; }
  }
  if (!obj) obj = await env.PHOTOS.get(key);
  if (!obj) return json({ error: 'Nu există.' }, 404);

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  // Corectăm tipul pentru fișierele vechi salvate fără MIME corect
  const storedType = headers.get('content-type');
  if (!storedType || storedType === 'application/octet-stream') {
    headers.set('content-type', guessType(key));
  }
  headers.set('etag', obj.httpEtag);
  headers.set('accept-ranges', 'bytes');
  headers.set('cache-control', key === COUPLE_KEY ? 'public, max-age=300' : 'private, max-age=3600');
  if (forceDownload) {
    headers.set('content-disposition', `attachment; filename="${key.replace(/"/g, '')}"`);
  }

  let status = 200;
  if (obj.range && rangeHeader && !forceDownload) {
    const offset = obj.range.offset ?? (obj.range.suffix != null ? obj.size - obj.range.suffix : 0);
    const length = obj.range.length ?? (obj.range.suffix != null ? obj.range.suffix : obj.size - offset);
    headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${obj.size}`);
    headers.set('content-length', String(length));
    status = 206;
  }
  return new Response(obj.body, { status, headers });
}

async function totalUsage(env) {
  let used = 0;
  let cursor;
  do {
    const page = await env.PHOTOS.list({ cursor });
    for (const obj of page.objects) {
      if (obj.key !== COUPLE_KEY) used += obj.size;
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return used;
}

function maxTotal(env) {
  return Number(env.MAX_TOTAL_BYTES || 10737418240);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

/* ---------- Pagina de administrare ---------- */

const ADMIN_HTML = `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Admin — Nunta Larisa și Cătălin</title>
<style>
  :root {
    --verde: #0f6e57;
    --verde-inchis: #0a4a3b;
    --crem: #faf7f2;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, 'Times New Roman', serif; background: var(--crem); color: #333; }
  header { background: var(--verde); color: #fff; padding: 20px; text-align: center; }
  header h1 { font-weight: normal; font-size: 1.5rem; }
  .container { max-width: 1100px; margin: 0 auto; padding: 20px; }
  .stats { background: #fff; border: 1px solid #e2ddd2; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between; }
  .bar { flex: 1 1 240px; height: 10px; background: #e9e4d9; border-radius: 5px; overflow: hidden; }
  .bar div { height: 100%; background: var(--verde); border-radius: 5px; width: 0; transition: width .5s; }
  .couple-box { background: #fff; border: 1px solid #e2ddd2; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; }
  .couple-box h2 { font-size: 1.1rem; color: var(--verde-inchis); margin-bottom: 10px; }
  .couple-box label { display: inline-block; background: var(--verde); color: #fff; padding: 10px 18px; border-radius: 8px; cursor: pointer; }
  .couple-box input { display: none; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
  .card { background: #fff; border: 1px solid #e2ddd2; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
  .card .thumb { width: 100%; aspect-ratio: 1; object-fit: cover; background: #eee; display: block; }
  .card .thumb.ph { display: flex; align-items: center; justify-content: center; font-size: 2.6rem; color: #aaa; }
  .card .badge { position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,.55); color: #fff; font-size: .7rem; padding: 3px 8px; border-radius: 6px; }
  .card .thumb-wrap { position: relative; }
  .card .meta { padding: 8px 10px; font-size: .75rem; color: #666; word-break: break-all; }
  .card .actions { display: flex; border-top: 1px solid #eee; }
  .card .actions a, .card .actions button { flex: 1; padding: 8px; text-align: center; font-size: .8rem; border: none; background: none; cursor: pointer; color: var(--verde-inchis); text-decoration: none; font-family: inherit; }
  .card .actions button.del { color: #a33; }
  .card .actions a:hover, .card .actions button:hover { background: #f4f1ea; }
  .empty { text-align: center; color: #888; padding: 40px 0; }
  .msg { margin: 10px 0; color: var(--verde-inchis); }
  .btn { background: var(--verde); color: #fff; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-family: inherit; font-size: .95rem; }
  .btn:hover { background: var(--verde-inchis); }
  .btn:disabled { opacity: .5; cursor: default; }
  .btn.secondary { background: #fff; color: #a33; border: 1px solid #e2ddd2; }
  .zip-panel { background: #fff; border: 1px solid #e2ddd2; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; }
  .zip-panel h2 { font-size: 1.1rem; color: var(--verde-inchis); margin-bottom: 10px; }
  .zip-panel .row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
  .zip-panel .note { font-size: .85rem; color: #777; margin-top: 8px; }
  .zip-panel .links { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
  .zip-panel .links a { color: var(--verde-inchis); }
</style>
</head>
<body>
<header><h1>Panou administrare — Nunta Larisa și Cătălin</h1></header>
<div class="container">
  <div class="stats">
    <span id="count">…</span>
    <div class="bar"><div id="barfill"></div></div>
    <span id="usage">…</span>
    <button class="btn" id="zipBtn">⬇ Descarcă tot (ZIP)</button>
  </div>

  <div class="zip-panel" id="zipPanel" hidden>
    <h2>Descărcare totală</h2>
    <div class="row">
      <div class="bar"><div id="zipFill"></div></div>
      <span id="zipStatus">…</span>
      <button class="btn secondary" id="zipCancel">Anulează</button>
    </div>
    <div class="note" id="zipNote"></div>
    <div class="links" id="zipLinks"></div>
  </div>

  <div class="couple-box">
    <h2>Poza mirilor de pe pagina principală</h2>
    <p style="font-size:.85rem;color:#777;margin-bottom:10px;">Încarcă aici poza cu Larisa și Cătălin — apare automat pe prima pagină.</p>
    <label>Alege poza mirilor<input type="file" id="coupleInput" accept="image/*"></label>
    <span class="msg" id="coupleMsg"></span>
  </div>

  <div class="grid" id="grid"></div>
  <div class="empty" id="empty" hidden>Nicio amintire încărcată încă.</div>
</div>
<script>
function fmt(b) {
  if (b >= 1073741824) return (b / 1073741824).toFixed(2) + ' GB';
  if (b >= 1048576) return (b / 1048576).toFixed(1) + ' MB';
  return Math.round(b / 1024) + ' KB';
}

let currentItems = [];

async function load() {
  const res = await fetch('/admin/list');
  const data = await res.json();
  currentItems = data.items;
  document.getElementById('count').textContent = data.items.length + ' fișiere';
  document.getElementById('usage').textContent = fmt(data.used) + ' / ' + fmt(data.max);
  document.getElementById('barfill').style.width = Math.min(100, data.used / data.max * 100) + '%';
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  document.getElementById('empty').hidden = data.items.length > 0;
  for (const item of data.items) {
    const fileUrl = '/admin/file/' + encodeURIComponent(item.key);
    const card = document.createElement('div');
    card.className = 'card';
    const isVideo = item.contentType.startsWith('video/') ||
      /\\.(mp4|m4v|mov|webm|mkv|avi|3gp|ts|mts|m2ts|mpg|mpeg|wmv)$/i.test(item.key);
    card.innerHTML =
      (isVideo
        ? '<div class="thumb-wrap"><video class="thumb" src="' + fileUrl + '#t=0.1" preload="metadata" controls muted playsinline></video><span class="badge">🎬 video</span></div>'
        : '<img class="thumb" src="' + fileUrl + '" loading="lazy" alt="">') +
      '<div class="meta">' + item.key + '<br>' + fmt(item.size) + ' · ' + new Date(item.uploaded).toLocaleString('ro-RO') + '</div>' +
      '<div class="actions">' +
        '<a href="' + fileUrl + '?download" download>Descarcă</a>' +
        '<button class="del">Șterge</button>' +
      '</div>';
    // Dacă imaginea nu se poate afișa (ex. video cu nume de poză sau HEIC),
    // încercăm ca video, apoi arătăm un simbol generic.
    const img = card.querySelector('img.thumb');
    if (img) {
      img.onerror = () => {
        const v = document.createElement('video');
        v.className = 'thumb';
        v.src = fileUrl + '#t=0.1';
        v.controls = true; v.muted = true; v.playsInline = true; v.preload = 'metadata';
        v.onerror = () => {
          const d = document.createElement('div');
          d.className = 'thumb ph';
          d.textContent = '🖼️';
          v.replaceWith(d);
        };
        img.replaceWith(v);
      };
    }
    card.querySelector('.del').onclick = async () => {
      if (!confirm('Sigur ștergi acest fișier?')) return;
      await fetch(fileUrl, { method: 'DELETE' });
      load();
    };
    grid.appendChild(card);
  }
}

/* ---------- Descărcare totală ca ZIP ---------- */

// ZIP fără compresie ("store") — pozele și clipurile sunt deja comprimate,
// iar așa nu pierdem timp. Suportă ZIP64 pentru arhive peste 4 GB.

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function dosDateTime(d) {
  const y = Math.max(1980, d.getFullYear());
  return {
    dosTime: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
    dosDate: ((y - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

class ZipWriter {
  constructor(sink) { this.sink = sink; this.offset = 0; this.entries = []; }

  async write(bytes) { await this.sink(bytes); this.offset += bytes.byteLength; }

  async addFile(name, data, date) {
    const nameBytes = new TextEncoder().encode(name);
    const crc = crc32(data);
    const size = data.byteLength;
    const { dosTime, dosDate } = dosDateTime(date);
    const h = new DataView(new ArrayBuffer(30 + nameBytes.length));
    h.setUint32(0, 0x04034b50, true);   // semnătură antet local
    h.setUint16(4, 20, true);           // versiune necesară
    h.setUint16(6, 0x0800, true);       // nume în UTF-8
    h.setUint16(8, 0, true);            // metoda: store
    h.setUint16(10, dosTime, true);
    h.setUint16(12, dosDate, true);
    h.setUint32(14, crc, true);
    h.setUint32(18, size, true);
    h.setUint32(22, size, true);
    h.setUint16(26, nameBytes.length, true);
    h.setUint16(28, 0, true);
    new Uint8Array(h.buffer).set(nameBytes, 30);
    const offset = this.offset;
    await this.write(new Uint8Array(h.buffer));
    await this.write(data);
    this.entries.push({ nameBytes, crc, size, dosTime, dosDate, offset });
  }

  async finish() {
    const cdStart = this.offset;
    for (const e of this.entries) {
      const zip64 = e.offset >= 0xFFFFFFFF;
      const extraLen = zip64 ? 12 : 0;
      const c = new DataView(new ArrayBuffer(46 + e.nameBytes.length + extraLen));
      c.setUint32(0, 0x02014b50, true);
      c.setUint16(4, zip64 ? 45 : 20, true);
      c.setUint16(6, zip64 ? 45 : 20, true);
      c.setUint16(8, 0x0800, true);
      c.setUint16(10, 0, true);
      c.setUint16(12, e.dosTime, true);
      c.setUint16(14, e.dosDate, true);
      c.setUint32(16, e.crc, true);
      c.setUint32(20, e.size, true);
      c.setUint32(24, e.size, true);
      c.setUint16(28, e.nameBytes.length, true);
      c.setUint16(30, extraLen, true);
      c.setUint16(32, 0, true);
      c.setUint16(34, 0, true);
      c.setUint16(36, 0, true);
      c.setUint32(38, 0, true);
      c.setUint32(42, zip64 ? 0xFFFFFFFF : e.offset, true);
      const u8 = new Uint8Array(c.buffer);
      u8.set(e.nameBytes, 46);
      if (zip64) {
        const p = 46 + e.nameBytes.length;
        c.setUint16(p, 0x0001, true);
        c.setUint16(p + 2, 8, true);
        c.setBigUint64(p + 4, BigInt(e.offset), true);
      }
      await this.write(u8);
    }
    const cdSize = this.offset - cdStart;
    const count = this.entries.length;
    if (cdStart >= 0xFFFFFFFF || cdSize >= 0xFFFFFFFF || count >= 0xFFFF) {
      const z = new DataView(new ArrayBuffer(76));
      z.setUint32(0, 0x06064b50, true);   // ZIP64 end of central directory
      z.setBigUint64(4, BigInt(44), true);
      z.setUint16(12, 45, true);
      z.setUint16(14, 45, true);
      z.setUint32(16, 0, true);
      z.setUint32(20, 0, true);
      z.setBigUint64(24, BigInt(count), true);
      z.setBigUint64(32, BigInt(count), true);
      z.setBigUint64(40, BigInt(cdSize), true);
      z.setBigUint64(48, BigInt(cdStart), true);
      z.setUint32(56, 0x07064b50, true);  // ZIP64 locator
      z.setUint32(60, 0, true);
      z.setBigUint64(64, BigInt(this.offset), true);
      z.setUint32(72, 1, true);
      await this.write(new Uint8Array(z.buffer));
    }
    const e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true);
    e.setUint16(4, 0, true);
    e.setUint16(6, 0, true);
    e.setUint16(8, Math.min(count, 0xFFFF), true);
    e.setUint16(10, Math.min(count, 0xFFFF), true);
    e.setUint32(12, Math.min(cdSize, 0xFFFFFFFF), true);
    e.setUint32(16, Math.min(cdStart, 0xFFFFFFFF), true);
    e.setUint16(20, 0, true);
    await this.write(new Uint8Array(e.buffer));
  }
}

async function fetchBytes(url, signal) {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return new Uint8Array(await res.arrayBuffer());
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      lastErr = err;
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw lastErr;
}

// Când browserul nu poate scrie direct pe disc (Safari, Firefox), arhiva se
// construiește în memorie și se împarte în bucăți de cel mult 1 GB.
const PART_LIMIT = 1024 * 1024 * 1024;
let zipAbort = null;

async function downloadAll() {
  const btn = document.getElementById('zipBtn');
  const status = document.getElementById('zipStatus');
  const fill = document.getElementById('zipFill');
  const note = document.getElementById('zipNote');
  const links = document.getElementById('zipLinks');

  if (!currentItems.length) { alert('Nu există nicio amintire de descărcat.'); return; }

  // Dialogul de salvare trebuie deschis direct din click (înainte de orice await).
  let handlePromise = null;
  if (window.showSaveFilePicker) {
    handlePromise = window.showSaveFilePicker({
      suggestedName: 'amintiri-nunta.zip',
      types: [{ description: 'Arhivă ZIP', accept: { 'application/zip': ['.zip'] } }],
    });
  }

  const controller = new AbortController();
  zipAbort = controller;
  btn.disabled = true;
  document.getElementById('zipPanel').hidden = false;
  links.innerHTML = '';
  note.textContent = '';
  fill.style.width = '0%';
  status.textContent = 'Se pregătește…';

  let writable = null;
  try {
    if (handlePromise) {
      const handle = await handlePromise;
      writable = await handle.createWritable();
    }

    const res = await fetch('/admin/list', { signal: controller.signal });
    const items = (await res.json()).items;
    items.sort((a, b) => new Date(a.uploaded) - new Date(b.uploaded));
    const total = items.reduce((s, i) => s + i.size, 0);
    const multi = !writable && total > PART_LIMIT;
    if (!writable) {
      note.textContent = multi
        ? 'Acest browser nu poate scrie arhiva direct pe disc, așa că va fi împărțită în părți de cel mult 1 GB. Pentru un singur fișier ZIP folosește Chrome sau Edge.'
        : 'Arhiva se construiește în memorie și se descarcă la final.';
    }

    let chunks = [];
    let partNo = 1, partBytes = 0, done = 0;
    const sink = writable ? (b) => writable.write(b) : (b) => { chunks.push(b); };
    let zip = new ZipWriter(sink);

    const flushPart = async () => {
      await zip.finish();
      const blob = new Blob(chunks, { type: 'application/zip' });
      chunks = [];
      const name = 'amintiri-nunta' + (multi ? '-partea-' + partNo : '') + '.zip';
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.textContent = '⬇ ' + name + ' (' + fmt(blob.size) + ')';
      links.appendChild(a);
      a.click();
    };

    for (let i = 0; i < items.length; i++) {
      if (controller.signal.aborted) throw new DOMException('Anulat', 'AbortError');
      const item = items[i];
      if (!writable && partBytes > 0 && partBytes + item.size > PART_LIMIT) {
        await flushPart();
        partNo++; partBytes = 0;
        zip = new ZipWriter(sink);
      }
      status.textContent = 'Fișier ' + (i + 1) + ' / ' + items.length + ' · ' + fmt(done) + ' / ' + fmt(total) + (multi ? ' · partea ' + partNo : '');
      const data = await fetchBytes('/admin/file/' + encodeURIComponent(item.key), controller.signal);
      await zip.addFile(item.key, data, new Date(item.uploaded));
      done += item.size; partBytes += item.size;
      fill.style.width = (total ? done / total * 100 : 100) + '%';
    }

    if (writable) {
      await zip.finish();
      await writable.close();
      writable = null;
    } else {
      await flushPart();
    }
    fill.style.width = '100%';
    status.textContent = 'Gata ✓ ' + items.length + ' fișiere, ' + fmt(done) + (multi ? ', în ' + partNo + ' părți' : '') + '.';
    if (!writable && links.children.length) note.textContent += ' Dacă descărcarea nu a pornit automat, apasă pe linkurile de mai jos.';
  } catch (err) {
    if (writable) { try { await writable.abort(); } catch (e) {} }
    status.textContent = err.name === 'AbortError' ? 'Descărcare anulată.' : 'Eroare: ' + err.message;
  } finally {
    btn.disabled = false;
    zipAbort = null;
  }
}

document.getElementById('zipBtn').onclick = downloadAll;
document.getElementById('zipCancel').onclick = () => { if (zipAbort) zipAbort.abort(); };

document.getElementById('coupleInput').onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const msg = document.getElementById('coupleMsg');
  msg.textContent = 'Se încarcă…';
  const res = await fetch('/admin/couple', {
    method: 'POST',
    headers: { 'content-type': file.type || 'image/jpeg' },
    body: file,
  });
  msg.textContent = res.ok ? 'Poza mirilor a fost actualizată ✓' : 'Eroare la încărcare.';
};

load();
</script>
</body>
</html>`;
