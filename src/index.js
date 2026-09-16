/**
 * Platformă de colectat poze și clipuri de la invitați prin cod QR.
 * Cloudflare Workers + R2, mai multe evenimente pe același Worker.
 *
 * Rute publice:
 *   GET  /                          — pagina de prezentare (sau evenimentul ROOT_EVENT, vezi wrangler.toml)
 *   GET  /creeaza                   — creează un eveniment nou
 *   GET  /login                     — intră în panoul unui eveniment (adresă + parolă)
 *   POST /api/events                — API creare eveniment
 *   GET  /api/slug-check?slug=      — verifică dacă adresa e liberă
 *
 * Rute per eveniment (/e/<slug>):
 *   GET  /e/<slug>                  — pagina invitaților
 *   GET  /e/<slug>/cover            — poza principală
 *   POST /e/<slug>/api/upload       — încarcă un fișier
 *   GET  /e/<slug>/api/usage        — spațiu folosit
 *   POST /e/<slug>/api/message      — mesaj în cartea de oaspeți
 *   GET  /e/<slug>/api/gallery      — lista fișierelor (dacă galeria e publică sau cu cheie de slideshow)
 *   GET  /e/<slug>/file/<cheie>     — un fișier (aceleași condiții)
 *   GET  /e/<slug>/galerie          — galeria publică
 *   GET  /e/<slug>/slideshow?k=     — slideshow live pentru proiector
 *   GET  /e/<slug>/print            — cartonașe QR de printat
 *   GET  /e/<slug>/admin            — panoul evenimentului (parolă + cookie)
 *   *    /e/<slug>/admin/api/...    — API-ul panoului
 *
 * Proprietarul platformei:
 *   GET  /owner                     — toate evenimentele (Basic Auth OWNER_USER / OWNER_PASS)
 */

import {
  json, html, redirect, escapeHtml, guessType, sanitizeName, timingSafeEqual,
  hmacHex, verifyPassword, hashPassword, serverSecret, isValidSlug, parseCookies, cookieHeader, isSecure,
} from './util.js';
import * as store from './store.js';
import { renderGuestPage, renderPrintPage, renderGalleryPage, renderSlideshowPage, normalizeColors, palette } from './templates.js';
import { renderAdminPage, renderLoginPage } from './pages/admin.js';
import { renderLandingPage } from './pages/landing.js';
import { renderCreatePage } from './pages/create.js';
import { renderLoginPage as renderPlatformLoginPage } from './pages/login.js';
import { renderOwnerPage } from './pages/owner.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Totul pe HTTPS (echivalentul „Always Use HTTPS” din Cloudflare, dar garantat de Worker)
      let visitorScheme = '';
      try { visitorScheme = JSON.parse(request.headers.get('cf-visitor') || '{}').scheme || ''; } catch {}
      const insecure = url.protocol === 'http:' || visitorScheme === 'http' || request.headers.get('x-forwarded-proto') === 'http';
      if (insecure && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
        url.protocol = 'https:';
        return Response.redirect(url.toString(), 301);
      }
      // www.pozeqr.ro -> pozeqr.ro (un singur host canonic pentru platformă)
      if (env.PLATFORM_HOST && url.hostname === 'www.' + env.PLATFORM_HOST) {
        url.hostname = env.PLATFORM_HOST;
        return Response.redirect(url.toString(), 301);
      }
      if (path === '/owner' || path.startsWith('/owner/')) {
        return await handleOwner(request, env, url);
      }
      if (path === '/api/events' && request.method === 'POST') {
        return await createEvent(request, env, url);
      }
      if (path === '/api/slug-check' && request.method === 'GET') {
        const slug = url.searchParams.get('slug') || '';
        if (!isValidSlug(slug)) return json({ ok: false, reason: 'invalid' });
        return json({ ok: !(await store.eventExists(env, slug)) });
      }

      const m = /^\/e\/([a-z0-9-]+)(\/.*)?$/.exec(path);
      if (m) {
        return await handleEvent(request, env, url, m[1], m[2] || '/', '/e/' + m[1]);
      }

      // Evenimentul "rădăcină": pe adresa Worker-ului, / rămâne pagina evenimentului
      // (codurile QR deja tipărite continuă să funcționeze).
      const root = env.ROOT_EVENT;
      const onPlatformHost = env.PLATFORM_HOST && url.hostname === env.PLATFORM_HOST;
      if (root && !onPlatformHost) {
        if (path === '/' && await store.eventExists(env, root)) return await handleEvent(request, env, url, root, '/', '');
        if (path === '/admin' || path.startsWith('/admin/')) return redirect(`/e/${root}/admin`);
        if (path === '/print') return redirect(`/e/${root}/print`);
        if (path === '/galerie') return redirect(`/e/${root}/galerie`);
        if (path === '/cover' || path.startsWith('/api/')) return await handleEvent(request, env, url, root, path, '');
      }

      if (path === '/' || path === '/index.html') return html(renderLandingPage(env, url));
      if (path === '/creeaza') return html(renderCreatePage(env, url));
      if (path === '/login') return html(renderPlatformLoginPage(env, url), 200, { 'cache-control': 'no-store' });

      return env.ASSETS.fetch(request);
    } catch (err) {
      console.error(err);
      return json({ error: 'Eroare internă: ' + err.message }, 500);
    }
  },
};

/* ---------- Creare eveniment ---------- */

async function createEvent(request, env, url) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'Date invalide.' }, 400); }
  if (body.website) return json({ ok: true, url: '/' }); // capcană pentru roboți

  const slug = String(body.slug || '').trim().toLowerCase();
  if (!isValidSlug(slug)) return json({ error: 'Adresa poate conține doar litere mici, cifre și cratime (3–40 caractere).' }, 400);
  if (!String(body.name1 || '').trim()) return json({ error: 'Completează numele.' }, 400);
  if (typeof body.password !== 'string' || body.password.length < 6) return json({ error: 'Parola trebuie să aibă cel puțin 6 caractere.' }, 400);
  if (await store.eventExists(env, slug)) return json({ error: 'Adresa aceasta e deja folosită. Alege alta.' }, 409);

  const secret = serverSecret(env);
  const ev = await store.buildEvent(env, secret, { ...body, slug });
  await store.putEvent(env, ev);

  const cookie = await sessionCookie(request, secret, ev);
  return json({ ok: true, url: `/e/${slug}`, adminUrl: `/e/${slug}/admin` }, 200, { 'set-cookie': cookie });
}

/* ---------- Rutele unui eveniment ---------- */

async function handleEvent(request, env, url, slug, rest, base) {
  const ev = await store.getEvent(env, slug);
  if (!ev) return html(notFoundPage(env), 404);
  const secret = serverSecret(env);
  const method = request.method;
  const brand = { name: env.BRAND_NAME || '', url: env.PLATFORM_URL || '/' };
  const publicBase = `/e/${slug}`;

  if (rest === '/' && method === 'GET') {
    let view = ev;
    if (url.searchParams.get('preview') === '1') {
      if (!(await validSession(request, secret, ev))) return html(renderLoginPage(ev, publicBase), 401);
      view = previewOverrides(ev, url.searchParams);
    }
    return html(renderGuestPage(view, { base, preview: view !== ev, brand, coverUrl: base + '/cover?v=' + encodeURIComponent(ev.updatedAt || '') }), 200, {
      'cache-control': 'no-store',
    });
  }

  if ((rest === '/cover' || rest === '/api/couple') && method === 'GET') {
    return await serveCover(env, ev, request, base);
  }

  if (rest === '/api/upload' && method === 'POST') return await handleUpload(request, env, url, ev);
  if (rest === '/api/usage' && method === 'GET') {
    const { used } = await store.usageOf(env, slug);
    return json({ used, max: ev.maxTotalBytes });
  }
  if (rest === '/api/message' && method === 'POST') return await handleMessage(request, env, ev);

  if (rest === '/print' && method === 'GET') {
    const qrUrl = env.ROOT_EVENT === slug && !(env.PLATFORM_HOST && url.hostname === env.PLATFORM_HOST)
      ? url.origin + '/'
      : url.origin + publicBase;
    const brandHost = (env.PLATFORM_URL || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
    return html(renderPrintPage(ev, { qrUrl, brand: { name: env.BRAND_NAME || '', host: brandHost } }));
  }

  // Galerie / slideshow: publice dacă evenimentul permite, altfel doar cu cheia din admin
  const galleryAllowed = ev.publicGallery || (await validSlideshowKey(secret, ev, url.searchParams.get('k')));
  if (rest === '/galerie' && method === 'GET') {
    if (!ev.publicGallery) return html(notFoundPage(env, 'Galeria nu este publică.'), 404);
    return html(renderGalleryPage(ev, { base: publicBase }));
  }
  if (rest === '/slideshow' && method === 'GET') {
    if (!galleryAllowed) return html(notFoundPage(env, 'Link de slideshow invalid.'), 404);
    const qrUrl = env.ROOT_EVENT === slug && !(env.PLATFORM_HOST && url.hostname === env.PLATFORM_HOST) ? url.origin + '/' : url.origin + publicBase;
    return html(renderSlideshowPage(ev, { base: publicBase, key: url.searchParams.get('k') || '', qrUrl }));
  }
  if (rest === '/api/gallery' && method === 'GET') {
    if (!galleryAllowed) return json({ error: 'Galeria nu este publică.' }, 403);
    const items = await store.listFiles(env, slug);
    return json({ items });
  }
  if (rest.startsWith('/file/') && method === 'GET') {
    if (!galleryAllowed) return json({ error: 'Galeria nu este publică.' }, 403);
    const key = decodeURIComponent(rest.slice('/file/'.length));
    return await serveObject(env, store.filesPrefix(slug) + key, false, request, key);
  }

  /* ----- Admin ----- */

  if (rest === '/admin/login' && method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch (e) {}
    if (!(await verifyPassword(secret, String(body.password || ''), ev.passwordHash))) {
      return json({ error: 'Parolă greșită.' }, 401);
    }
    return json({ ok: true }, 200, { 'set-cookie': await sessionCookie(request, secret, ev) });
  }
  if (rest === '/admin/logout' && method === 'POST') {
    return json({ ok: true }, 200, { 'set-cookie': cookieHeader(cookieName(slug), '', { path: publicBase, maxAge: 0, secure: isSecure(request) }) });
  }
  if (rest === '/admin' && method === 'GET') {
    if (!(await validSession(request, secret, ev))) return html(renderLoginPage(ev, publicBase), 401);
    const slideshowKey = await slideshowKeyFor(secret, ev);
    return html(renderAdminPage(ev, env, { base: publicBase, slideshowKey, origin: url.origin, rootEvent: env.ROOT_EVENT === slug }), 200, { 'cache-control': 'no-store' });
  }
  if (rest.startsWith('/admin/api/')) {
    if (!(await validSession(request, secret, ev))) return json({ error: 'Neautentificat.' }, 401);
    if (method !== 'GET' && !sameOrigin(request)) return json({ error: 'Cerere refuzată.' }, 403);
    return await handleAdminApi(request, env, url, ev, rest.slice('/admin/api'.length), secret);
  }

  return json({ error: 'Rută necunoscută.' }, 404);
}

function previewOverrides(ev, q) {
  const view = JSON.parse(JSON.stringify(ev));
  const s = {};
  for (const k of ['name1', 'name2', 'date', 'type', 'template']) if (q.has(k)) s[k] = q.get(k);
  const colors = {};
  for (const k of ['primary', 'accent', 'bg']) if (q.has(k)) colors[k] = q.get(k);
  if (Object.keys(colors).length) s.colors = colors;
  if (q.has('intro')) s.intro = q.get('intro') === '1';
  if (q.has('guestbook')) s.guestbook = q.get('guestbook') === '1';
  if (q.has('publicGallery')) s.publicGallery = q.get('publicGallery') === '1';
  const texts = {};
  for (const k of ['subtitle', 'footer', 'buttonText', 'buttonHint', 'introText', 'thanksText', 'guestbookTitle']) if (q.has('t_' + k)) texts[k] = q.get('t_' + k);
  if (Object.keys(texts).length) s.texts = texts;
  return store.applySettings(view, s);
}

/* ---------- Încărcare fișiere (invitați) ---------- */

async function handleUpload(request, env, url, ev) {
  const size = Number(request.headers.get('content-length') || 0);
  const maxFile = ev.maxFileBytes || store.fileLimit(env);
  if (!size) return json({ error: 'Fișier gol sau mărime necunoscută.' }, 411);
  if (size > maxFile) return json({ error: `Fișierul depășește limita de ${Math.round(maxFile / 1048576)} MB.` }, 413);

  const { used } = await store.usageOf(env, ev.slug);
  if (used + size > ev.maxTotalBytes) {
    return json({ error: 'Spațiul de stocare al evenimentului este plin. Mulțumim pentru toate amintirile!' }, 507);
  }

  const original = sanitizeName(url.searchParams.get('name') || 'amintire');
  const key = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${original}`;
  let contentType = request.headers.get('content-type') || '';
  if (!contentType || contentType === 'application/octet-stream') contentType = guessType(original);

  await env.PHOTOS.put(store.filesPrefix(ev.slug) + key, request.body, { httpMetadata: { contentType } });
  return json({ ok: true, key });
}

async function handleMessage(request, env, ev) {
  if (!ev.guestbook) return json({ error: 'Cartea de oaspeți nu este activă.' }, 403);
  let body = {};
  try { body = await request.json(); } catch (e) { return json({ error: 'Date invalide.' }, 400); }
  const name = String(body.name || '').trim().slice(0, 60);
  const text = String(body.text || '').trim().slice(0, 600);
  if (!name || !text) return json({ error: 'Completează numele și mesajul.' }, 400);
  const id = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  await env.PHOTOS.put(store.messagesPrefix(ev.slug) + id + '.json', JSON.stringify({ name, text, at: new Date().toISOString() }), {
    httpMetadata: { contentType: 'application/json' },
  });
  return json({ ok: true });
}

/* ---------- API-ul panoului de admin ---------- */

async function handleAdminApi(request, env, url, ev, sub, secret) {
  const method = request.method;
  const slug = ev.slug;

  if (sub === '/list' && method === 'GET') {
    const items = await store.listFiles(env, slug);
    const used = items.reduce((s, o) => s + o.size, 0);
    return json({ items, used, max: ev.maxTotalBytes });
  }

  if (sub.startsWith('/file/')) {
    const key = decodeURIComponent(sub.slice('/file/'.length));
    if (!key || key.includes('/')) return json({ error: 'Cheie invalidă.' }, 400);
    const fullKey = store.filesPrefix(slug) + key;
    if (method === 'GET') return await serveObject(env, fullKey, url.searchParams.has('download'), request, key);
    if (method === 'DELETE') { await env.PHOTOS.delete(fullKey); return json({ ok: true }); }
  }

  if (sub === '/settings') {
    if (method === 'GET') return json(store.publicEvent(ev));
    if (method === 'POST') {
      let body;
      try { body = await request.json(); } catch (e) { return json({ error: 'Date invalide.' }, 400); }
      store.applySettings(ev, body);
      await store.putEvent(env, ev);
      return json({ ok: true, event: store.publicEvent(ev) });
    }
  }

  if (sub === '/cover') {
    if (method === 'POST') {
      const size = Number(request.headers.get('content-length') || 0);
      if (!size) return json({ error: 'Fișier gol.' }, 411);
      if (size > 15 * 1048576) return json({ error: 'Poza principală trebuie să aibă sub 15 MB.' }, 413);
      await env.PHOTOS.put(store.coverKey(slug), request.body, {
        httpMetadata: { contentType: request.headers.get('content-type') || 'image/jpeg' },
      });
      await store.putEvent(env, ev); // actualizează updatedAt → invalidează cache-ul pozei
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      await env.PHOTOS.delete(store.coverKey(slug));
      await store.putEvent(env, ev);
      return json({ ok: true });
    }
  }

  if (sub === '/password' && method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch (e) {}
    if (typeof body.password !== 'string' || body.password.length < 6) return json({ error: 'Parola trebuie să aibă cel puțin 6 caractere.' }, 400);
    ev.passwordHash = await hashPassword(secret, body.password);
    await store.putEvent(env, ev);
    return json({ ok: true }, 200, { 'set-cookie': await sessionCookie(request, secret, ev) });
  }

  if (sub === '/messages' && method === 'GET') {
    return json({ items: await store.listMessages(env, slug) });
  }
  if (sub.startsWith('/message/') && method === 'DELETE') {
    const id = decodeURIComponent(sub.slice('/message/'.length));
    if (!/^[\w-]+$/.test(id)) return json({ error: 'ID invalid.' }, 400);
    await env.PHOTOS.delete(store.messagesPrefix(slug) + id + '.json');
    return json({ ok: true });
  }

  if (sub === '/delete-event' && method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch (e) {}
    if (body.confirm !== slug) return json({ error: 'Scrie adresa evenimentului pentru confirmare.' }, 400);
    const deleted = await store.deleteEvent(env, slug);
    return json({ ok: true, deleted }, 200, { 'set-cookie': cookieHeader(cookieName(slug), '', { path: `/e/${slug}`, maxAge: 0, secure: isSecure(request) }) });
  }

  return json({ error: 'Rută necunoscută.' }, 404);
}

/* ---------- Panoul proprietarului ---------- */

async function handleOwner(request, env, url) {
  const user = env.OWNER_USER || env.ADMIN_USER || 'admin';
  const pass = env.OWNER_PASS || env.ADMIN_PASS || '';
  const header = request.headers.get('authorization') || '';
  if (!pass || !timingSafeEqual(header, 'Basic ' + btoa(`${user}:${pass}`))) {
    return new Response('Autentificare necesară', {
      status: 401,
      headers: { 'www-authenticate': 'Basic realm="Proprietar platforma", charset="UTF-8"' },
    });
  }
  const path = url.pathname;
  const method = request.method;
  const secret = serverSecret(env);

  if (path === '/owner' && method === 'GET') {
    return html(renderOwnerPage(env, url), 200, { 'cache-control': 'no-store' });
  }

  if (path === '/owner/api/events' && method === 'GET') {
    const slugs = await store.listEventSlugs(env);
    const events = [];
    for (const slug of slugs) {
      const ev = await store.getEvent(env, slug);
      if (!ev) continue;
      const { used, count } = await store.usageOf(env, slug);
      events.push({ ...store.publicEvent(ev), used, count });
    }
    events.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    // Fișiere rămase la rădăcina bucket-ului (de dinaintea platformei)
    const legacy = await env.PHOTOS.list({ limit: 1000 });
    const legacyCount = legacy.objects.filter(o => !o.key.startsWith('ev/')).length;
    return json({ events, legacyCount, demoLimit: store.demoLimit(env), paidLimit: store.paidLimit(env) });
  }

  const m = /^\/owner\/api\/event\/([a-z0-9-]+)(\/login)?$/.exec(path);
  if (m) {
    const ev = await store.getEvent(env, m[1]);
    if (!ev) return json({ error: 'Evenimentul nu există.' }, 404);
    if (m[2] === '/login' && method === 'POST') {
      return json({ ok: true, adminUrl: `/e/${ev.slug}/admin` }, 200, { 'set-cookie': await sessionCookie(request, secret, ev) });
    }
    if (method === 'PATCH') {
      let body = {};
      try { body = await request.json(); } catch (e) {}
      if (body.plan === 'demo' || body.plan === 'paid') {
        ev.plan = body.plan;
        ev.maxTotalBytes = body.plan === 'paid' ? store.paidLimit(env) : store.demoLimit(env);
      }
      if (Number(body.maxTotalBytes) > 0) ev.maxTotalBytes = Number(body.maxTotalBytes);
      if (typeof body.note === 'string') ev.note = body.note.slice(0, 300);
      if (typeof body.password === 'string' && body.password.length >= 6) ev.passwordHash = await hashPassword(secret, body.password);
      await store.putEvent(env, ev);
      return json({ ok: true, event: store.publicEvent(ev) });
    }
    if (method === 'DELETE') {
      const deleted = await store.deleteEvent(env, ev.slug);
      return json({ ok: true, deleted });
    }
  }

  // Mută fișierele vechi de la rădăcina bucket-ului într-un eveniment (în loturi mici,
  // ca să rămânem sub limita de sub-cereri a unei singure cereri).
  if (path === '/owner/api/migrate-legacy' && method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch (e) {}
    const slug = String(body.slug || '').trim().toLowerCase();
    if (!isValidSlug(slug)) return json({ error: 'Adresă invalidă.' }, 400);
    let ev = await store.getEvent(env, slug);
    if (!ev) {
      if (!body.name1 || typeof body.password !== 'string' || body.password.length < 6) {
        return json({ error: 'Evenimentul nu există: dă-i un nume și o parolă (min. 6 caractere) ca să fie creat.' }, 400);
      }
      ev = await store.buildEvent(env, secret, { ...body, slug, template: 'smarald', type: body.type || 'nunta' });
      ev.plan = 'paid';
      ev.maxTotalBytes = store.paidLimit(env);
      await store.putEvent(env, ev);
    }
    const page = await env.PHOTOS.list({ limit: 200 });
    const legacyKeys = page.objects.filter(o => !o.key.startsWith('ev/')).map(o => o.key).slice(0, 8);
    let moved = 0;
    for (const key of legacyKeys) {
      const obj = await env.PHOTOS.get(key);
      if (!obj) continue;
      const target = key === '_couple' ? store.coverKey(slug) : store.filesPrefix(slug) + key;
      const { readable, writable } = new FixedLengthStream(obj.size);
      obj.body.pipeTo(writable);
      await env.PHOTOS.put(target, readable, { httpMetadata: obj.httpMetadata });
      await env.PHOTOS.delete(key);
      moved++;
    }
    const after = await env.PHOTOS.list({ limit: 1000 });
    const remaining = after.objects.filter(o => !o.key.startsWith('ev/')).length;
    return json({ ok: true, moved, remaining });
  }

  return json({ error: 'Rută necunoscută.' }, 404);
}

/* ---------- Sesiuni admin ---------- */

function cookieName(slug) { return 'adm_' + slug.replace(/-/g, '_'); }

async function sessionCookie(request, secret, ev) {
  const exp = Date.now() + 30 * 86400000;
  const sig = await hmacHex(secret, `adm:${ev.slug}:${exp}:${ev.passwordHash}`);
  return cookieHeader(cookieName(ev.slug), `${exp}.${sig}`, { path: `/e/${ev.slug}`, secure: isSecure(request) });
}

async function validSession(request, secret, ev) {
  const value = parseCookies(request)[cookieName(ev.slug)];
  if (!value) return false;
  const [exp, sig] = value.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = await hmacHex(secret, `adm:${ev.slug}:${exp}:${ev.passwordHash}`);
  return timingSafeEqual(sig, expected);
}

async function slideshowKeyFor(secret, ev) {
  return (await hmacHex(secret, `slideshow:${ev.slug}:${ev.passwordHash}`)).slice(0, 20);
}

async function validSlideshowKey(secret, ev, key) {
  if (!key) return false;
  return timingSafeEqual(key, await slideshowKeyFor(secret, ev));
}

function sameOrigin(request) {
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'none') return false;
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return false;
  return true;
}

/* ---------- Servirea obiectelor din R2 ---------- */

async function serveCover(env, ev, request, base) {
  const obj = await env.PHOTOS.get(store.coverKey(ev.slug));
  if (obj) {
    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set('etag', obj.httpEtag);
    headers.set('cache-control', 'public, max-age=300');
    return new Response(obj.body, { headers });
  }
  // Fără poză: pentru evenimentul rădăcină folosim couple.jpg din /public (dacă există),
  // altfel un placeholder generat în culorile evenimentului
  if (env.ROOT_EVENT === ev.slug) {
    const assetUrl = new URL(request.url);
    assetUrl.pathname = '/couple.jpg';
    const res = await env.ASSETS.fetch(new Request(assetUrl.toString(), { method: 'GET' }));
    if (res.ok) return res;
  }
  const pal = palette(normalizeColors(ev.template, ev.colors));
  const initials = [ev.name1, ev.name2].filter(Boolean).map(n => n.trim()[0] || '').join(' & ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${pal.c1l}"/><stop offset="1" stop-color="${pal.c1}"/></linearGradient></defs>
<rect width="400" height="500" fill="url(#g)"/>
<path d="M200 330 C120 270 90 220 110 180 C130 145 180 150 200 190 C220 150 270 145 290 180 C310 220 280 270 200 330 Z" fill="none" stroke="${pal.c1d}" stroke-width="3" opacity=".55"/>
<text x="200" y="250" text-anchor="middle" font-family="Georgia, serif" font-size="46" fill="${pal.c1d}" opacity=".85">${escapeHtml(initials)}</text>
<text x="200" y="420" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="16" fill="${pal.c1d}" opacity=".7">poza va apărea aici</text>
</svg>`;
  return new Response(svg, { headers: { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': 'no-store' } });
}

async function serveObject(env, key, forceDownload, request, downloadName) {
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
  const storedType = headers.get('content-type');
  if (!storedType || storedType === 'application/octet-stream') headers.set('content-type', guessType(key));
  headers.set('etag', obj.httpEtag);
  headers.set('accept-ranges', 'bytes');
  headers.set('cache-control', 'private, max-age=3600');
  if (forceDownload) headers.set('content-disposition', `attachment; filename="${(downloadName || key).replace(/"/g, '')}"`);

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

function notFoundPage(env, msg) {
  const brand = env.BRAND_NAME || 'Platforma';
  return `<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><title>Nu am găsit pagina</title>
<style>body{font-family:Georgia,serif;background:#faf8f3;color:#333;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center;padding:24px}h1{font-weight:normal;color:#0a4a3b}a{color:#0f6e57}</style></head>
<body><div><h1>${escapeHtml(msg || 'Evenimentul nu există (sau a fost șters).')}</h1><p><a href="/">${escapeHtml(brand)} — pagina principală</a></p></div></body></html>`;
}
