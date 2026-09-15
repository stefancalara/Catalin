# PozeQR — platformă de colectat poze și clipuri de la invitați prin cod QR

Invitații scanează un cod QR de pe masă, se deschide o pagină în browser (fără
aplicație, fără cont) și încarcă poze și clipuri din galeria telefonului. Gazda
are un panou de administrare cu galerie, descărcare totală ZIP, personalizare
(template-uri, culori, texte, poză), cartonașe QR de printat, slideshow live
pentru proiector și carte de oaspeți.

Construită pe **Cloudflare Workers + R2**. Mai multe evenimente pe același Worker,
fiecare cu adresa lui: `/e/<adresa-evenimentului>`.

## Pagini și rute

| Adresă | Ce este |
|---|---|
| `/` | Pagina de prezentare a platformei (pe domeniul platformei) sau evenimentul rădăcină (vezi `ROOT_EVENT`) |
| `/creeaza` | Formular de creare eveniment: tip, nume, adresă, template, culori, parolă |
| `/e/<slug>` | Pagina invitaților (upload) |
| `/e/<slug>/galerie` | Galeria publică (dacă e activată de gazdă) |
| `/e/<slug>/slideshow?k=…` | Slideshow live pentru proiector/TV (link secret din admin) |
| `/e/<slug>/print` | 4 planșe A4 cu cartonașe QR, în stilul paginii |
| `/e/<slug>/admin` | Panoul evenimentului (parolă, sesiune pe cookie) |
| `/owner` | Panoul proprietarului platformei (Basic Auth `OWNER_USER`/`OWNER_PASS`): toate evenimentele, activare plan, limite, intrare în orice admin, migrare fișiere vechi |

## Panoul evenimentului (`/e/<slug>/admin`)

- **Amintiri** — grilă cu poze/clipuri, descărcare sau ștergere individuală, **Descarcă tot (ZIP)**
  (arhiva se construiește în browser; în Chrome/Edge se scrie direct pe disc, în Safari/Firefox
  în memorie, împărțită în părți de 1 GB peste această mărime; include și mesajele din cartea de oaspeți).
- **Personalizare** — 6 template-uri (Smarald, Clasic, Boho, Romantic, Modern, Petrecere), palete
  propuse sau culori proprii (principală, accent, fundal), animație de intrare, poza principală,
  toate textele, cartea de oaspeți și galeria publică — cu **previzualizare live** într-un telefon.
- **Cod QR & linkuri** — adresa invitaților, QR ca PNG/SVG, planșele de printat, linkul de slideshow.
- **Mesaje** — cartea de oaspeți, export ca text.
- **Setări** — plan și spațiu, schimbare parolă, contact, ștergere eveniment.

## Planuri și vânzare

Un eveniment nou pornește pe planul **demo** (`DEMO_MAX_BYTES`, implicit 500 MB). După ce
clientul plătește (transfer, WhatsApp — cum preferi), intri pe `/owner` și apeși **Activează**:
evenimentul primește spațiul complet (`PAID_MAX_BYTES`, implicit 10 GB). Prețul afișat pe site
vine din `PRICE_TEXT`, textul de contact din `CONTACT_TEXT`.

## Configurare (`wrangler.toml`)

| Variabilă | Implicit | Descriere |
|---|---|---|
| `BRAND_NAME` | `PozeQR` | Numele platformei |
| `PRICE_TEXT` | `249 lei` | Prețul afișat |
| `CONTACT_TEXT` | … | Cum te contactează clienții |
| `ROOT_EVENT` | `larisa-si-catalin` | Evenimentul servit la `/` pe adresa Worker-ului (codurile QR vechi merg în continuare) |
| `PLATFORM_HOST` | *(gol)* | Domeniul platformei; pe el `/` e pagina de prezentare |
| `PLATFORM_URL` | `https://pozeqr.ro` | Linkul „realizat cu” din subsolul paginilor |
| `DEMO_EVENT` | *(gol)* | Slug-ul unui eveniment demo legat de pe pagina de prezentare |
| `OWNER_USER` / `OWNER_PASS` | `admin` / … | Contul de proprietar (`/owner`) — schimbă parola! |
| `DEMO_MAX_BYTES` | 500 MB | Spațiul planului demo |
| `PAID_MAX_BYTES` | 10 GB | Spațiul planului plătit |
| `MAX_FILE_BYTES` | 100 MB | Limita per fișier (limita de request Cloudflare Workers) |

Cheia pentru parole și sesiuni se setează ca secret, o singură dată:

```bash
npx wrangler secret put SECRET
```

## Deploy

```bash
npx wrangler login
npx wrangler r2 bucket create nunta-larisa-catalin   # o singură dată
npx wrangler deploy
```

Pe mașini cu Node 20 folosește `npx -y wrangler@3 …` (wrangler 4 cere Node 22).

### Domeniul platformei

Cloudflare Registrar nu vinde `.ro`. Cumpără domeniul de la un registrar acreditat ROTLD
(Hostico etc.), adaugă-l ca site în Cloudflare (plan Free), schimbă nameserverele la registrar pe
cele date de Cloudflare, apoi în Workers → Settings → Domains & Routes adaugă domeniul la Worker.
La final pune `PLATFORM_HOST = "pozeqr.ro"` în `wrangler.toml` și fă deploy.

## Structura în R2

```
ev/<slug>/_config.json   configurația evenimentului (nume, template, culori, parolă hash…)
ev/<slug>/_cover         poza principală
ev/<slug>/f/<cheie>      fișierele încărcate de invitați
ev/<slug>/m/<id>.json    mesajele din cartea de oaspeți
```

Fișierele de dinaintea platformei (la rădăcina bucket-ului) se mută într-un eveniment
din `/owner`, secțiunea „Fișiere vechi”.

## Structura proiectului

```
├── wrangler.toml            configurația Cloudflare (Worker + R2 + variabile)
├── src/index.js             router-ul: rute publice, per eveniment, admin, owner
├── src/store.js             stocarea evenimentelor și fișierelor în R2
├── src/templates.js         template-urile paginii invitaților, print, galerie, slideshow
├── src/util.js              utilitare (HTML, culori, criptografie, cookie-uri)
├── src/pages/admin.js       panoul evenimentului + login
├── src/pages/create.js      /creeaza
├── src/pages/landing.js     pagina de prezentare
├── src/pages/owner.js       /owner
└── public/                  qrcode.js, placeholder, couple.jpg (poza veche a mirilor)
```

## Testare locală

```bash
npx -y wrangler@3 dev --port 8787 --var PLATFORM_HOST:localhost
```

Cu `PLATFORM_HOST:localhost`, `http://localhost:8787/` e pagina de prezentare, iar
`http://127.0.0.1:8787/` evenimentul rădăcină. Bucket-ul R2 e simulat local.
