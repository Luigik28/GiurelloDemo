# Giurello – nuovo sito (demo)

Demo del nuovo sito di [giurello.it](https://giurello.it), con uno stile moderno. È pensata per girare su **Google Cloud** (Cloud Run oppure App Engine). Tutta la logica è **lato server**, così chi visita il sito non riesce a copiarne il funzionamento guardando il codice sorgente.

## Cosa contiene

Contenuti, testi, logo, colori e catalogo sono ripresi dal sito attuale ([giurello.it](https://www.giurello.it)) e dal negozio [giurello.thinkific.com](https://giurello.thinkific.com). La struttura e la navigazione sono le stesse, con una grafica più moderna.

| Pagina | Contenuto |
|---|---|
| `/` | Hero con claim, promo del simulatore in evidenza, "I nostri corsi più amati", aree di formazione con ricerca, "Che cosa troverai su Giurello" (simulatori, dispense, podcast), ultimi concorsi, riassunti dei manuali, "Tutti i nostri corsi comprendono", recensioni reali, newsletter "Rimani aggiornato", FAQ |
| `/concorsi`, `/concorsi/:area` | Catalogo completo (163 prodotti Thinkific) con aree, filtri per tipologia, ricerca e paginazione, tutto lato server |
| `/prodotto/:slug` | Scheda prodotto: descrizione, prezzo, acquisto su Thinkific. Per i simulatori anche "Perché scegliere il nostro simulatore" e le FAQ originali; in fondo i prodotti correlati |
| `/dispense`, `/universita`, `/podcast-e-altro`, `/avvocato` | Pagine di sezione con i testi originali e i prodotti collegati |
| `/galletto` | Galletto AI: presentazione, piani di abbonamento, chat demo e generatore del piano di studio |
| `/chi-siamo`, `/help` | Team, community e modulo "Hai domande?" (nome, cognome, email, telefono, messaggio) |
| `/prova-simulatore` | Quiz demo con correzione lato server |

### Aggiornare il catalogo

```bash
npm run sync-catalog   # scarica prodotti, prezzi, immagini e categorie da Thinkific
```

Lo script rigenera `server/data/catalog.json`. Tipologie (simulatore, dispensa, podcast…) e aree (giuridica, economica, enti locali…) vengono calcolate in `server/data/catalog.js`. Dopo il commit, il deploy su Cloud Run pubblica il catalogo aggiornato.

## Protezione del codice: cosa si ottiene e cosa no

Nessun sito web può nascondere del tutto quello che il browser deve visualizzare: HTML e CSS arrivano sempre al visitatore. Questa architettura però fa sì che **niente di ciò che ha valore esca dal server**:

- **Pagine renderizzate sul server** (Express + EJS): al browser arriva solo l'HTML finale, già minificato.
- **Dati e logica solo sul server**: catalogo, filtri, ricerca, banca dati dei quiz, risposte corrette, logica di Galletto e calcolo del piano di studio stanno in `server/` e non vengono mai inviati al browser.
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

- [ ] Verificare con il cliente l'assegnazione automatica di aree e tipologie (regole in `server/data/catalog.js`).
- [ ] Galletto: collegare il servizio reale (o un modello linguistico, per esempio Vertex AI) dietro a `gallettoService.reply()`, mantenendo la stessa API.
- [ ] Modulo "Hai domande?" e newsletter: salvare su Firestore o CRM e inviare una notifica email (oggi finiscono in Cloud Logging).
- [ ] Sincronizzazione automatica del catalogo (per esempio con Cloud Scheduler).
- [ ] Il consenso cookie (iubenda) va aggiunto se si inseriscono strumenti di analisi.
