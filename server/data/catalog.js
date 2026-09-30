'use strict';

/**
 * Catalogo prodotti Giurello.
 * I dati grezzi arrivano da Thinkific (scripts/sync-catalog.js → catalog.json);
 * qui vengono arricchiti con tipologia e aree di formazione, usate per la navigazione del sito.
 */

const raw = require('./catalog.json');

const STORE = raw.store;

// Aree di formazione, come nella home di giurello.it ("Scegli la tua area di formazione").
const areas = [
  { id: 'area-giuridica', label: 'Area Giuridica', icon: 'scale', text: 'Concorsi in ambito legale, amministrativo, giudiziario e normativo' },
  { id: 'area-economica', label: 'Area Economica', icon: 'chart', text: 'Concorsi in ambito economico, finanziario e contabile' },
  { id: 'area-enti-locali', label: 'Area Enti Locali', icon: 'building', text: 'Concorsi per Comuni, Province, Regioni e altri enti territoriali' },
  { id: 'area-sanitaria', label: 'Area Sanitaria', icon: 'health', text: 'Concorsi per ASL, aziende sanitarie e ospedaliere' },
  { id: 'area-epso-e-lingue', label: 'Area EPSO e lingue', icon: 'globe', text: 'Concorsi europei EPSO e percorsi per certificazioni linguistiche' },
  { id: 'area-universitaria', label: 'Area Universitaria', icon: 'cap', text: 'Metodo di studio, corsi per materia, tesi e post laurea' },
  { id: 'esame-avvocato', label: "Esame d'avvocato", icon: 'gavel', text: 'Tracce, correzioni, dispense e percorso completo' },
  { id: 'concorsi-superiori', label: 'Concorsi superiori', icon: 'trophy', text: "Magistratura tributaria, SNA, Banca d'Italia" },
  { id: 'area-umanistica', label: 'Area Umanistica', icon: 'book', text: 'Storia, arte, archeologia e geografia' }
];

// Tipologie di prodotto (le etichette delle card su giurello.it).
const types = {
  simulatore: { label: 'Simulatori', single: 'Simulatore' },
  dispensa: { label: 'Dispense', single: 'Dispensa' },
  schemi: { label: 'Schemi di ripasso', single: 'Schemi' },
  ebook: { label: 'Ebook normativi', single: 'Ebook normativo' },
  eserciziario: { label: 'Eserciziari', single: 'Eserciziario' },
  podcast: { label: 'Podcast e videocorsi', single: 'Podcast' },
  corso: { label: 'Corsi', single: 'Corso' },
  pacchetto: { label: 'Pacchetti', single: 'Pacchetto' },
  tutor: { label: 'Tutor', single: 'Tutor' },
  gratis: { label: 'Gratuiti', single: 'Gratuito' }
};

const SIMULATOR_RE = /concors|posti|funzionar|assistent|commissari|ispettor|\bade\b|mase|asmel|segretario parlamentare|referendari|guida turistica|\bupp\b|dirigenti|\bsna\b|\basl\b|polizia|progressioni|aspal|carriera prefettizia|epso - corso/i;

function typeOf(p) {
  const n = p.name;
  if (!p.price || /gratis|gratuit/i.test(p.price) || p.collections.includes('Prodotti gratuiti')) return 'gratis';
  if (p.kind === 'Pacchetto') return 'pacchetto';
  if (p.kind === 'Coaching') return 'tutor';
  if (/^podcast/i.test(n)) return 'podcast';
  if (p.kind === 'Digital download') {
    if (/^schemi/i.test(n)) return 'schemi';
    if (/e-?book/i.test(n)) return 'ebook';
    if (/eserciziari/i.test(n)) return 'eserciziario';
    return 'dispensa';
  }
  if (/^corso (di|breve)|^quiz situazionali/i.test(n)) return 'corso';
  if (p.collections.some((c) => /concorsi|ripam/i.test(c)) || SIMULATOR_RE.test(n)) return 'simulatore';
  return 'corso';
}

const AREA_RULES = [
  ['area-umanistica', /geografi|storia (dell'arte|contemporanea)|archeolog|guida turistica/i],
  ['esame-avvocato', /avvocat|deontologia/i],
  ['concorsi-superiori', /magistratura|\bsna\b|banca d'italia|bankit|ivass|prefettizi|prefettura|referendari|segretario parlamentare|dirigenti|corte dei conti/i],
  ['area-epso-e-lingue', /epso|inglese|unione europea/i],
  ['area-sanitaria', /\basl\b|sanitari|azienda zero|\bats\b|welfare|previdenza/i],
  ['area-enti-locali', /enti locali|comun|polizia (municipale|locale)|segretario comunale|asmel|statuto|roma capitale|aspal|ripam/i],
  ['area-economica', /econom|contabil|finanz|welfare|management|marketing|aziendal|tributari|bankit|banca d'italia|\bmef\b|m\.e\.f|dogan|entrate|\bade\b|bancario|assicurazion|inps/i],
  ['area-universitaria', /universit|tesi di laurea|legalpath|smart legal|full immersion|diritto romano|metodo di studio|piano di studio|privato & commerciale/i]
];

function areasOf(p) {
  const found = new Set();
  for (const [id, re] of AREA_RULES) if (re.test(p.name)) found.add(id);
  if (p.collections.includes('Esame Avvocato')) found.add('esame-avvocato');
  if (p.collections.includes('EPSO') || p.collections.includes('Inglese per concorsi')) found.add('area-epso-e-lingue');
  if (p.collections.includes('Materie Economiche')) found.add('area-economica');
  if (p.collections.some((c) => /metodo di studio|corsi per materia/i.test(c))) found.add('area-universitaria');
  // Tutto ciò che è di diritto rientra anche nell'area giuridica.
  if (/diritt|giuridic|legal|giustizia|amministrativ|penale|civile|costituzional|normativ|codice|t\.u\.|atti|cancelleria|ordinamento|polizia|commissari|ispettori|funzionari|assistenti|concorso|upp|accesso/i.test(p.name) || !found.size) {
    found.add('area-giuridica');
  }
  return [...found];
}

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
const used = new Set();
const slugOf = (name) => {
  let base = slugify(name) || 'prodotto';
  let slug = base;
  for (let i = 2; used.has(slug); i++) slug = `${base}-${i}`;
  used.add(slug);
  return slug;
};

const products = raw.products.map((p, i) => {
  const type = typeOf(p);
  return {
    slug: slugOf(p.name),
    name: p.name.replace(/\s+/g, ' ').trim(),
    description: p.description,
    kind: p.kind,
    price: p.price,
    priceValue: Number(String(p.price).replace(/[^\d,]/g, '').replace(',', '.')) || 0,
    image: p.image && !/default|placeholder\.png/i.test(p.image) ? p.image : '',
    url: STORE + p.path,
    collections: p.collections,
    type,
    typeLabel: types[type].single,
    areas: areasOf(p),
    isNew: p.collections.includes('Ultimi Concorsi'),
    order: i // ordine del negozio: i più recenti per primi
  };
});

const bySlug = new Map(products.map((p) => [p.slug, p]));

function search({ area, type, q } = {}) {
  const query = String(q || '').trim().toLowerCase();
  return products.filter(
    (p) =>
      (!area || p.areas.includes(area)) &&
      (!type || p.type === type) &&
      (!query || `${p.name} ${p.description}`.toLowerCase().includes(query))
  );
}

const countBy = (list, key) =>
  list.reduce((acc, p) => {
    for (const k of [].concat(p[key])) acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

const WORD_STOP = new Set(['concorso', 'concorsi', 'corso', 'dispensa', 'diritto', 'della', 'delle', 'degli', 'dello', 'posti', 'prova', 'preselettiva', 'profilo', 'funzionari', 'funzionario', 'per', 'con', 'the', 'podcast', 'pacchetto', 'guida', 'base']);
const words = (s) => new Set(slugify(s).split('-').filter((w) => w.length > 3 && !WORD_STOP.has(w)).map((w) => w.slice(0, 7)));

/** Prodotti correlati: stesse aree specifiche, parole in comune nel titolo, tipologie complementari. */
function related(product, n) {
  const mine = words(product.name);
  const specific = product.areas.filter((a) => a !== 'area-giuridica');
  const complementary = product.type === 'simulatore' ? ['dispensa', 'pacchetto', 'podcast', 'ebook', 'schemi'] : ['simulatore', 'pacchetto', 'podcast'];
  return products
    .filter((p) => p.slug !== product.slug)
    .map((p) => {
      let score = 0;
      for (const w of words(p.name)) if (mine.has(w)) score += 4;
      score += p.areas.filter((a) => specific.includes(a)).length * 2;
      if (p.areas.includes('area-giuridica') && product.areas.includes('area-giuridica')) score += 0.5;
      if (complementary.includes(p.type)) score += 1.5;
      return { p, score };
    })
    .filter((x) => x.score > 2)
    .sort((a, b) => b.score - a.score || a.p.order - b.p.order)
    .slice(0, n)
    .map((x) => x.p);
}

module.exports = {
  related,
  STORE,
  syncedAt: raw.syncedAt,
  areas,
  types,
  products,
  search,
  countBy,
  get: (slug) => bySlug.get(String(slug || '').toLowerCase()) || null,
  area: (id) => areas.find((a) => a.id === id) || null,
  byNames: (names) => names.map((n) => products.find((p) => p.name.toLowerCase().startsWith(n.toLowerCase()))).filter(Boolean)
};
