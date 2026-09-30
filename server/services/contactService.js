'use strict';

/**
 * Gestione richieste di contatto.
 * Demo: i messaggi vengono registrati su Cloud Logging (stdout JSON).
 * Prodotto completo: salvarli su Firestore e inviare una mail (es. tramite Cloud Functions).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TOPICS = ['Concorsi', 'Università', 'Galletto AI', 'Collaborazioni', 'Altro'];

function validate(body) {
  const data = {
    name: String(body.name || '').trim().slice(0, 100),
    email: String(body.email || '').trim().slice(0, 150),
    topic: TOPICS.includes(body.topic) ? body.topic : 'Altro',
    message: String(body.message || '').trim().slice(0, 3000),
    consent: body.consent === true || body.consent === 'on' || body.consent === 'true'
  };
  const errors = {};
  if (data.name.length < 2) errors.name = 'Inserisci il tuo nome.';
  if (!EMAIL_RE.test(data.email)) errors.email = 'Inserisci un indirizzo email valido.';
  if (data.message.length < 10) errors.message = 'Il messaggio è troppo breve.';
  if (!data.consent) errors.consent = 'È necessario accettare l’informativa privacy.';
  // Honeypot anti-spam: il campo è nascosto agli utenti reali.
  const spam = Boolean(body.website);
  return { data, errors, spam };
}

async function submit(body) {
  const { data, errors, spam } = validate(body || {});
  if (Object.keys(errors).length) return { ok: false, errors };
  if (!spam) {
    console.log(JSON.stringify({ severity: 'INFO', message: 'contact_request', topic: data.topic, name: data.name, email: data.email, text: data.message }));
  }
  return { ok: true };
}

module.exports = { submit, TOPICS };
