'use strict';

const { sign, verify } = require('./signer');
const { isProd } = require('../config');

/** Legge i cookie della richiesta (senza dipendenze esterne). */
function parse(req) {
  if (req._cookies) return req._cookies;
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    if (k) out[k] = decodeURIComponent(part.slice(i + 1).trim());
  }
  req._cookies = out;
  return out;
}

/** Cookie firmato HMAC: il contenuto è leggibile ma non modificabile dal browser. */
function getSigned(req, name) {
  const raw = parse(req)[name];
  return raw ? verify(raw) : null;
}

function setSigned(res, name, payload, maxAgeDays = 30) {
  res.cookie(name, sign(payload), {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: maxAgeDays * 24 * 60 * 60 * 1000,
    path: '/'
  });
}

function clear(res, name) {
  res.clearCookie(name, { path: '/' });
}

module.exports = { parse, getSigned, setSigned, clear };
