/**
 * Template-urile paginii pentru invitați + paginile derivate (cartonașe QR, galerie).
 * Toate culorile vin din variabile CSS calculate din cele 3 culori alese de client
 * (principală, accent, fundal), așa că orice template merge cu orice paletă.
 */

import { escapeHtml, jsonForScript, shade, isDark, rgbaFromHex, isHex } from './util.js';

/* ---------- Tipuri de eveniment ---------- */

export const EVENT_TYPES = {
  nunta:      { label: 'Nuntă',            word: 'nunta noastră',      emoji: '💍' },
  botez:      { label: 'Botez',            word: 'botez',              emoji: '👶' },
  majorat:    { label: 'Majorat',          word: 'majoratul meu',      emoji: '🎂' },
  aniversare: { label: 'Aniversare',       word: 'petrecerea noastră', emoji: '🎉' },
  corporate:  { label: 'Eveniment firmă',  word: 'evenimentul nostru', emoji: '🏢' },
  alt:        { label: 'Alt eveniment',    word: 'evenimentul nostru', emoji: '✨' },
};

export function defaultTexts(type, name1, name2) {
  const t = EVENT_TYPES[type] || EVENT_TYPES.alt;
  const names = name2 ? `${name1} & ${name2}` : name1;
  const base = {
    subtitle: 'Ajută-ne să păstrăm fiecare clipă a acestei zile',
    footer: `Cu drag, ${names} ✦`,
    buttonText: 'Încarcă aici',
    buttonHint: '📸 Poți selecta mai multe poze și clipuri deodată!',
    introText: 'Un cadou pentru amintirile noastre…',
    thanksText: 'Mulțumim! Amintirea ta a fost încărcată ♥',
    cardInvite: 'Împarte cu noi\namintirile tale',
    cardScan: `Scanează codul cu camera telefonului și încarcă pozele și videoclipurile tale de la ${t.word}`,
    guestbookTitle: 'Lasă-ne un mesaj',
  };
  if (type === 'botez') {
    base.subtitle = `Ajută-ne să păstrăm amintirile de la botezul lui ${name1}`;
    base.cardScan = `Scanează codul cu camera telefonului și încarcă pozele și videoclipurile tale de la botezul lui ${name1}`;
    base.footer = `Cu drag, familia lui ${name1} ✦`;
  } else if (type === 'majorat') {
    base.subtitle = 'Hai să păstrăm fiecare moment din seara asta!';
    base.introText = 'Petrecerea începe…';
    base.thanksText = 'Mersi! Poza ta e în album 🎉';
    base.footer = `${names} · 18 ✦`;
  } else if (type === 'aniversare') {
    base.subtitle = 'Hai să păstrăm împreună amintirile acestei zile';
    base.introText = 'Surpriză…';
  } else if (type === 'corporate') {
    base.subtitle = 'Încarcă pozele și clipurile tale de la eveniment';
    base.introText = 'Bine ai venit!';
    base.thanksText = 'Mulțumim! Fișierul a fost încărcat.';
    base.cardInvite = 'Împărtășește\nmomentele tale';
    base.footer = `${names}`;
  }
  return base;
}

/* ---------- Template-uri ---------- */

export const TEMPLATES = {
  smarald: {
    name: 'Smarald',
    desc: 'Satin verde și auriu, cu un cadou care se desface la intrare.',
    fonts: 'family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Montserrat:wght@300;400;500;600',
    heading: "'Cormorant Garamond', Georgia, serif",
    body: "'Montserrat', 'Helvetica Neue', Arial, sans-serif",
    intro: 'gift',
    ornament: '✦ ✦ ✦',
    divider: '❦',
    presets: [
      { name: 'Smarald', primary: '#0f6e57', accent: '#c9b287', bg: '#faf8f3' },
      { name: 'Bordo', primary: '#7a1f2e', accent: '#d4b06a', bg: '#fbf6f1' },
      { name: 'Navy', primary: '#1d3557', accent: '#c9a96e', bg: '#f7f8fa' },
      { name: 'Prună', primary: '#5b2a5e', accent: '#d9b98a', bg: '#faf6fb' },
    ],
    css: `
      .photo-frame { border-radius: 50% 50% 46% 46% / 40% 40% 56% 56%; border: 6px solid var(--card); }
      h1 .amp { font-style: italic; color: var(--c1); }
      .upload-btn { background: linear-gradient(135deg, var(--c1) 0%, var(--c1d) 100%); border-radius: 999px; }
    `,
  },
  clasic: {
    name: 'Clasic',
    desc: 'Alb, auriu și serif elegant. Sobru, atemporal.',
    fonts: 'family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Lato:wght@300;400;700',
    heading: "'Playfair Display', Georgia, serif",
    body: "'Lato', 'Helvetica Neue', Arial, sans-serif",
    intro: 'fade',
    ornament: '— ✦ —',
    divider: '✦',
    presets: [
      { name: 'Auriu', primary: '#2b2b2b', accent: '#b8975a', bg: '#ffffff' },
      { name: 'Sage', primary: '#5f7161', accent: '#b8a47a', bg: '#f8f8f4' },
      { name: 'Dusty blue', primary: '#4b6584', accent: '#c8b48a', bg: '#f9fafb' },
      { name: 'Negru', primary: '#111111', accent: '#9a9a9a', bg: '#ffffff' },
    ],
    css: `
      .photo-frame { border-radius: 50%; aspect-ratio: 1; width: min(66vw, 290px, 32vh); border: 2px solid var(--acc); outline: 1px solid var(--acc); outline-offset: 6px; box-shadow: none; }
      h1 { letter-spacing: .04em; font-weight: 400; text-transform: uppercase; font-size: clamp(1.6rem, 6.5vw, 2.5rem); }
      h1 .amp { font-style: italic; text-transform: none; color: var(--acc); font-size: 1.3em; }
      .subtitle { font-style: italic; color: var(--text); opacity: .8; }
      .upload-btn { background: var(--c1); border-radius: 4px; box-shadow: 0 6px 18px var(--shadow); }
      .divider::before, .divider::after { width: 90px; }
      footer { color: var(--acc); }
    `,
  },
  boho: {
    name: 'Boho',
    desc: 'Teracotă și nisip, ramă în arcadă, caligrafie caldă.',
    fonts: 'family=Great+Vibes&family=Nunito:wght@300;400;600;700',
    heading: "'Great Vibes', 'Brush Script MT', cursive",
    body: "'Nunito', 'Helvetica Neue', Arial, sans-serif",
    intro: 'fade',
    ornament: '· · ·',
    divider: '⌘',
    presets: [
      { name: 'Teracotă', primary: '#b5654a', accent: '#d9b48f', bg: '#f7f0e6' },
      { name: 'Măsliniu', primary: '#6b7248', accent: '#c9b58a', bg: '#f6f3ea' },
      { name: 'Muștar', primary: '#b8862b', accent: '#7a5c3c', bg: '#fbf6ec' },
      { name: 'Cafea', primary: '#5c4033', accent: '#c8a27a', bg: '#f5efe8' },
    ],
    css: `
      body { background-image: radial-gradient(circle at 20% 10%, var(--accl) 0, transparent 40%), radial-gradient(circle at 85% 90%, var(--c1ll) 0, transparent 40%); }
      .photo-frame { border-radius: 160px 160px 12px 12px; aspect-ratio: 3 / 4; border: 5px solid var(--card); box-shadow: 0 14px 34px var(--shadow); }
      h1 { font-size: clamp(2.8rem, 11vw, 4.4rem); font-weight: 400; color: var(--c1); }
      h1 .amp { color: var(--acc); }
      .ornament { color: var(--c1); letter-spacing: .3em; }
      .upload-btn { background: var(--c1); border-radius: 18px; box-shadow: 0 8px 20px var(--shadow); }
      .divider { color: var(--acc); }
      .divider::before, .divider::after { background: var(--acc); }
      footer { font-family: var(--font-heading); font-size: 1.5rem; color: var(--c1); }
    `,
  },
  romantic: {
    name: 'Romantic',
    desc: 'Roz pudrat, petale care plutesc și caligrafie fină.',
    fonts: 'family=Parisienne&family=Quicksand:wght@400;500;600',
    heading: "'Parisienne', 'Brush Script MT', cursive",
    body: "'Quicksand', 'Helvetica Neue', Arial, sans-serif",
    intro: 'petals',
    ornament: '❀ ❀ ❀',
    divider: '❀',
    presets: [
      { name: 'Blush', primary: '#c26a8a', accent: '#e8b4c4', bg: '#fff7f9' },
      { name: 'Lavandă', primary: '#8a6bb5', accent: '#cdbde6', bg: '#faf7fd' },
      { name: 'Piersică', primary: '#d98a6a', accent: '#f4c9b2', bg: '#fff8f4' },
      { name: 'Mentă', primary: '#5b9a8b', accent: '#bfe3d8', bg: '#f5fbf9' },
    ],
    css: `
      .photo-frame { border-radius: 28px; border: 6px solid var(--card); box-shadow: 0 12px 34px var(--shadow), 0 0 0 1px var(--accl); }
      h1 { font-size: clamp(2.6rem, 10vw, 4rem); font-weight: 400; color: var(--c1); }
      h1 .amp { color: var(--acc); }
      .upload-btn { background: linear-gradient(135deg, var(--c1) 0%, var(--c1d) 100%); border-radius: 999px; }
      .ornament, .divider { color: var(--acc); }
      .divider::before, .divider::after { background: var(--acc); }
    `,
  },
  modern: {
    name: 'Modern',
    desc: 'Fundal închis, tipografie curată. Potrivit pentru firme și majorate.',
    fonts: 'family=Poppins:wght@300;400;600;700',
    heading: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
    body: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
    intro: 'fade',
    ornament: '',
    divider: '',
    presets: [
      { name: 'Ambră', primary: '#f59e0b', accent: '#fbbf24', bg: '#0b0f19' },
      { name: 'Electric', primary: '#3b82f6', accent: '#60a5fa', bg: '#0a0a0f' },
      { name: 'Neon', primary: '#22c55e', accent: '#a3e635', bg: '#09110d' },
      { name: 'Alb', primary: '#111827', accent: '#6b7280', bg: '#ffffff' },
    ],
    css: `
      .photo-frame { border-radius: 20px; width: min(84vw, 360px, 36vh); aspect-ratio: 4 / 3; border: none; box-shadow: 0 20px 50px rgba(0,0,0,.45); }
      h1 { font-weight: 700; letter-spacing: -.02em; font-size: clamp(1.9rem, 7.5vw, 3rem); color: var(--text); }
      h1 .amp { color: var(--c1); font-weight: 300; }
      .subtitle { font-style: normal; color: var(--muted); font-family: var(--font-body); font-size: 1rem; }
      .ornament, .divider { display: none; }
      .upload-btn { background: var(--c1); color: var(--onC1); border-radius: 14px; margin-top: 26px; box-shadow: 0 10px 30px var(--shadow); }
      .progress-item { background: var(--card); border-color: var(--cardBorder); }
      footer { font-style: normal; color: var(--muted); font-family: var(--font-body); font-size: .85rem; }
    `,
  },
  petrecere: {
    name: 'Petrecere',
    desc: 'Confetti și culori vii. Pentru majorate și aniversări.',
    fonts: 'family=Pacifico&family=Nunito:wght@400;600;800',
    heading: "'Pacifico', 'Brush Script MT', cursive",
    body: "'Nunito', 'Helvetica Neue', Arial, sans-serif",
    intro: 'confetti',
    ornament: '🎉 🎈 🎉',
    divider: '★',
    presets: [
      { name: 'Violet', primary: '#7c3aed', accent: '#fbbf24', bg: '#fdf4ff' },
      { name: 'Coral', primary: '#f43f5e', accent: '#fb923c', bg: '#fff7f7' },
      { name: 'Turcoaz', primary: '#0891b2', accent: '#fde047', bg: '#f0fdff' },
      { name: 'Verde lime', primary: '#16a34a', accent: '#facc15', bg: '#f7fff3' },
    ],
    css: `
      .photo-frame { border-radius: 50%; aspect-ratio: 1; width: min(66vw, 290px, 32vh); border: 8px solid var(--card); box-shadow: 0 0 0 4px var(--acc), 0 14px 34px var(--shadow); }
      h1 { font-size: clamp(2.2rem, 9vw, 3.4rem); font-weight: 400; color: var(--c1); }
      h1 .amp { color: var(--acc); }
      .ornament { font-size: 1.3rem; letter-spacing: .3em; }
      .upload-btn { background: linear-gradient(135deg, var(--c1) 0%, var(--acc) 140%); border-radius: 999px; }
      .divider { color: var(--acc); }
      .divider::before, .divider::after { background: var(--acc); }
      footer { font-family: var(--font-heading); color: var(--c1); font-style: normal; }
    `,
  },
};

export const DEFAULT_TEMPLATE = 'smarald';

export function templateFor(id) {
  return TEMPLATES[id] || TEMPLATES[DEFAULT_TEMPLATE];
}

export function normalizeColors(templateId, colors) {
  const t = templateFor(templateId);
  const p = t.presets[0];
  const c = colors || {};
  return {
    primary: isHex(c.primary) ? c.primary.toLowerCase() : p.primary,
    accent: isHex(c.accent) ? c.accent.toLowerCase() : p.accent,
    bg: isHex(c.bg) ? c.bg.toLowerCase() : p.bg,
  };
}

export function palette(colors) {
  const { primary: c1, accent: acc, bg } = colors;
  const dark = isDark(bg);
  const c1d = shade(c1, -0.3);
  return {
    c1, c1d, c1dd: shade(c1, -0.5), c1l: shade(c1, 0.78), c1ll: shade(c1, 0.92),
    acc, accd: shade(acc, -0.25), accl: shade(acc, 0.65),
    bg, text: dark ? '#f1f1ee' : '#2f3531', muted: dark ? '#a3a8a1' : '#8a8f85',
    card: dark ? shade(bg, 0.08) : '#ffffff', cardBorder: dark ? shade(bg, 0.18) : shade(c1, 0.8),
    onC1: isDark(c1) ? '#ffffff' : '#1d1d1d',
    shadow: rgbaFromHex(c1d, 0.35),
  };
}

function cssVars(tpl, pal) {
  return `:root {
    --c1: ${pal.c1}; --c1d: ${pal.c1d}; --c1dd: ${pal.c1dd}; --c1l: ${pal.c1l}; --c1ll: ${pal.c1ll};
    --acc: ${pal.acc}; --accd: ${pal.accd}; --accl: ${pal.accl};
    --bg: ${pal.bg}; --text: ${pal.text}; --muted: ${pal.muted}; --card: ${pal.card}; --cardBorder: ${pal.cardBorder};
    --onC1: ${pal.onC1}; --shadow: ${pal.shadow};
    --font-heading: ${tpl.heading}; --font-body: ${tpl.body};
  }`;
}

function fontLink(tpl) {
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${tpl.fonts}&display=swap" rel="stylesheet">`;
}

/* ---------- CSS de bază, comun tuturor template-urilor ---------- */

const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: var(--font-body);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  main { display: flex; flex-direction: column; align-items: center; width: 100%; }
  .ornament { color: var(--acc); letter-spacing: .5em; font-size: .9rem; margin: 26px 0 4px; }
  .photo-frame {
    width: min(72vw, 320px, 34vh);
    aspect-ratio: 4 / 5;
    overflow: hidden;
    box-shadow: 0 12px 40px var(--shadow);
    background: var(--c1l);
    margin: 18px 0 8px;
    position: relative;
  }
  .photo-frame img { width: 100%; height: 100%; object-fit: cover; display: block; opacity: 0; transition: opacity .6s ease; }
  .photo-frame img.loaded { opacity: 1; }
  .photo-frame.loading { background: linear-gradient(110deg, var(--c1l) 40%, var(--c1ll) 50%, var(--c1l) 60%); background-size: 200% 100%; animation: shimmer 1.4s linear infinite; }
  @keyframes shimmer { to { background-position: -200% 0; } }
  h1 { font-family: var(--font-heading); font-weight: 500; font-size: clamp(2rem, 8vw, 3.2rem); color: var(--c1d); text-align: center; line-height: 1.15; margin-top: 18px; padding: 0 16px; }
  .subtitle { font-family: var(--font-heading); font-style: italic; font-size: 1.15rem; color: var(--c1); margin-top: 8px; text-align: center; padding: 0 24px; }
  .date { font-size: .85rem; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); margin-top: 8px; }
  .divider { display: flex; align-items: center; gap: 12px; margin: 22px 0; color: var(--acc); }
  .divider::before, .divider::after { content: ''; width: 60px; height: 1px; background: var(--acc); }
  .upload-btn {
    font-family: var(--font-body); font-size: 1.05rem; font-weight: 500; letter-spacing: .04em;
    color: var(--onC1); background: var(--c1); border: none; border-radius: 999px; padding: 18px 42px; cursor: pointer;
    box-shadow: 0 8px 24px var(--shadow); transition: transform .15s, box-shadow .15s;
    display: inline-flex; flex-direction: column; align-items: center; gap: 8px; max-width: 92vw;
  }
  .btn-line1 { font-size: .78rem; font-weight: 400; letter-spacing: .02em; opacity: .95; }
  .btn-line2 { display: inline-flex; align-items: center; gap: 10px; font-size: 1.2rem; font-weight: 600; }
  .upload-btn:active { transform: scale(.97); }
  .upload-btn svg { flex: none; }
  .upload-btn:disabled { opacity: .85; cursor: wait; transform: none; }
  .spinner { width: 20px; height: 20px; flex: none; border: 3px solid rgba(255,255,255,.35); border-top-color: #fff; border-radius: 50%; animation: spin .8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  input[type="file"] { display: none; }
  .hint { font-size: .8rem; color: var(--muted); margin-top: 14px; text-align: center; padding: 0 24px; }
  .progress-list { width: min(92vw, 480px); margin: 26px 0 10px; display: flex; flex-direction: column; gap: 10px; }
  .progress-item { background: var(--card); border: 1px solid var(--cardBorder); border-radius: 12px; padding: 12px 16px; font-size: .8rem; }
  .progress-item .name { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 8px; color: var(--text); }
  .progress-item .name .status { flex: none; color: var(--c1); }
  .progress-item .track { height: 6px; background: var(--c1l); border-radius: 3px; overflow: hidden; }
  .progress-item .fill { height: 100%; width: 0; background: var(--c1); border-radius: 3px; transition: width .2s; }
  .progress-item.error .status { color: #b05050; }
  .progress-item.done .fill { background: var(--c1d); }
  .toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: var(--c1d); color: #fff; padding: 14px 26px; border-radius: 999px; font-size: .9rem; box-shadow: 0 8px 24px rgba(0,0,0,.25); opacity: 0; pointer-events: none; transition: opacity .3s; max-width: 90vw; text-align: center; z-index: 50; }
  .toast.show { opacity: 1; }
  .guestbook { width: min(92vw, 480px); margin: 18px 0 10px; background: var(--card); border: 1px solid var(--cardBorder); border-radius: 16px; padding: 18px; }
  .guestbook h2 { font-family: var(--font-heading); font-weight: 500; color: var(--c1d); font-size: 1.4rem; text-align: center; margin-bottom: 12px; }
  .guestbook input, .guestbook textarea { width: 100%; font-family: var(--font-body); font-size: .95rem; padding: 10px 12px; border: 1px solid var(--cardBorder); border-radius: 10px; background: var(--bg); color: var(--text); margin-bottom: 10px; }
  .guestbook textarea { min-height: 80px; resize: vertical; }
  .guestbook button { width: 100%; font-family: var(--font-body); font-size: .95rem; font-weight: 600; color: var(--onC1); background: var(--c1); border: none; border-radius: 10px; padding: 12px; cursor: pointer; }
  .guestbook button:disabled { opacity: .6; }
  .gallery-link { margin-top: 16px; font-size: .9rem; color: var(--c1); text-decoration: underline; text-underline-offset: 3px; }
  footer { margin-top: auto; padding: 18px; font-family: var(--font-heading); font-style: italic; color: var(--c1); font-size: 1rem; text-align: center; }
  .powered { font-family: var(--font-body); font-size: .68rem; color: var(--muted); opacity: .8; margin-top: 6px; }
  .powered a { color: inherit; }
  @media (max-height: 740px) {
    .ornament { margin: 12px 0 2px; }
    .photo-frame { margin: 12px 0 4px; }
    h1 { font-size: clamp(1.7rem, 6.5vw, 2.5rem); margin-top: 10px; }
    .subtitle { font-size: 1rem; margin-top: 5px; }
    .divider { margin: 14px 0; }
    .upload-btn { padding: 14px 34px; }
    .hint { margin-top: 10px; }
  }
  .intro-fade main, .intro-fade footer { animation: fadeUp .9s ease both; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
`;

/* ---------- Animații de intrare ---------- */

const GIFT_CSS = `
  #gift { position: fixed; inset: 0; z-index: 100; overflow: hidden; perspective: 1300px; }
  #gift.open { pointer-events: none; }
  #gift::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 45% 60% at 50% 50%, rgba(255, 248, 225, .7), rgba(255, 248, 225, .2) 45%, transparent 70%); opacity: 0; pointer-events: none; }
  #gift.open::before { animation: bloomFlash 1.5s ease .6s forwards; }
  @keyframes bloomFlash { 0% { opacity: 0; } 35% { opacity: 1; } 100% { opacity: 0; } }
  #gift .panel {
    position: absolute; top: -2vh; bottom: -2vh; width: 51%;
    background-color: var(--c1d);
    background-image:
      repeating-linear-gradient(115deg, rgba(255,255,255,.045) 0 1px, transparent 1px 5px),
      repeating-linear-gradient(25deg, rgba(0,0,0,.05) 0 1px, transparent 1px 7px),
      linear-gradient(112deg, transparent 0%, rgba(255,255,255,.13) 9%, transparent 17%, rgba(0,0,0,.22) 27%, transparent 36%, rgba(255,255,255,.18) 46%, rgba(255,255,255,.05) 52%, transparent 58%, rgba(0,0,0,.28) 70%, transparent 80%, rgba(255,255,255,.10) 89%, transparent 100%),
      radial-gradient(ellipse 60% 42% at 30% 22%, rgba(255,255,255,.30), transparent 60%),
      radial-gradient(ellipse 45% 35% at 74% 68%, rgba(255,255,255,.14), transparent 55%),
      radial-gradient(ellipse 55% 45% at 62% 8%, rgba(0,0,0,.35), transparent 60%),
      radial-gradient(ellipse 50% 45% at 25% 88%, rgba(0,0,0,.4), transparent 60%),
      linear-gradient(128deg, var(--c1) 0%, var(--c1d) 28%, var(--c1) 50%, var(--c1dd) 74%, var(--c1d) 100%);
    transition: transform 1.5s cubic-bezier(.62, 0, .23, 1) .6s, filter 1.5s ease .6s;
    will-change: transform;
  }
  #gift .panel.left { left: 0; transform-origin: left center; box-shadow: inset -24px 0 45px -14px rgba(0,0,0,.55); }
  #gift .panel.right { right: 0; transform-origin: right center; box-shadow: inset 24px 0 45px -14px rgba(0,0,0,.55); }
  #gift.open .panel.left { transform: rotateY(94deg) translateZ(2vw); filter: brightness(.45); }
  #gift.open .panel.right { transform: rotateY(-94deg) translateZ(2vw); filter: brightness(.45); }
  #gift .ribbon-v, #gift .ribbon-h {
    position: absolute;
    background: repeating-linear-gradient(90deg, rgba(0,0,0,.12) 0 1px, transparent 1px 4px), linear-gradient(90deg, var(--accd) 0%, var(--accl) 26%, var(--acc) 48%, var(--accl) 70%, var(--accd) 100%);
    box-shadow: 0 0 22px rgba(0,0,0,.45), inset 0 0 8px rgba(255,255,255,.25);
    transition: transform .8s cubic-bezier(.45, 0, .85, .4) .05s, opacity .7s .15s; will-change: transform;
  }
  #gift .ribbon-v { top: 0; bottom: 0; left: 50%; width: 58px; margin-left: -29px; }
  #gift .ribbon-h { left: 0; right: 0; top: 50%; height: 58px; margin-top: -29px; background: repeating-linear-gradient(0deg, rgba(0,0,0,.12) 0 1px, transparent 1px 4px), linear-gradient(180deg, var(--accd) 0%, var(--accl) 26%, var(--acc) 48%, var(--accl) 70%, var(--accd) 100%); }
  #gift.open .ribbon-v { transform: translateY(112vh) rotate(7deg); opacity: 0; }
  #gift.open .ribbon-h { transform: translateX(60vw) translateY(112vh) rotate(-10deg); opacity: 0; }
  #gift .bow { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); filter: drop-shadow(0 10px 18px rgba(0,0,0,.5)); will-change: transform; }
  #gift.open .bow { animation: bowFly 1.15s cubic-bezier(.55, -.15, .75, .4) forwards; }
  @keyframes bowFly {
    0% { transform: translate(-50%, -50%); opacity: 1; }
    22% { transform: translate(-50%, -50%) translateY(3.5vh) rotate(-5deg) scale(1.06); opacity: 1; }
    100% { transform: translate(-50%, -50%) translateY(-135vh) translateX(10vw) rotate(28deg) scale(1.1); opacity: 0; }
  }
  #gift .tap-hint { position: absolute; left: 50%; bottom: 12%; transform: translateX(-50%); color: #f3ead3; font-family: var(--font-heading); font-style: italic; font-size: 1.3rem; text-shadow: 0 2px 10px rgba(0,0,0,.5); animation: pulse 2s ease-in-out infinite; white-space: nowrap; max-width: 92vw; overflow: hidden; text-overflow: ellipsis; }
  @keyframes pulse { 0%, 100% { opacity: .75; } 50% { opacity: 1; } }
  #gift.open .tap-hint { opacity: 0; transition: opacity .3s; animation: none; }
  @media (prefers-reduced-motion: reduce) { #gift { display: none; } }
`;

function giftHtml(pal, introText) {
  return `<div id="gift" role="button" aria-label="Deschide">
    <div class="panel left"></div>
    <div class="panel right"></div>
    <div class="ribbon-h"></div>
    <div class="ribbon-v"></div>
    <svg class="bow" width="210" height="172" viewBox="0 0 210 172">
      <defs>
        <linearGradient id="goldA" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${pal.accl}"/><stop offset="40%" stop-color="${pal.acc}"/><stop offset="100%" stop-color="${pal.accd}"/></linearGradient>
        <linearGradient id="goldB" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${pal.accl}"/><stop offset="40%" stop-color="${pal.acc}"/><stop offset="100%" stop-color="${pal.accd}"/></linearGradient>
        <radialGradient id="knotG" cx="35%" cy="30%" r="90%"><stop offset="0%" stop-color="${pal.accl}"/><stop offset="55%" stop-color="${pal.acc}"/><stop offset="100%" stop-color="${pal.accd}"/></radialGradient>
      </defs>
      <path d="M105 86 C82 106 60 132 70 150 L87 142 L83 160 C100 154 107 122 105 86 Z" fill="url(#goldB)" stroke="${pal.accd}" stroke-width="1.5"/>
      <path d="M105 86 C128 106 150 132 140 150 L123 142 L127 160 C110 154 103 122 105 86 Z" fill="url(#goldA)" stroke="${pal.accd}" stroke-width="1.5"/>
      <path d="M103 92 C88 110 76 130 79 144" stroke="rgba(0,0,0,.3)" stroke-width="1.5" fill="none"/>
      <path d="M107 92 C122 110 134 130 131 144" stroke="rgba(0,0,0,.3)" stroke-width="1.5" fill="none"/>
      <path d="M105 80 C60 30 16 36 13 64 C10 92 56 102 105 80 Z" fill="url(#goldA)" stroke="${pal.accd}" stroke-width="2"/>
      <path d="M105 80 C150 30 194 36 197 64 C200 92 154 102 105 80 Z" fill="url(#goldB)" stroke="${pal.accd}" stroke-width="2"/>
      <path d="M105 80 C68 50 34 52 26 68 C36 86 72 90 105 80 Z" fill="rgba(0,0,0,.18)"/>
      <path d="M105 80 C142 50 176 52 184 68 C174 86 138 90 105 80 Z" fill="rgba(0,0,0,.18)"/>
      <path d="M96 72 C68 44 38 44 25 58" stroke="rgba(255,250,230,.6)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M114 72 C142 44 172 44 185 58" stroke="rgba(255,250,230,.6)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="105" cy="79" r="17" fill="url(#knotG)" stroke="${pal.accd}" stroke-width="2"/>
      <path d="M93 71 C99 78 99 82 94 88" stroke="rgba(0,0,0,.35)" stroke-width="1.5" fill="none"/>
      <path d="M117 71 C111 78 111 82 116 88" stroke="rgba(0,0,0,.35)" stroke-width="1.5" fill="none"/>
      <ellipse cx="99" cy="72" rx="5" ry="3" fill="rgba(255,250,230,.55)" transform="rotate(-25 99 72)"/>
    </svg>
    <div class="tap-hint">${escapeHtml(introText)}</div>
  </div>`;
}

const GIFT_JS = `
  const gift = document.getElementById('gift');
  let giftOpened = false;
  function openGift() {
    if (giftOpened) return;
    giftOpened = true;
    gift.classList.add('open');
    setTimeout(() => gift.remove(), 2600);
  }
  gift.addEventListener('click', openGift);
  setTimeout(openGift, 1400);
`;

const CONFETTI_CSS = `
  #confetti { position: fixed; inset: 0; pointer-events: none; z-index: 100; overflow: hidden; }
  #confetti i { position: absolute; top: -4vh; width: 10px; height: 16px; border-radius: 2px; opacity: 0; animation: confettiFall 3.2s ease-in forwards; }
  @keyframes confettiFall { 0% { opacity: 1; transform: translateY(0) rotate(0); } 100% { opacity: 0; transform: translateY(110vh) rotate(720deg); } }
  #intro-text { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; font-family: var(--font-heading); font-size: clamp(2rem, 9vw, 3.6rem); color: var(--c1); background: var(--bg); z-index: 101; animation: introOut 1.2s ease 1.1s forwards; }
  @keyframes introOut { to { opacity: 0; visibility: hidden; } }
  @media (prefers-reduced-motion: reduce) { #confetti, #intro-text { display: none; } }
`;

function confettiHtml(pal, introText) {
  let pieces = '';
  const colors = [pal.c1, pal.acc, pal.c1l, pal.accd, '#ffffff'];
  for (let i = 0; i < 70; i++) {
    const left = (i * 37) % 100;
    const delay = ((i * 13) % 20) / 10;
    const dur = 2.4 + ((i * 7) % 10) / 6;
    pieces += `<i style="left:${left}%;background:${colors[i % colors.length]};animation-delay:${delay}s;animation-duration:${dur}s;transform:rotate(${(i * 53) % 360}deg)"></i>`;
  }
  return `<div id="intro-text">${escapeHtml(introText)}</div><div id="confetti">${pieces}</div>`;
}

const CONFETTI_JS = `setTimeout(() => { const c = document.getElementById('confetti'); if (c) c.remove(); const t = document.getElementById('intro-text'); if (t) t.remove(); }, 5600);`;

const PETALS_CSS = `
  #petals { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
  #petals i { position: absolute; top: -6vh; width: 14px; height: 14px; border-radius: 80% 0 80% 0; background: var(--acc); opacity: .55; animation: petalFall linear infinite; }
  @keyframes petalFall { 0% { transform: translateY(0) translateX(0) rotate(0); } 50% { transform: translateY(55vh) translateX(6vw) rotate(180deg); } 100% { transform: translateY(112vh) translateX(-4vw) rotate(360deg); } }
  main, footer { position: relative; z-index: 1; }
  @media (prefers-reduced-motion: reduce) { #petals { display: none; } }
`;

function petalsHtml() {
  let pieces = '';
  for (let i = 0; i < 16; i++) {
    const left = (i * 41) % 100;
    const delay = -((i * 17) % 14);
    const dur = 11 + ((i * 5) % 8);
    const size = 10 + ((i * 3) % 9);
    pieces += `<i style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;width:${size}px;height:${size}px"></i>`;
  }
  return `<div id="petals">${pieces}</div>`;
}

/* ---------- Pagina pentru invitați ---------- */

/**
 * @param {object} ev   configurația evenimentului
 * @param {object} opts { base: '/e/slug' sau '', preview: bool, brand: {name, url}, coverUrl }
 */
export function renderGuestPage(ev, opts) {
  const tpl = templateFor(ev.template);
  const pal = palette(normalizeColors(ev.template, ev.colors));
  const base = opts.base || '';
  const t = ev.texts || {};
  const intro = ev.intro === false ? 'fade' : tpl.intro;
  const title = ev.name2 ? `${escapeHtml(ev.name1)} <span class="amp">&amp;</span> ${escapeHtml(ev.name2)}` : escapeHtml(ev.name1);
  const plainTitle = ev.name2 ? `${ev.name1} & ${ev.name2}` : ev.name1;
  const typeInfo = EVENT_TYPES[ev.type] || EVENT_TYPES.alt;

  let introCss = '', introHtml = '', introJs = '';
  if (intro === 'gift') { introCss = GIFT_CSS; introHtml = giftHtml(pal, t.introText || ''); introJs = GIFT_JS; }
  else if (intro === 'confetti') { introCss = CONFETTI_CSS; introHtml = confettiHtml(pal, t.introText || ''); introJs = CONFETTI_JS; }
  else if (intro === 'petals') { introCss = PETALS_CSS; introHtml = petalsHtml(); }

  const config = {
    base, preview: !!opts.preview, maxFile: ev.maxFileBytes || 104857600,
    thanks: t.thanksText || 'Mulțumim! Amintirea ta a fost încărcată ♥',
    guestbook: !!ev.guestbook,
  };

  return `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(plainTitle)} — ${escapeHtml(typeInfo.label)}</title>
<meta name="description" content="Încarcă pozele și clipurile tale de la ${escapeHtml(typeInfo.word)} — ${escapeHtml(plainTitle)}.">
<meta name="robots" content="noindex">
<meta name="theme-color" content="${pal.bg}">
${fontLink(tpl)}
<style>
${cssVars(tpl, pal)}
${BASE_CSS}
${tpl.css}
${introCss}
</style>
</head>
<body class="tpl-${escapeHtml(ev.template || DEFAULT_TEMPLATE)} intro-${intro}">
${introHtml}
<main>
  ${tpl.ornament ? `<div class="ornament">${escapeHtml(tpl.ornament)}</div>` : ''}
  <div class="photo-frame loading" id="photoFrame">
    <img id="couplePhoto" src="${escapeHtml(opts.coverUrl || base + '/cover')}" alt="${escapeHtml(plainTitle)}">
  </div>
  <h1>${title}</h1>
  ${t.subtitle ? `<p class="subtitle">${escapeHtml(t.subtitle)}</p>` : ''}
  ${ev.date ? `<p class="date">${escapeHtml(ev.date)}</p>` : ''}
  ${tpl.divider ? `<div class="divider">${escapeHtml(tpl.divider)}</div>` : '<div style="height:16px"></div>'}
  <button class="upload-btn" id="uploadBtn">
    ${t.buttonHint ? `<span class="btn-line1">${escapeHtml(t.buttonHint)}</span>` : ''}
    <span class="btn-line2">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      ${escapeHtml(t.buttonText || 'Încarcă aici')}
    </span>
  </button>
  <input type="file" id="fileInput" accept="image/*,video/*" multiple>
  <p class="hint">Ține apăsat pe o poză în galerie ca să selectezi mai multe.<br>Maxim ${Math.round((ev.maxFileBytes || 104857600) / 1048576)} MB per fișier.</p>
  <div class="progress-list" id="progressList"></div>
  ${ev.guestbook ? `<form class="guestbook" id="guestbook">
    <h2>${escapeHtml(t.guestbookTitle || 'Lasă-ne un mesaj')}</h2>
    <input type="text" id="gbName" maxlength="60" placeholder="Numele tău" required>
    <textarea id="gbText" maxlength="600" placeholder="Mesajul tău…" required></textarea>
    <button type="submit">Trimite mesajul</button>
  </form>` : ''}
  ${ev.publicGallery ? `<a class="gallery-link" href="${escapeHtml(base)}/galerie">Vezi amintirile încărcate de toți →</a>` : ''}
  <div class="toast" id="toast"></div>
</main>
<footer>
  ${escapeHtml(t.footer || '')}
  ${opts.brand && opts.brand.name ? `<div class="powered">realizat cu <a href="${escapeHtml(opts.brand.url || '/')}" target="_blank" rel="noopener">${escapeHtml(opts.brand.name)}</a></div>` : ''}
</footer>
<script>
const CFG = ${jsonForScript(config)};
${introJs}
const fileInput = document.getElementById('fileInput');
const progressList = document.getElementById('progressList');
const toast = document.getElementById('toast');
const uploadBtn = document.getElementById('uploadBtn');
const uploadBtnHtml = uploadBtn.innerHTML;

const couplePhoto = document.getElementById('couplePhoto');
const photoFrame = document.getElementById('photoFrame');
function photoReady() { couplePhoto.classList.add('loaded'); photoFrame.classList.remove('loading'); }
if (couplePhoto.complete && couplePhoto.naturalWidth > 0) photoReady();
else { couplePhoto.addEventListener('load', photoReady); couplePhoto.addEventListener('error', photoReady); }

uploadBtn.addEventListener('click', () => {
  if (CFG.preview) { showToast('În previzualizare nu se pot încărca fișiere.'); return; }
  fileInput.click();
});
fileInput.addEventListener('change', () => {
  const files = Array.from(fileInput.files);
  fileInput.value = '';
  if (files.length) uploadAll(files);
});

function setUploadingState(current, total) {
  uploadBtn.disabled = true;
  uploadBtn.innerHTML = '<span class="btn-line2"><span class="spinner"></span> Se încarcă ' + current + ' din ' + total + '…</span>';
}
function resetUploadBtn() { uploadBtn.disabled = false; uploadBtn.innerHTML = uploadBtnHtml; }

// Unele telefoane trimit videoclipuri cu nume/tip de poză (.jpeg) —
// citim primii octeți ca să aflăm ce este cu adevărat fișierul.
async function sniffType(file) {
  const buf = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const ascii = String.fromCharCode.apply(null, buf);
  if (ascii.slice(4, 8) === 'ftyp') {
    const brand = ascii.slice(8, 12).trim();
    if (brand.slice(0, 2) === 'qt') return { type: 'video/quicktime', ext: 'mov', video: true };
    if (['heic', 'heix', 'hevc', 'heif', 'mif1', 'msf1', 'heis'].indexOf(brand) !== -1) return { type: 'image/heic', ext: 'heic', video: false };
    if (brand === 'avif' || brand === 'avis') return { type: 'image/avif', ext: 'avif', video: false };
    if (brand.slice(0, 3) === '3gp') return { type: 'video/3gpp', ext: '3gp', video: true };
    return { type: 'video/mp4', ext: 'mp4', video: true };
  }
  if (buf[0] === 0xFF && buf[1] === 0xD8) return { type: 'image/jpeg', ext: 'jpg', video: false };
  if (buf[0] === 0x89 && ascii.slice(1, 4) === 'PNG') return { type: 'image/png', ext: 'png', video: false };
  if (ascii.slice(0, 3) === 'GIF') return { type: 'image/gif', ext: 'gif', video: false };
  if (buf[0] === 0x42 && buf[1] === 0x4D) return { type: 'image/bmp', ext: 'bmp', video: false };
  if ((buf[0] === 0x49 && buf[1] === 0x49 && buf[2] === 0x2A && buf[3] === 0) || (buf[0] === 0x4D && buf[1] === 0x4D && buf[2] === 0 && buf[3] === 0x2A)) return { type: 'image/tiff', ext: 'tif', video: false };
  if (ascii.slice(0, 4) === 'RIFF' && ascii.slice(8, 12) === 'WEBP') return { type: 'image/webp', ext: 'webp', video: false };
  if (buf[0] === 0x1A && buf[1] === 0x45 && buf[2] === 0xDF && buf[3] === 0xA3) return { type: 'video/webm', ext: 'webm', video: true };
  return null;
}
const VIDEO_EXTS = ['mp4', 'm4v', 'mov', 'webm', 'mkv', 'avi', '3gp', 'ts', 'mts', 'm2ts', 'mpg', 'mpeg', 'wmv'];
async function fixNameAndType(file) {
  let name = file.name || 'amintire';
  let type = file.type || '';
  try {
    const s = await sniffType(file);
    if (s) {
      const m = name.match(/\\.([A-Za-z0-9]+)$/);
      const ext = m ? m[1].toLowerCase() : '';
      const extIsVideo = VIDEO_EXTS.indexOf(ext) !== -1;
      if (!ext || extIsVideo !== s.video) { name = (m ? name.slice(0, -m[0].length) : name) + '.' + s.ext; type = s.type; }
      else if (!type) { type = s.type; }
    }
  } catch (e) {}
  return { name, type: type || 'application/octet-stream' };
}

async function uploadAll(files) {
  let uploaded = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    setUploadingState(i + 1, files.length);
    const fixed = await fixNameAndType(file);
    const item = createProgressItem(fixed.name);
    if (file.size > CFG.maxFile) { markError(item, 'Peste ' + Math.round(CFG.maxFile / 1048576) + ' MB'); continue; }
    try { await uploadFile(file, item, fixed); uploaded++; }
    catch (err) { markError(item, err.message || 'Eroare'); }
  }
  resetUploadBtn();
  if (uploaded > 0) showToast(uploaded === 1 ? CFG.thanks : 'Mulțumim! ' + uploaded + ' amintiri au fost încărcate ♥');
}

function uploadFile(file, item, fixed) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', CFG.base + '/api/upload?name=' + encodeURIComponent(fixed.name));
    xhr.setRequestHeader('content-type', fixed.type);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) item.querySelector('.fill').style.width = (e.loaded / e.total * 100) + '%'; };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        item.classList.add('done');
        item.querySelector('.status').textContent = '✓ Încărcat';
        item.querySelector('.fill').style.width = '100%';
        resolve();
      } else {
        let msg = 'Eroare la încărcare';
        try { msg = JSON.parse(xhr.responseText).error || msg; } catch (e) {}
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error('Conexiune întreruptă — încearcă din nou'));
    xhr.send(file);
  });
}

function createProgressItem(name) {
  const div = document.createElement('div');
  div.className = 'progress-item';
  div.innerHTML = '<div class="name"><span>' + escapeHtml(name) + '</span><span class="status">Se încarcă…</span></div><div class="track"><div class="fill"></div></div>';
  progressList.prepend(div);
  return div;
}
function markError(item, msg) { item.classList.add('error'); item.querySelector('.status').textContent = '✗ ' + msg; }
function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
let toastTimer;
function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 4500); }

const gb = document.getElementById('guestbook');
if (gb) gb.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (CFG.preview) { showToast('În previzualizare nu se pot trimite mesaje.'); return; }
  const btn = gb.querySelector('button');
  btn.disabled = true;
  try {
    const res = await fetch(CFG.base + '/api/message', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: document.getElementById('gbName').value, text: document.getElementById('gbText').value }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Eroare');
    gb.innerHTML = '<h2>Mulțumim pentru mesaj ♥</h2>';
  } catch (err) { showToast(err.message); btn.disabled = false; }
});
</script>
</body>
</html>`;
}

/* ---------- Cartonașe QR de printat ---------- */

export function renderPrintPage(ev, opts) {
  const tpl = templateFor(ev.template);
  const pal = palette(normalizeColors(ev.template, ev.colors));
  const t = ev.texts || {};
  const title = ev.name2 ? `${escapeHtml(ev.name1)} <span class="amp">&amp;</span> ${escapeHtml(ev.name2)}` : escapeHtml(ev.name1);
  const plainTitle = ev.name2 ? `${ev.name1} & ${ev.name2}` : ev.name1;
  const qrDark = isDark(pal.c1d) ? pal.c1d : '#1a1a1a';
  const paper = isDark(pal.bg) ? '#ffffff' : pal.bg;

  return `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cartonașe QR — ${escapeHtml(plainTitle)}</title>
<meta name="robots" content="noindex">
${fontLink(tpl)}
<script src="/qrcode.js"></script>
<style>
${cssVars(tpl, pal)}
  :root { --hartie: ${paper}; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #e8e6e0; font-family: var(--font-body); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .toolbar { background: var(--c1d); color: #fff; padding: 16px 20px; text-align: center; font-size: .9rem; line-height: 1.6; }
  .toolbar a { color: #fff; }
  .toolbar button { display: inline-block; margin: 10px 6px 0; background: var(--acc); color: ${isDark(pal.acc) ? '#fff' : '#222'}; border: none; border-radius: 999px; padding: 12px 34px; font-family: inherit; font-size: 1rem; cursor: pointer; }
  .sheet { width: 210mm; height: 297mm; page: portrait; background: var(--hartie); position: relative; margin: 24px auto; box-shadow: 0 4px 24px rgba(0,0,0,.2); overflow: hidden; }
  .sheet.landscape { width: 297mm; height: 210mm; page: landscape; }
  .grid { position: absolute; inset: 0; display: grid; grid-template-rows: 1fr 1fr; }
  .grid.four { grid-template-columns: 1fr 1fr; }
  .grid.two { grid-template-columns: 1fr; }
  .grid.side { grid-template-rows: 1fr; grid-template-columns: 1fr 1fr; }
  .grid.six { grid-template-rows: 1fr 1fr 1fr; grid-template-columns: 1fr 1fr; }
  .panel { display: flex; align-items: center; justify-content: center; padding: 10mm; }
  .grid.six .panel { padding: 6mm; }
  .panel.flip { transform: rotate(180deg); }
  .card-inner { width: 100%; height: 100%; border: 1.2pt solid var(--acc); outline: .5pt solid var(--acc); outline-offset: 1.6mm; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4mm; text-align: center; padding: 6mm; }
  .card-inner .stars { color: var(--acc); letter-spacing: .45em; font-size: 9pt; }
  .card-inner h2 { font-family: var(--font-heading); font-weight: 500; color: var(--c1d); font-size: 21pt; line-height: 1.1; }
  .card-inner h2 .amp { font-style: italic; color: var(--c1); }
  .card-inner .invite { font-family: var(--font-heading); font-style: italic; color: var(--c1); font-size: 14pt; line-height: 1.2; white-space: pre-line; }
  .qr { line-height: 0; }
  .qr svg { display: block; }
  .card-inner .scan { font-size: 7.5pt; color: #6b7069; line-height: 1.5; max-width: 62mm; }
  .grid.four .qr svg { width: 44mm; height: 44mm; }
  .grid.six .qr svg { width: 36mm; height: 36mm; }
  .grid.six .card-inner h2 { font-size: 17pt; }
  .grid.six .card-inner .invite { font-size: 12pt; }
  .grid.six .card-inner .scan { font-size: 6.5pt; }
  .grid.two .qr svg { width: 54mm; height: 54mm; }
  .grid.two .card-inner h2 { font-size: 26pt; }
  .grid.two .card-inner .invite { font-size: 15pt; }
  .grid.two .card-inner .scan { font-size: 8.5pt; max-width: 105mm; }
  .grid.side .qr svg { width: 64mm; height: 64mm; }
  .grid.side .card-inner { gap: 6mm; }
  .grid.side .card-inner h2 { font-size: 28pt; }
  .grid.side .card-inner .invite { font-size: 16pt; }
  .grid.side .card-inner .scan { font-size: 9pt; max-width: 95mm; }
  .cutline { position: absolute; top: 0; bottom: 0; left: 50%; border-left: .4pt dashed #b3ada0; }
  .cutline::before { content: '✂'; position: absolute; top: 2mm; left: -2.2mm; font-size: 9pt; color: #b3ada0; background: var(--hartie); }
  .cutline.h { top: auto; bottom: auto; left: 0; right: 0; border-left: none; border-top: .4pt dashed #b3ada0; }
  .cutline.h::before { top: -2.4mm; left: 2mm; }
  .foldline { position: absolute; left: 0; right: 0; top: 50%; border-top: .4pt dotted #c5bfb2; }
  .foldline span { position: absolute; right: 2mm; top: -3.2mm; font-size: 5.5pt; color: #b3ada0; background: var(--hartie); padding: 0 1mm; }
  .foldline.vertical { top: 0; bottom: 0; left: 50%; right: auto; border-top: none; border-left: .4pt dotted #c5bfb2; }
  .foldline.vertical span { right: auto; left: -2.2mm; top: 2mm; writing-mode: vertical-rl; padding: 1mm 0; }
  .sheet-label { position: absolute; bottom: 1.5mm; left: 0; right: 0; text-align: center; font-size: 5.5pt; color: #c5bfb2; }
  @media print { body { background: none; } .toolbar { display: none; } .sheet { margin: 0; box-shadow: none; page-break-after: always; } .sheet:last-child { page-break-after: auto; } }
  @page { size: A4; margin: 0; }
  @page portrait { size: A4 portrait; }
  @page landscape { size: A4 landscape; }
</style>
</head>
<body>
<div class="toolbar">
  <strong>Cartonașe cu cod QR pentru mese — ${escapeHtml(plainTitle)}</strong><br>
  Planșa 1: taie pe linia verticală din mijloc, apoi îndoaie fiecare parte pe linia punctată — obții 2 cartonașe cu QR pe ambele fețe.<br>
  Planșa 2: doar îndoaie pe linia punctată — un cartonaș mare cu QR pe ambele fețe. Jumătățile de sus sunt rotite intenționat, ca la îndoit totul să stea drept.<br>
  Planșa 3: A4 pe orizontal, îndoită pe verticală la mijloc — un cartonaș cu două fețe A5 care stă în picioare ca o carte deschisă.<br>
  Planșa 4: 6 cartonașe simple de tăiat (pentru meniuri, invitații sau suporturi de masă).<br>
  Printează pe hârtie A4 cartonată, la scară 100% (fără „fit to page").
  <br><button onclick="window.print()">🖨 Printează</button><button onclick="downloadQr()">⬇ Descarcă QR (PNG)</button>
</div>

<div class="sheet"><div class="grid four"><div class="panel flip"></div><div class="panel flip"></div><div class="panel"></div><div class="panel"></div></div><div class="foldline"><span>îndoaie aici</span></div><div class="cutline"></div><div class="sheet-label">Planșa 1 — taie pe verticală, apoi îndoaie fiecare jumătate</div></div>
<div class="sheet"><div class="grid two"><div class="panel flip"></div><div class="panel"></div></div><div class="foldline"><span>îndoaie aici</span></div><div class="sheet-label">Planșa 2 — doar îndoaie la jumătate</div></div>
<div class="sheet landscape"><div class="grid side"><div class="panel"></div><div class="panel"></div></div><div class="foldline vertical"><span>îndoaie aici</span></div><div class="sheet-label">Planșa 3 — A4 pe orizontal, îndoaie pe verticală la mijloc</div></div>
<div class="sheet"><div class="grid six"><div class="panel"></div><div class="panel"></div><div class="panel"></div><div class="panel"></div><div class="panel"></div><div class="panel"></div></div><div class="cutline"></div><div class="cutline h" style="top:33.33%"></div><div class="cutline h" style="top:66.66%"></div><div class="sheet-label">Planșa 4 — 6 cartonașe simple, taie pe liniile întrerupte</div></div>

<script>
const siteUrl = ${jsonForScript(opts.qrUrl)};
const qr = qrcode(0, 'M');
qr.addData(siteUrl);
qr.make();
const qrSvg = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true }).replace(/black/g, ${jsonForScript(qrDark)}).replace(/white/g, ${jsonForScript(paper)});
const cardHtml = '<div class="card-inner">' +
  ${jsonForScript(tpl.ornament ? `<div class="stars">${escapeHtml(tpl.ornament)}</div>` : '')} +
  ${jsonForScript(`<h2>${title}</h2>`)} +
  ${jsonForScript(`<div class="invite">${escapeHtml(t.cardInvite || '')}</div>`)} +
  '<div class="qr">' + qrSvg + '</div>' +
  ${jsonForScript(`<div class="scan">${escapeHtml(t.cardScan || '')}</div>`)} +
  '</div>';
document.querySelectorAll('.panel').forEach(p => { p.innerHTML = cardHtml; });

function downloadQr() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = new Image();
  const svg = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true }).replace(/black/g, ${jsonForScript(qrDark)}).replace(/white/g, '#ffffff');
  img.onload = () => {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'cod-qr-' + ${jsonForScript(ev.slug)} + '.png';
    a.click();
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
</script>
</body>
</html>`;
}

/* ---------- Slideshow live pentru proiector ---------- */

export function renderSlideshowPage(ev, opts) {
  const tpl = templateFor(ev.template);
  const pal = palette(normalizeColors(ev.template, ev.colors));
  const base = opts.base || '';
  const plainTitle = ev.name2 ? `${ev.name1} & ${ev.name2}` : ev.name1;
  return `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Slideshow — ${escapeHtml(plainTitle)}</title>
<meta name="robots" content="noindex">
${fontLink(tpl)}
<script src="/qrcode.js"></script>
<style>
${cssVars(tpl, pal)}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: #000; color: #fff; font-family: var(--font-body); overflow: hidden; cursor: none; }
  .slide { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 1.4s ease; }
  .slide.show { opacity: 1; }
  .slide img, .slide video { max-width: 100%; max-height: 100%; object-fit: contain; animation: kb 12s ease-in-out both; }
  @keyframes kb { from { transform: scale(1); } to { transform: scale(1.06); } }
  .bg { position: absolute; inset: 0; background-size: cover; background-position: center; filter: blur(40px) brightness(.35); transform: scale(1.2); }
  .corner { position: absolute; right: 28px; bottom: 28px; background: rgba(255,255,255,.96); color: #222; border-radius: 16px; padding: 14px 16px; display: flex; align-items: center; gap: 14px; box-shadow: 0 10px 40px rgba(0,0,0,.5); z-index: 5; }
  .corner svg { width: 110px; height: 110px; display: block; }
  .corner b { font-family: var(--font-heading); font-size: 1.4rem; color: var(--c1d); display: block; }
  .corner small { font-size: .8rem; color: #555; display: block; max-width: 180px; line-height: 1.3; }
  .title { position: absolute; left: 28px; bottom: 28px; font-family: var(--font-heading); font-size: 2rem; color: #fff; text-shadow: 0 2px 16px rgba(0,0,0,.7); z-index: 5; }
  .empty { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 12px; padding: 40px; }
  .empty h1 { font-family: var(--font-heading); font-weight: 500; font-size: 3rem; }
  .empty p { font-size: 1.2rem; opacity: .8; }
  .counter { position: absolute; top: 20px; right: 28px; font-size: .9rem; opacity: .6; z-index: 5; }
</style>
</head>
<body>
<div class="empty" id="empty"><h1>${escapeHtml(plainTitle)}</h1><p>Scanează codul QR și încarcă primele poze!</p></div>
<div class="slide" id="s0"><div class="bg"></div></div>
<div class="slide" id="s1"><div class="bg"></div></div>
<div class="title">${escapeHtml(plainTitle)}</div>
<div class="counter" id="counter"></div>
<div class="corner"><div id="qr"></div><div><b>Scanează</b><small>și încarcă pozele tale de la eveniment</small></div></div>
<script>
const BASE = ${jsonForScript(base)};
const KEY = ${jsonForScript(opts.key || '')};
const VID = /\\.(mp4|m4v|mov|webm|mkv|avi|3gp|ts|mts|m2ts|mpg|mpeg|wmv)$/i;
const INTERVAL = 7000;
const qr = qrcode(0, 'M'); qr.addData(${jsonForScript(opts.qrUrl)}); qr.make();
document.getElementById('qr').innerHTML = qr.createSvgTag({ cellSize: 4, margin: 1, scalable: true });

let items = [], known = new Set(), queue = [], idx = 0, cur = 0, timer = null;
function fileUrl(key) { return BASE + '/file/' + encodeURIComponent(key) + (KEY ? '?k=' + encodeURIComponent(KEY) : ''); }
async function refresh() {
  try {
    const data = await fetch(BASE + '/api/gallery' + (KEY ? '?k=' + encodeURIComponent(KEY) : '')).then(r => r.json());
    const list = (data.items || []).slice().sort((a, b) => new Date(a.uploaded) - new Date(b.uploaded));
    for (const it of list) if (!known.has(it.key)) { known.add(it.key); if (items.length) queue.push(it); }
    items = list;
    document.getElementById('empty').style.display = items.length ? 'none' : 'flex';
    document.getElementById('counter').textContent = items.length ? items.length + ' amintiri' : '';
    if (items.length && !timer) next();
  } catch (e) {}
}
function next() {
  clearTimeout(timer);
  if (!items.length) { timer = null; return; }
  let it;
  if (queue.length) it = queue.shift();
  else { idx = (idx + 1) % items.length; it = items[idx]; }
  const slide = document.getElementById('s' + (cur ^= 1));
  const other = document.getElementById('s' + (cur ^ 1));
  const url = fileUrl(it.key);
  const isVideo = (it.contentType || '').startsWith('video/') || VID.test(it.key);
  slide.querySelector('img, video')?.remove();
  slide.querySelector('.bg').style.backgroundImage = isVideo ? 'none' : 'url("' + url + '")';
  let dur = INTERVAL;
  if (isVideo) {
    const v = document.createElement('video'); v.src = url; v.muted = true; v.autoplay = true; v.playsInline = true;
    v.onended = () => next();
    v.onerror = () => next();
    slide.appendChild(v);
    dur = 60000;
  } else {
    const img = document.createElement('img'); img.src = url;
    img.onerror = () => next();
    slide.appendChild(img);
  }
  slide.classList.add('show'); other.classList.remove('show');
  timer = setTimeout(next, dur);
}
refresh();
setInterval(refresh, 15000);
document.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === ' ') next(); });
</script>
</body>
</html>`;
}

/* ---------- Galerie publică pentru invitați ---------- */

export function renderGalleryPage(ev, opts) {
  const tpl = templateFor(ev.template);
  const pal = palette(normalizeColors(ev.template, ev.colors));
  const base = opts.base || '';
  const plainTitle = ev.name2 ? `${ev.name1} & ${ev.name2}` : ev.name1;
  return `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Galerie — ${escapeHtml(plainTitle)}</title>
<meta name="robots" content="noindex">
${fontLink(tpl)}
<style>
${cssVars(tpl, pal)}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: var(--font-body); background: var(--bg); color: var(--text); }
  header { text-align: center; padding: 26px 16px 10px; }
  header h1 { font-family: var(--font-heading); font-weight: 500; color: var(--c1d); font-size: clamp(1.8rem, 7vw, 2.6rem); }
  header h1 .amp { font-style: italic; color: var(--c1); }
  header a { color: var(--c1); font-size: .9rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 6px; padding: 12px; max-width: 1100px; margin: 0 auto; }
  .grid img, .grid video { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; border-radius: 8px; background: var(--c1l); }
  .empty { text-align: center; color: var(--muted); padding: 40px 16px; }
  .lb { position: fixed; inset: 0; background: rgba(0,0,0,.92); display: none; align-items: center; justify-content: center; z-index: 10; }
  .lb.show { display: flex; }
  .lb img, .lb video { max-width: 96vw; max-height: 92vh; border-radius: 6px; }
  .lb .x { position: absolute; top: 12px; right: 18px; color: #fff; font-size: 2rem; cursor: pointer; }
</style>
</head>
<body>
<header>
  <h1>${ev.name2 ? `${escapeHtml(ev.name1)} <span class="amp">&amp;</span> ${escapeHtml(ev.name2)}` : escapeHtml(ev.name1)}</h1>
  <a href="${escapeHtml(base || '/')}">← Înapoi la încărcare</a>
</header>
<div class="grid" id="grid"></div>
<div class="empty" id="empty" hidden>Încă nu s-a încărcat nimic. Fii primul!</div>
<div class="lb" id="lb"><span class="x" id="lbx">×</span><div id="lbc"></div></div>
<script>
const BASE = ${jsonForScript(base)};
const VID = /\\.(mp4|m4v|mov|webm|mkv|avi|3gp|ts|mts|m2ts|mpg|mpeg|wmv)$/i;
fetch(BASE + '/api/gallery').then(r => r.json()).then(data => {
  const grid = document.getElementById('grid');
  document.getElementById('empty').hidden = data.items.length > 0;
  for (const it of data.items) {
    const url = BASE + '/file/' + encodeURIComponent(it.key);
    const isVideo = it.contentType.startsWith('video/') || VID.test(it.key);
    const el = document.createElement(isVideo ? 'video' : 'img');
    el.src = isVideo ? url + '#t=0.1' : url;
    if (isVideo) { el.muted = true; el.playsInline = true; el.preload = 'metadata'; } else { el.loading = 'lazy'; }
    el.onclick = () => {
      const c = document.getElementById('lbc');
      c.innerHTML = isVideo ? '<video src="' + url + '" controls autoplay playsinline></video>' : '<img src="' + url + '">';
      document.getElementById('lb').classList.add('show');
    };
    grid.appendChild(el);
  }
});
document.getElementById('lbx').onclick = () => { document.getElementById('lb').classList.remove('show'); document.getElementById('lbc').innerHTML = ''; };
</script>
</body>
</html>`;
}
