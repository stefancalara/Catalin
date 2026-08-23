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
</style>
</head>
<body>
<header><h1>Panou administrare — Nunta Larisa și Cătălin</h1></header>
<div class="container">
  <div class="stats">
    <span id="count">…</span>
    <div class="bar"><div id="barfill"></div></div>
    <span id="usage">…</span>
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

async function load() {
  const res = await fetch('/admin/list');
  const data = await res.json();
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
