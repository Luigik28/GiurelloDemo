'use strict';

const express = require('express');
const site = require('../data/site');
const catalog = require('../data/catalog');
const quiz = require('../services/quizService');
const galletto = require('../services/gallettoService');

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
    areaCounts: catalog.countBy(catalog.products, 'areas')
  });
});

function renderCatalog(req, res, next) {
  const areaId = req.params.area || '';
  const area = areaId ? catalog.area(areaId) : null;
  if (areaId && !area) return next();
  const type = catalog.types[req.query.tipo] ? req.query.tipo : '';
  const q = String(req.query.q || '').slice(0, 80);

  const inArea = catalog.search({ area: areaId || undefined, q });
  const results = type ? inArea.filter((p) => p.type === type) : inArea;
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(Math.max(parseInt(req.query.pagina, 10) || 1, 1), pages);

  const qs = (over) => {
    const params = new URLSearchParams();
    const v = { tipo: type, q, ...over };
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
    qs
  });
}

router.get('/concorsi', renderCatalog);
router.get('/concorsi/:area', renderCatalog);

router.get('/prodotto/:slug', (req, res, next) => {
  const product = catalog.get(req.params.slug);
  if (!product) return next();
  const related = catalog.related(product, 3);
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
  res.render('pages/avvocato', {
    title: "Esame d'avvocato | Giurello",
    metaDescription: site.lawyer.intro,
    products: catalog.search({ area: 'esame-avvocato' })
  });
});

router.get('/chi-siamo', (req, res) => {
  res.render('pages/chi-siamo', { title: 'Chi siamo | Giurello', metaDescription: site.about.intro });
});

router.get('/help', (req, res) => {
  res.render('pages/help', { title: 'Help e contatti | Giurello', metaDescription: 'Hai domande? Contattaci: ti rispondiamo entro 48 ore.' });
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
    '/', '/concorsi', '/dispense', '/universita', '/podcast-e-altro', '/galletto', '/avvocato', '/chi-siamo', '/help', '/prova-simulatore',
    ...catalog.areas.map((a) => `/concorsi/${a.id}`),
    ...catalog.products.map((p) => `/prodotto/${p.slug}`)
  ];
  const urls = paths.map((p) => `<url><loc>${site.baseUrl}${p}</loc></url>`).join('');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
});

module.exports = router;
