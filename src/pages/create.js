/**
 * Pagina de creare a unui eveniment nou (/creeaza).
 */

import { escapeHtml, jsonForScript } from '../util.js';
import { TEMPLATES, EVENT_TYPES, DEFAULT_TEMPLATE } from '../templates.js';

export function renderCreatePage(env, url) {
  const brand = env.BRAND_NAME || 'PozeQR';
  const templates = {};
  for (const [id, t] of Object.entries(TEMPLATES)) templates[id] = { name: t.name, desc: t.desc, presets: t.presets };
  const cfg = { templates, eventTypes: EVENT_TYPES, defaultTemplate: DEFAULT_TEMPLATE, origin: url.origin, demoMb: Math.round(Number(env.DEMO_MAX_BYTES || 524288000) / 1048576) };

  return `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Creează evenimentul tău — ${escapeHtml(brand)}</title>
<meta name="description" content="Creează în 2 minute pagina cu cod QR prin care invitații îți trimit pozele și clipurile de la nuntă, botez sau orice eveniment.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root { --verde: #0f6e57; --verde-inchis: #0a4a3b; --crem: #faf8f3; --auriu: #c9b287; --linie: #e2ddd2; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Montserrat', system-ui, sans-serif; background: var(--crem); color: #333b37; }
  header { padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
  header a.logo { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; color: var(--verde-inchis); text-decoration: none; font-weight: 600; }
  header a.back { color: var(--verde); font-size: .9rem; text-decoration: none; }
  .wrap { max-width: 760px; margin: 0 auto; padding: 10px 20px 60px; }
  h1 { font-family: 'Cormorant Garamond', serif; font-weight: 600; color: var(--verde-inchis); font-size: 2.2rem; margin-bottom: 6px; }
  .lead { color: #6b716c; margin-bottom: 24px; font-size: .95rem; }
  .step { background: #fff; border: 1px solid var(--linie); border-radius: 14px; padding: 20px 22px; margin-bottom: 18px; }
  .step h2 { font-size: 1rem; color: var(--verde-inchis); margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
  .step h2 span { background: var(--verde); color: #fff; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: .8rem; }
  label.field { display: block; font-size: .82rem; color: #555; margin: 10px 0 4px; }
  input[type=text], input[type=password] { width: 100%; font-family: inherit; font-size: 1rem; padding: 11px 13px; border: 1px solid var(--linie); border-radius: 10px; background: #fff; }
  input:focus { outline: 2px solid rgba(15,110,87,.25); border-color: var(--verde); }
  .two { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
  @media (max-width: 560px) { .two { grid-template-columns: 1fr; } }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip { border: 1px solid var(--linie); border-radius: 999px; padding: 8px 14px; cursor: pointer; background: #fff; font-family: inherit; font-size: .9rem; }
  .chip.active { border-color: var(--verde); background: var(--verde); color: #fff; }
  .tpl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
  .tpl { border: 2px solid var(--linie); border-radius: 12px; padding: 10px; cursor: pointer; background: #fff; }
  .tpl.active { border-color: var(--verde); box-shadow: 0 0 0 3px rgba(15,110,87,.15); }
  .tpl .sw { display: flex; gap: 4px; margin-bottom: 8px; }
  .tpl .sw i { flex: 1; height: 24px; border-radius: 5px; display: block; }
  .tpl b { display: block; font-size: .9rem; color: var(--verde-inchis); }
  .tpl small { font-size: .72rem; color: #777; line-height: 1.3; display: block; }
  .presets { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 6px; }
  .preset { display: flex; align-items: center; gap: 6px; border: 1px solid var(--linie); border-radius: 999px; padding: 4px 10px 4px 4px; cursor: pointer; font-size: .8rem; background: #fff; font-family: inherit; }
  .preset.active { border-color: var(--verde); }
  .preset i { width: 18px; height: 18px; border-radius: 50%; display: inline-block; border: 1px solid rgba(0,0,0,.1); }
  .colors { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 8px; }
  .colors label { display: flex; flex-direction: column; gap: 4px; font-size: .78rem; color: #555; }
  .colors input[type=color] { width: 60px; height: 38px; border: 1px solid var(--linie); border-radius: 8px; padding: 2px; background: #fff; cursor: pointer; }
  .slug-box { display: flex; align-items: center; border: 1px solid var(--linie); border-radius: 10px; background: #fff; overflow: hidden; }
  .slug-box span { padding: 11px 0 11px 13px; color: #888; font-size: .9rem; white-space: nowrap; }
  .slug-box input { border: none; border-radius: 0; flex: 1; min-width: 0; }
  .slug-box input:focus { outline: none; }
  .slug-status { font-size: .8rem; margin-top: 6px; min-height: 1.2em; }
  .slug-status.ok { color: var(--verde); } .slug-status.bad { color: #a33; }
  .toggle { display: flex; align-items: center; gap: 8px; font-size: .9rem; margin: 8px 0; cursor: pointer; }
  .toggle input { width: 18px; height: 18px; }
  .btn { background: linear-gradient(135deg, var(--verde), var(--verde-inchis)); color: #fff; border: none; padding: 16px 32px; border-radius: 999px; cursor: pointer; font-family: inherit; font-size: 1.05rem; font-weight: 600; box-shadow: 0 8px 24px rgba(10,74,59,.3); width: 100%; }
  .btn:disabled { opacity: .6; cursor: wait; }
  .err { color: #a33; font-size: .9rem; margin-top: 10px; min-height: 1.2em; }
  .fine { font-size: .78rem; color: #888; margin-top: 12px; text-align: center; }
  .hp { position: absolute; left: -9999px; }
</style>
</head>
<body>
<header><a class="logo" href="/">${escapeHtml(brand)}</a><a class="back" href="/">← înapoi</a></header>
<div class="wrap">
  <h1>Creează evenimentul tău</h1>
  <p class="lead">Durează 2 minute. Primești imediat pagina, codul QR și panoul de administrare. Începi cu ${cfg.demoMb} MB gratuit pentru testare.</p>
  <form id="f" autocomplete="off">
    <div class="step">
      <h2><span>1</span> Ce sărbătorești?</h2>
      <div class="chips" id="types"></div>
      <div class="two">
        <div><label class="field" id="lbl1">Numele miresei</label><input type="text" id="name1" maxlength="60" required></div>
        <div><label class="field" id="lbl2">Numele mirelui</label><input type="text" id="name2" maxlength="60"></div>
      </div>
      <label class="field">Data evenimentului (opțional, text liber)</label>
      <input type="text" id="date" maxlength="60" placeholder="ex. 24 august 2026">
    </div>

    <div class="step">
      <h2><span>2</span> Adresa paginii</h2>
      <div class="slug-box"><span>${escapeHtml(url.origin)}/e/</span><input type="text" id="slug" maxlength="40" pattern="[a-z0-9-]+" placeholder="larisa-si-catalin" required></div>
      <div class="slug-status" id="slugStatus"></div>
    </div>

    <div class="step">
      <h2><span>3</span> Alege stilul</h2>
      <div class="tpl-grid" id="tplGrid"></div>
      <div class="presets" id="presets"></div>
      <div class="colors">
        <label>Principală<input type="color" id="c_primary"></label>
        <label>Accent<input type="color" id="c_accent"></label>
        <label>Fundal<input type="color" id="c_bg"></label>
      </div>
      <p class="fine" style="text-align:left">Poți schimba oricând template-ul, culorile, textele și poza din panoul de administrare, cu previzualizare live.</p>
    </div>

    <div class="step">
      <h2><span>4</span> Funcții pentru invitați</h2>
      <label class="toggle"><input type="checkbox" id="guestbook" checked> Carte de oaspeți — invitații pot lăsa un mesaj scris</label>
      <label class="toggle"><input type="checkbox" id="publicGallery"> Galerie publică — invitații văd pozele încărcate de toți</label>
    </div>

    <div class="step">
      <h2><span>5</span> Parola panoului de administrare</h2>
      <div class="two">
        <div><label class="field">Parola (min. 6 caractere)</label><input type="password" id="pw1" minlength="6" required autocomplete="new-password"></div>
        <div><label class="field">Repetă parola</label><input type="password" id="pw2" minlength="6" required autocomplete="new-password"></div>
      </div>
      <label class="field">E-mail sau telefon de contact (opțional — pentru activarea planului complet)</label>
      <input type="text" id="contact" maxlength="120">
      <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off">
    </div>

    <button class="btn" type="submit" id="submit">Creează pagina și codul QR →</button>
    <div class="err" id="err"></div>
    <p class="fine">Nu ai nevoie de card. Planul demo are ${cfg.demoMb} MB; activarea planului complet se face după ce testezi.</p>
  </form>
</div>
<script>
const CFG = ${jsonForScript(cfg)};
function $(id) { return document.getElementById(id); }
let type = 'nunta', template = CFG.defaultTemplate;

const LABELS = { nunta: ['Numele miresei', 'Numele mirelui'], botez: ['Numele copilului', 'Al doilea nume (opțional)'], majorat: ['Numele sărbătoritului', '(opțional)'], aniversare: ['Numele sărbătoritului', 'Al doilea nume (opțional)'], corporate: ['Numele evenimentului / firmei', '(opțional)'], alt: ['Numele evenimentului', '(opțional)'] };
function renderTypes() {
  const box = $('types'); box.innerHTML = '';
  for (const [id, t] of Object.entries(CFG.eventTypes)) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (id === type ? ' active' : ''); b.textContent = t.emoji + ' ' + t.label;
    b.onclick = () => { type = id; renderTypes(); if (id === 'majorat' || id === 'aniversare') pickTemplate('petrecere'); if (id === 'corporate') pickTemplate('modern'); if (id === 'botez') pickTemplate('romantic'); };
    box.appendChild(b);
  }
  $('lbl1').textContent = LABELS[type][0]; $('lbl2').textContent = LABELS[type][1];
}
function pickTemplate(id) { template = id; const p = CFG.templates[id].presets[0]; setColors(p); renderTemplates(); }
function setColors(p) { $('c_primary').value = p.primary; $('c_accent').value = p.accent; $('c_bg').value = p.bg; }
function renderTemplates() {
  const g = $('tplGrid'); g.innerHTML = '';
  for (const [id, t] of Object.entries(CFG.templates)) {
    const d = document.createElement('div'); d.className = 'tpl' + (id === template ? ' active' : '');
    const p = t.presets[0];
    d.innerHTML = '<div class="sw"><i style="background:' + p.primary + '"></i><i style="background:' + p.accent + '"></i><i style="background:' + p.bg + ';border:1px solid #ddd"></i></div><b>' + t.name + '</b><small>' + t.desc + '</small>';
    d.onclick = () => pickTemplate(id);
    g.appendChild(d);
  }
  const pr = $('presets'); pr.innerHTML = '';
  for (const p of CFG.templates[template].presets) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'preset';
    b.innerHTML = '<i style="background:' + p.primary + '"></i><i style="background:' + p.accent + '"></i><i style="background:' + p.bg + '"></i>' + p.name;
    b.onclick = () => setColors(p);
    pr.appendChild(b);
  }
}
function slugify(s) {
  return s.toLowerCase().replace(/ă/g, 'a').replace(/â/g, 'a').replace(/î/g, 'i').replace(/[șş]/g, 's').replace(/[țţ]/g, 't').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/&/g, ' si ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/-+$/g, '');
}
let slugTouched = false, slugTimer, slugOk = false;
function suggestSlug() {
  if (slugTouched) return;
  const n1 = $('name1').value.trim(), n2 = $('name2').value.trim();
  $('slug').value = slugify(n2 ? n1 + ' si ' + n2 : n1);
  checkSlug();
}
function checkSlug() {
  clearTimeout(slugTimer);
  const st = $('slugStatus'); const v = $('slug').value.trim().toLowerCase(); $('slug').value = v;
  slugOk = false;
  if (!v) { st.textContent = ''; return; }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v) || v.length < 3) { st.className = 'slug-status bad'; st.textContent = 'Doar litere mici, cifre și cratime, minim 3 caractere.'; return; }
  st.className = 'slug-status'; st.textContent = 'Se verifică…';
  slugTimer = setTimeout(async () => {
    const r = await fetch('/api/slug-check?slug=' + encodeURIComponent(v)).then(r => r.json());
    if (r.ok) { slugOk = true; st.className = 'slug-status ok'; st.textContent = '✓ Adresa e liberă: ' + CFG.origin + '/e/' + v; }
    else { st.className = 'slug-status bad'; st.textContent = r.reason === 'invalid' ? 'Adresa nu e permisă.' : 'Adresa e deja folosită — încearcă alta.'; }
  }, 350);
}
$('name1').addEventListener('input', suggestSlug);
$('name2').addEventListener('input', suggestSlug);
$('slug').addEventListener('input', () => { slugTouched = true; checkSlug(); });

$('f').onsubmit = async (e) => {
  e.preventDefault();
  const err = $('err'); err.textContent = '';
  if ($('pw1').value !== $('pw2').value) { err.textContent = 'Parolele nu coincid.'; return; }
  const btn = $('submit'); btn.disabled = true; btn.textContent = 'Se creează…';
  try {
    const res = await fetch('/api/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
      type, template, name1: $('name1').value, name2: $('name2').value, date: $('date').value, slug: $('slug').value,
      colors: { primary: $('c_primary').value, accent: $('c_accent').value, bg: $('c_bg').value },
      guestbook: $('guestbook').checked, publicGallery: $('publicGallery').checked,
      password: $('pw1').value, contact: $('contact').value, website: document.querySelector('.hp').value,
    }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Eroare');
    location.href = data.adminUrl + '#personalizare';
  } catch (ex) { err.textContent = ex.message; btn.disabled = false; btn.textContent = 'Creează pagina și codul QR →'; }
};

renderTypes();
pickTemplate(template);
</script>
</body>
</html>`;
}
