'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const catalog = require('../data/catalog');
const shop = require('../services/shopService');

const router = express.Router();

// Pagine personali: mai in cache.
router.use(['/carrello', '/preferiti', '/checkout', '/ordine', '/accedi', '/esci', '/area-studenti'], (req, res, next) => {
  res.locals.noCache = true;
  res.set('Cache-Control', 'private, no-store');
  next();
});

const formLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false });

// Solo percorsi interni per i redirect (niente open redirect).
const safeBack = (v, fallback) => (typeof v === 'string' && /^\/(?!\/)[\w\-/?=&.%]*$/.test(v) ? v : fallback);

/* Carrello ---------------------------------------------------------------- */
router.get('/carrello', (req, res) => {
  const cart = shop.getCart(req);
  res.render('pages/carrello', {
    title: 'Carrello | Giurello',
    cart,
    added: catalog.get(req.query.aggiunto),
    suggestions: cart.items.length ? catalog.related(cart.items[0], 3).filter((p) => !cart.items.includes(p)) : []
  });
});

router.post('/carrello/aggiungi', (req, res) => {
  const slug = String(req.body.slug || '');
  if (!shop.addToCart(req, res, slug)) return res.redirect(303, '/concorsi');
  if (req.body.buyNow) return res.redirect(303, '/checkout');
  res.redirect(303, `/carrello?aggiunto=${encodeURIComponent(slug)}`);
});

router.post('/carrello/rimuovi', (req, res) => {
  shop.removeFromCart(req, res, String(req.body.slug || ''));
  res.redirect(303, '/carrello');
});

router.post('/preferiti/toggle', (req, res) => {
  shop.toggleFavorite(req, res, String(req.body.slug || ''));
  const back = safeBack((req.get('referer') || '').replace(/^https?:\/\/[^/]+/, ''), '/preferiti');
  res.redirect(303, back);
});

/* Checkout ---------------------------------------------------------------- */
function renderCheckout(req, res, extra = {}) {
  const cart = shop.getCart(req);
  if (!cart.count) return res.redirect(303, '/carrello');
  const acct = shop.getAccount(req);
  res.status(extra.errors ? 422 : 200).render('pages/checkout', {
    title: 'Checkout | Giurello',
    cart,
    data: extra.data || { email: acct?.email || '', firstName: acct?.name || '', method: 'card' },
    errors: extra.errors || {},
    fmt: shop.fmt
  });
}

router.get('/checkout', (req, res) => renderCheckout(req, res));

router.post('/checkout', formLimiter, (req, res) => {
  const result = shop.checkout(req, res, req.body);
  if (!result.ok) return renderCheckout(req, res, result);
  res.redirect(303, `/ordine/${result.order.id}`);
});

router.get('/ordine/:id', (req, res, next) => {
  const order = shop.findOrder(req, req.params.id);
  if (!order) return next();
  res.render('pages/ordine', { title: 'Ordine confermato | Giurello', order });
});

/* Area studenti ------------------------------------------------------------ */
router.get('/accedi', (req, res) => {
  if (shop.getAccount(req)) return res.redirect(303, '/area-studenti');
  res.render('pages/accedi', { title: 'Accedi | Giurello', errors: {}, email: '', back: safeBack(req.query.torna, '/area-studenti') });
});

router.post('/accedi', formLimiter, (req, res) => {
  const back = safeBack(req.body.back, '/area-studenti');
  const result = shop.login(req, res, req.body);
  if (!result.ok) return res.status(422).render('pages/accedi', { title: 'Accedi | Giurello', errors: result.errors, email: req.body.email || '', back });
  res.redirect(303, back);
});

router.post('/esci', (req, res) => {
  shop.logout(res);
  res.redirect(303, '/');
});

router.get('/area-studenti', (req, res) => {
  const lib = shop.library(req);
  if (!lib) return res.redirect(303, '/accedi?torna=/area-studenti');
  res.render('pages/area-studenti', { title: 'Area studenti | Giurello', lib });
});

module.exports = router;
