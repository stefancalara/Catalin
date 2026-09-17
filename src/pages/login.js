import { escapeHtml } from '../util.js';

/* Pagina de autentificare a platformei: clientul introduce adresa evenimentului
   (sau doar numele scurt) și parola aleasă la creare, apoi ajunge în panoul lui. */
export function renderLoginPage(env, url) {
  const brand = env.BRAND_NAME || 'PozeQR';
  const prefill = /^[a-z0-9-]{3,40}$/.test(url.searchParams.get('e') || '') ? url.searchParams.get('e') : '';
  return `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<title>Intră în panoul evenimentului — ${escapeHtml(brand)}</title>
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root { --verde: #0f6e57; --verde-inchis: #0a4a3b; --crem: #faf8f3; --linie: #e2ddd2; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Montserrat', system-ui, sans-serif; background: var(--crem); color: #333b37; line-height: 1.5; min-height: 100vh; display: flex; flex-direction: column; }
  header { padding: 18px 24px; max-width: 1100px; width: 100%; margin: 0 auto; }
  .logo { font-family: 'Cormorant Garamond', serif; font-size: 1.7rem; color: var(--verde-inchis); text-decoration: none; font-weight: 600; }
  main { flex: 1; display: flex; align-items: flex-start; justify-content: center; padding: 24px 16px 60px; }
  .card { background: #fff; border: 1px solid var(--linie); border-radius: 18px; padding: 32px 28px; width: 100%; max-width: 440px; box-shadow: 0 10px 40px rgba(15,110,87,.06); }
  h1 { font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 2rem; color: var(--verde-inchis); line-height: 1.15; }
  .sub { color: #5b615c; font-size: .95rem; margin: 8px 0 22px; }
  label { display: block; font-size: .8rem; font-weight: 600; color: #4a524d; margin: 14px 0 6px; }
  input:not([type=checkbox]) { width: 100%; font: inherit; font-size: 1rem; padding: 11px 12px; border: 1px solid var(--linie); border-radius: 10px; background: #fff; color: inherit; }
  input:focus { outline: 2px solid var(--verde); outline-offset: -1px; }
  .btn { display: block; width: 100%; margin-top: 22px; background: var(--verde); color: #fff; border: 0; border-radius: 999px; padding: 13px 18px; font: inherit; font-weight: 600; font-size: 1rem; cursor: pointer; }
  .btn:disabled { opacity: .6; cursor: default; }
  .err { color: #b3261e; font-size: .9rem; margin-top: 12px; min-height: 1.3em; }
  .foot { text-align: center; font-size: .9rem; color: #5b615c; margin-top: 22px; }
  .foot a { color: var(--verde); }
  .help { font-size: .8rem; color: #8a918c; margin-top: 6px; }
</style>
</head>
<body>
<header><a class="logo" href="/">${escapeHtml(brand)}</a></header>
<main>
  <form class="card" id="f">
    <h1>Intră în panoul evenimentului</h1>
    <p class="sub" id="sub">Folosește e-mailul și parola alese când ai creat pagina.</p>

    <div id="modeEmail">
      <label for="email">E-mail</label>
      <input id="email" name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="none" spellcheck="false" placeholder="nume@exemplu.ro">
    </div>
    <div id="modeSlug" hidden>
      <label for="slug">Adresa evenimentului</label>
      <input id="slug" name="username" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="numele-evenimentului" value="${escapeHtml(prefill)}">
      <p class="help">Partea de după <b>/e/</b> din linkul paginii tale, sau linkul complet.</p>
    </div>

    <label for="pw">Parola</label>
    <input id="pw" name="password" type="password" autocomplete="current-password" required>
    <button class="btn" id="submit" type="submit">Intră în panou →</button>
    <div class="err" id="err" aria-live="polite"></div>

    <div id="choose" hidden>
      <p class="sub">Ai mai multe evenimente pe acest e-mail. Alege unul:</p>
      <div id="chooseList"></div>
    </div>

    <p class="foot"><a href="#" id="toggle">Intră cu adresa evenimentului în loc de e-mail</a></p>
    <p class="foot">Nu ai încă un eveniment? <a href="/creeaza">Creează unul gratuit</a></p>
  </form>
</main>
<script>
const $ = (id) => document.getElementById(id);
let mode = ${prefill ? "'slug'" : "'email'"};
function setMode(m) {
  mode = m;
  $('modeEmail').hidden = m !== 'email';
  $('modeSlug').hidden = m !== 'slug';
  $('email').required = m === 'email';
  $('slug').required = m === 'slug';
  $('sub').textContent = m === 'email' ? 'Folosește e-mailul și parola alese când ai creat pagina.' : 'Pentru paginile create fără e-mail: adresa paginii și parola.';
  $('toggle').textContent = m === 'email' ? 'Intră cu adresa evenimentului în loc de e-mail' : 'Intră cu e-mail și parolă';
  $('err').textContent = ''; $('choose').hidden = true;
}
$('toggle').onclick = (e) => { e.preventDefault(); setMode(mode === 'email' ? 'slug' : 'email'); };
setMode(mode);

function toSlug(v) {
  v = String(v || '').trim().toLowerCase();
  const m = /\\/e\\/([a-z0-9-]+)/.exec(v);
  if (m) return m[1];
  return v.replace(/^https?:\\/\\//, '').replace(/^[^/]*\\//, '').replace(/[?#].*$/, '').replace(/\\/.*$/, '');
}
$('slug').addEventListener('blur', () => { const s = toSlug($('slug').value); if (s) $('slug').value = s; });

async function loginSlug(slug, password) {
  const res = await fetch('/e/' + slug + '/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password }) });
  if (res.status === 404) throw new Error('Nu există niciun eveniment la adresa aceasta.');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Nu am putut intra. Încearcă din nou.');
  return '/e/' + slug + '/admin';
}

$('f').onsubmit = async (e) => {
  e.preventDefault();
  const err = $('err'); err.textContent = ''; $('choose').hidden = true;
  const password = $('pw').value;
  const btn = $('submit'); btn.disabled = true; btn.textContent = 'Se verifică…';
  try {
    if (mode === 'slug') {
      const slug = toSlug($('slug').value);
      if (!/^[a-z0-9-]{3,40}$/.test(slug)) throw new Error('Adresa nu arată bine. Introdu doar numele scurt, de exemplu ana-si-mihai.');
      location.href = await loginSlug(slug, password);
      return;
    }
    const res = await fetch('/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: $('email').value, password }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Nu am putut intra. Încearcă din nou.');
    if (data.adminUrl) { location.href = data.adminUrl; return; }
    const list = $('chooseList'); list.innerHTML = '';
    for (const ev of data.choose || []) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.style.marginTop = '10px';
      b.textContent = (ev.name || ev.slug) + ' →';
      b.onclick = async () => { try { location.href = await loginSlug(ev.slug, password); } catch (ex) { err.textContent = ex.message; } };
      list.appendChild(b);
    }
    $('choose').hidden = false;
    btn.disabled = false; btn.textContent = 'Intră în panou →';
  } catch (ex) { err.textContent = ex.message; btn.disabled = false; btn.textContent = 'Intră în panou →'; }
};
</script>
</body>
</html>`;
}
