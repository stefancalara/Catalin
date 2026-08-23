# Nunta Larisa și Cătălin — aplicație de încărcat amintiri

Aplicație web pentru invitați: încarcă poze și clipuri din galeria telefonului
(iPhone și Android) direct în cloud. Construită pentru **Cloudflare Workers + R2**,
cu o limită totală de stocare de **10 GB**.

## Funcționalități

- **Pagina principală** (`/`) — poza mirilor, titlul „Larisa & Cătălin" în nuanțe
  de verde și butonul **„Încarcă amintirile tale"**, care deschide galeria
  telefonului (poze + videoclipuri, selecție multiplă, bară de progres per fișier).
- **Cartonașe printabile** (`/print`) — două planșe A4 cu coduri QR către
  pagina principală, gata de tipărit pe hârtie cartonată: planșa 1 (4 coduri —
  se taie pe verticală și se îndoaie → 2 cartonașe de masă cu QR pe ambele
  fețe) și planșa 2 (2 coduri — doar se îndoaie → un cartonaș mare). Jumătățile
  de sus sunt rotite 180°, ca totul să stea drept după îndoire. Codul QR se
  generează automat cu adresa la care e găzduită aplicația.
- **Panou admin** (`/admin`) — protejat cu utilizator `admin` și parola
  `casadepiatra`. De aici poți:
  - vedea toate amintirile încărcate (grilă cu poze/clipuri),
  - descărca sau șterge orice fișier,
  - vedea spațiul folosit din cei 10 GB,
  - **încărca poza mirilor** care apare pe pagina principală.
- Limite: 10 GB în total, 100 MB per fișier (limita de request Cloudflare Workers).

## Cum îl pui pe Cloudflare

Ai nevoie de un cont Cloudflare (gratuit) cu R2 activat, apoi:

```bash
# 1. Autentificare
npx wrangler login

# 2. Creează bucket-ul R2 pentru poze
npx wrangler r2 bucket create nunta-larisa-catalin

# 3. Publică aplicația
npx wrangler deploy
```

Wrangler îți afișează adresa aplicației (ceva de forma
`https://nunta-larisa-catalin.<subdomeniul-tau>.workers.dev`). Poți lega și un
domeniu propriu din dashboard-ul Cloudflare (Workers → Settings → Domains & Routes).

## Poza mirilor

Poza cu Larisa și Cătălin se pune direct din panoul de admin:
intră pe `/admin`, secțiunea **„Poza mirilor de pe pagina principală"**,
și alege poza — apare automat pe prima pagină. Până atunci se afișează un
placeholder elegant.

## Configurare

Totul e în `wrangler.toml`:

| Variabilă         | Valoare implicită | Descriere                    |
|-------------------|-------------------|------------------------------|
| `ADMIN_USER`      | `admin`           | Utilizator panou admin       |
| `ADMIN_PASS`      | `casadepiatra`    | Parola panoului admin        |
| `MAX_TOTAL_BYTES` | `10737418240`     | Limita totală (10 GB)         |
| `MAX_FILE_BYTES`  | `104857600`       | Limita per fișier (100 MB)   |

> Recomandare: după nuntă, poți descărca tot conținutul bucket-ului cu
> `rclone` sau din dashboard-ul Cloudflare R2, apoi șterge bucket-ul.

## Structura proiectului

```
├── wrangler.toml          # configurația Cloudflare (Worker + R2 + variabile)
├── src/index.js           # Worker-ul: API upload, servire poze, /admin
└── public/
    ├── index.html         # pagina pentru invitați
    └── couple-placeholder.svg  # placeholder până se încarcă poza mirilor
```

## Testare locală

```bash
npx wrangler dev
```

Rulează aplicația local cu un bucket R2 simulat — poți testa upload-ul și
panoul de admin înainte de deploy.
