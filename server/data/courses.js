'use strict';

/**
 * Catalogo simulatori per concorsi pubblici.
 * Fonte: catalogo pubblico Giurello (giurello.thinkific.com). Materie e numeri vanno
 * verificati con il cliente prima della messa online: dove un dato non era pubblico
 * il campo è generico.
 * `storePath` = percorso della pagina di acquisto attuale su Thinkific.
 */

const categories = [
  { id: 'giustizia', label: 'Giustizia' },
  { id: 'fisco', label: 'Agenzie fiscali' },
  { id: 'enti-locali', label: 'Enti locali' },
  { id: 'sanita', label: 'Sanità' },
  { id: 'ministeri', label: 'Ministeri ed enti' },
  { id: 'sicurezza', label: 'Sicurezza' }
];

const courses = [
  {
    slug: 'magistratura-tributaria',
    title: 'Concorso Magistratura tributaria',
    category: 'giustizia',
    featured: true,
    badge: 'Più scelto',
    summary: 'Simulatore con quiz sulla normativa individuata dal bando, inclusi quiz situazionali.',
    description:
      "Un simulatore completo e ben costruito, con quiz non banali che coprono ampiamente le materie previste dal bando. Dopo circa 20 giorni di quiz costanti puoi arrivare a memorizzare l'80% della normativa inserita nel simulatore, la stessa individuata dal bando di concorso.",
    highlights: ['Quiz situazionali', 'Normativa del bando', 'Piano di 20 giorni'],
    subjects: ['Diritto tributario', 'Processo tributario', 'Diritto civile', 'Diritto commerciale', 'Diritto costituzionale', 'Diritto amministrativo'],
    price: 150,
    storePath: '/courses/ai-placeholder-22'
  },
  {
    slug: 'ufficio-del-processo-21-giorni',
    title: 'Ufficio del processo in 21 giorni',
    category: 'giustizia',
    featured: true,
    badge: '500+ quiz',
    summary: 'Tre settimane, cinque giorni a settimana: oltre 500 quiz per imparare le norme.',
    description:
      'Il corso è strutturato in unità operative: i quiz sono suddivisi in 3 settimane e ogni settimana in 5 giorni di quiz su materie diverse, per un totale di oltre 500 quesiti.',
    highlights: ['3 settimane × 5 giorni', 'Oltre 500 quiz', 'Unità operative'],
    subjects: ['Ordinamento giudiziario', 'Diritto processuale civile', 'Diritto processuale penale', 'Diritto amministrativo', 'Diritto costituzionale'],
    price: 150,
    storePath: '/courses/ufficio-del-processo-in-21-giorni'
  },
  {
    slug: 'avvocatura-consiglio-di-stato-tar',
    title: 'Avvocatura dello Stato, Consiglio di Stato e TAR',
    category: 'giustizia',
    summary: 'Simulatore per assistenti e funzionari della giustizia amministrativa.',
    description:
      'Quiz su tutte le materie del bando per i profili di assistente e funzionario presso Avvocatura dello Stato, Consiglio di Stato e Tribunali amministrativi regionali.',
    highlights: ['Assistenti e funzionari', 'Tutte le materie del bando'],
    subjects: ['Diritto amministrativo', 'Giustizia amministrativa', 'Diritto costituzionale', 'Diritto civile', 'Contabilità pubblica'],
    price: 150,
    storePath: '/courses/ai-placeholder-14'
  },
  {
    slug: 'agenzia-entrate-2025',
    title: 'Pacchetto Agenzia delle Entrate 2025',
    category: 'fisco',
    featured: true,
    badge: 'Pacchetto',
    summary: 'Il pacchetto completo di quiz per superare il concorso Agenzia delle Entrate.',
    description:
      'Tutti i simulatori necessari per la preparazione al concorso Agenzia delle Entrate raccolti in un unico pacchetto, con piano di studio integrato.',
    highlights: ['Pacchetto completo', 'Piano integrato'],
    subjects: ['Diritto tributario', 'Diritto amministrativo', 'Diritto civile', 'Diritto commerciale', 'Contabilità aziendale'],
    price: 189,
    storePath: '/bundles/pacchetto-agenzia-entrate-2025'
  },
  {
    slug: 'agenzia-entrate-funzionari',
    title: 'Agenzia delle Entrate – 2700 funzionari',
    category: 'fisco',
    summary: 'Corso-quiz per il concorso da 2700 funzionari tributari.',
    description: 'Simulatore con quiz sulle materie del bando per il concorso da 2700 funzionari presso l’Agenzia delle Entrate.',
    highlights: ['2700 posti', 'Quiz per materia'],
    subjects: ['Diritto tributario', 'Diritto amministrativo', 'Diritto civile', 'Contabilità aziendale'],
    price: 150,
    storePath: '/courses/agenzientrate'
  },
  {
    slug: 'agenzia-entrate-riscossione',
    title: 'Agenzia delle Entrate – Riscossione',
    category: 'fisco',
    summary: 'Simulatore per il concorso da 470 addetti alla riscossione.',
    description:
      'Corso-simulatore per il concorso per l’assunzione a tempo indeterminato di 470 addetti riscossione. La prova è composta da 60 quesiti a risposta multipla e si considera superata con un punteggio di 21/30.',
    highlights: ['470 posti', '60 quesiti', 'Soglia 21/30'],
    subjects: ['Diritto tributario', 'Riscossione coattiva', 'Diritto civile', 'Diritto amministrativo'],
    price: 150,
    storePath: '/courses/ader2024'
  },
  {
    slug: 'ripam-piccoli-comuni',
    title: 'Ripam – Piccoli comuni',
    category: 'enti-locali',
    summary: 'Quiz mirati e materiali aggiornati per il concorso Ripam dei piccoli comuni.',
    description: 'Materiali aggiornati, quiz mirati e un metodo che ti accompagna passo dopo passo verso la prova del concorso Ripam per i piccoli comuni.',
    highlights: ['Quiz mirati', 'Materiali aggiornati'],
    subjects: ['Ordinamento degli enti locali', 'Diritto amministrativo', 'Diritto costituzionale', 'Contabilità pubblica'],
    price: 150,
    storePath: '/collections/concorsi'
  },
  {
    slug: 'asmel-funzionario-amministrativo',
    title: 'ASMEL – Funzionario amministrativo',
    category: 'enti-locali',
    summary: 'Simulatore con quiz su tutte le materie richieste dal bando ASMEL.',
    description: 'Simulatore con quiz su tutte le materie richieste dal bando per il profilo di funzionario amministrativo ASMEL.',
    highlights: ['Tutte le materie del bando'],
    subjects: ['Ordinamento degli enti locali', 'Diritto amministrativo', 'Contratti pubblici', 'Diritto costituzionale'],
    price: 150,
    storePath: '/courses/ai-placeholder-8'
  },
  {
    slug: 'ats-2025',
    title: 'Concorso ATS 2025',
    category: 'sanita',
    summary: 'Simulatore per il concorso delle Agenzie di Tutela della Salute.',
    description: 'Quiz e piano di studio per il concorso ATS 2025, con le materie previste dal bando.',
    highlights: ['Piano integrato'],
    subjects: ['Legislazione sanitaria', 'Diritto amministrativo', 'Diritto costituzionale', 'Contratti pubblici'],
    price: 150,
    storePath: '/courses/concorsoats'
  },
  {
    slug: 'asl-personale-amministrativo',
    title: 'ASL – Personale amministrativo',
    category: 'sanita',
    summary: 'Preparazione ai concorsi per personale amministrativo nelle aziende sanitarie.',
    description: 'Quiz sulle materie tipiche dei concorsi per personale amministrativo presso le aziende sanitarie locali.',
    highlights: ['Profili amministrativi'],
    subjects: ['Legislazione sanitaria', 'Diritto amministrativo', 'Pubblico impiego'],
    price: 150,
    storePath: '/collections/concorsi'
  },
  {
    slug: 'inps-funzionari',
    title: 'Funzionari INPS',
    category: 'ministeri',
    summary: 'Simulatore per il concorso funzionari dell’Istituto nazionale della previdenza sociale.',
    description: 'Quiz e piano di studio per il concorso funzionari INPS.',
    highlights: ['Piano integrato'],
    subjects: ['Diritto della previdenza sociale', 'Diritto del lavoro', 'Diritto amministrativo', 'Diritto costituzionale'],
    price: 150,
    storePath: '/collections/concorsi'
  },
  {
    slug: 'corte-dei-conti-2026',
    title: 'Concorso Corte dei conti 2026',
    category: 'ministeri',
    badge: 'Nuovo',
    summary: 'Simulatore per il concorso 2026 della Corte dei conti.',
    description: 'Quiz sulle materie del bando del concorso Corte dei conti 2026, con piano integrato.',
    highlights: ['Bando 2026'],
    subjects: ['Contabilità pubblica', 'Diritto amministrativo', 'Diritto costituzionale', 'Diritto civile'],
    price: 150,
    storePath: '/collections/concorsi'
  },
  {
    slug: 'ministero-interno-funzionario-economico',
    title: 'Ministero dell’Interno – Funzionario economico',
    category: 'ministeri',
    summary: 'Corso per il profilo di funzionario economico-finanziario del Ministero dell’Interno.',
    description: 'Simulatore con quiz per il concorso da funzionario economico-finanziario presso il Ministero dell’Interno.',
    highlights: ['Area economico-finanziaria'],
    subjects: ['Economia politica', 'Contabilità pubblica', 'Diritto amministrativo', 'Scienza delle finanze'],
    price: 150,
    storePath: '/courses/Ministerointernieconomico'
  },
  {
    slug: 'commissari-polizia',
    title: '220 Commissari di Polizia',
    category: 'sicurezza',
    summary: 'Simulatore per il concorso a 220 commissari della Polizia di Stato.',
    description: 'Quiz sulle materie giuridiche del concorso per 220 commissari della Polizia di Stato.',
    highlights: ['220 posti', 'Materie giuridiche'],
    subjects: ['Diritto penale', 'Procedura penale', 'Diritto costituzionale', 'Diritto amministrativo', 'Diritto civile'],
    price: 150,
    storePath: '/collections/concorsi'
  }
];

const bySlug = new Map(courses.map((c) => [c.slug, c]));

module.exports = {
  categories,
  courses,
  getCourse: (slug) => bySlug.get(slug) || null,
  categoryLabel: (id) => (categories.find((c) => c.id === id) || {}).label || id
};
