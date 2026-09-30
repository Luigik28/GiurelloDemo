'use strict';

/**
 * Galletto – la IA di studio di Giurello (versione demo, deterministica).
 * Tutta la logica gira sul server. Nel prodotto completo `reply()` può delegare a un
 * modello linguistico (es. Vertex AI su Google Cloud) mantenendo la stessa API.
 */

const catalog = require('../data/catalog');

const DAY_MS = 24 * 60 * 60 * 1000;
const QUIZ_PER_DAY = 150; // come nei simulatori Giurello

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const STOP = new Set(['concorso', 'concorsi', 'per', 'del', 'della', 'delle', 'dei', 'di', 'il', 'la', 'le', 'lo', 'gli', 'un', 'una', 'mi', 'preparo', 'devo', 'fare', 'posti', 'prova', 'come', 'che', 'con', 'sono', 'vorrei', 'voglio', 'studiare', 'ciao', 'profilo', 'al', 'alla', 'nel', 'nella', 'e']);
const tokens = (s) => normalize(s).split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w));

const simulators = () => catalog.products.filter((p) => p.type === 'simulatore');

/** Trova il simulatore più pertinente al testo (sovrapposizione di parole). */
function findSimulator(text) {
  const words = tokens(text);
  if (!words.length) return null;
  let best = null;
  let bestScore = 0;
  for (const p of simulators()) {
    const name = tokens(p.name);
    const score = words.reduce((s, w) => s + (name.some((n) => n.startsWith(w) || w.startsWith(n)) ? (w.length > 4 ? 2 : 1) : 0), 0);
    if (score > bestScore || (score === bestScore && best && p.isNew && !best.isNew)) {
      best = p;
      bestScore = score;
    }
  }
  return bestScore >= 2 ? best : null;
}

const intents = [
  {
    test: /(piano|organizz|pianific|programm|calendario)/,
    reply: () => ({
      text: 'Posso prepararti un piano di studio settimana per settimana. Scegli il concorso e la data della prova nel modulo «Il tuo piano» e lo genero subito.',
      actions: [{ label: 'Crea il mio piano', href: '#piano' }]
    })
  },
  {
    test: /(quiz|interrog|simulaz|esercit|test)/,
    reply: () => ({
      text: 'Allenarsi con i quiz è il modo più rapido per fissare le norme. Prova il simulatore demo: domande di diritto con correzione e riferimento normativo.',
      actions: [{ label: 'Prova il simulatore', href: '/prova-simulatore' }]
    })
  },
  {
    test: /(metodo|concentra|memorizz|manuale|univers|sessione|esame)/,
    reply: () => ({
      text: 'Tre regole d’oro: studia poco ma ogni giorno, ripeti attivamente (chiudi il libro e spiega ad alta voce) e verifica con i quiz. Per un metodo completo c’è «Smart Legal Studies».',
      actions: [{ label: 'Area universitaria', href: '/universita' }]
    })
  },
  {
    test: /(tesi|relatore|laurea)/,
    reply: () => ({
      text: 'Per la tesi parti da una domanda di ricerca precisa, costruisci l’indice e confrontalo presto con il relatore. La «Masterclass – Tesi di laurea» ti accompagna dalla scelta del professore al discorso di laurea.',
      actions: [{ label: 'Vai ai corsi', href: '/universita' }]
    })
  },
  {
    test: /(avvocat|abilitazione|tracce|parere)/,
    reply: () => ({
      text: 'Per l’esame d’avvocato trovi tracce con correzione, dispense, podcast di ripasso e il corso completo 2026-2027.',
      actions: [{ label: "Esame d'avvocato", href: '/avvocato' }]
    })
  },
  {
    test: /(prezz|costo|costa|pagare|acquist|rate|€|euro)/,
    reply: () => ({
      text: 'I simulatori costano €129 nelle prime 24 ore dal lancio, poi €150, anche a rate con un piccolo sovrapprezzo. Le dispense vanno da €30 a €50.',
      actions: [{ label: 'Tutti i concorsi', href: '/concorsi' }]
    })
  },
  {
    test: /(ciao|salve|buongiorno|buonasera|hey)/,
    reply: () => ({
      text: 'Chicchirichì! Sono Galletto, la tua IA personale per lo studio. Posso organizzarti lo studio, interrogarti con i quiz o consigliarti il percorso giusto. Per quale concorso o esame ti stai preparando?'
    })
  }
];

function reply(message) {
  const text = String(message || '').slice(0, 500);
  if (!text.trim()) return { text: 'Scrivimi pure: per esempio «come mi organizzo per il concorso Agenzia delle Entrate?»' };

  const t = normalize(text);
  const sim = /(concors|funzionar|assistent|simulator|bando|posti)/.test(t) || tokens(text).length ? findSimulator(text) : null;
  if (sim) {
    return {
      text: `Per «${sim.name}» c’è il simulatore Giurello (${sim.price}): quiz costruiti sul bando e piano di studio già integrato. Vuoi che ti prepari un piano fino alla data della prova?`,
      actions: [
        { label: 'Vedi il simulatore', href: `/prodotto/${sim.slug}` },
        { label: 'Crea il piano', href: '#piano', course: sim.slug }
      ]
    };
  }

  const hit = intents.find((i) => i.test.test(t));
  if (hit) return hit.reply();

  return {
    text: 'Non sono sicuro di aver capito. Posso aiutarti con: piano di studio, quiz di allenamento, metodo di studio, tesi, esame d’avvocato e informazioni sui concorsi. Prova a scrivermi il nome del concorso!',
    actions: [
      { label: 'Tutti i concorsi', href: '/concorsi' },
      { label: 'Prova il simulatore', href: '/prova-simulatore' }
    ]
  };
}

/**
 * Piano di studio fino alla data della prova, sul modello dei simulatori Giurello:
 * batterie giornaliere di quiz, soglia dell'80% per sbloccare la successiva,
 * ultime settimane dedicate a ripasso e simulazioni.
 */
function plan({ course: slug, examDate, daysPerWeek }) {
  const course = catalog.get(slug);
  if (!course) return { error: 'Seleziona un concorso valido.' };

  const exam = new Date(examDate);
  if (Number.isNaN(exam.getTime())) return { error: 'Inserisci una data valida.' };
  const daysLeft = Math.ceil((exam.getTime() - Date.now()) / DAY_MS);
  if (daysLeft < 3) return { error: 'La data della prova deve essere almeno fra 3 giorni.' };

  const d = Math.min(Math.max(Math.round(Number(daysPerWeek) || 5), 1), 7);
  const weeks = Math.min(Math.max(Math.ceil(daysLeft / 7), 1), 26);
  const reviewWeeks = weeks >= 6 ? 2 : weeks >= 3 ? 1 : 0;

  const schedule = [];
  for (let w = 0; w < weeks; w++) {
    const last = w === weeks - 1;
    if (w >= weeks - reviewWeeks) {
      schedule.push({
        week: w + 1,
        phase: last ? 'Simulazioni finali' : 'Ripasso mirato',
        focus: last ? ['Simulazioni complete a tempo', 'Strategia per il giorno della prova'] : ['Quiz sbagliati', 'Materie più deboli'],
        quiz: QUIZ_PER_DAY * d,
        tip: last
          ? 'Fai almeno 3 simulazioni complete nelle condizioni della prova. Il giorno prima: solo ripasso leggero.'
          : 'Rileggi articolo e comma dei quiz sbagliati: stampare la norma aiuta a fissarla.'
      });
    } else {
      schedule.push({
        week: w + 1,
        phase: 'Batterie di quiz',
        focus: w === 0 ? ['Tutte le materie del bando', 'Diagnosi del livello'] : ['Nuova batteria di quiz', 'Ripasso della settimana precedente'],
        quiz: QUIZ_PER_DAY * d,
        tip: w === 0 ? 'Non passare alla batteria successiva senza almeno l’80% di risposte giuste.' : 'Apri ogni sessione con 10 quiz della settimana precedente.'
      });
    }
  }

  return {
    course: { slug: course.slug, title: course.name },
    daysLeft,
    weeks,
    quizPerDay: QUIZ_PER_DAY,
    totalQuiz: schedule.reduce((s, w) => s + w.quiz, 0),
    schedule
  };
}

function courseOptions() {
  return simulators().map((p) => ({ slug: p.slug, title: p.name }));
}

module.exports = { reply, plan, courseOptions, findSimulator };
