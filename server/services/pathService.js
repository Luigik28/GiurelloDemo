'use strict';

/**
 * "Trova il tuo percorso": tre domande → un piano di preparazione con i prodotti consigliati.
 * Tutta la logica è sul server: il browser invia solo le risposte.
 */

const catalog = require('../data/catalog');

const GOALS = [
  { id: 'concorso', icon: 'target', label: 'Un concorso pubblico', text: 'Simulatori, dispense e metodo per superare la prova.' },
  { id: 'universita', icon: 'cap', label: 'Un esame universitario', text: 'Metodo di studio, dispense e corsi per materia.' },
  { id: 'avvocato', icon: 'gavel', label: "L'esame d'avvocato", text: 'Tracce, correzioni, dispense e percorso completo.' }
];

const NEEDS = {
  concorso: catalog.areas.filter((a) => !['area-universitaria', 'esame-avvocato'].includes(a.id)).map((a) => ({ id: a.id, icon: a.icon, label: a.label, text: a.text })),
  universita: [
    { id: 'metodo', icon: 'compass', label: 'Un metodo di studio', text: 'Organizzare sessione ed esami.' },
    { id: 'materia', icon: 'book', label: 'Una materia difficile', text: 'Dispense e corsi per materia.' },
    { id: 'tesi', icon: 'pen', label: 'La tesi di laurea', text: 'Dalla scelta del relatore alla discussione.' },
    { id: 'post', icon: 'road', label: 'Cosa fare dopo', text: 'Orientamento post laurea.' }
  ],
  avvocato: [
    { id: 'completo', icon: 'package', label: 'Un percorso completo', text: 'Podcast, dispense, tracce e metodo.' },
    { id: 'tracce', icon: 'pen', label: 'Allenarmi sulle tracce', text: 'Con correzione tecnica.' },
    { id: 'tutor', icon: 'users', label: 'Un tutor', text: 'Supporto personalizzato.' }
  ]
};

const TIMES = [
  { id: 'breve', icon: 'clock', label: 'Meno di un mese', text: 'Serve un piano intensivo.' },
  { id: 'medio', icon: 'calendar', label: 'Da 1 a 3 mesi', text: 'Il tempo giusto per costruire.' },
  { id: 'lungo', icon: 'trophy', label: 'Più di 3 mesi', text: 'Partiamo dalle basi.' }
];

const pick = (list, n = 1) => list.slice(0, n);
const byType = (list, type) => list.filter((p) => p.type === type);
const find = (names) => catalog.byNames(names);

function recommend({ goal, need, time }) {
  const g = GOALS.find((x) => x.id === goal);
  if (!g) return null;
  const needs = NEEDS[goal] || [];
  const n = needs.find((x) => x.id === need) || needs[0];
  const t = TIMES.find((x) => x.id === time) || TIMES[1];

  let main = [];
  let extra = [];
  let steps = [];

  if (goal === 'concorso') {
    const inArea = catalog.search({ area: n.id });
    const sims = byType(inArea, 'simulatore').sort((a, b) => Number(b.isNew) - Number(a.isNew) || a.order - b.order);
    main = pick(sims, 2);
    extra = [...pick(byType(inArea, 'dispensa'), t.id === 'lungo' ? 2 : 1), ...pick(byType(inArea, 'pacchetto')), ...pick(byType(inArea, 'podcast'))];
    if (!main.length) main = pick(inArea, 2);
    steps = [
      'Scegli il simulatore del tuo concorso: il piano di studio è già integrato.',
      t.id === 'breve' ? '150 quiz al giorno, tutti i giorni: niente pause fino alla prova.' : 'Affianca ai quiz una dispensa per capire davvero le materie del bando.',
      'Non passare alla batteria successiva senza l’80% di risposte giuste.',
      'Nelle ultime due settimane: ripasso degli errori e simulazioni complete.'
    ];
  } else if (goal === 'universita') {
    const map = {
      metodo: ['Smart Legal Studies', 'Metodo di studio - università'],
      materia: ['Diritto privato - FULL', 'Privato & Commerciale', 'Dispensa di Diritto Costituzionale'],
      tesi: ['MASTERCLASS - Tesi', 'Smart Legal Studies'],
      post: ['LEGALPATH', 'Mega pacchetto per il tuo percorso universitario']
    };
    main = find(map[n.id] || map.metodo).slice(0, 2);
    extra = pick(catalog.search({ area: 'area-universitaria' }).filter((p) => !main.includes(p) && ['corso', 'pacchetto', 'dispensa'].includes(p.type) && !/podcast/i.test(p.name)), 3);
    steps = ['Parti dal metodo: poco, ma ogni giorno.', 'Usa le dispense per ridurre i tempi sui manuali.', 'Ripeti ad alta voce e verifica con domande d’esame.', 'Chiedi a Galletto un piano per la tua sessione.'];
  } else {
    const inArea = catalog.search({ area: 'esame-avvocato' });
    const map = { completo: ['Corso completo per l’ Esame Avvocato'], tracce: ['SOLO TRACCE', 'Tracce Esame Avvocato'], tutor: ['Avvocatura - tutoraggio'] };
    main = find(map[n.id] || map.completo);
    if (!main.length) main = pick(inArea, 1);
    extra = pick(inArea.filter((p) => !main.includes(p)), 3);
    steps = ['Studia il programma con il piano per l’esame d’avvocato.', 'Allenati sulle tracce e ricevi la correzione.', 'Ripassa con i podcast quando sei fuori casa.', 'Simula l’esame nelle condizioni reali.'];
  }

  return { goal: g, need: n, time: t, main, extra: extra.filter((p) => p && !main.includes(p)).slice(0, 3), steps };
}

module.exports = { GOALS, NEEDS, TIMES, recommend };
