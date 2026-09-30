'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const quiz = require('../services/quizService');
const galletto = require('../services/gallettoService');
const contact = require('../services/contactService');
const catalog = require('../data/catalog');
const shop = require('../services/shopService');

// Scorciatoie verso le pagine, mostrate nella ricerca istantanea.
const PAGES = [
  { label: 'Tutti i concorsi', href: '/concorsi', k: 'concorsi catalogo corsi simulatori tutti' },
  { label: 'Trova il tuo percorso', href: '/percorso', k: 'percorso consiglio guida aiuto scegliere quiz inizio' },
  { label: 'Dispense e riassunti', href: '/dispense', k: 'dispense riassunti manuali pdf' },
  { label: 'Università e metodo di studio', href: '/universita', k: 'universita metodo studio tesi laurea giurisprudenza' },
  { label: "Esame d'avvocato", href: '/avvocato', k: 'avvocato abilitazione tracce esame' },
  { label: 'Podcast e altro', href: '/podcast-e-altro', k: 'podcast audio logica inglese tutor schemi' },
  { label: 'Galletto AI', href: '/galletto', k: 'galletto ai intelligenza artificiale piano chat' },
  { label: 'Prova gratis il simulatore', href: '/prova-simulatore', k: 'prova gratis demo quiz simulatore' },
  { label: 'I miei preferiti', href: '/preferiti', k: 'preferiti salvati cuore wishlist' },
  { label: 'Carrello', href: '/carrello', k: 'carrello acquisto pagamento' },
  { label: 'Area studenti', href: '/area-studenti', k: 'area studenti account login accedi miei corsi ordini' },
  { label: 'Help e contatti', href: '/help', k: 'help aiuto contatti assistenza email domande faq' },
  { label: 'Chi siamo', href: '/chi-siamo', k: 'chi siamo team giurello azienda' }
];
const fold = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const router = express.Router();

router.use(express.json({ limit: '10kb' }));
router.use(rateLimit({ windowMs: 60 * 1000, limit: 150, standardHeaders: 'draft-8', legacyHeaders: false }));
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.get('/search', (req, res) => {
  const q = String(req.query.q || '').slice(0, 80);
  const f = fold(q).trim();
  const pages = f ? PAGES.filter((p) => fold(`${p.label} ${p.k}`).split(' ').some((w) => w.startsWith(f.split(' ')[0]))).slice(0, 3) : PAGES.slice(0, 4);
  const results = catalog.quickSearch(q, 7).map((p) => ({ slug: p.slug, name: p.name, type: p.typeLabel, price: p.type === 'gratis' ? 'Gratis' : p.price, image: p.image, isNew: p.isNew }));
  const total = f ? catalog.quickSearch(q, 500).length : 0;
  res.json({ q, results, pages: pages.map(({ label, href }) => ({ label, href })), total });
});

router.get('/cart', (req, res) => res.json(shop.cartSummary(req)));

router.post('/cart/add', (req, res) => {
  const slugs = shop.addToCart(req, res, String(req.body.slug || ''));
  if (!slugs) return res.status(404).json({ error: 'Prodotto non trovato.' });
  res.json({ ok: true, added: req.body.slug, ...shop.cartSummary(req, slugs) });
});

router.post('/cart/remove', (req, res) => {
  const slugs = shop.removeFromCart(req, res, String(req.body.slug || ''));
  res.json({ ok: true, ...shop.cartSummary(req, slugs) });
});

router.post('/favorites/toggle', (req, res) => {
  const r = shop.toggleFavorite(req, res, String(req.body.slug || ''));
  if (!r) return res.status(404).json({ error: 'Prodotto non trovato.' });
  res.json(r);
});

router.get('/quiz', (req, res) => {
  res.json({ questions: quiz.createSession({ count: req.query.count, subject: req.query.subject || undefined }) });
});

router.post('/quiz/answer', (req, res) => {
  const result = quiz.checkAnswer(req.body.token, req.body.choice);
  res.status(result.error ? 400 : 200).json(result);
});

router.post('/galletto/chat', (req, res) => {
  res.json(galletto.reply(req.body.message));
});

router.post('/galletto/plan', (req, res) => {
  const result = galletto.plan(req.body || {});
  res.status(result.error ? 400 : 200).json(result);
});

const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: 'draft-8', legacyHeaders: false });
router.post('/contact', contactLimiter, async (req, res) => {
  const result = await contact.submit(req.body);
  res.status(result.ok ? 200 : 422).json(result);
});

router.post('/newsletter', contactLimiter, async (req, res) => {
  const result = await contact.subscribe(req.body);
  res.status(result.ok ? 200 : 422).json(result);
});

router.use((req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = router;
