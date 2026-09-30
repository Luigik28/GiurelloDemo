# Giurello – nuovo sito (demo)

Demo del nuovo sito di [giurello.it](https://giurello.it), con uno stile moderno. È pensata per girare su **Google Cloud** (Cloud Run oppure App Engine). Tutta la logica è **lato server**, così chi visita il sito non riesce a copiarne il funzionamento guardando il codice sorgente.

## Cosa contiene

| Pagina | Contenuto |
|---|---|
| `/` | Hero, numeri, punti di forza, concorsi in evidenza, Galletto AI, come funziona, masterclass, testimonianze, FAQ |
| `/concorsi` | Catalogo dei 14 simulatori con filtro per categoria e ricerca |
| `/concorsi/:slug` | Scheda del corso: materie, prezzo, acquisto (link all'attuale Thinkific), corsi correlati |
| `/universita` | Masterclass *Smart Legal Studies*, corsi per materia, supporto (metodo, sessione, tesi, post-laurea) |
| `/galletto` | Chat demo con Galletto e **generatore del piano di studio** (calcolato sul server) |
| `/simulatore` | Quiz demo con **correzione sul server** e spiegazione con il riferimento normativo |
| `/chi-siamo`, `/contatti` | Presentazione dell'azienda e modulo di contatto (validazione e anti-spam lato server) |
| `/privacy`, `/condizioni` | Testi segnaposto |
| `/sitemap.xml`, `/robots.txt`, `/healthz` | SEO e health check |

Il sito ha tema chiaro e scuro, è responsive e rispetta l'accessibilità di base (skip link, focus visibile, `prefers-reduced-motion`).

## Protezione del codice: cosa si ottiene e cosa no

Nessun sito web può nascondere del tutto quello che il browser deve visualizzare: HTML e CSS arrivano sempre al visitatore. Questa architettura però fa sì che **niente di ciò che ha valore esca dal server**:

- **Pagine renderizzate sul server** (Express + EJS): al browser arriva solo l'HTML finale, già minificato.
- **Dati e logica solo sul server**: il catalogo, la banca dati dei quiz, le risposte corrette, la logica di Galletto e il calcolo del piano di studio stanno in `server/` e non vengono mai inviati al browser.
- **Quiz a prova di sbirciata**: le opzioni vengono rimescolate e firmate con un token HMAC. La risposta giusta la conosce solo il server, e un token manomesso viene rifiutato.
- **JavaScript client minificato e offuscato** (esbuild + javascript-obfuscator, con `selfDefending`). Il file ha un hash nel nome e non ci sono source map.
- **L'immagine Docker di produzione contiene solo `server/` e `dist/`**: i sorgenti client (`client/`) non vengono pubblicati.
- **Header di sicurezza** (Helmet): CSP restrittiva (niente script inline o esterni), `frame-ancestors 'none'` contro l'embedding e rate limiting sulle API.

## Sviluppo locale

```bash
npm install
npm run dev          # build + server su http://localhost:8080
npm run check        # smoke test di pagine e API (richiede una build)
```

Struttura:

```
server/
  data/        contenuti (sito, corsi, università, quiz): sostituibili con un CMS o con Firestore
  services/    logica (quiz, Galletto, contatti)
  routes/      pagine e API
  views/       template EJS (pages + partials)
client/        sorgenti JS/CSS (NON pubblicati: vengono compilati in dist/)
scripts/       build (minificazione + offuscamento) e smoke test
```

## Deploy su Google Cloud

### Opzione A: Cloud Run (consigliata)

```bash
gcloud config set project <PROJECT_ID>
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com

# segreto per firmare i token dei quiz (condiviso fra le istanze)
openssl rand -hex 32 | gcloud secrets create giurello-app-secret --data-file=-
gcloud artifacts repositories create web --repository-format=docker --location=europe-west8

# build + deploy
gcloud builds submit --config cloudbuild.yaml
```

Per una prova veloce basta anche `gcloud run deploy giurello-web --source . --region europe-west8 --allow-unauthenticated`.

Al service account di Cloud Run va concesso il ruolo `Secret Manager Secret Accessor` sul segreto. Il dominio `giurello.it` si collega da **Cloud Run → Gestisci domini personalizzati** (oppure con un Load Balancer).

### Opzione B: App Engine

```bash
gcloud app deploy
```

Lo script `gcp-build` esegue minificazione e offuscamento direttamente sui server di Google.

## Da completare per il prodotto finale

- [ ] Verificare con il cliente i testi, i prezzi, le materie dei corsi, l'email e la P.IVA (`server/data/*.js`). Il sito originale non era raggiungibile dall'ambiente di sviluppo, quindi i contenuti sono stati ricostruiti dalle pagine pubbliche indicizzate (sito, catalogo Thinkific, profili social).
- [ ] Sostituire le testimonianze dimostrative con recensioni reali e autorizzate.
- [ ] Testi legali definitivi (privacy, condizioni, cookie).
- [ ] Galletto: collegare un modello linguistico (per esempio Vertex AI) dietro a `gallettoService.reply()`, mantenendo la stessa API.
- [ ] Contatti: salvare su Firestore e inviare una notifica email.
- [ ] Checkout interno o integrazione con Thinkific (oggi i pulsanti "Acquista" aprono lo store attuale).
- [ ] Immagini e logo ufficiali (quelli attuali sono segnaposto in SVG).
