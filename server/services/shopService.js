'use strict';

/**
 * Negozio Giurello: carrello, checkout e area studenti.
 * DEMO: il pagamento è simulato e i dati stanno in cookie firmati (nessun database).
 * Prodotto completo: sostituire `pay()` con un gateway reale (Stripe, PayPal, Satispay…)
 * e salvare utenti e ordini su Firestore, mantenendo le stesse funzioni.
 */

const crypto = require('crypto');
const catalog = require('../data/catalog');
const cookies = require('../lib/cookies');

const CART = 'g_cart';
const FAV = 'g_fav';
const SEEN = 'g_seen';
const ACCOUNT = 'g_acct';
const MAX_ITEMS = 20;
const MAX_OWNED = 40;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const fmt = (n) => euro.format(n);

/* Carrello ---------------------------------------------------------------- */
function cartSlugs(req) {
  const c = cookies.getSigned(req, CART);
  return Array.isArray(c?.i) ? c.i.filter((s) => catalog.get(s)) : [];
}

function getCart(req) {
  const owned = new Set(getAccount(req)?.owned || []);
  const items = cartSlugs(req).map((s) => catalog.get(s));
  const total = items.reduce((sum, p) => sum + p.priceValue, 0);
  return { items, total, totalLabel: fmt(total), count: items.length, owned };
}

function saveCart(res, slugs) {
  if (slugs.length) cookies.setSigned(res, CART, { i: slugs.slice(0, MAX_ITEMS) }, 30);
  else cookies.clear(res, CART);
}

function addToCart(req, res, slug) {
  const p = catalog.get(slug);
  if (!p) return false;
  const slugs = cartSlugs(req);
  if (!slugs.includes(p.slug)) slugs.push(p.slug);
  saveCart(res, slugs);
  return slugs;
}

function removeFromCart(req, res, slug) {
  const slugs = cartSlugs(req).filter((s) => s !== slug);
  saveCart(res, slugs);
  return slugs;
}

/* Account ----------------------------------------------------------------- */
function getAccount(req) {
  const a = cookies.getSigned(req, ACCOUNT);
  return a && a.email ? a : null;
}

function saveAccount(res, acct) {
  acct.owned = [...new Set(acct.owned || [])].slice(-MAX_OWNED);
  acct.orders = (acct.orders || []).slice(-8);
  cookies.setSigned(res, ACCOUNT, acct, 180);
}

/** Accesso demo: qualsiasi email valida e password di almeno 6 caratteri. */
function login(req, res, { email, password, name }) {
  const e = String(email || '').trim().toLowerCase().slice(0, 150);
  const errors = {};
  if (!EMAIL_RE.test(e)) errors.email = 'Inserisci un indirizzo email valido.';
  if (String(password || '').length < 6) errors.password = 'La password deve avere almeno 6 caratteri.';
  if (Object.keys(errors).length) return { ok: false, errors };
  const prev = getAccount(req);
  const acct = prev && prev.email === e ? prev : { email: e, name: String(name || '').trim().slice(0, 80) || e.split('@')[0], owned: [], orders: [] };
  saveAccount(res, acct);
  return { ok: true, account: acct };
}

function logout(res) {
  cookies.clear(res, ACCOUNT);
}

function library(req) {
  const acct = getAccount(req);
  if (!acct) return null;
  return {
    ...acct,
    products: acct.owned.map((s) => catalog.get(s)).filter(Boolean).reverse(),
    orders: acct.orders.slice().reverse().map((o) => ({ ...o, totalLabel: fmt(o.t), date: new Date(o.d).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }), items: o.i.map((s) => catalog.get(s)).filter(Boolean) }))
  };
}

/* Checkout e pagamento (simulato) ------------------------------------------- */
const luhn = (num) => {
  let sum = 0;
  let dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = Number(num[i]);
    if (dbl) d = d * 2 > 9 ? d * 2 - 9 : d * 2;
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
};

/**
 * Pagamento SIMULATO. Accetta qualunque carta con numero valido (algoritmo di Luhn),
 * scadenza futura e CVC di 3-4 cifre; la carta 4000 0000 0000 0002 viene rifiutata
 * per mostrare il caso di errore. Nessun dato di pagamento viene salvato o registrato.
 */
function pay({ method, cardNumber, cardExpiry, cardCvc }, total) {
  if (total === 0) return { ok: true, ref: 'GRATIS' };
  if (method === 'paypal') return { ok: true, ref: `PP-${crypto.randomBytes(4).toString('hex').toUpperCase()}` };
  const errors = {};
  const num = String(cardNumber || '').replace(/[\s-]/g, '');
  if (!/^\d{13,19}$/.test(num) || !luhn(num)) errors.cardNumber = 'Numero di carta non valido.';
  const m = String(cardExpiry || '').match(/^\s*(\d{2})\s*\/\s*(\d{2})\s*$/);
  const now = new Date();
  if (!m || +m[1] < 1 || +m[1] > 12 || new Date(2000 + +m[2], +m[1], 1) <= now) errors.cardExpiry = 'Scadenza non valida (MM/AA).';
  if (!/^\d{3,4}$/.test(String(cardCvc || '').trim())) errors.cardCvc = 'CVC non valido.';
  if (Object.keys(errors).length) return { ok: false, errors };
  if (num === '4000000000000002') return { ok: false, errors: { cardNumber: 'Pagamento rifiutato dalla banca (carta di test per il rifiuto).' } };
  return { ok: true, ref: `CARD-${num.slice(-4)}` };
}

function checkout(req, res, body = {}) {
  const cart = getCart(req);
  if (!cart.count) return { ok: false, errors: { form: 'Il carrello è vuoto.' } };
  const data = {
    firstName: String(body.firstName || '').trim().slice(0, 80),
    lastName: String(body.lastName || '').trim().slice(0, 80),
    email: String(body.email || '').trim().toLowerCase().slice(0, 150),
    method: ['card', 'paypal', 'rate'].includes(body.method) ? body.method : 'card',
    terms: body.terms === 'on' || body.terms === true
  };
  const errors = {};
  if (data.firstName.length < 2) errors.firstName = 'Inserisci il nome.';
  if (data.lastName.length < 2) errors.lastName = 'Inserisci il cognome.';
  if (!EMAIL_RE.test(data.email)) errors.email = 'Inserisci un indirizzo email valido.';
  if (!data.terms) errors.terms = 'Devi accettare le condizioni generali.';
  const paid = Object.keys(errors).length ? { ok: false, errors: {} } : pay(body, cart.total);
  Object.assign(errors, paid.errors || {});
  if (Object.keys(errors).length) return { ok: false, errors, data };

  const order = {
    id: `G${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
    d: Date.now(),
    t: cart.total,
    m: data.method,
    r: paid.ref,
    i: cart.items.map((p) => p.slug)
  };
  const prev = getAccount(req);
  const acct = prev && prev.email === data.email ? prev : { email: data.email, name: data.firstName, owned: [], orders: [] };
  acct.owned = [...(acct.owned || []), ...order.i];
  acct.orders = [...(acct.orders || []), order];
  saveAccount(res, acct);
  saveCart(res, []);
  console.log(JSON.stringify({ severity: 'INFO', message: 'demo_order', id: order.id, total: order.t, items: order.i.length, method: order.m }));
  return { ok: true, order };
}

function findOrder(req, id) {
  const lib = library(req);
  return lib ? lib.orders.find((o) => o.id === id) || null : null;
}

/* Preferiti e visti di recente --------------------------------------------- */
const slugList = (req, name) => {
  const c = cookies.getSigned(req, name);
  return Array.isArray(c?.i) ? c.i.filter((s) => catalog.get(s)) : [];
};

function favorites(req) {
  return slugList(req, FAV);
}

function toggleFavorite(req, res, slug) {
  const p = catalog.get(slug);
  if (!p) return null;
  const list = favorites(req);
  const on = !list.includes(p.slug);
  const next = on ? [p.slug, ...list].slice(0, 30) : list.filter((s) => s !== p.slug);
  if (next.length) cookies.setSigned(res, FAV, { i: next }, 180);
  else cookies.clear(res, FAV);
  return { on, count: next.length };
}

function recentlyViewed(req) {
  return slugList(req, SEEN);
}

function markViewed(req, res, slug) {
  const next = [slug, ...recentlyViewed(req).filter((s) => s !== slug)].slice(0, 8);
  cookies.setSigned(res, SEEN, { i: next }, 60);
}

/** Riepilogo carrello per le chiamate API (mini carrello laterale). */
function cartSummary(req, extraSlugs) {
  const slugs = extraSlugs || cartSlugs(req);
  const items = slugs.map((sl) => catalog.get(sl)).filter(Boolean);
  const total = items.reduce((sum, p) => sum + p.priceValue, 0);
  return { count: items.length, total: fmt(total), items: items.map((p) => ({ slug: p.slug, name: p.name, price: p.price || 'Gratis', image: p.image, type: p.typeLabel })) };
}

module.exports = { favorites, toggleFavorite, recentlyViewed, markViewed, cartSummary, cartSlugs, getCart, addToCart, removeFromCart, getAccount, login, logout, library, checkout, findOrder, fmt };
