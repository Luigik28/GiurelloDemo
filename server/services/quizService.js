'use strict';

const crypto = require('crypto');
const bank = require('../data/quiz');
const { sign, verify } = require('../lib/signer');

const byId = new Map(bank.map((q) => [q.id, q]));
const TTL_MS = 2 * 60 * 60 * 1000;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function subjects() {
  return [...new Set(bank.map((q) => q.subject))].sort();
}

/**
 * Crea una sessione di quiz. Le opzioni vengono rimescolate e ogni domanda porta
 * con sé un token firmato con la permutazione: la risposta giusta non lascia mai il server.
 */
function createSession({ count = 5, subject } = {}) {
  const pool = subject ? bank.filter((q) => q.subject === subject) : bank;
  const n = Math.max(1, Math.min(Number(count) || 5, 10, pool.length));
  const exp = Date.now() + TTL_MS;
  return shuffle(pool)
    .slice(0, n)
    .map((q) => {
      const perm = shuffle(q.options.map((_, i) => i));
      return {
        token: sign({ q: q.id, p: perm, exp }),
        subject: q.subject,
        question: q.question,
        options: perm.map((i) => q.options[i])
      };
    });
}

function checkAnswer(token, choice) {
  const payload = verify(token);
  if (!payload) return { error: 'Sessione scaduta o non valida. Ricarica il quiz.' };
  const q = byId.get(payload.q);
  const idx = Number(choice);
  if (!q || !Number.isInteger(idx) || idx < 0 || idx >= payload.p.length) {
    return { error: 'Risposta non valida.' };
  }
  const correctChoice = payload.p.indexOf(q.correct);
  return { correct: idx === correctChoice, correctChoice, explanation: q.explanation };
}

module.exports = { createSession, checkAnswer, subjects };
