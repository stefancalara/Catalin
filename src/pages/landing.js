/**
 * Pagina de prezentare a platformei (/).
 */

import { escapeHtml, approxPhotos } from '../util.js';
import { TEMPLATES } from '../templates.js';

export function renderLandingPage(env, url) {
  const brand = env.BRAND_NAME || 'PozeQR';
  const price = env.PRICE_TEXT || '249 lei';
  const demoBytes = Number(env.DEMO_MAX_BYTES || 314572800);
  const paidBytes = Number(env.PAID_MAX_BYTES || 10737418240);
  const demoMb = Math.round(demoBytes / 1048576);
  const paidGb = (paidBytes / 1073741824).toFixed(0);
  const demoPhotos = approxPhotos(demoBytes);
  const paidPhotos = approxPhotos(paidBytes);
  const contact = env.CONTACT_TEXT || '';
  const demoEvent = env.DEMO_EVENT ? `/e/${env.DEMO_EVENT}` : '';

  const templateCards = Object.entries(TEMPLATES).map(([id, t]) => {
    const p = t.presets[0];
    return `<div class="tpl"><div class="sw" style="background:${p.bg}"><i style="background:${p.primary}"></i><i style="background:${p.accent}"></i></div><b>${escapeHtml(t.name)}</b><small>${escapeHtml(t.desc)}</small></div>`;
  }).join('');

  return `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(brand)} — Cod QR pentru poze de la nuntă, botez sau eveniment</title>
<meta name="description" content="Colectează pozele și clipurile invitaților cu un simplu cod QR: fără aplicație, fără cont. Pagină personalizată cu template-uri și culori, cartonașe QR de printat, slideshow live, descărcare totală ZIP. ${escapeHtml(price)} per eveniment.">
<link rel="canonical" href="${escapeHtml(url.origin)}/">
<meta property="og:title" content="${escapeHtml(brand)} — Cod QR pentru poze de la nuntă">
<meta property="og:description" content="Invitații scanează codul QR și îți trimit pozele și clipurile direct de pe telefon. Fără aplicație, fără cont.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root { --verde: #0f6e57; --verde-inchis: #0a4a3b; --verde-pal: #d5e6df; --crem: #faf8f3; --auriu: #c9b287; --linie: #e2ddd2; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Montserrat', system-ui, sans-serif; background: var(--crem); color: #333b37; line-height: 1.5; }
  a { color: var(--verde); }
  header { padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; max-width: 1100px; margin: 0 auto; }
  .logo { font-family: 'Cormorant Garamond', serif; font-size: 1.7rem; color: var(--verde-inchis); text-decoration: none; font-weight: 600; }
  header nav a { margin-left: 18px; text-decoration: none; color: #555; font-size: .9rem; }
  header nav a.cta { background: var(--verde); color: #fff; padding: 9px 16px; border-radius: 999px; }
  .hero { max-width: 1100px; margin: 0 auto; padding: 40px 24px 30px; display: grid; grid-template-columns: 1.1fr .9fr; gap: 40px; align-items: center; }
  @media (max-width: 860px) { .hero { grid-template-columns: 1fr; } }
  .hero h1 { font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: clamp(2.2rem, 5vw, 3.6rem); line-height: 1.1; color: var(--verde-inchis); }
  .hero h1 em { font-style: italic; color: var(--verde); }
  .hero p { margin: 18px 0 26px; color: #5b615c; font-size: 1.05rem; max-width: 520px; }
  .btn { display: inline-block; background: linear-gradient(135deg, var(--verde), var(--verde-inchis)); color: #fff; text-decoration: none; padding: 16px 30px; border-radius: 999px; font-weight: 600; box-shadow: 0 8px 24px rgba(10,74,59,.3); }
  .btn.ghost { background: #fff; color: var(--verde-inchis); box-shadow: none; border: 1px solid var(--linie); margin-left: 10px; }
  .hero .fine { font-size: .8rem; color: #888; margin-top: 12px; }
  .mock { position: relative; display: flex; justify-content: center; }
  .phone { width: 250px; aspect-ratio: 9 / 18; border: 9px solid #222; border-radius: 34px; background: var(--crem); box-shadow: 0 24px 60px rgba(0,0,0,.28); overflow: hidden; display: flex; flex-direction: column; align-items: center; padding: 28px 16px; text-align: center; }
  .phone .fr { width: 120px; height: 150px; border-radius: 50% 50% 46% 46% / 40% 40% 56% 56%; background: linear-gradient(135deg, var(--verde-pal), #b7d4c8); border: 4px solid #fff; box-shadow: 0 8px 20px rgba(10,74,59,.25); }
  .phone h3 { font-family: 'Cormorant Garamond', serif; font-weight: 500; color: var(--verde-inchis); font-size: 1.5rem; margin-top: 14px; }
  .phone small { font-family: 'Cormorant Garamond', serif; font-style: italic; color: var(--verde); font-size: .9rem; }
  .phone .b { margin-top: 18px; background: var(--verde); color: #fff; border-radius: 999px; padding: 12px 22px; font-size: .8rem; font-weight: 600; }
  .card-qr { position: absolute; right: 0; bottom: 20px; background: #fff; border: 1px solid var(--auriu); padding: 12px; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,.15); transform: rotate(6deg); width: 130px; text-align: center; font-family: 'Cormorant Garamond', serif; color: var(--verde-inchis); }
  .card-qr .q { width: 80px; height: 80px; margin: 6px auto; background: repeating-conic-gradient(#0a4a3b 0 25%, #fff 0 50%) 0 0 / 16px 16px; border: 3px solid #fff; outline: 1px solid #0a4a3b; }
  section { max-width: 1100px; margin: 0 auto; padding: 44px 24px; }
  section h2 { font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 2.1rem; color: var(--verde-inchis); text-align: center; margin-bottom: 8px; }
  section .sub { text-align: center; color: #6b716c; margin-bottom: 30px; }
  .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 18px; }
  .step { background: #fff; border: 1px solid var(--linie); border-radius: 16px; padding: 22px; }
  .step .n { width: 34px; height: 34px; border-radius: 50%; background: var(--verde); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 600; margin-bottom: 12px; }
  .step h3 { font-size: 1.05rem; color: var(--verde-inchis); margin-bottom: 6px; }
  .step p { font-size: .9rem; color: #5b615c; }
  .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 14px; }
  .feat { background: #fff; border: 1px solid var(--linie); border-radius: 14px; padding: 18px; display: flex; gap: 12px; }
  .feat .i { font-size: 1.5rem; flex: none; }
  .feat b { display: block; color: var(--verde-inchis); margin-bottom: 3px; }
  .feat span { font-size: .88rem; color: #5b615c; }
  .tpls { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
  .tpl { background: #fff; border: 1px solid var(--linie); border-radius: 14px; padding: 12px; }
  .tpl .sw { height: 70px; border-radius: 10px; display: flex; align-items: flex-end; justify-content: center; gap: 6px; padding: 10px; margin-bottom: 8px; border: 1px solid rgba(0,0,0,.05); }
  .tpl .sw i { width: 28px; height: 28px; border-radius: 50%; display: block; box-shadow: 0 2px 6px rgba(0,0,0,.15); }
  .tpl b { display: block; color: var(--verde-inchis); font-size: .95rem; }
  .tpl small { color: #777; font-size: .75rem; line-height: 1.3; display: block; }
  .pricing { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; max-width: 760px; margin: 0 auto; }
  .plan { background: #fff; border: 1px solid var(--linie); border-radius: 18px; padding: 26px; text-align: center; }
  .plan.main { border: 2px solid var(--verde); position: relative; }
  .plan.main::before { content: 'Recomandat'; position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--verde); color: #fff; font-size: .72rem; padding: 3px 12px; border-radius: 999px; }
  .plan h3 { font-size: 1.1rem; color: var(--verde-inchis); }
  .plan .p { font-family: 'Cormorant Garamond', serif; font-size: 2.6rem; color: var(--verde-inchis); margin: 8px 0; }
  .plan .p small { font-size: 1rem; color: #888; font-family: 'Montserrat', sans-serif; }
  .plan ul { list-style: none; text-align: left; font-size: .9rem; color: #5b615c; margin: 14px 0 20px; }
  .plan li { padding: 5px 0; padding-left: 22px; position: relative; }
  .plan li::before { content: '✓'; color: var(--verde); position: absolute; left: 0; }
  .faq { max-width: 760px; margin: 0 auto; }
  .faq details { background: #fff; border: 1px solid var(--linie); border-radius: 12px; padding: 14px 18px; margin-bottom: 10px; }
  .faq summary { cursor: pointer; font-weight: 600; color: var(--verde-inchis); }
  .faq p { margin-top: 8px; font-size: .92rem; color: #5b615c; }
  .final { text-align: center; padding: 50px 24px 70px; }
  footer { border-top: 1px solid var(--linie); padding: 22px; text-align: center; font-size: .8rem; color: #888; }
</style>
</head>
<body>
<header>
  <a class="logo" href="/">${escapeHtml(brand)}</a>
  <nav><a href="#cum">Cum funcționează</a><a href="#template">Template-uri</a><a href="#pret">Preț</a><a class="cta" href="/creeaza">Creează gratuit</a></nav>
</header>

<div class="hero">
  <div>
    <h1>Toate pozele de la <em>nunta ta</em>, trimise de invitați printr-un cod QR</h1>
    <p>Pui cartonașul cu cod QR pe mese. Invitații scanează, aleg pozele și clipurile din telefon și gata — apar în albumul vostru. Fără aplicație, fără cont, fără limite de invitați.</p>
    <a class="btn" href="/creeaza">Creează pagina ta →</a>
    ${demoEvent ? `<a class="btn ghost" href="${escapeHtml(demoEvent)}" target="_blank">Vezi un exemplu</a>` : ''}
    <div class="fine">Gata în 2 minute · ${demoMb} MB gratuit pentru testare (aprox. ${demoPhotos} de poze) · nunți, botezuri, majorate, evenimente de firmă</div>
  </div>
  <div class="mock">
    <div class="phone">
      <div class="fr"></div>
      <h3>Larisa &amp; Cătălin</h3>
      <small>Ajută-ne să păstrăm fiecare clipă</small>
      <div class="b">⬆ Încarcă aici</div>
    </div>
    <div class="card-qr">Scanează și<br>încarcă pozele<div class="q"></div><small>Larisa &amp; Cătălin</small></div>
  </div>
</div>

<section id="cum">
  <h2>Cum funcționează</h2>
  <p class="sub">Trei pași, zero bătăi de cap.</p>
  <div class="steps">
    <div class="step"><div class="n">1</div><h3>Creezi pagina</h3><p>Alegi template-ul, culorile, pui poza voastră și textele. Primești imediat linkul și codul QR.</p></div>
    <div class="step"><div class="n">2</div><h3>Printezi cartonașele</h3><p>Planșe A4 gata de tăiat și îndoit, în stilul paginii. Le pui pe mese, în invitații sau pe un afiș.</p></div>
    <div class="step"><div class="n">3</div><h3>Invitații scanează și încarcă</h3><p>Din galeria telefonului, mai multe poze și clipuri deodată, la calitate originală. Tu le vezi live și le descarci pe toate într-un ZIP.</p></div>
  </div>
</section>

<section id="functii">
  <h2>Tot ce ai nevoie, într-un singur loc</h2>
  <p class="sub">Fără abonament, fără aplicații de instalat pentru invitați.</p>
  <div class="features">
    <div class="feat"><div class="i">📱</div><div><b>Fără aplicație, fără cont</b><span>Invitații scanează și încarcă direct din browser, pe iPhone și Android.</span></div></div>
    <div class="feat"><div class="i">🎬</div><div><b>Poze și clipuri, calitate originală</b><span>Fără compresie, fără limită de durată la video. Până la 100 MB per fișier.</span></div></div>
    <div class="feat"><div class="i">🎨</div><div><b>6 template-uri, culorile tale</b><span>Alegi stilul, paleta sau propriile culori și vezi rezultatul live, pe măsură ce modifici.</span></div></div>
    <div class="feat"><div class="i">🖨️</div><div><b>Cartonașe QR de printat</b><span>4 planșe A4 în stilul paginii: pliate pentru mese, mari sau mici de tăiat. Plus QR ca PNG/SVG pentru invitații.</span></div></div>
    <div class="feat"><div class="i">📺</div><div><b>Slideshow live în sală</b><span>Pozele noi apar automat pe proiector sau TV, cu codul QR în colț ca să încarce și ceilalți.</span></div></div>
    <div class="feat"><div class="i">💌</div><div><b>Carte de oaspeți</b><span>Invitații pot lăsa un mesaj scris, pe care îl primești și în arhiva finală.</span></div></div>
    <div class="feat"><div class="i">⬇️</div><div><b>Descarcă tot într-un ZIP</b><span>Toate fișierele, cu numele și datele originale, dintr-un singur click.</span></div></div>
    <div class="feat"><div class="i">🔒</div><div><b>Galerie privată sau publică</b><span>Tu decizi dacă invitații văd ce au încărcat ceilalți. Panou de administrare protejat cu parolă.</span></div></div>
    <div class="feat"><div class="i">🎉</div><div><b>Pentru orice eveniment</b><span>Nuntă, botez, majorat, aniversare sau eveniment de firmă — texte și stiluri potrivite fiecăruia.</span></div></div>
  </div>
</section>

<section id="template">
  <h2>Template-uri</h2>
  <p class="sub">Fiecare merge cu orice paletă de culori. Poza, textele și animația de intrare sunt ale tale.</p>
  <div class="tpls">${templateCards}</div>
</section>

<section id="pret">
  <h2>Preț simplu</h2>
  <p class="sub">O singură plată per eveniment. Fără abonament.</p>
  <div class="pricing">
    <div class="plan">
      <h3>Demo</h3>
      <div class="p">0 lei</div>
      <ul><li>Toate funcțiile, pentru testare</li><li>${demoMb} MB spațiu — aprox. ${demoPhotos} de poze</li><li>Pagină, QR și panou de administrare</li></ul>
      <a class="btn ghost" style="margin:0" href="/creeaza">Începe gratuit</a>
    </div>
    <div class="plan main">
      <h3>Eveniment</h3>
      <div class="p">${escapeHtml(price)}<small> / eveniment</small></div>
      <ul><li>${paidGb} GB spațiu — aprox. ${paidPhotos} de poze, sau poze și clipuri</li><li>Invitați nelimitați</li><li>Slideshow live, carte de oaspeți, galerie</li><li>Descărcare totală ZIP</li><li>Fișierele păstrate 12 luni</li></ul>
      <a class="btn" href="/creeaza">Creează evenimentul</a>
      <p style="font-size:.78rem;color:#888;margin-top:12px">${escapeHtml(contact || 'Activezi planul complet din panoul de administrare, după ce testezi.')}</p>
    </div>
  </div>
</section>

<section>
  <h2>Întrebări frecvente</h2>
  <div class="faq">
    <details><summary>Invitații trebuie să instaleze ceva?</summary><p>Nu. Scanează codul QR cu camera telefonului, se deschide pagina în browser și aleg pozele din galerie. Merge pe iPhone și Android.</p></details>
    <details><summary>Pozele se comprimă?</summary><p>Nu. Fișierele se păstrează exact cum au fost încărcate, inclusiv clipurile video, până la 100 MB per fișier.</p></details>
    <details><summary>Cât timp rămân pozele?</summary><p>12 luni de la eveniment. Le poți descărca oricând pe toate într-un singur ZIP, iar la final poți șterge evenimentul.</p></details>
    <details><summary>Pot folosi pentru botez, majorat sau un eveniment de firmă?</summary><p>Da. Alegi tipul evenimentului la creare și primești texte și template-uri potrivite. Poți schimba totul oricând.</p></details>
    <details><summary>Cum pun codul QR pe mese?</summary><p>Din panoul de administrare descarci planșe A4 în stilul paginii, gata de printat pe hârtie cartonată: cartonașe pliate, un afiș mare sau 6 cartonașe mici. Primești și codul QR ca imagine pentru invitații.</p></details>
    <details><summary>Cum văd pozele în timp real la petrecere?</summary><p>Ai un link secret de slideshow pe care îl deschizi pe laptopul de la proiector sau pe TV. Pozele noi apar singure, iar în colț e codul QR.</p></details>
  </div>
</section>

<div class="final">
  <h2 style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:2rem;color:var(--verde-inchis)">Începe acum, gratuit</h2>
  <p style="color:#6b716c;margin:10px 0 20px">Pagina ta e gata în 2 minute.</p>
  <a class="btn" href="/creeaza">Creează pagina ta →</a>
</div>
<footer>© ${new Date().getFullYear()} ${escapeHtml(brand)} · ${escapeHtml(contact || '')}</footer>
</body>
</html>`;
}
