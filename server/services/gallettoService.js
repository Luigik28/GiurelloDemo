'use strict';

/**
 * Galletto – assistente di studio (versione demo, deterministica).
 * Tutta la logica gira sul server. Per il prodotto completo `reply()` può delegare
 * a un modello linguistico (es. via Vertex AI su Google Cloud) mantenendo la stessa API.
 */

const { courses, getCourse } = require('../data/courses');
const { masterclass } = require('../data/university');

const QUIZ_PER_HOUR = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

function findCourse(text) {
  const t = normalize(text);
  const aliases = [
    ['magistratura', 'magistratura-tributaria'],
    ['tributar', 'magistratura-tributaria'],
    ['ufficio del processo', 'ufficio-del-processo-21-giorni'],
    ['upp\\b', 'ufficio-del-processo-21-giorni'],
    ['riscossione', 'agenzia-entrate-riscossione'],
    ['ader\\b', 'agenzia-entrate-riscossione'],
    ['agenzia', 'agenzia-entrate-2025'],
    ['entrate', 'agenzia-entrate-2025'],
    ['ripam', 'ripam-piccoli-comuni'],
    ['comuni\\b', 'ripam-piccoli-comuni'],
    ['asmel', 'asmel-funzionario-amministrativo'],
    ['ats\\b', 'ats-2025'],
    ['asl\\b', 'asl-personale-amministrativo'],
    ['sanit', 'asl-personale-amministrativo'],
    ['inps', 'inps-funzionari'],
    ['corte dei conti', 'corte-dei-conti-2026'],
    ['interno', 'ministero-interno-funzionario-economico'],
    ['polizia', 'commissari-polizia'],
    ['commissar', 'commissari-polizia'],
    ['tar\\b', 'avvocatura-consiglio-di-stato-tar'],
    ['consiglio di stato', 'avvocatura-consiglio-di-stato-tar'],
    ['avvocatura', 'avvocatura-consiglio-di-stato-tar']
  ];
  for (const [needle, slug] of aliases) {
    const re = new RegExp(`\\b${needle}`);
    if (re.test(t)) return getCourse(slug);
  }
  return null;
}

const intents = [
  {
    test: /(piano|organizz|pianific|programm|calendario)/,
    reply: () => ({
      text: 'Posso prepararti un piano di studio settimana per settimana. Dimmi per quale concorso ti prepari e quando c’è la prova: usa il modulo «Piano di studio» qui accanto e lo genero subito.',
      actions: [{ label: 'Crea il mio piano', href: '#piano' }]
    })
  },
  {
    test: /(quiz|interrog|simulaz|esercit|test)/,
    reply: () => ({
      text: 'Allenarsi con i quiz è il modo più rapido per fissare le norme. Prova il simulatore demo: 5 domande su diritto costituzionale, civile, amministrativo e penale, con correzione e spiegazione.',
      actions: [{ label: 'Apri il simulatore', href: '/simulatore' }]
    })
  },
  {
    test: /(metodo|studiare|concentra|memorizz|manuale|univers|esame|sessione)/,
    reply: () => ({
      text: `Tre regole d’oro: 1) studia poco ma ogni giorno, 2) ripeti attivamente (chiudi il libro e spiega ad alta voce), 3) verifica con quiz o domande d’esame. Se vuoi un metodo completo c’è la masterclass «${masterclass.title}».`,
      actions: [{ label: 'Scopri Smart Legal Studies', href: '/universita' }]
    })
  },
  {
    test: /(tesi|relatore|laurea)/,
    reply: () => ({
      text: 'Per la tesi parti da una domanda di ricerca precisa, poi costruisci l’indice e confrontalo presto con il relatore. Ti aiutiamo anche nella scelta dell’argomento e nella struttura dei capitoli.',
      actions: [{ label: 'Supporto tesi', href: '/universita#supporto' }]
    })
  },
  {
    test: /(prezz|costo|costa|pagare|acquist|€|euro)/,
    reply: () => ({
      text: 'I simulatori hanno un prezzo di lancio nelle prime 24 ore dall’uscita; poi il prezzo diventa definitivo (in genere 150 €, alcuni pacchetti 189 €).',
      actions: [{ label: 'Vedi tutti i concorsi', href: '/concorsi' }]
    })
  },
  {
    test: /(ciao|salve|buongiorno|buonasera|hey)/,
    reply: () => ({
      text: 'Chicchirichì! Sono Galletto, il tuo compagno di studio. Posso organizzarti lo studio, interrogarti con i quiz o consigliarti il percorso giusto. Per quale concorso o esame ti stai preparando?'
    })
  }
];

function reply(message) {
  const text = String(message || '').slice(0, 500);
  if (!text.trim()) return { text: 'Scrivimi pure: per esempio «come mi organizzo per il concorso Agenzia delle Entrate?»' };

  const course = findCourse(text);
  if (course) {
    return {
      text: `Per «${course.title}» abbiamo un simulatore dedicato. Le materie principali sono: ${course.subjects.join(', ')}. Vuoi che ti prepari un piano di studio fino alla data della prova?`,
      actions: [
        { label: 'Vedi il corso', href: `/concorsi/${course.slug}` },
        { label: 'Crea il piano', href: `#piano`, course: course.slug }
      ]
    };
  }

  const t = normalize(text);
  const hit = intents.find((i) => i.test.test(t));
  if (hit) return hit.reply();

  return {
    text: 'Non sono sicuro di aver capito. Posso aiutarti con: piano di studio, quiz di allenamento, metodo di studio per Giurisprudenza, tesi e informazioni sui concorsi.',
    actions: [
      { label: 'Concorsi', href: '/concorsi' },
      { label: 'Simulatore', href: '/simulatore' }
    ]
  };
}

/**
 * Piano di studio personalizzato fino alla data della prova.
 * Le ultime settimane sono dedicate a ripasso e simulazioni complete.
 */
function plan({ course: slug, examDate, hoursPerDay, daysPerWeek }) {
  const course = getCourse(slug);
  if (!course) return { error: 'Seleziona un concorso valido.' };

  const exam = new Date(examDate);
  if (Number.isNaN(exam.getTime())) return { error: 'Inserisci una data valida.' };
  const daysLeft = Math.ceil((exam.getTime() - Date.now()) / DAY_MS);
  if (daysLeft < 3) return { error: 'La data della prova deve essere almeno fra 3 giorni.' };

  const h = Math.min(Math.max(Number(hoursPerDay) || 2, 0.5), 10);
  const d = Math.min(Math.max(Math.round(Number(daysPerWeek) || 5), 1), 7);
  const weeks = Math.min(Math.max(Math.ceil(daysLeft / 7), 1), 26);
  const reviewWeeks = weeks >= 6 ? 2 : weeks >= 3 ? 1 : 0;
  const learnWeeks = weeks - reviewWeeks;
  const subjects = course.subjects;
  const quizPerDay = Math.round(h * QUIZ_PER_HOUR);

  const out = [];
  for (let w = 0; w < weeks; w++) {
    if (w >= learnWeeks) {
      const last = w === weeks - 1;
      out.push({
        week: w + 1,
        phase: last ? 'Simulazioni finali' : 'Ripasso mirato',
        focus: last ? ['Simulazioni complete a tempo'] : ['Errori ricorrenti', 'Materie più deboli'],
        quiz: quizPerDay * d,
        tip: last
          ? 'Fai almeno 3 simulazioni complete nelle condizioni della prova. Il giorno prima: solo ripasso leggero.'
          : 'Galletto ti ripropone le domande sbagliate: ripetile finché non diventano automatiche.'
      });
      continue;
    }
    // Rotazione delle materie: 2 materie principali a settimana, ripasso della precedente.
    const per = Math.max(1, Math.ceil(subjects.length / Math.max(learnWeeks, 1)));
    const start = (w * per) % subjects.length;
    const focus = [];
    for (let k = 0; k < Math.min(per + 1, subjects.length); k++) focus.push(subjects[(start + k) % subjects.length]);
    out.push({
      week: w + 1,
      phase: 'Studio e quiz',
      focus: [...new Set(focus)],
      quiz: quizPerDay * d,
      tip: w === 0 ? 'Parti dalla materia che conosci meno: i primi giorni sono quelli con più energia.' : 'Apri ogni sessione con 10 quiz di ripasso della settimana precedente.'
    });
  }

  return {
    course: { slug: course.slug, title: course.title },
    daysLeft,
    weeks,
    quizPerDay,
    totalQuiz: out.reduce((s, w) => s + w.quiz, 0),
    schedule: out
  };
}

function courseOptions() {
  return courses.map((c) => ({ slug: c.slug, title: c.title }));
}

module.exports = { reply, plan, courseOptions };
