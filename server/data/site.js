'use strict';

/**
 * Contenuti del sito, ripresi da giurello.it e giurello.thinkific.com.
 * In un prodotto completo possono arrivare da un CMS: le viste leggono solo da qui.
 */

const { areas, byNames } = require('./catalog');

const productHref = (name) => {
  const p = byNames([name])[0];
  return p ? `/prodotto/${p.slug}` : '/concorsi';
};

const STORE = 'https://giurello.thinkific.com';

module.exports = {
  name: 'Giurello',
  tagline: 'Il tuo compagno di studio per diventare un vero giurista',
  claim: 'Con i nostri corsi, impari anche se non vuoi.',
  description:
    'Giurello è la prima piattaforma che integra piani di studio passo passo nella formazione: simulatori per concorsi pubblici, dispense, podcast, corsi per l’università e l’esame d’avvocato.',
  baseUrl: process.env.PUBLIC_BASE_URL || 'https://www.giurello.it',
  storeUrl: STORE,
  loginUrl: `${STORE}/users/sign_in`,
  cartUrl: `${STORE}/cart`,
  company: {
    legalName: 'Giurello S.r.l.',
    address: 'Viale del Lavoro 43',
    zip: '37036',
    city: 'San Martino Buon Albergo',
    province: 'VR',
    vat: '05047360234',
    email: 'info@giurello.it'
  },
  legal: {
    privacy: 'https://www.iubenda.com/privacy-policy/98702159',
    cookie: 'https://www.iubenda.com/privacy-policy/98702159/cookie-policy',
    terms: `${STORE}/pages/condizioni-generali-del-servizio`
  },
  social: [
    { name: 'Instagram', url: 'https://www.instagram.com/giurello_official/', icon: 'instagram' },
    { name: 'YouTube', url: 'https://www.youtube.com/@Giurello', icon: 'youtube' }
  ],
  announcement: {
    text: 'Nuovo: preparati al concorso INPS per Funzionari PECS con il nostro simulatore!',
    cta: 'Scopri di più',
    href: productHref('Corso completo Funzionari INPS')
  },
  navAreas: areas.filter((a) => a.id !== 'area-umanistica'),
  nav: [
    { label: 'Dispense', href: '/dispense' },
    { label: 'Università', href: '/universita' },
    { label: 'Podcast e altro', href: '/podcast-e-altro' },
    { label: 'Avvocato', href: '/avvocato' },
    { label: 'Chi siamo', href: '/chi-siamo' },
    { label: 'Help', href: '/help' }
  ],
  trust: [
    { icon: 'users', text: 'Oltre 10.000 studenti formati' },
    { icon: 'star', text: 'Corsi pratici, aggiornati e concreti' },
    { icon: 'clock', text: 'Formazione flessibile: impara quando vuoi' },
    { icon: 'heart', text: 'Supporto e community sempre con te' }
  ],
  // "Che cosa troverai su Giurello" (home originale)
  offers: [
    {
      icon: 'laptop',
      title: 'Simulatori di quiz',
      text: 'I nostri simulatori sono fatti a mano da un tutor, creati per ogni specifico concorso sulla base degli articoli del bando.',
      bullets: ['Sempre aggiornati fino al giorno della prova', '150 quiz al giorno', 'Spiegazioni per ogni risposta', 'Statistiche e monitoraggio progressi', 'Accesso da qualsiasi dispositivo', 'Supporto via email entro 48 ore'],
      price: '€129',
      note: 'Ma dopo le prime 24 ore dal lancio lo paghi 150 euro, anche a rate con un piccolo sovrapprezzo. Seguici sui social, perché lanciamo simulatori nuovi ogni settimana.',
      cta: 'Scegli il simulatore',
      href: '/concorsi?tipo=simulatore'
    },
    {
      icon: 'book',
      title: 'Dispense',
      text: 'Riassunti completi, chiari e aggiornati dei manuali più richiesti nei concorsi pubblici e nelle facoltà di giurisprudenza.',
      bullets: ['Dispense complete in formato PDF', 'In media non più di 200 pagine', 'Scritte in modo semplice e chiaro', 'Basate sui libri più utilizzati in Italia', 'È possibile stamparle'],
      price: '€30 - €50',
      note: 'Periodicamente le dispense vanno in sconto: segui i nostri social per individuare il momento giusto.',
      cta: 'Scopri le materie',
      href: '/dispense',
      featured: true
    },
    {
      icon: 'headphones',
      title: 'Podcast e corsi per i tuoi punti deboli',
      text: 'C’è chi deve finalmente capire una materia ostica, chi perde punti in logica, chi non sa come affrontare l’inglese o ha bisogno di un metodo di studio più efficace.',
      bullets: ['Podcast e videolezioni', 'Schemi Salva Estate', 'Corso di inglese per concorsisti', 'Puoi ascoltarlo dove e quando vuoi', 'Corso di logica per concorso', 'Corsi situazionali per concorsi'],
      price: '€15 - €150',
      note: 'Gli strumenti con cui possiamo aiutarti sono vari e per tutte le tasche: dai uno sguardo alla nostra libreria.',
      cta: 'Scopri di più',
      href: '/podcast-e-altro'
    }
  ],
  // "Tutti i nostri corsi comprendono" (giurello.thinkific.com)
  promises: [
    { icon: 'clock', title: 'Lezioni di impatto', text: 'Ogni corso è composto da tante lezioni brevi di 5/10 minuti, con il tempo necessario per capire e seguire il ragionamento. Tutti i nostri corsi sono ADHD friendly.' },
    { icon: 'heart', title: 'Supporto emotivo', text: 'I corsi sono pensati per non impattare troppo sulla psiche dello studente: il nostro obiettivo è darti serenità nello studio, non l’esaurimento.' },
    { icon: 'target', title: 'Esempi concreti', text: 'Accanto alla teoria e al perché delle cose trovi sempre esempi pratici, affinché il concetto rimanga nella memoria.' },
    { icon: 'shield', title: 'Testato', text: 'Tutto ciò che insegniamo è già stato provato con altri studenti che hanno raggiunto i risultati sperati: il metodo Giurello è efficace e provato.' },
    { icon: 'check', title: 'Soddisfatto o rimborsato', text: 'Puoi fare il reso di ogni corso fino al 15% del suo utilizzo.' },
    { icon: 'mail', title: 'Dai un’occhiata prima', text: 'Scrivici a info@giurello.it per ricevere un’anteprima delle nostre dispense prima di acquistare.' }
  ],
  // Recensioni pubblicate su giurello.thinkific.com
  reviews: [
    { title: 'Soddisfacente', author: 'Tiziana Persico', text: 'Il simulatore risulta completo e ben costruito, i quiz non sono banali e trattano ampiamente le materie previste dal bando. La parte dei quiz situazionali rappresenta un tratto distintivo rispetto agli altri simulatori presenti sul mercato, ho particolarmente apprezzato la suddivisione in settimane e ritengo questo strumento molto utile!' },
    { title: 'Consiglio a tutti di provare almeno una volta i loro corsi!', author: 'Antonietta Violante', text: 'Ho trovato il loro corso il più centrato sulla prova rispetto ad altre banche dati utilizzate. La ripetizione costante dei quiz aiuta tantissimo nella memorizzazione delle normative utili per il superamento delle prove!' },
    { title: 'Ottimo simulatore', author: 'Erica Franceschin', text: 'Questo simulatore è perfetto per chi vuole non solo esercitarsi ed apprendere in modo facile ed efficace ma anche avere una organizzazione ed una suddivisione del lavoro già pronta, preparata da persone disponibili e competenti.' },
    { title: 'Non piangere per diritto commerciale', author: 'Giulia Montesano', text: 'Questo corso è fantastico! La dispensa è eccezionale, scrittura chiara e comprensibile, senza gli inutili giri di parole in cui si perdono i manuali, e le lezioni a supporto rendono ancora più fluido il ragionamento.' },
    { title: 'Ottimo simulatore', author: 'Mattia Del Re', text: 'Un ottimo supporto per affrontare materie specifiche come quelle su dogane e giochi richieste per la prova. Mi ha aiutato molto a indirizzare lo studio verso gli argomenti più importanti.' },
    { title: 'Sempre ottimi', author: 'Caterina Cimmino', text: 'Come sempre confermate la vostra bravura nella realizzazione dei simulatori! Le domande coprono veramente tutto il programma e permettono una preparazione assolutamente adeguata! Una garanzia insomma!' },
    { title: 'Scoperta incredibile!', author: 'Matteo Pelliccia', text: 'Corso completo e perfetta integrazione di uno studio mirato delle normative oggetto del concorso. Uno strumento indispensabile che mi ha permesso di approcciare per la prima volta in maniera seria e convinta a questo mondo.' },
    { title: 'Ottimo simulatore', author: 'Letizia Gallo', text: 'Il simulatore è davvero ben fatto, permette di memorizzare la normativa in maniera semplice e veloce.' },
    { title: 'Super consigliato', author: 'Letizia Gallo', text: 'Correzioni veloci, molto precise e dettagliate.' }
  ],
  // Pagina Dispense
  dispense: {
    intro: 'Studia e ripassa le materie che ti servono con materiali chiari, aggiornati e organizzati per farti risparmiare tempo.',
    bullets: ['Basate sui manuali più utilizzati in Italia, ma più veloci e brevi', 'Aggiornate e ricche di esempi', 'Organizzate per essere studiate in massimo 1 mese', 'Perfette sia per gli esami che per i concorsi'],
    categories: [
      { title: 'Dispense di diritto', text: 'Dalle materie fondamentali a quelle più specialistiche: trova la dispensa giuridica che ti serve per il tuo esame o concorso.', href: '/concorsi/area-giuridica?tipo=dispensa' },
      { title: 'Dispense di economia', text: 'Economia, contabilità e management spiegati in modo chiaro, anche se parti da zero. Per esami universitari e concorsi.', href: '/concorsi/area-economica?tipo=dispensa' },
      { title: 'Storia e materie umanistiche', text: 'Storia, geografia, arte, archeologia e altre materie da preparare per concorsi e selezioni specifiche.', href: '/concorsi/area-umanistica' },
      { title: 'Ebook normativi', text: 'La normativa che ti serve per il tuo concorso, selezionata e raccolta in un unico documento facile da consultare.', href: '/concorsi?tipo=ebook' },
      { title: 'Enti locali', text: 'Materiali dedicati a chi prepara i concorsi di Comuni ed enti locali: diritto, contabilità, normativa e strumenti specifici.', href: '/concorsi/area-enti-locali?tipo=dispensa' },
      { title: 'Guide e strumenti pratici', text: 'Metodo, strategie e strumenti operativi per organizzare lo studio e affrontare concretamente le prove di esami e concorsi.', href: '/concorsi?tipo=schemi' }
    ]
  },
  // Pagina Podcast e altro
  tools: [
    { icon: 'headphones', title: 'Podcast e corsi per materia', text: 'Studia o ripassa una singola materia con lezioni, spiegazioni ed esempi pensati per rendere più semplici anche gli argomenti più complessi.', href: '/concorsi?tipo=podcast' },
    { icon: 'puzzle', title: 'Logica e quiz situazionali', text: 'Impara il metodo per affrontare logica, ragionamento e quesiti situazionali sempre più presenti nei concorsi pubblici.', href: '/concorsi?q=logica' },
    { icon: 'lang', title: 'Inglese per concorsi', text: 'Preparati alle prove di inglese con un percorso pratico per comprendere, scrivere e affrontare la lingua richiesta nei concorsi pubblici.', href: '/concorsi/area-epso-e-lingue' },
    { icon: 'users', title: 'Tutor e metodo di studio', text: 'Impara a organizzare lo studio, per un concorso o per un esame. Le nostre tutor ti orientano dalla prima sessione fino alla tesi e al tuo primo concorso.', href: '/concorsi?tipo=tutor' },
    { icon: 'book', title: 'Ebook normativi', text: 'La normativa che ti serve per il tuo concorso, selezionata e raccolta in un unico documento facile da consultare.', href: '/concorsi?tipo=ebook' },
    { icon: 'doc', title: 'Schemi Salva Estate', text: 'Schemi essenziali e semplificati per ripassare rapidamente le materie più complesse e fissare i concetti davvero importanti.', href: '/concorsi?tipo=schemi' }
  ],
  // Pagina Avvocato
  lawyer: {
    title: 'Diventa Avvocato con Giurello',
    intro: 'Tutte le risorse e i servizi pensati per accompagnarti durante il tuo percorso universitario e oltre.',
    services: [
      { icon: 'doc', title: 'Riassunti e dispense', text: 'Accedi a migliaia di riassunti e dispense dei tuoi esami.', href: '/dispense' },
      { icon: 'users', title: 'Prenota un incontro con il tutor', text: 'Parla con un tutor esperto e ricevi supporto personalizzato.', href: '/concorsi?tipo=tutor' },
      { icon: 'headphones', title: 'Podcast di ripasso', text: 'Ascolta i podcast per ripassare ovunque e quando vuoi.', href: '/concorsi?tipo=podcast' },
      { icon: 'compass', title: 'Metodo di studio', text: 'Scopri strategie e tecniche per studiare meglio e ottenere risultati concreti.', href: '/universita' },
      { icon: 'road', title: 'Orientamento post laurea', text: 'Scopri opportunità, percorsi e consigli per il tuo futuro professionale.', href: productHref('LEGALPATH') }
    ]
  },
  // Pagina Chi siamo
  about: {
    title: 'Il team Giurello',
    subtitle: 'Un gruppo che cresce insieme a chi studia',
    intro: 'Giurello nasce da un’idea condivisa, ma prende forma grazie a un team che cresce insieme al progetto. Un gruppo affiatato, con competenze complementari e una visione comune: offrire un supporto concreto e strutturato a chi affronta esami universitari e concorsi nel campo del diritto.',
    teams: [
      { icon: 'book', title: 'Didattica', text: 'Tutor, docenti, giuristi e redattori si occupano ogni giorno della produzione dei contenuti, dello sviluppo dei quiz e della revisione dei materiali, con un’attenzione costante all’efficacia didattica e all’aggiornamento normativo.' },
      { icon: 'laptop', title: 'Marketing e sviluppo informatico', text: 'Professionisti della comunicazione e dello sviluppo digitale lavorano per rendere Giurello accessibile, riconoscibile e funzionale. Portano il nostro metodo dove serve, con gli strumenti e i linguaggi giusti.' },
      { icon: 'shield', title: 'I nostri alleati silenziosi: i beta tester', text: 'Una community attiva di beta tester verifica i contenuti prima del rilascio. Il loro contributo è fondamentale per garantire qualità, precisione e aggiornamento continuo.' }
    ],
    milestoneTitle: 'Una startup che cammina con le proprie gambe',
    milestone: 'Essere arrivati fin qui grazie alla qualità del prodotto e alla forza del metodo. Giurello non si basa sull’immagine di un singolo founder, ma su un’idea condivisa di autonomia, coerenza e solidità. È una realtà indipendente, costruita su ciò che offre, non su chi la rappresenta.',
    communityTitle: 'Una community vera, che non si arrende',
    community: 'Abbiamo costruito una community fatta di studenti determinati, appassionati, capaci di affrontare i momenti difficili con metodo e coraggio. Giurello non promette miracoli. Promette un passo alla volta, fatto bene. È quel segnale che ti rimette in moto, quando la disperazione prende il sopravvento. È metodo, costanza e fiducia in sé.'
  },
  // Galletto (pagina Podcast e altro)
  galletto: {
    intro: 'Sai già come studiare per il tuo prossimo esame o concorso? Ti senti insicuro, non sai da dove iniziare o vuoi semplicemente una conferma di essere sulla strada giusta? Con Galletto, la tua IA personale per lo studio, non perdi tempo!',
    features: [
      { icon: 'calendar', text: 'Pianifica il tuo studio in modo intelligente e personalizzato' },
      { icon: 'chat', text: 'Ti interroga con domande d’esame sulle materie giuridiche' },
      { icon: 'target', text: 'Analizza le tue risposte e ti guida a migliorare' },
      { icon: 'spark', text: 'Ti aiuta a ripassare e consolidare le nozioni chiave' }
    ],
    about: 'Galletto è una AI specializzata nel metodo di studio universitario e per i concorsi italiani, sviluppata sulla base dell’esperienza di vincitori ai concorsi.',
    plans: [
      { name: 'Prova gratuita', price: '€0', period: '2 giorni da attivazione', items: [['Domande limitate', true], ['Simulazione', false], ['Assistenza', false], ['Sconti', false]], cta: 'Voglio provare' },
      { name: 'Pacchetto mensile', price: '€4,99', period: '1 mese', items: [['Domande illimitate', true], ['Simulazione esame', true], ['Assistenza via email', true]], cta: 'Voglio 1 mese', featured: true },
      { name: 'Pacchetto annuo', price: '€50', period: '1 anno', items: [['Simulazione esame', true], ['Supporto 24/7', true], ['10% di sconto sui prodotti', true]], cta: 'Scegli l’annuale' }
    ]
  },
  // Testo comune alle schede dei simulatori (dalla scheda "Concorso Magistratura tributaria" di giurello.it)
  simulator: {
    hook: 'Hai mai avuto la sensazione di navigare a vista?',
    story: [
      'Materiale dispersivo, normativa da cercare ovunque, nessuna guida chiara, e poi la classica domanda: «Ma sto davvero studiando nel modo giusto?» Se ti è successo, sappi che non sei il solo.',
      'Il nostro corso simulatore nasce proprio da qui: non da un’idea, ma da un ascolto. Abbiamo costruito un percorso concreto per chi è stanco di perdersi nei manuali e cerca finalmente un metodo guidato, quiz calibrati sui bandi ufficiali e una pianificazione intelligente che fa risparmiare tempo e stress.'
    ],
    why: [
      'I quiz sono formulati ad hoc per il concorso',
      'I quiz sono validati dalla community di beta tester',
      'Ti diciamo esattamente cosa fare ogni giorno: non passi alla batteria successiva se non completi almeno l’80% di risposte giuste',
      'Ogni quiz indica articolo, comma e fonte normativa',
      'Quiz divisi anche per singola materia, per allenarti sulle tue lacune',
      'Un metodo per gestire i quiz anche il giorno del concorso'
    ],
    forYou: ['Vuoi superare il concorso con una preparazione concreta e mirata', 'Hai bisogno di allenarti con quiz simili a quelli che troverai durante la prova', 'Vuoi memorizzare la normativa in modo più dinamico ed efficace'],
    faq: [
      { q: 'Se non ho un mio metodo di studio, va bene lo stesso?', a: 'Sì, il simulatore nasce con il metodo di studio incorporato. Ti diciamo esattamente cosa fare e quando farlo: ogni giorno un mix di quiz da completare all’80% per accedere alla batteria successiva. Dopo circa 20 giorni avrai memorizzato l’80% della normativa inserita nel simulatore, la stessa individuata dal bando.' },
      { q: 'È pensato anche per chi non ha mai studiato alcune materie?', a: 'Sì: è possibile memorizzare la normativa «giocando» con essa. Per chi ha più tempo forniamo anche un pacchetto con la dispensa, per comprendere meglio la materia e memorizzare più velocemente i dettagli.' },
      { q: 'Devo già sapere tutto sui concorsi?', a: 'Assolutamente no. Ti spieghiamo anche la strategia da adottare per gestire la prova il giorno del concorso.' },
      { q: 'È aggiornato?', a: 'Sì, il simulatore è creato ad hoc per il concorso selezionando le norme rilevanti, elencate anche all’interno del simulatore. Ogni quiz è validato dai beta tester della community prima della pubblicazione.' },
      { q: 'Posso usarlo da telefono? E offline?', a: 'Puoi usarlo da smartphone, tablet o pc. Al momento serve una connessione a internet.' },
      { q: 'Posso scrivere se ho domande?', a: 'Sì, su Instagram o a info@giurello.it.' }
    ]
  },
  faq: [
    { q: 'Come funzionano i simulatori?', a: 'Ogni simulatore è fatto a mano da un tutor sulla base degli articoli del bando. Contiene il piano di studio integrato: 150 quiz al giorno con spiegazione per ogni risposta, statistiche e monitoraggio dei progressi. Devi solo acquistare ed esercitarti seguendo le nostre indicazioni.' },
    { q: 'Quanto costa un simulatore?', a: 'Nelle prime 24 ore dal lancio costa €129, poi €150. Puoi pagare anche a rate con un piccolo sovrapprezzo. Lanciamo simulatori nuovi ogni settimana: seguici sui social per non perdere il prezzo di lancio.' },
    { q: 'Le dispense si possono stampare?', a: 'Sì. Sono PDF completi, in media non più di 200 pagine, basati sui manuali più utilizzati in Italia e organizzati per essere studiati in massimo un mese.' },
    { q: 'Posso chiedere il rimborso?', a: 'Sì, puoi fare il reso di ogni corso fino al 15% del suo utilizzo.' },
    { q: 'Posso vedere un’anteprima delle dispense?', a: 'Certo: scrivici a info@giurello.it e ti mandiamo un’anteprima prima dell’acquisto.' },
    { q: 'Entro quanto rispondete all’assistenza?', a: 'Rispondiamo via email entro 48 ore.' }
  ]
};
