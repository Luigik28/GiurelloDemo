'use strict';

const express = require('express');
const site = require('../data/site');
const catalog = require('../data/catalog');
const quiz = require('../services/quizService');
const galletto = require('../services/gallettoService');
const shop = require('../services/shopService');
const paths = require('../services/pathService');

const router = express.Router();
const PAGE_SIZE = 12;

const pick = (names) => catalog.byNames(names);

router.get('/', (req, res) => {
  res.render('pages/home', {
    title: `${site.name} | ${site.tagline}`,
    loved: pick(['150 posti Funzionario Giuridico', 'Concorso per la Presidenza del Consiglio', 'Concorso Progressioni al Ministero della Giustizia', 'Corso completo Funzionari INPS', 'Concorso Magistratura tributaria', '95 Funzionari MAECI']),
    latest: catalog.products.filter((p) => p.isNew).slice(0, 8),
    manuals: pick(['Dispensa di Diritto degli Enti Locali', 'Dispensa di diritto degli appalti pubblici', "Dispensa di diritto dell'Unione Europea", 'Dispensa di diritto Amministrativo']),
    areas: catalog.areas.filter((a) => a.id !== 'area-umanistica'),
    areaCounts: catalog.countBy(catalog.products, 'areas'),
    audiences: [
      { id: 'concorsi', label: 'Preparo un concorso', icon: 'target', title: 'Simulatori con il piano di studio già integrato', text: '150 quiz al giorno, spiegazioni per ogni risposta e statistiche: tu devi solo esercitarti.', href: '/concorsi?tipo=simulatore', cta: 'Tutti i simulatori', items: catalog.search({ type: 'simulatore' }).slice(0, 8) },
      { id: 'universita', label: 'Studio Giurisprudenza', icon: 'cap', title: 'Metodo, dispense e corsi per ogni esame', text: 'Dal primo esame alla tesi: materiali brevi, chiari e basati sui manuali più usati.', href: '/universita', cta: "Vai all'area universitaria", items: catalog.search({ area: 'area-universitaria' }).slice(0, 8) },
      { id: 'avvocato', label: 'Diventerò avvocato', icon: 'gavel', title: "Tutto per l'esame d'avvocato", text: 'Tracce con correzione, dispense, podcast di ripasso e un percorso completo online.', href: '/avvocato', cta: "Scopri il percorso", items: catalog.search({ area: 'esame-avvocato' }).slice(0, 8) }
    ],
    seen: shop.recentlyViewed(req).map((s) => catalog.get(s)).filter(Boolean)
  });
});

function renderCatalog(req, res, next) {
  const areaId = req.params.area || '';
  const area = areaId ? catalog.area(areaId) : null;
  if (areaId && !area) return next();
  const type = catalog.types[req.query.tipo] ? req.query.tipo : '';
  const q = String(req.query.q || '').slice(0, 80);

  const inArea = catalog.search({ area: areaId || undefined, q });
  const sort = catalog.SORTS[req.query.ordina] ? req.query.ordina : 'consigliati';
  const results = (type ? inArea.filter((p) => p.type === type) : inArea).slice().sort(catalog.SORTS[sort].fn);
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(Math.max(parseInt(req.query.pagina, 10) || 1, 1), pages);

  const qs = (over) => {
    const params = new URLSearchParams();
    const v = { tipo: type, q, ordina: sort === 'consigliati' ? '' : sort, ...over };
    for (const [k, val] of Object.entries(v)) if (val && !(k === 'pagina' && val === 1)) params.set(k, val);
    const s = params.toString();
    return s ? `?${s}` : '';
  };

  const heading = area ? area.label : q ? `Risultati per «${q}»` : type ? catalog.types[type].label : 'Tutti i corsi';
  res.render('pages/catalogo', {
    title: `${area ? area.label : 'Concorsi e corsi'} | Giurello`,
    metaDescription: area ? `${area.label}: ${area.text}. Simulatori, dispense e corsi Giurello.` : 'Simulatori per concorsi pubblici, dispense, podcast e corsi Giurello.',
    area,
    areaId,
    areas: catalog.areas,
    areaCounts: catalog.countBy(catalog.search({ q }), 'areas'),
    totalAll: catalog.search({ q }).length,
    types: catalog.types,
    typeCounts: catalog.countBy(inArea, 'type'),
    type,
    q,
    heading,
    items: results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: results.length,
    page,
    pages,
    base: area ? `/concorsi/${area.id}` : '/concorsi',
    sort,
    sorts: catalog.SORTS,
    qs
  });
}

router.get('/concorsi', renderCatalog);
router.get('/concorsi/:area', renderCatalog);

router.get('/prodotto/:slug', (req, res, next) => {
  const product = catalog.get(req.params.slug);
  if (!product) return next();
  const related = catalog.related(product, 3);
  shop.markViewed(req, res, product.slug);
  res.locals.noCache = true;
  res.render('pages/prodotto', {
    title: `${product.name} | Giurello`,
    metaDescription: product.description.slice(0, 160),
    product,
    area: catalog.area(product.areas[0]),
    related
  });
});

router.get('/dispense', (req, res) => {
  res.render('pages/dispense', {
    title: 'Dispense e riassunti | Giurello',
    metaDescription: site.dispense.intro,
    manuals: catalog.search({ type: 'dispensa' }).slice(0, 6),
    count: catalog.search({ type: 'dispensa' }).length
  });
});

router.get('/universita', (req, res) => {
  res.render('pages/universita', {
    title: 'Università e metodo di studio | Giurello',
    metaDescription: 'Metodo di studio per Giurisprudenza, tesi di laurea, orientamento post laurea e corsi per materia.',
    featured: [
      { p: pick(['Smart Legal Studies'])[0], img: '/img/smart-legal-studies.jpg' },
      { p: pick(['LEGALPATH'])[0], img: '/img/legalpath.jpg' },
      { p: pick(['MASTERCLASS - Tesi'])[0], img: '/img/tesi.jpg' },
      { p: pick(['Diritto Commerciale'])[0] || pick(['Privato & Commerciale'])[0], img: '/img/diritto-commerciale.jpg' }
    ].filter((x) => x.p),
    products: catalog.search({ area: 'area-universitaria' })
  });
});

router.get('/podcast-e-altro', (req, res) => {
  res.render('pages/podcast', {
    title: 'Podcast, corsi e strumenti di studio | Giurello',
    metaDescription: 'Podcast e corsi per materia, logica e quiz situazionali, inglese per concorsi, tutor, ebook normativi e schemi.',
    podcasts: catalog.search({ type: 'podcast' }),
    courses: catalog.search({ type: 'corso' }).slice(0, 6)
  });
});

router.get('/galletto', (req, res) => {
  res.render('pages/galletto', {
    title: 'Galletto, la tua IA personale per lo studio | Giurello',
    metaDescription: site.galletto.about,
    courseOptions: galletto.courseOptions(),
    selected: String(req.query.corso || '')
  });
});

router.get('/avvocato', (req, res) => {
  const L = site.lawyer;
  const plans = L.plans.map((pl) => ({ ...pl, p: catalog.byNames([pl.find])[0] })).filter((pl) => pl.p);
  const used = new Set(plans.map((pl) => pl.p.slug));
  const tutor = catalog.search({ area: 'esame-avvocato', type: 'tutor' })[0] || null;
  if (tutor) used.add(tutor.slug);
  res.render('pages/avvocato', {
    title: "Esame d'avvocato: corso completo, tracce e tutor | Giurello",
    metaDescription: L.intro,
    plans,
    tutorProduct: tutor,
    singles: catalog.search({ area: 'esame-avvocato' }).filter((p) => !used.has(p.slug))
  });
});

router.get('/chi-siamo', (req, res) => {
  res.render('pages/chi-siamo', { title: 'Chi siamo | Giurello', metaDescription: site.about.intro });
});

router.get('/help', (req, res) => {
  res.render('pages/help', { title: 'Help e contatti | Giurello', metaDescription: 'Hai domande? Contattaci: ti rispondiamo entro 48 ore.' });
});

router.get('/percorso', (req, res) => {
  res.render('pages/percorso', {
    title: 'Trova il tuo percorso | Giurello',
    metaDescription: 'Rispondi a tre domande e scopri il percorso di preparazione più adatto a te.',
    goals: paths.GOALS,
    needs: paths.NEEDS,
    times: paths.TIMES,
    preset: { goal: String(req.query.goal || '') }
  });
});

router.get('/percorso/risultato', (req, res) => {
  const rec = paths.recommend(req.query);
  if (!rec) return res.redirect(303, '/percorso');
  res.locals.noCache = true;
  res.render('pages/percorso-risultato', { title: 'Il tuo percorso | Giurello', metaDescription: 'Il percorso di preparazione consigliato da Giurello.', rec });
});

router.get('/preferiti', (req, res) => {
  res.locals.noCache = true;
  res.render('pages/preferiti', {
    title: 'I miei preferiti | Giurello',
    items: shop.favorites(req).map((s) => catalog.get(s)).filter(Boolean),
    suggestions: catalog.products.filter((p) => p.isNew).slice(0, 3)
  });
});

router.get('/condizioni', (req, res) => {
  res.render('pages/condizioni', { title: 'Condizioni generali del servizio | Giurello', metaDescription: 'Condizioni generali di contratto per i corsi e i prodotti Giurello.', terms: require('../data/terms.json') });
});

router.get('/prova-simulatore', (req, res) => {
  res.render('pages/simulatore', {
    title: 'Prova gratis il simulatore | Giurello',
    metaDescription: 'Prova come funzionano i simulatori Giurello: quiz con correzione immediata e riferimento normativo.',
    subjects: quiz.subjects()
  });
});

// Vecchi percorsi (sito attuale e prima demo)
const redirects = {
  '/podcast-altro': '/podcast-e-altro',
  '/supporto': '/help',
  '/contatti': '/help',
  '/simulatore': '/prova-simulatore',
  '/concorsi/tutti-i-concorsi': '/concorsi',
  '/concorsi/magistratura-e-concorsi-superiori': '/concorsi/concorsi-superiori'
};
for (const [from, to] of Object.entries(redirects)) router.get(from, (req, res) => res.redirect(301, to));

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${site.baseUrl}/sitemap.xml\n`);
});

router.get('/sitemap.xml', (req, res) => {
  const paths = [
    '/', '/concorsi', '/percorso', '/condizioni', '/dispense', '/universita', '/podcast-e-altro', '/galletto', '/avvocato', '/chi-siamo', '/help', '/prova-simulatore',
    ...catalog.areas.map((a) => `/concorsi/${a.id}`),
    ...catalog.products.map((p) => `/prodotto/${p.slug}`)
  ];
  const urls = paths.map((p) => `<url><loc>${site.baseUrl}${p}</loc></url>`).join('');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
});

module.exports = router;
