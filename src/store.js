/**
 * Stocarea evenimentelor în R2. Fiecare eveniment stă sub prefixul ev/<slug>/:
 *   ev/<slug>/_config.json   — configurația (nume, template, culori, parolă hash…)
 *   ev/<slug>/_cover         — poza de pe pagina principală
 *   ev/<slug>/f/<cheie>      — fișierele încărcate de invitați
 *   ev/<slug>/m/<id>.json    — mesajele din cartea de oaspeți
 */

import { hashPassword, isValidSlug } from './util.js';
import { DEFAULT_TEMPLATE, normalizeColors, defaultTexts, EVENT_TYPES, TEMPLATES } from './templates.js';

export const prefixOf = slug => `ev/${slug}/`;
export const configKey = slug => `ev/${slug}/_config.json`;
export const coverKey = slug => `ev/${slug}/_cover`;
export const filesPrefix = slug => `ev/${slug}/f/`;
export const messagesPrefix = slug => `ev/${slug}/m/`;

export async function getEvent(env, slug) {
  if (!isValidSlug(slug)) return null;
  const obj = await env.PHOTOS.get(configKey(slug));
  if (!obj) return null;
  try { return await obj.json(); } catch (e) { return null; }
}

export async function putEvent(env, ev) {
  ev.updatedAt = new Date().toISOString();
  await env.PHOTOS.put(configKey(ev.slug), JSON.stringify(ev), {
    httpMetadata: { contentType: 'application/json' },
  });
  return ev;
}

export async function eventExists(env, slug) {
  return !!(await env.PHOTOS.head(configKey(slug)));
}

export async function listEventSlugs(env) {
  const slugs = [];
  let cursor;
  do {
    const page = await env.PHOTOS.list({ prefix: 'ev/', delimiter: '/', cursor });
    for (const p of page.delimitedPrefixes || []) {
      const slug = p.slice(3, -1);
      if (slug) slugs.push(slug);
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return slugs;
}

export function demoLimit(env) { return Number(env.DEMO_MAX_BYTES || 524288000); }
export function paidLimit(env) { return Number(env.PAID_MAX_BYTES || 10737418240); }
export function fileLimit(env) { return Number(env.MAX_FILE_BYTES || 104857600); }

/** Construiește configurația unui eveniment nou din datele formularului. */
export async function buildEvent(env, secret, input) {
  const type = EVENT_TYPES[input.type] ? input.type : 'nunta';
  const template = TEMPLATES[input.template] ? input.template : DEFAULT_TEMPLATE;
  const name1 = String(input.name1 || '').trim().slice(0, 60);
  const name2 = String(input.name2 || '').trim().slice(0, 60);
  const texts = defaultTexts(type, name1, name2);
  return {
    slug: input.slug,
    type,
    name1,
    name2,
    date: String(input.date || '').trim().slice(0, 60),
    template,
    colors: normalizeColors(template, input.colors),
    intro: input.intro !== false,
    texts,
    guestbook: !!input.guestbook,
    publicGallery: !!input.publicGallery,
    plan: 'demo',
    maxTotalBytes: demoLimit(env),
    maxFileBytes: fileLimit(env),
    passwordHash: await hashPassword(secret, input.password),
    contact: String(input.contact || '').trim().slice(0, 120),
    createdAt: new Date().toISOString(),
    note: '',
  };
}

/** Aplică modificările permise din panoul de admin peste configurația existentă. */
export function applySettings(ev, input) {
  const s = input || {};
  if (typeof s.name1 === 'string') ev.name1 = s.name1.trim().slice(0, 60) || ev.name1;
  if (typeof s.name2 === 'string') ev.name2 = s.name2.trim().slice(0, 60);
  if (typeof s.date === 'string') ev.date = s.date.trim().slice(0, 60);
  if (EVENT_TYPES[s.type]) ev.type = s.type;
  if (TEMPLATES[s.template]) ev.template = s.template;
  if (s.colors) ev.colors = normalizeColors(ev.template, { ...ev.colors, ...s.colors });
  else ev.colors = normalizeColors(ev.template, ev.colors);
  if (typeof s.intro === 'boolean') ev.intro = s.intro;
  if (typeof s.guestbook === 'boolean') ev.guestbook = s.guestbook;
  if (typeof s.publicGallery === 'boolean') ev.publicGallery = s.publicGallery;
  if (typeof s.contact === 'string') ev.contact = s.contact.trim().slice(0, 120);
  if (s.texts && typeof s.texts === 'object') {
    ev.texts = ev.texts || {};
    for (const k of ['subtitle', 'footer', 'buttonText', 'buttonHint', 'introText', 'thanksText', 'cardInvite', 'cardScan', 'guestbookTitle']) {
      if (typeof s.texts[k] === 'string') ev.texts[k] = s.texts[k].trim().slice(0, k === 'cardScan' ? 240 : 140);
    }
  }
  return ev;
}

/** Datele publice ale evenimentului (fără parolă). */
export function publicEvent(ev) {
  const { passwordHash, ...rest } = ev;
  return rest;
}

/* ---------- Fișiere ---------- */

export async function listFiles(env, slug) {
  const items = [];
  const prefix = filesPrefix(slug);
  let cursor;
  do {
    const page = await env.PHOTOS.list({ prefix, cursor, include: ['httpMetadata'] });
    for (const obj of page.objects) {
      items.push({
        key: obj.key.slice(prefix.length),
        size: obj.size,
        uploaded: obj.uploaded,
        contentType: obj.httpMetadata?.contentType || '',
      });
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  items.sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));
  return items;
}

export async function usageOf(env, slug) {
  let used = 0, count = 0;
  const prefix = filesPrefix(slug);
  let cursor;
  do {
    const page = await env.PHOTOS.list({ prefix, cursor });
    for (const obj of page.objects) { used += obj.size; count++; }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return { used, count };
}

export async function listMessages(env, slug) {
  const items = [];
  const prefix = messagesPrefix(slug);
  let cursor;
  do {
    const page = await env.PHOTOS.list({ prefix, cursor });
    for (const obj of page.objects) items.push(obj.key);
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  items.sort().reverse();
  const out = [];
  for (const key of items.slice(0, 500)) {
    const obj = await env.PHOTOS.get(key);
    if (!obj) continue;
    try { out.push({ id: key.slice(prefix.length, -5), ...(await obj.json()) }); } catch (e) {}
  }
  return out;
}

/** Șterge tot ce ține de un eveniment (în loturi de 1000 de chei). */
export async function deleteEvent(env, slug) {
  const prefix = prefixOf(slug);
  let cursor, deleted = 0;
  do {
    const page = await env.PHOTOS.list({ prefix, cursor, limit: 1000 });
    const keys = page.objects.map(o => o.key);
    if (keys.length) { await env.PHOTOS.delete(keys); deleted += keys.length; }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return deleted;
}
