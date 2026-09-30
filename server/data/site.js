'use strict';

const { courses } = require('./courses');

/**
 * Contenuti generali del sito.
 * In un prodotto completo questi dati possono arrivare da un CMS o da Firestore:
 * le viste leggono solo da qui, quindi basta sostituire questo modulo.
 */
module.exports = {
  name: 'Giurello',
  tagline: 'Il tuo compagno di studio per diventare un vero giurista',
  description:
    "Giurello è la piattaforma e-learning che ti supporta nello studio del diritto: simulatori per i concorsi pubblici, metodo di studio per Giurisprudenza e Galletto, l'assistente AI che ti dice cosa fare ogni giorno.",
  baseUrl: process.env.PUBLIC_BASE_URL || 'https://giurello.it',
  company: {
    legalName: 'Giurello S.r.l.',
    address: 'Viale del Lavoro 43',
    zip: '37036',
    city: 'San Martino Buon Albergo',
    province: 'VR',
    country: 'Italia',
    email: 'info@giurello.it', // DA VERIFICARE con il cliente
    vat: 'P.IVA da inserire'
  },
  social: [
    { name: 'Instagram', handle: '@giurello_official', url: 'https://www.instagram.com/giurello_official/', icon: 'instagram' },
    { name: 'YouTube', handle: '@Giurello', url: 'https://www.youtube.com/@Giurello', icon: 'youtube' }
  ],
  // Piattaforma corsi attuale: i pulsanti "Acquista" puntano qui finché il checkout non è internalizzato.
  storeUrl: 'https://giurello.thinkific.com',
  nav: [
    { label: 'Concorsi', href: '/concorsi' },
    { label: 'Università', href: '/universita' },
    { label: 'Galletto AI', href: '/galletto' },
    { label: 'Simulatore', href: '/simulatore' },
    { label: 'Chi siamo', href: '/chi-siamo' }
  ],
  stats: [
    { value: 300, suffix: '+', label: 'studenti di Giurisprudenza aiutati' },
    { value: courses.length, suffix: '', label: 'simulatori per concorsi pubblici' },
    { value: 80, suffix: '%', label: 'della normativa memorizzata in 20 giorni di quiz*' },
    { value: 24, suffix: '/7', label: 'Galletto sempre disponibile' }
  ],
  pillars: [
    {
      icon: 'target',
      title: 'Quiz dalla banca dati ufficiale',
      text: 'Ti eserciti su quesiti realmente usciti nei concorsi precedenti, con una ripartizione settimanale già organizzata.'
    },
    {
      icon: 'calendar',
      title: 'Poco, ma ogni giorno',
      text: 'Ogni percorso è pensato per farti lavorare poco ma con costanza: settimane divise in giorni, giorni divisi in materie.'
    },
    {
      icon: 'spark',
      title: 'Galletto, il tutor AI',
      text: 'Pianifica il tuo studio, ti interroga, analizza le risposte e ti guida nel ripasso dei concetti chiave.'
    },
    {
      icon: 'scale',
      title: 'Fatto da chi studia diritto',
      text: 'Giurello nasce da studenti che sanno cosa significa preparare un esame o un concorso giuridico.'
    }
  ],
  howItWorks: [
    { step: '01', title: 'Scegli il tuo obiettivo', text: 'Un concorso pubblico, un esame universitario o la tesi: trovi il percorso dedicato.' },
    { step: '02', title: 'Segui il piano integrato', text: 'Ogni simulatore include un piano di studio: sai esattamente cosa fare oggi, questa settimana, questo mese.' },
    { step: '03', title: 'Allenati con i quiz', text: 'Ripetizione costante e quiz situazionali per memorizzare le norme richieste dal bando.' },
    { step: '04', title: 'Arriva pronto alla prova', text: 'Galletto monitora i progressi e ti indica dove ripassare prima del giorno X.' }
  ],
  // Testimonianze: ricavate da feedback pubblici, parafrasate. Da sostituire con recensioni verificate e autorizzate.
  testimonials: [
    {
      quote: 'Il corso è molto più centrato sulla prova rispetto ad altre banche dati. La ripetizione dei quiz aiuta davvero a memorizzare le norme.',
      author: 'Candidata concorso pubblico',
      role: 'Testimonianza dimostrativa'
    },
    {
      quote: 'Simulatore completo e ben costruito, quiz non banali e una parte di quiz situazionali che non avevo trovato altrove.',
      author: 'Candidato Magistratura tributaria',
      role: 'Testimonianza dimostrativa'
    },
    {
      quote: 'Il piano settimanale mi ha tolto il pensiero di organizzarmi: aprivo la piattaforma e sapevo cosa fare.',
      author: 'Studente di Giurisprudenza',
      role: 'Testimonianza dimostrativa'
    }
  ],
  faq: [
    {
      q: 'Come funzionano i simulatori per i concorsi?',
      a: "Ogni simulatore contiene quiz su tutte le materie previste dal bando, spesso tratti dalla banca dati ufficiale, suddivisi in settimane e giorni. Devi solo acquistare e seguire le indicazioni del piano integrato."
    },
    {
      q: "Cos'è Galletto?",
      a: "Galletto è l'assistente AI di Giurello: pianifica lo studio in modo personalizzato, ti interroga con domande d'esame, analizza le tue risposte e ti aiuta nel ripasso."
    },
    {
      q: 'Quanto costa un corso?',
      a: 'I simulatori hanno un prezzo di lancio nelle prime 24 ore dalla pubblicazione; poi il prezzo diventa definitivo (in genere 150 €, alcuni pacchetti 189 €).'
    },
    {
      q: 'Posso usare Giurello anche per gli esami universitari?',
      a: 'Sì: la masterclass Smart Legal Studies insegna il metodo di studio per Giurisprudenza e trovi corsi su diverse materie, dal diritto privato al diritto romano.'
    },
    {
      q: 'Da quale dispositivo posso studiare?',
      a: 'Da qualsiasi dispositivo: computer, tablet o smartphone. Ti eserciti dovunque e in ogni momento.'
    }
  ]
};
