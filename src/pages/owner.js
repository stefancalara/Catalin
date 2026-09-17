/**
 * Panoul proprietarului platformei (/owner): toate evenimentele, planuri, migrare.
 */

import { escapeHtml, jsonForScript } from '../util.js';
import { EVENT_TYPES } from '../templates.js';

export function renderOwnerPage(env, url) {
  const brand = env.BRAND_NAME || 'PozeQR';
  const cfg = { eventTypes: EVENT_TYPES, rootEvent: env.ROOT_EVENT || '', origin: url.origin };
  return `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<title>Proprietar — ${escapeHtml(brand)}</title>
<meta name="robots" content="noindex">
<style>
  :root { --verde: #0f6e57; --verde-inchis: #0a4a3b; --crem: #faf7f2; --linie: #e2ddd2; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background: var(--crem); color: #333; }
  header { background: var(--verde-inchis); color: #fff; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; }
  header h1 { font-family: Georgia, serif; font-weight: normal; font-size: 1.25rem; }
  header a { color: #fff; font-size: .9rem; }
  .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
  .box { background: #fff; border: 1px solid var(--linie); border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; }
  .box h2 { font-size: 1.05rem; color: var(--verde-inchis); margin-bottom: 10px; }
  .help { font-size: .85rem; color: #777; margin-bottom: 10px; }
  .totals { display: flex; flex-wrap: wrap; gap: 24px; font-size: .95rem; }
  .totals b { color: var(--verde-inchis); font-size: 1.3rem; display: block; }
  table { width: 100%; border-collapse: collapse; font-size: .85rem; }
  th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #eee; vertical-align: top; }
  th { color: #777; font-weight: 600; font-size: .75rem; text-transform: uppercase; }
  .btn { background: var(--verde); color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-family: inherit; font-size: .8rem; text-decoration: none; display: inline-block; margin: 2px 2px 2px 0; }
  .btn.secondary { background: #fff; color: var(--verde-inchis); border: 1px solid var(--linie); }
  .btn.danger { background: #fff; color: #a33; border: 1px solid #e5c8c8; }
  .plan { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: .72rem; font-weight: 600; }
  .plan.demo { background: #fff3d6; color: #8a5a00; }
  .plan.paid { background: #dff3ea; color: #0a4a3b; }
  input[type=text], input[type=password] { font-family: inherit; font-size: .9rem; padding: 8px 10px; border: 1px solid var(--linie); border-radius: 8px; }
  .row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .msg { font-size: .85rem; color: var(--verde-inchis); }
  .msg.err { color: #a33; }
  .note { color: #888; font-size: .78rem; }
  code { background: #f4f1ea; padding: 2px 6px; border-radius: 4px; }
</style>
</head>
<body>
<header><h1>${escapeHtml(brand)} — panou proprietar</h1><a href="/">pagina publică ↗</a></header>
<div class="container">
  <div class="box totals" id="totals"></div>

  <div class="box">
    <h2>Evenimente</h2>
    <div style="overflow-x:auto"><table>
      <thead><tr><th>Eveniment</th><th>Tip</th><th>Creat</th><th>Plan</th><th>Fișiere</th><th>Spațiu</th><th>E-mail / contact / notă</th><th>Acțiuni</th></tr></thead>
      <tbody id="rows"></tbody>
    </table></div>
  </div>

  <div class="box" id="legacyBox" hidden>
    <h2>Fișiere vechi la rădăcina bucket-ului</h2>
    <p class="help">Există <b id="legacyCount"></b> fișiere încărcate înainte de platformă (direct în rădăcina bucket-ului). Mută-le într-un eveniment. Dacă evenimentul nu există încă, va fi creat cu datele de mai jos (template Smarald, plan activ). Se mută câte 8 pe rând, automat, până se termină.</p>
    <div class="row">
      <input type="text" id="mSlug" placeholder="adresa evenimentului (ex. larisa-si-catalin)" value="${escapeHtml(env.ROOT_EVENT || '')}" style="min-width:260px">
      <input type="text" id="mName1" placeholder="Nume 1 (ex. Larisa)">
      <input type="text" id="mName2" placeholder="Nume 2 (ex. Cătălin)">
      <input type="password" id="mPw" placeholder="parola admin (min. 6)">
      <button class="btn" id="mBtn">Mută fișierele</button>
      <span class="msg" id="mMsg"></span>
    </div>
  </div>

  <div class="box">
    <h2>Cum vinzi un eveniment</h2>
    <p class="help">Clientul își creează singur evenimentul pe <code>/creeaza</code> (plan demo, spațiu limitat). După ce plătește, apeși <b>Activează</b> aici: primește spațiul complet. Poți intra oricând în panoul unui eveniment cu <b>Admin</b>, fără parolă. Pentru a schimba limitele implicite sau textele de preț, editează <code>wrangler.toml</code>.</p>
  </div>
</div>
<script>
const CFG = ${jsonForScript(cfg)};
function $(id) { return document.getElementById(id); }
function fmt(b) { if (b >= 1073741824) return (b / 1073741824).toFixed(2) + ' GB'; if (b >= 1048576) return (b / 1048576).toFixed(1) + ' MB'; return Math.round(b / 1024) + ' KB'; }
async function api(path, opts) { const res = await fetch('/owner/api' + path, opts); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'Eroare ' + res.status); return data; }
function jsonReq(method, body) { return { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }; }

async function load() {
  const data = await api('/events');
  const totalUsed = data.events.reduce((s, e) => s + e.used, 0);
  const totalFiles = data.events.reduce((s, e) => s + e.count, 0);
  $('totals').innerHTML = '<div><b>' + data.events.length + '</b>evenimente</div><div><b>' + data.events.filter(e => e.plan === 'paid').length + '</b>active (plătite)</div><div><b>' + totalFiles + '</b>fișiere</div><div><b>' + fmt(totalUsed) + '</b>spațiu folosit</div>';
  const rows = $('rows'); rows.innerHTML = '';
  for (const e of data.events) {
    const tr = document.createElement('tr');
    const title = e.name2 ? e.name1 + ' & ' + e.name2 : e.name1;
    const isRoot = e.slug === CFG.rootEvent;
    tr.innerHTML =
      '<td><b></b><br><a href="/e/' + e.slug + '" target="_blank">/e/' + e.slug + '</a>' + (isRoot ? ' <span class="note">(rădăcină)</span>' : '') + '</td>' +
      '<td>' + (CFG.eventTypes[e.type] ? CFG.eventTypes[e.type].label : e.type) + '<br><span class="note">' + e.template + '</span></td>' +
      '<td>' + (e.createdAt ? new Date(e.createdAt).toLocaleDateString('ro-RO') : '') + (e.date ? '<br><span class="note">' + escapeHtml(e.date) + '</span>' : '') + '</td>' +
      '<td><span class="plan ' + e.plan + '">' + (e.plan === 'paid' ? 'activ' : 'demo') + '</span></td>' +
      '<td>' + e.count + '</td>' +
      '<td>' + fmt(e.used) + '<br><span class="note">din ' + fmt(e.maxTotalBytes) + '</span></td>' +
      '<td><span class="c"></span><br><span class="note n"></span></td>' +
      '<td>' +
        '<button class="btn" data-a="login">Admin</button>' +
        (e.plan === 'paid' ? '<button class="btn secondary" data-a="demo">→ demo</button>' : '<button class="btn" data-a="paid">Activează</button>') +
        '<button class="btn secondary" data-a="limit">Limită</button>' +
        '<button class="btn secondary" data-a="note">Notă</button>' +
        '<button class="btn secondary" data-a="email">E-mail</button>' +
        '<button class="btn secondary" data-a="pw">Parolă</button>' +
        '<button class="btn danger" data-a="del">Șterge</button>' +
      '</td>';
    tr.querySelector('b').textContent = title;
    tr.querySelector('.c').textContent = [e.email, e.contact].filter(Boolean).join(' · ') || '—';
    tr.querySelector('.n').textContent = e.note || '';
    tr.querySelectorAll('button').forEach(b => b.onclick = () => action(b.dataset.a, e));
    rows.appendChild(tr);
  }
  $('legacyBox').hidden = data.legacyCount === 0;
  $('legacyCount').textContent = data.legacyCount;
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

async function action(a, e) {
  try {
    if (a === 'login') { const r = await api('/event/' + e.slug + '/login', { method: 'POST' }); window.open(r.adminUrl, '_blank'); return; }
    if (a === 'paid' || a === 'demo') { await api('/event/' + e.slug, jsonReq('PATCH', { plan: a })); }
    if (a === 'limit') { const gb = prompt('Limita de spațiu în GB pentru ' + e.slug + ':', (e.maxTotalBytes / 1073741824).toFixed(1)); if (!gb) return; await api('/event/' + e.slug, jsonReq('PATCH', { maxTotalBytes: Math.round(Number(gb) * 1073741824) })); }
    if (a === 'note') { const n = prompt('Notă internă (plată, factură etc.):', e.note || ''); if (n === null) return; await api('/event/' + e.slug, jsonReq('PATCH', { note: n })); }
    if (a === 'email') { const v = prompt('E-mailul cu care clientul intră în panou:', e.email || ''); if (v === null) return; await api('/event/' + e.slug, jsonReq('PATCH', { email: v })); }
    if (a === 'pw') { const p = prompt('Parola nouă pentru panoul evenimentului (min. 6):'); if (!p) return; await api('/event/' + e.slug, jsonReq('PATCH', { password: p })); alert('Parola a fost schimbată.'); }
    if (a === 'del') { if (prompt('Șterge DEFINITIV evenimentul și toate fișierele. Scrie adresa pentru confirmare:') !== e.slug) return; await api('/event/' + e.slug, { method: 'DELETE' }); }
    load();
  } catch (err) { alert(err.message); }
}

$('mBtn').onclick = async () => {
  const msg = $('mMsg'); msg.className = 'msg'; $('mBtn').disabled = true;
  try {
    let total = 0;
    for (;;) {
      msg.textContent = 'Se mută… (' + total + ' mutate)';
      const r = await api('/migrate-legacy', jsonReq('POST', { slug: $('mSlug').value, name1: $('mName1').value, name2: $('mName2').value, password: $('mPw').value }));
      total += r.moved;
      if (r.remaining === 0 || r.moved === 0) { msg.textContent = 'Gata ✓ ' + total + ' fișiere mutate.'; break; }
    }
    load();
  } catch (err) { msg.className = 'msg err'; msg.textContent = err.message; }
  $('mBtn').disabled = false;
};

load();
</script>
</body>
</html>`;
}
