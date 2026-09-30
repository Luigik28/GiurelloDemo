# Giurello – nuovo sito (demo)

Demo del nuovo sito di [giurello.it](https://giurello.it), con uno stile moderno. È pensata per girare su **Google Cloud** (Cloud Run oppure App Engine). Tutta la logica è **lato server**, così chi visita il sito non riesce a copiarne il funzionamento guardando il codice sorgente.

## Cosa contiene

Contenuti, testi, logo, colori e catalogo sono ripresi dal sito attuale di Giurello. La struttura e la navigazione sono le stesse, con una grafica più moderna. **Il sito è autonomo**: carrello, pagamento, area studenti, condizioni generali e immagini dei prodotti sono tutti interni, senza collegamenti a Thinkific.

| Pagina | Contenuto |
|---|---|
| `/` | Hero con ricerca e "più cercati", "Riprendi da dove eri", schede "Cosa stai preparando?" (concorso, università, avvocato), invito al percorso guidato, aree, offerta, novità, metodo, recensioni, FAQ, newsletter |
| `/percorso`, `/percorso/risultato` | **Percorso guidato**: tre domande (obiettivo, area o bisogno, tempo) e un piano in quattro mosse con i prodotti consigliati |
| `/concorsi`, `/concorsi/:area` | Catalogo completo (163 prodotti) con aree, tipologie, ricerca, ordinamento, filtri attivi rimovibili e paginazione, tutto lato server |
| `/preferiti` | Prodotti salvati con il cuore |
| `/prodotto/:slug` | Scheda prodotto: descrizione, prezzo, "Acquista ora" e "Aggiungi al carrello". Per i simulatori anche "Perché scegliere il nostro simulatore" e le FAQ originali; in fondo i prodotti correlati |
| `/dispense`, `/universita`, `/podcast-e-altro`, `/avvocato` | Pagine di sezione con i testi originali e i prodotti collegati |
| `/galletto` | Galletto AI: presentazione, piani di abbonamento, chat demo e generatore del piano di studio |
| `/chi-siamo`, `/help` | Team, community e modulo "Hai domande?" (nome, cognome, email, telefono, messaggio) |
| `/prova-simulatore` | Quiz demo con correzione lato server |
| `/carrello`, `/checkout`, `/ordine/:id` | Carrello e checkout interni con **pagamento simulato** (carta, rate, PayPal) |
| `/accedi`, `/area-studenti` | Accesso demo (qualsiasi email e una password di almeno 6 caratteri) e libreria "I miei corsi" con lo storico ordini |
| `/condizioni` | Condizioni generali del servizio (testo attuale da far verificare al legale) |

### Navigazione ed esperienza utente

- **Ricerca istantanea** (`Ctrl+K`, `/` o l'icona della lente): risultati mentre scrivi, parole trovate evidenziate, tolleranza ai refusi, navigazione da tastiera. La ricerca gira sul server (`/api/search`).
- **Menu "Concorsi" allargato** con aree, tipologie e simulatore in evidenza; menu **Risorse**.
- **Su mobile**: menu laterale e barra in basso (Home, Cerca, Percorso, Preferiti, Profilo).
- **Mini carrello laterale**: "Aggiungi" funziona senza cambiare pagina.
- **Preferiti** con il cuore e **"Riprendi da dove eri"** con i prodotti visti di recente.
- **Scheda prodotto**: barra d'acquisto fissa quando il pulsante esce dallo schermo, "Salva" e "Condividi".
- **Rifiniture**: transizioni tra le pagine, barra di avanzamento della lettura, pulsante "torna su", notifiche.
- **Dati strutturati per Google**: organizzazione, FAQ, prodotti e percorso di navigazione.
- Tutte le funzioni funzionano anche **senza JavaScript**, con normali form e link.

### Pagamenti nella demo

Il pagamento è **simulato** (`server/services/shopService.js` → `pay()`): nessun addebito e nessun dato di carta salvato.

- Carta accettata: `4242 4242 4242 4242`, scadenza futura, CVC qualsiasi.
- Carta rifiutata: `4000 0000 0000 0002`, per vedere il caso di errore.
- PayPal e rate sono solo simulati.

Carrello, account e ordini stanno in cookie firmati (HMAC): nessun database. Per il prodotto finale basta sostituire `pay()` con un gateway reale (Stripe, PayPal, Satispay…) e salvare utenti e ordini su Firestore, mantenendo le stesse funzioni.

### Aggiornare il catalogo

```bash
npm run sync-catalog   # importa prodotti, prezzi, immagini e categorie dal vecchio negozio
```

Lo script rigenera `server/data/catalog.json` e salva le immagini, ridimensionate in WebP, in `client/static/prodotti/`: il sito le serve dal proprio dominio. Quando il vecchio negozio verrà dismesso, il catalogo si gestirà direttamente in `catalog.json` (o in un CMS/Firestore). Tipologie (simulatore, dispensa, podcast…) e aree (giuridica, economica, enti locali…) vengono calcolate in `server/data/catalog.js`. Dopo il commit, il deploy su Cloud Run pubblica il catalogo aggiornato.

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
- [ ] Pagamenti reali: gateway di pagamento, fatturazione e email di conferma ordine.
- [ ] Account reali (Firebase Authentication) e ordini su Firestore.
- [ ] Erogazione dei contenuti acquistati (simulatori, PDF, videolezioni) nell'area studenti.
- [ ] Il consenso cookie (iubenda) va aggiunto se si inseriscono strumenti di analisi.
