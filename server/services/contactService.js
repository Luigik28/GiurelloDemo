'use strict';

/**
 * Modulo "Hai domande?" (pagina Help) e iscrizione alla newsletter "Rimani aggiornato".
 * Demo: le richieste vengono registrate su Cloud Logging (stdout JSON).
 * Prodotto completo: salvarle su Firestore e inviare una mail (es. tramite Cloud Functions).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s./-]{5,20}$/;
const str = (v, max) => String(v || '').trim().slice(0, max);
const yes = (v) => v === true || v === 'on' || v === 'true';

async function submit(body = {}) {
  const data = {
    firstName: str(body.firstName, 80),
    lastName: str(body.lastName, 80),
    email: str(body.email, 150),
    phone: str(body.phone, 30),
    message: str(body.message, 3000),
    consent: yes(body.consent)
  };
  const errors = {};
  if (data.firstName.length < 2) errors.firstName = 'Inserisci il tuo nome.';
  if (data.lastName.length < 2) errors.lastName = 'Inserisci il tuo cognome.';
  if (!EMAIL_RE.test(data.email)) errors.email = 'Inserisci un indirizzo email valido.';
  if (data.phone && !PHONE_RE.test(data.phone)) errors.phone = 'Numero di telefono non valido.';
  if (data.message.length < 10) errors.message = 'Il messaggio è troppo breve.';
  if (!data.consent) errors.consent = 'È necessario accettare la privacy policy.';
  if (Object.keys(errors).length) return { ok: false, errors };
  // Honeypot anti-spam: il campo "website" è invisibile agli utenti reali.
  if (!body.website) console.log(JSON.stringify({ severity: 'INFO', message: 'contact_request', ...data }));
  return { ok: true };
}

async function subscribe(body = {}) {
  const email = str(body.email, 150);
  if (!EMAIL_RE.test(email)) return { ok: false, errors: { email: 'Inserisci un indirizzo email valido.' } };
  if (!yes(body.consent)) return { ok: false, errors: { consent: 'Seleziona la casella per procedere.' } };
  if (!body.website) console.log(JSON.stringify({ severity: 'INFO', message: 'newsletter_signup', email }));
  return { ok: true };
}

module.exports = { submit, subscribe };
