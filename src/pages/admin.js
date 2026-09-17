/**
 * Panoul de administrare al unui eveniment (+ pagina de login).
 */

import { escapeHtml, jsonForScript } from '../util.js';
import { TEMPLATES, EVENT_TYPES } from '../templates.js';
import { publicEvent } from '../store.js';

const SHELL_CSS = `
  :root { --verde: #0f6e57; --verde-inchis: #0a4a3b; --crem: #faf7f2; --linie: #e2ddd2; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: var(--crem); color: #333; }
  header { background: var(--verde); color: #fff; padding: 14px 20px; display: flex; flex-wrap: wrap; gap: 10px 20px; align-items: center; justify-content: space-between; }
  header h1 { font-family: Georgia, serif; font-weight: normal; font-size: 1.25rem; }
  header nav a, header nav button { color: #fff; opacity: .9; text-decoration: none; margin-left: 14px; font-size: .9rem; background: none; border: none; cursor: pointer; font-family: inherit; }
  header nav a:hover { opacity: 1; text-decoration: underline; }
  .container { max-width: 1100px; margin: 0 auto; padding: 20px; }
  .tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 18px; border-bottom: 1px solid var(--linie); }
  .tabs button { background: none; border: none; border-bottom: 3px solid transparent; padding: 10px 14px; font-family: inherit; font-size: .95rem; color: #555; cursor: pointer; }
  .tabs button.active { color: var(--verde-inchis); border-bottom-color: var(--verde); font-weight: 600; }
  .tab { display: none; } .tab.active { display: block; }
  .box { background: #fff; border: 1px solid var(--linie); border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; }
  .box h2 { font-size: 1.05rem; color: var(--verde-inchis); margin-bottom: 10px; }
  .box p.help { font-size: .85rem; color: #777; margin-bottom: 10px; }
  .btn { background: var(--verde); color: #fff; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-family: inherit; font-size: .95rem; text-decoration: none; display: inline-block; }
  .btn:hover { background: var(--verde-inchis); }
  .btn:disabled { opacity: .5; cursor: default; }
  .btn.secondary { background: #fff; color: var(--verde-inchis); border: 1px solid var(--linie); }
  .btn.danger { background: #fff; color: #a33; border: 1px solid #e5c8c8; }
  .btn.small { padding: 6px 12px; font-size: .85rem; }
  .stats { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between; }
  .bar { flex: 1 1 200px; height: 10px; background: #e9e4d9; border-radius: 5px; overflow: hidden; }
  .bar div { height: 100%; background: var(--verde); border-radius: 5px; width: 0; transition: width .5s; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 14px; }
  .card { background: #fff; border: 1px solid var(--linie); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
  .card .thumb { width: 100%; aspect-ratio: 1; object-fit: cover; background: #eee; display: block; }
  .card .thumb.ph { display: flex; align-items: center; justify-content: center; font-size: 2.6rem; color: #aaa; }
  .card .badge { position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,.55); color: #fff; font-size: .7rem; padding: 3px 8px; border-radius: 6px; }
  .card .thumb-wrap { position: relative; }
  .card .meta { padding: 8px 10px; font-size: .72rem; color: #666; word-break: break-all; }
  .card .actions { display: flex; border-top: 1px solid #eee; }
  .card .actions a, .card .actions button { flex: 1; padding: 8px; text-align: center; font-size: .8rem; border: none; background: none; cursor: pointer; color: var(--verde-inchis); text-decoration: none; font-family: inherit; }
  .card .actions button.del { color: #a33; }
  .card .actions a:hover, .card .actions button:hover { background: #f4f1ea; }
  .empty { text-align: center; color: #888; padding: 40px 0; }
  .msg { margin: 10px 0; color: var(--verde-inchis); font-size: .9rem; }
  .msg.err { color: #a33; }
  label.field { display: block; font-size: .85rem; color: #555; margin: 10px 0 4px; }
  input[type=text], input[type=password], input[type=url], textarea, select { width: 100%; font-family: inherit; font-size: .95rem; padding: 9px 12px; border: 1px solid var(--linie); border-radius: 8px; background: #fff; }
  textarea { min-height: 70px; resize: vertical; }
  .two { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
  @media (max-width: 640px) { .two { grid-template-columns: 1fr; } }
  .row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
  .toggle { display: flex; align-items: center; gap: 8px; font-size: .9rem; margin: 8px 0; cursor: pointer; }
  .toggle input { width: 18px; height: 18px; }
  .tpl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
  .tpl { border: 2px solid var(--linie); border-radius: 10px; padding: 10px; cursor: pointer; background: #fff; }
  .tpl.active { border-color: var(--verde); box-shadow: 0 0 0 3px rgba(15,110,87,.15); }
  .tpl .sw { display: flex; gap: 4px; margin-bottom: 8px; }
  .tpl .sw i { flex: 1; height: 22px; border-radius: 4px; display: block; }
  .tpl b { display: block; font-size: .9rem; color: var(--verde-inchis); }
  .tpl small { font-size: .72rem; color: #777; line-height: 1.3; display: block; }
  .presets { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
  .preset { display: flex; align-items: center; gap: 6px; border: 1px solid var(--linie); border-radius: 999px; padding: 4px 10px 4px 4px; cursor: pointer; font-size: .8rem; background: #fff; }
  .preset i { width: 18px; height: 18px; border-radius: 50%; display: inline-block; border: 1px solid rgba(0,0,0,.1); }
  .colors { display: flex; flex-wrap: wrap; gap: 16px; }
  .colors label { display: flex; flex-direction: column; gap: 4px; font-size: .8rem; color: #555; }
  .colors input[type=color] { width: 64px; height: 40px; border: 1px solid var(--linie); border-radius: 8px; padding: 2px; background: #fff; cursor: pointer; }
  .custom { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 20px; align-items: start; }
  @media (max-width: 900px) { .custom { grid-template-columns: 1fr; } }
  .preview { position: sticky; top: 16px; }
  .phone { width: 100%; max-width: 380px; aspect-ratio: 9 / 17; border: 10px solid #222; border-radius: 34px; overflow: hidden; background: #fff; box-shadow: 0 16px 40px rgba(0,0,0,.25); margin: 0 auto; }
  .phone iframe { width: 100%; height: 100%; border: none; display: block; }
  .preview .note { text-align: center; font-size: .78rem; color: #777; margin-top: 8px; }
  .link-box { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin: 8px 0; }
  .link-box code { background: #f4f1ea; padding: 8px 12px; border-radius: 8px; font-size: .85rem; word-break: break-all; flex: 1 1 200px; }
  .qr-preview { display: flex; gap: 20px; flex-wrap: wrap; align-items: center; }
  .qr-preview svg { width: 160px; height: 160px; border: 1px solid var(--linie); border-radius: 8px; }
  .message { border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between; gap: 12px; }
  .message b { color: var(--verde-inchis); }
  .message small { color: #999; }
  .message p { white-space: pre-wrap; font-size: .92rem; margin-top: 3px; }
  .zip-panel .row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
  .zip-panel .note { font-size: .85rem; color: #777; margin-top: 8px; }
  .zip-panel .links { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
  .zip-panel .links a { color: var(--verde-inchis); }
  .plan { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: .75rem; font-weight: 600; }
  .plan.demo { background: #fff3d6; color: #8a5a00; }
  .plan.paid { background: #dff3ea; color: #0a4a3b; }
`;

export function renderLoginPage(ev, base) {
  const title = ev.name2 ? `${ev.name1} & ${ev.name2}` : ev.name1;
  return `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<title>Admin — ${escapeHtml(title)}</title>
<meta name="robots" content="noindex">
<style>${SHELL_CSS}
  .login { max-width: 380px; margin: 60px auto; }
  .login h1 { font-family: Georgia, serif; font-weight: normal; color: var(--verde-inchis); text-align: center; margin-bottom: 6px; }
  .login p { text-align: center; color: #777; font-size: .9rem; margin-bottom: 18px; }
</style>
</head>
<body>
<div class="container">
  <div class="login box">
    <h1>${escapeHtml(title)}</h1>
    <p>Panoul de administrare al evenimentului</p>
    <form id="f">
      <label class="field">Parola</label>
      <input type="password" id="pw" autocomplete="current-password" autofocus required>
      <div class="msg err" id="err"></div>
      <button class="btn" type="submit" style="width:100%;margin-top:10px">Intră</button>
    </form>
    <p style="margin-top:16px"><a href="${escapeHtml(base)}">← pagina invitaților</a></p>
  </div>
</div>
<script>
document.getElementById('f').onsubmit = async (e) => {
  e.preventDefault();
  const err = document.getElementById('err');
  err.textContent = '';
  const res = await fetch(${jsonForScript(base + '/admin/login')}, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: document.getElementById('pw').value }) });
  if (res.ok) location.reload(); else err.textContent = (await res.json()).error || 'Eroare';
};
</script>
</body>
</html>`;
}

export function renderAdminPage(ev, env, opts) {
  const base = opts.base;
  const title = ev.name2 ? `${ev.name1} & ${ev.name2}` : ev.name1;
  const templates = {};
  for (const [id, t] of Object.entries(TEMPLATES)) templates[id] = { name: t.name, desc: t.desc, presets: t.presets, intro: t.intro };
  const publicUrl = opts.rootEvent ? opts.origin + '/' : opts.origin + base;
  const cfg = {
    base, api: base + '/admin/api', publicUrl, publicPath: base,
    printUrl: base + '/print', galleryUrl: base + '/galerie',
    slideshowUrl: base + '/slideshow?k=' + opts.slideshowKey,
    event: publicEvent(ev), templates, eventTypes: EVENT_TYPES,
    brand: env.BRAND_NAME || '', contact: env.CONTACT_TEXT || '',
    rootEvent: !!opts.rootEvent,
  };

  return `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<title>Admin — ${escapeHtml(title)}</title>
<meta name="robots" content="noindex">
<script src="/qrcode.js"></script>
<style>${SHELL_CSS}</style>
</head>
<body>
<header>
  <h1>${escapeHtml(title)} <span class="plan ${escapeHtml(ev.plan || 'demo')}" id="planBadge"></span></h1>
  <nav>
    <a href="${escapeHtml(publicUrl)}" target="_blank">Pagina invitaților ↗</a>
    <a href="${escapeHtml(base + '/print')}" target="_blank">Cartonașe QR ↗</a>
    <button id="logout">Ieșire</button>
  </nav>
</header>
<div class="container">
  <div class="tabs">
    <button data-tab="amintiri" class="active">📷 Amintiri</button>
    <button data-tab="personalizare">🎨 Personalizare</button>
    <button data-tab="qr">🔗 Cod QR &amp; linkuri</button>
    <button data-tab="mesaje">💌 Mesaje</button>
    <button data-tab="setari">⚙️ Setări</button>
  </div>

  <!-- ===== Amintiri ===== -->
  <div class="tab active" id="tab-amintiri">
    <div class="box stats">
      <span id="count">…</span>
      <div class="bar"><div id="barfill"></div></div>
      <span id="usage">…</span>
      <button class="btn" id="zipBtn">⬇ Descarcă tot (ZIP)</button>
    </div>
    <div class="box zip-panel" id="zipPanel" hidden>
      <h2>Descărcare totală</h2>
      <div class="row">
        <div class="bar"><div id="zipFill"></div></div>
        <span id="zipStatus">…</span>
        <button class="btn danger small" id="zipCancel">Anulează</button>
      </div>
      <div class="note" id="zipNote"></div>
      <div class="links" id="zipLinks"></div>
    </div>
    <div class="grid" id="grid"></div>
    <div class="empty" id="empty" hidden>Nicio amintire încărcată încă. Distribuie codul QR invitaților!</div>
  </div>

  <!-- ===== Personalizare ===== -->
  <div class="tab" id="tab-personalizare">
    <div class="custom">
      <div>
        <div class="box">
          <h2>Template</h2>
          <div class="tpl-grid" id="tplGrid"></div>
        </div>
        <div class="box">
          <h2>Culori</h2>
          <p class="help">Alege o paletă propusă pentru template sau setează-ți propriile culori.</p>
          <div class="presets" id="presets"></div>
          <div class="colors">
            <label>Principală<input type="color" id="c_primary"></label>
            <label>Accent<input type="color" id="c_accent"></label>
            <label>Fundal<input type="color" id="c_bg"></label>
          </div>
          <label class="toggle"><input type="checkbox" id="f_intro"> Animație de intrare (cadou / confetti / petale, în funcție de template)</label>
        </div>
        <div class="box">
          <h2>Poza principală</h2>
          <p class="help">Poza cu voi (sau cu sărbătoritul) de pe pagina invitaților. Ideal pe verticală, sub 15 MB.</p>
          <div class="row">
            <label class="btn secondary" for="coverInput">Alege poza</label>
            <input type="file" id="coverInput" accept="image/*" style="display:none">
            <button class="btn danger small" id="coverDelete">Șterge poza</button>
            <span class="msg" id="coverMsg"></span>
          </div>
        </div>
        <div class="box">
          <h2>Texte</h2>
          <div class="two">
            <div><label class="field">Tip eveniment</label><select id="f_type"></select></div>
            <div><label class="field">Data (text liber)</label><input type="text" id="f_date" placeholder="ex. 24 august 2026"></div>
            <div><label class="field">Nume 1</label><input type="text" id="f_name1" maxlength="60"></div>
            <div><label class="field">Nume 2 (opțional)</label><input type="text" id="f_name2" maxlength="60"></div>
          </div>
          <label class="field">Subtitlu</label><input type="text" id="t_subtitle" maxlength="140">
          <label class="field">Text pe buton</label><input type="text" id="t_buttonText" maxlength="60">
          <label class="field">Text mic deasupra butonului</label><input type="text" id="t_buttonHint" maxlength="100">
          <label class="field">Text la animația de intrare</label><input type="text" id="t_introText" maxlength="80">
          <label class="field">Mesaj de mulțumire după încărcare</label><input type="text" id="t_thanksText" maxlength="120">
          <label class="field">Text din subsol</label><input type="text" id="t_footer" maxlength="120">
        </div>
        <div class="box">
          <h2>Funcții pentru invitați</h2>
          <label class="toggle"><input type="checkbox" id="f_guestbook"> Carte de oaspeți — invitații pot lăsa un mesaj scris</label>
          <label class="field">Titlul cărții de oaspeți</label><input type="text" id="t_guestbookTitle" maxlength="80">
          <label class="toggle"><input type="checkbox" id="f_publicGallery"> Galerie publică — invitații pot vedea pozele încărcate de toți</label>
        </div>
        <div class="box">
          <h2>Cartonașe QR</h2>
          <label class="field">Invitația de pe cartonaș</label><textarea id="t_cardInvite" maxlength="140"></textarea>
          <label class="field">Instrucțiunea de scanare</label><textarea id="t_cardScan" maxlength="240"></textarea>
        </div>
        <div class="row" style="margin-bottom:20px">
          <button class="btn" id="saveBtn">Salvează modificările</button>
          <span class="msg" id="saveMsg"></span>
        </div>
      </div>
      <div class="preview">
        <div class="phone"><iframe id="previewFrame" title="Previzualizare"></iframe></div>
        <div class="note">Previzualizare live · se actualizează pe măsură ce modifici</div>
      </div>
    </div>
  </div>

  <!-- ===== QR & linkuri ===== -->
  <div class="tab" id="tab-qr">
    <div class="box">
      <h2>Adresa pentru invitați</h2>
      <div class="link-box"><code id="publicLink"></code><button class="btn secondary small" data-copy="publicLink">Copiază</button></div>
      <div class="qr-preview">
        <div id="qrSvg"></div>
        <div>
          <p class="help">Codul QR duce la pagina de mai sus. Pune-l pe mese, în invitații sau pe un afiș.</p>
          <div class="row">
            <a class="btn" href="${escapeHtml(base + '/print')}" target="_blank">🖨 Planșe A4 de printat</a>
            <button class="btn secondary" id="qrPng">⬇ QR ca PNG</button>
            <button class="btn secondary" id="qrSvgDl">⬇ QR ca SVG</button>
          </div>
        </div>
      </div>
    </div>
    <div class="box">
      <h2>Slideshow live pentru proiector / TV</h2>
      <p class="help">Deschide linkul pe laptopul conectat la proiector sau pe un TV cu browser. Pozele noi apar automat, fără să apeși nimic. Linkul e secret — nu-l pune pe cartonașe.</p>
      <div class="link-box"><code id="slideshowLink"></code><button class="btn secondary small" data-copy="slideshowLink">Copiază</button><a class="btn small" id="slideshowOpen" target="_blank">Deschide ↗</a></div>
    </div>
    <div class="box">
      <h2>Galeria publică</h2>
      <p class="help" id="galleryHelp"></p>
      <div class="link-box"><code id="galleryLink"></code><button class="btn secondary small" data-copy="galleryLink">Copiază</button></div>
    </div>
  </div>

  <!-- ===== Mesaje ===== -->
  <div class="tab" id="tab-mesaje">
    <div class="box">
      <h2>Mesaje din cartea de oaspeți</h2>
      <p class="help" id="msgHelp"></p>
      <div id="messages"></div>
      <div class="row" style="margin-top:12px"><button class="btn secondary small" id="msgExport">⬇ Exportă ca text</button></div>
    </div>
  </div>

  <!-- ===== Setări ===== -->
  <div class="tab" id="tab-setari">
    <div class="box">
      <h2>Plan și spațiu</h2>
      <p id="planInfo"></p>
      <p class="help" id="planContact"></p>
    </div>
    <div class="box">
      <h2>Schimbă parola</h2>
      <div class="two">
        <div><label class="field">Parola nouă (min. 6 caractere)</label><input type="password" id="pw1" autocomplete="new-password"></div>
        <div><label class="field">Repetă parola</label><input type="password" id="pw2" autocomplete="new-password"></div>
      </div>
      <div class="row" style="margin-top:10px"><button class="btn" id="pwBtn">Schimbă parola</button><span class="msg" id="pwMsg"></span></div>
    </div>
    <div class="box">
      <h2>Cont și contact</h2>
      <label class="field">E-mail de autentificare (cu el intri în panou, de pe pagina principală)</label>
      <input type="email" id="f_email" maxlength="120" autocomplete="email">
      <label class="field">Telefon sau alt contact (doar pentru noi, ca să te putem contacta)</label>
      <input type="text" id="f_contact" maxlength="120">
      <div class="row" style="margin-top:10px"><button class="btn secondary" id="contactBtn">Salvează</button><span class="msg" id="contactMsg"></span></div>
    </div>
    <div class="box">
      <h2 style="color:#a33">Șterge evenimentul</h2>
      <p class="help">Șterge definitiv pagina, toate pozele, clipurile și mesajele. Nu se poate anula. Scrie adresa evenimentului (<b id="slugEcho"></b>) pentru confirmare.</p>
      <div class="row"><input type="text" id="delConfirm" style="max-width:260px" placeholder="adresa evenimentului"><button class="btn danger" id="delBtn">Șterge definitiv</button><span class="msg err" id="delMsg"></span></div>
    </div>
  </div>
</div>

<script>
const CFG = ${jsonForScript(cfg)};
const API = CFG.api;
let ev = CFG.event;

function $(id) { return document.getElementById(id); }
function fmt(b) {
  if (b >= 1073741824) return (b / 1073741824).toFixed(2) + ' GB';
  if (b >= 1048576) return (b / 1048576).toFixed(1) + ' MB';
  return Math.round(b / 1024) + ' KB';
}
function approxPhotos(b) { return (Math.floor(b / (3.5 * 1048576) / 10) * 10).toLocaleString('ro-RO'); }
async function api(path, opts) {
  const res = await fetch(API + path, opts);
  let data = {};
  try { data = await res.json(); } catch (e) {}
  if (!res.ok) throw new Error(data.error || ('Eroare ' + res.status));
  return data;
}
function post(path, body) { return api(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); }

/* ---- Tab-uri ---- */
document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => {
  document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('active', x === b));
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.id === 'tab-' + b.dataset.tab));
  if (b.dataset.tab === 'personalizare') refreshPreview(true);
  if (b.dataset.tab === 'mesaje') loadMessages();
  history.replaceState(null, '', '#' + b.dataset.tab);
});
if (location.hash) { const b = document.querySelector('.tabs button[data-tab="' + location.hash.slice(1) + '"]'); if (b) b.click(); }
$('logout').onclick = async () => { await fetch(CFG.base + '/admin/logout', { method: 'POST' }); location.reload(); };

/* ---- Amintiri ---- */
let currentItems = [];
async function load() {
  const data = await api('/list');
  currentItems = data.items;
  $('count').textContent = data.items.length + ' fișiere';
  $('usage').textContent = fmt(data.used) + ' / ' + fmt(data.max);
  $('barfill').style.width = Math.min(100, data.used / data.max * 100) + '%';
  const grid = $('grid');
  grid.innerHTML = '';
  $('empty').hidden = data.items.length > 0;
  for (const item of data.items) {
    const fileUrl = API + '/file/' + encodeURIComponent(item.key);
    const card = document.createElement('div');
    card.className = 'card';
    const isVideo = item.contentType.startsWith('video/') || /\\.(mp4|m4v|mov|webm|mkv|avi|3gp|ts|mts|m2ts|mpg|mpeg|wmv)$/i.test(item.key);
    card.innerHTML =
      (isVideo
        ? '<div class="thumb-wrap"><video class="thumb" src="' + fileUrl + '#t=0.1" preload="metadata" controls muted playsinline></video><span class="badge">🎬 video</span></div>'
        : '<img class="thumb" src="' + fileUrl + '" loading="lazy" alt="">') +
      '<div class="meta">' + item.key + '<br>' + fmt(item.size) + ' · ' + new Date(item.uploaded).toLocaleString('ro-RO') + '</div>' +
      '<div class="actions"><a href="' + fileUrl + '?download" download>Descarcă</a><button class="del">Șterge</button></div>';
    const img = card.querySelector('img.thumb');
    if (img) {
      img.onerror = () => {
        const v = document.createElement('video');
        v.className = 'thumb'; v.src = fileUrl + '#t=0.1'; v.controls = true; v.muted = true; v.playsInline = true; v.preload = 'metadata';
        v.onerror = () => { const d = document.createElement('div'); d.className = 'thumb ph'; d.textContent = '🖼️'; v.replaceWith(d); };
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

/* ---- Descărcare totală (ZIP, construit în browser) ---- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(bytes) { let crc = 0xFFFFFFFF; for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8); return (crc ^ 0xFFFFFFFF) >>> 0; }
function dosDateTime(d) {
  const y = Math.max(1980, d.getFullYear());
  return { dosTime: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), dosDate: ((y - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate() };
}
class ZipWriter {
  constructor(sink) { this.sink = sink; this.offset = 0; this.entries = []; }
  async write(bytes) { await this.sink(bytes); this.offset += bytes.byteLength; }
  async addFile(name, data, date) {
    const nameBytes = new TextEncoder().encode(name);
    const crc = crc32(data); const size = data.byteLength;
    const { dosTime, dosDate } = dosDateTime(date);
    const h = new DataView(new ArrayBuffer(30 + nameBytes.length));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
    h.setUint16(10, dosTime, true); h.setUint16(12, dosDate, true); h.setUint32(14, crc, true); h.setUint32(18, size, true); h.setUint32(22, size, true);
    h.setUint16(26, nameBytes.length, true); h.setUint16(28, 0, true);
    new Uint8Array(h.buffer).set(nameBytes, 30);
    const offset = this.offset;
    await this.write(new Uint8Array(h.buffer)); await this.write(data);
    this.entries.push({ nameBytes, crc, size, dosTime, dosDate, offset });
  }
  async finish() {
    const cdStart = this.offset;
    for (const e of this.entries) {
      const zip64 = e.offset >= 0xFFFFFFFF; const extraLen = zip64 ? 12 : 0;
      const c = new DataView(new ArrayBuffer(46 + e.nameBytes.length + extraLen));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, zip64 ? 45 : 20, true); c.setUint16(6, zip64 ? 45 : 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
      c.setUint16(12, e.dosTime, true); c.setUint16(14, e.dosDate, true); c.setUint32(16, e.crc, true); c.setUint32(20, e.size, true); c.setUint32(24, e.size, true);
      c.setUint16(28, e.nameBytes.length, true); c.setUint16(30, extraLen, true); c.setUint16(32, 0, true); c.setUint16(34, 0, true); c.setUint16(36, 0, true); c.setUint32(38, 0, true);
      c.setUint32(42, zip64 ? 0xFFFFFFFF : e.offset, true);
      const u8 = new Uint8Array(c.buffer); u8.set(e.nameBytes, 46);
      if (zip64) { const p = 46 + e.nameBytes.length; c.setUint16(p, 0x0001, true); c.setUint16(p + 2, 8, true); c.setBigUint64(p + 4, BigInt(e.offset), true); }
      await this.write(u8);
    }
    const cdSize = this.offset - cdStart; const count = this.entries.length;
    if (cdStart >= 0xFFFFFFFF || cdSize >= 0xFFFFFFFF || count >= 0xFFFF) {
      const z = new DataView(new ArrayBuffer(76));
      z.setUint32(0, 0x06064b50, true); z.setBigUint64(4, BigInt(44), true); z.setUint16(12, 45, true); z.setUint16(14, 45, true); z.setUint32(16, 0, true); z.setUint32(20, 0, true);
      z.setBigUint64(24, BigInt(count), true); z.setBigUint64(32, BigInt(count), true); z.setBigUint64(40, BigInt(cdSize), true); z.setBigUint64(48, BigInt(cdStart), true);
      z.setUint32(56, 0x07064b50, true); z.setUint32(60, 0, true); z.setBigUint64(64, BigInt(this.offset), true); z.setUint32(72, 1, true);
      await this.write(new Uint8Array(z.buffer));
    }
    const e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(4, 0, true); e.setUint16(6, 0, true); e.setUint16(8, Math.min(count, 0xFFFF), true); e.setUint16(10, Math.min(count, 0xFFFF), true);
    e.setUint32(12, Math.min(cdSize, 0xFFFFFFFF), true); e.setUint32(16, Math.min(cdStart, 0xFFFFFFFF), true); e.setUint16(20, 0, true);
    await this.write(new Uint8Array(e.buffer));
  }
}
async function fetchBytes(url, signal) {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try { const res = await fetch(url, { signal }); if (!res.ok) throw new Error('HTTP ' + res.status); return new Uint8Array(await res.arrayBuffer()); }
    catch (err) { if (err.name === 'AbortError') throw err; lastErr = err; await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); }
  }
  throw lastErr;
}
const PART_LIMIT = 1024 * 1024 * 1024;
let zipAbort = null;
async function downloadAll() {
  const btn = $('zipBtn'), status = $('zipStatus'), fill = $('zipFill'), note = $('zipNote'), links = $('zipLinks');
  if (!currentItems.length) { alert('Nu există nicio amintire de descărcat.'); return; }
  let handlePromise = null;
  if (window.showSaveFilePicker) {
    handlePromise = window.showSaveFilePicker({ suggestedName: 'amintiri-' + ev.slug + '.zip', types: [{ description: 'Arhivă ZIP', accept: { 'application/zip': ['.zip'] } }] });
  }
  const controller = new AbortController();
  zipAbort = controller;
  btn.disabled = true; $('zipPanel').hidden = false; links.innerHTML = ''; note.textContent = ''; fill.style.width = '0%'; status.textContent = 'Se pregătește…';
  let writable = null;
  try {
    if (handlePromise) { const handle = await handlePromise; writable = await handle.createWritable(); }
    const items = (await api('/list')).items;
    items.sort((a, b) => new Date(a.uploaded) - new Date(b.uploaded));
    let messagesText = '';
    try {
      const m = (await api('/messages')).items;
      if (m.length) messagesText = m.map(x => new Date(x.at).toLocaleString('ro-RO') + ' — ' + x.name + ':\\n' + x.text).join('\\n\\n');
    } catch (e) {}
    const total = items.reduce((s, i) => s + i.size, 0);
    const multi = !writable && total > PART_LIMIT;
    if (!writable) note.textContent = multi ? 'Acest browser nu poate scrie arhiva direct pe disc, așa că va fi împărțită în părți de cel mult 1 GB. Pentru un singur fișier ZIP folosește Chrome sau Edge.' : 'Arhiva se construiește în memorie și se descarcă la final.';
    let chunks = [], partNo = 1, partBytes = 0, done = 0;
    const sink = writable ? (b) => writable.write(b) : (b) => { chunks.push(b); };
    let zip = new ZipWriter(sink);
    const flushPart = async () => {
      await zip.finish();
      const blob = new Blob(chunks, { type: 'application/zip' }); chunks = [];
      const name = 'amintiri-' + ev.slug + (multi ? '-partea-' + partNo : '') + '.zip';
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.textContent = '⬇ ' + name + ' (' + fmt(blob.size) + ')';
      links.appendChild(a); a.click();
    };
    for (let i = 0; i < items.length; i++) {
      if (controller.signal.aborted) throw new DOMException('Anulat', 'AbortError');
      const item = items[i];
      if (!writable && partBytes > 0 && partBytes + item.size > PART_LIMIT) { await flushPart(); partNo++; partBytes = 0; zip = new ZipWriter(sink); }
      status.textContent = 'Fișier ' + (i + 1) + ' / ' + items.length + ' · ' + fmt(done) + ' / ' + fmt(total) + (multi ? ' · partea ' + partNo : '');
      const data = await fetchBytes(API + '/file/' + encodeURIComponent(item.key), controller.signal);
      await zip.addFile(item.key, data, new Date(item.uploaded));
      done += item.size; partBytes += item.size;
      fill.style.width = (total ? done / total * 100 : 100) + '%';
    }
    if (messagesText) await zip.addFile('mesaje-carte-de-oaspeti.txt', new TextEncoder().encode(messagesText), new Date());
    if (writable) { await zip.finish(); await writable.close(); writable = null; } else { await flushPart(); }
    fill.style.width = '100%';
    status.textContent = 'Gata ✓ ' + items.length + ' fișiere, ' + fmt(done) + (multi ? ', în ' + partNo + ' părți' : '') + '.';
    if (!writable && links.children.length) note.textContent += ' Dacă descărcarea nu a pornit automat, apasă pe linkurile de mai jos.';
    else if (writable === null && handlePromise) note.textContent = 'Arhiva a fost salvată în locul ales în dialogul de salvare.';
  } catch (err) {
    if (writable) { try { await writable.abort(); } catch (e) {} }
    status.textContent = err.name === 'AbortError' ? 'Descărcare anulată.' : 'Eroare: ' + err.message;
  } finally { btn.disabled = false; zipAbort = null; }
}
$('zipBtn').onclick = downloadAll;
$('zipCancel').onclick = () => { if (zipAbort) zipAbort.abort(); };

/* ---- Personalizare ---- */
const TEXT_KEYS = ['subtitle', 'buttonText', 'buttonHint', 'introText', 'thanksText', 'footer', 'guestbookTitle', 'cardInvite', 'cardScan'];
function fillForm() {
  const sel = $('f_type'); sel.innerHTML = '';
  for (const [id, t] of Object.entries(CFG.eventTypes)) { const o = document.createElement('option'); o.value = id; o.textContent = t.emoji + ' ' + t.label; sel.appendChild(o); }
  sel.value = ev.type;
  $('f_date').value = ev.date || ''; $('f_name1').value = ev.name1 || ''; $('f_name2').value = ev.name2 || '';
  for (const k of TEXT_KEYS) $('t_' + k).value = (ev.texts && ev.texts[k]) || '';
  $('f_intro').checked = ev.intro !== false; $('f_guestbook').checked = !!ev.guestbook; $('f_publicGallery').checked = !!ev.publicGallery;
  $('c_primary').value = ev.colors.primary; $('c_accent').value = ev.colors.accent; $('c_bg').value = ev.colors.bg;
  $('f_contact').value = ev.contact || '';
  $('f_email').value = ev.email || '';
  renderTemplates();
}
function renderTemplates() {
  const g = $('tplGrid'); g.innerHTML = '';
  for (const [id, t] of Object.entries(CFG.templates)) {
    const d = document.createElement('div');
    d.className = 'tpl' + (id === ev.template ? ' active' : '');
    const p = t.presets[0];
    d.innerHTML = '<div class="sw"><i style="background:' + p.primary + '"></i><i style="background:' + p.accent + '"></i><i style="background:' + p.bg + ';border:1px solid #ddd"></i></div><b>' + t.name + '</b><small>' + t.desc + '</small>';
    d.onclick = () => {
      ev.template = id;
      const first = t.presets[0];
      ev.colors = { primary: first.primary, accent: first.accent, bg: first.bg };
      $('c_primary').value = first.primary; $('c_accent').value = first.accent; $('c_bg').value = first.bg;
      renderTemplates(); refreshPreview();
    };
    g.appendChild(d);
  }
  const pr = $('presets'); pr.innerHTML = '';
  for (const p of CFG.templates[ev.template].presets) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'preset';
    b.innerHTML = '<i style="background:' + p.primary + '"></i><i style="background:' + p.accent + '"></i><i style="background:' + p.bg + '"></i>' + p.name;
    b.onclick = () => { $('c_primary').value = p.primary; $('c_accent').value = p.accent; $('c_bg').value = p.bg; refreshPreview(); };
    pr.appendChild(b);
  }
}
function draft() {
  const texts = {};
  for (const k of TEXT_KEYS) texts[k] = $('t_' + k).value;
  return {
    type: $('f_type').value, template: ev.template, date: $('f_date').value, name1: $('f_name1').value, name2: $('f_name2').value,
    colors: { primary: $('c_primary').value, accent: $('c_accent').value, bg: $('c_bg').value },
    intro: $('f_intro').checked, guestbook: $('f_guestbook').checked, publicGallery: $('f_publicGallery').checked, texts,
  };
}
let previewTimer;
function refreshPreview(now) {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(() => {
    const d = draft();
    const q = new URLSearchParams({ preview: '1', template: d.template, type: d.type, name1: d.name1, name2: d.name2, date: d.date,
      primary: d.colors.primary, accent: d.colors.accent, bg: d.colors.bg, intro: d.intro ? '1' : '0', guestbook: d.guestbook ? '1' : '0', publicGallery: d.publicGallery ? '1' : '0' });
    for (const k of ['subtitle', 'footer', 'buttonText', 'buttonHint', 'introText', 'thanksText', 'guestbookTitle']) q.set('t_' + k, d.texts[k]);
    $('previewFrame').src = CFG.publicPath + '?' + q.toString();
  }, now ? 0 : 400);
}
document.querySelectorAll('#tab-personalizare input, #tab-personalizare select, #tab-personalizare textarea').forEach(el => {
  if (el.type === 'file') return;
  el.addEventListener('input', () => refreshPreview());
  el.addEventListener('change', () => refreshPreview());
});
$('saveBtn').onclick = async () => {
  const msg = $('saveMsg'); msg.className = 'msg'; msg.textContent = 'Se salvează…';
  try {
    const d = draft();
    const r = await post('/settings', d);
    ev = r.event; msg.textContent = 'Salvat ✓'; renderTemplates(); updateLinks();
  } catch (e) { msg.className = 'msg err'; msg.textContent = e.message; }
};
$('coverInput').onchange = async (e) => {
  const file = e.target.files[0]; if (!file) return;
  const msg = $('coverMsg'); msg.textContent = 'Se încarcă…';
  try {
    await api('/cover', { method: 'POST', headers: { 'content-type': file.type || 'image/jpeg' }, body: file });
    msg.textContent = 'Poza a fost actualizată ✓'; refreshPreview(true);
  } catch (err) { msg.textContent = err.message; }
};
$('coverDelete').onclick = async () => { if (!confirm('Ștergi poza principală?')) return; await api('/cover', { method: 'DELETE' }); $('coverMsg').textContent = 'Poza a fost ștearsă.'; refreshPreview(true); };

/* ---- QR & linkuri ---- */
function updateLinks() {
  $('publicLink').textContent = CFG.publicUrl;
  $('slideshowLink').textContent = location.origin + CFG.slideshowUrl;
  $('slideshowOpen').href = CFG.slideshowUrl;
  $('galleryLink').textContent = location.origin + CFG.galleryUrl;
  $('galleryHelp').textContent = ev.publicGallery ? 'Galeria e publică: invitații văd un link către ea pe pagina de încărcare.' : 'Galeria publică e dezactivată (o poți porni din Personalizare → Funcții pentru invitați). Linkul de mai jos funcționează doar când e activă.';
  $('slugEcho').textContent = ev.slug;
  $('planBadge').textContent = ev.plan === 'paid' ? 'activ' : 'demo';
  $('planBadge').className = 'plan ' + (ev.plan === 'paid' ? 'paid' : 'demo');
  $('planInfo').innerHTML = (ev.plan === 'paid' ? '<b>Plan activ</b>' : '<b>Plan demo</b>') + ' — spațiu disponibil: <b>' + fmt(ev.maxTotalBytes) + '</b> (aprox. ' + approxPhotos(ev.maxTotalBytes) + ' de poze), maxim ' + Math.round(ev.maxFileBytes / 1048576) + ' MB per fișier.';
  $('planContact').textContent = ev.plan === 'paid' ? '' : ('Planul demo e pentru testare. ' + (CFG.contact || 'Contactează-ne pentru activarea planului complet.'));
  $('msgHelp').textContent = ev.guestbook ? 'Mesajele lăsate de invitați pe pagina de încărcare.' : 'Cartea de oaspeți e dezactivată — o poți porni din Personalizare.';
  const qr = qrcode(0, 'M'); qr.addData(CFG.publicUrl); qr.make();
  $('qrSvg').innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
}
document.querySelectorAll('[data-copy]').forEach(b => b.onclick = async () => { await navigator.clipboard.writeText($(b.dataset.copy).textContent); b.textContent = 'Copiat ✓'; setTimeout(() => b.textContent = 'Copiază', 1500); });
$('qrSvgDl').onclick = () => {
  const qr = qrcode(0, 'M'); qr.addData(CFG.publicUrl); qr.make();
  const svg = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })); a.download = 'cod-qr-' + ev.slug + '.svg'; a.click();
};
$('qrPng').onclick = () => {
  const qr = qrcode(0, 'M'); qr.addData(CFG.publicUrl); qr.make();
  const svg = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
  const size = 1024, canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d'); const img = new Image();
  img.onload = () => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size); ctx.drawImage(img, 0, 0, size, size); const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = 'cod-qr-' + ev.slug + '.png'; a.click(); };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};

/* ---- Mesaje ---- */
let messagesCache = [];
async function loadMessages() {
  const box = $('messages'); box.innerHTML = '<p class="help">Se încarcă…</p>';
  messagesCache = (await api('/messages')).items;
  box.innerHTML = messagesCache.length ? '' : '<p class="help">Niciun mesaj încă.</p>';
  for (const m of messagesCache) {
    const d = document.createElement('div'); d.className = 'message';
    d.innerHTML = '<div><b></b> <small></small><p></p></div><button class="btn danger small">Șterge</button>';
    d.querySelector('b').textContent = m.name; d.querySelector('small').textContent = new Date(m.at).toLocaleString('ro-RO'); d.querySelector('p').textContent = m.text;
    d.querySelector('button').onclick = async () => { if (!confirm('Ștergi mesajul?')) return; await api('/message/' + encodeURIComponent(m.id), { method: 'DELETE' }); loadMessages(); };
    box.appendChild(d);
  }
}
$('msgExport').onclick = () => {
  const text = messagesCache.map(x => new Date(x.at).toLocaleString('ro-RO') + ' — ' + x.name + ':\\n' + x.text).join('\\n\\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); a.download = 'mesaje-' + ev.slug + '.txt'; a.click();
};

/* ---- Setări ---- */
$('pwBtn').onclick = async () => {
  const msg = $('pwMsg'); msg.className = 'msg';
  if ($('pw1').value !== $('pw2').value) { msg.className = 'msg err'; msg.textContent = 'Parolele nu coincid.'; return; }
  try { await post('/password', { password: $('pw1').value }); msg.textContent = 'Parola a fost schimbată ✓'; $('pw1').value = $('pw2').value = ''; }
  catch (e) { msg.className = 'msg err'; msg.textContent = e.message; }
};
$('contactBtn').onclick = async () => {
  const msg = $('contactMsg');
  try { const r = await post('/settings', { contact: $('f_contact').value, email: $('f_email').value }); ev = r.event; msg.textContent = 'Salvat ✓'; } catch (e) { msg.textContent = e.message; }
};
$('delBtn').onclick = async () => {
  const msg = $('delMsg');
  if ($('delConfirm').value !== ev.slug) { msg.textContent = 'Scrie exact adresa evenimentului.'; return; }
  if (!confirm('Ștergi DEFINITIV evenimentul și toate fișierele?')) return;
  try { await post('/delete-event', { confirm: ev.slug }); location.href = '/'; } catch (e) { msg.textContent = e.message; }
};

fillForm();
updateLinks();
load();
</script>
</body>
</html>`;
}
