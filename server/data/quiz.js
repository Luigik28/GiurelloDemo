'use strict';

/**
 * Banca dati quiz di esempio. Resta SOLO sul server: al browser arrivano domanda e
 * opzioni, mai la risposta corretta. La correzione avviene via API.
 * `correct` = indice della risposta giusta in `options`.
 */
module.exports = [
  {
    id: 'cost-1',
    subject: 'Diritto costituzionale',
    question: "Secondo l'art. 1 della Costituzione, l'Italia è una Repubblica democratica fondata:",
    options: ['sul lavoro', 'sulla sovranità del Parlamento', 'sulla libertà di iniziativa economica', 'sulla solidarietà sociale'],
    correct: 0,
    explanation: "Art. 1, comma 1, Cost.: «L'Italia è una Repubblica democratica, fondata sul lavoro»."
  },
  {
    id: 'cost-85',
    subject: 'Diritto costituzionale',
    question: 'Per quanti anni resta in carica il Presidente della Repubblica?',
    options: ['5 anni', '7 anni', '6 anni', '9 anni'],
    correct: 1,
    explanation: 'Art. 85 Cost.: il Presidente della Repubblica è eletto per sette anni.'
  },
  {
    id: 'cost-135',
    subject: 'Diritto costituzionale',
    question: 'Da quanti giudici è composta la Corte costituzionale?',
    options: ['9', '12', '15', '21'],
    correct: 2,
    explanation: 'Art. 135 Cost.: la Corte è composta da quindici giudici, nominati per un terzo dal Presidente della Repubblica, un terzo dal Parlamento in seduta comune e un terzo dalle supreme magistrature.'
  },
  {
    id: 'cost-97',
    subject: 'Diritto amministrativo',
    question: "L'art. 97 della Costituzione impone che i pubblici uffici siano organizzati in modo da assicurare:",
    options: ['efficienza e trasparenza', 'il buon andamento e l’imparzialità dell’amministrazione', 'economicità ed efficacia', 'decentramento e sussidiarietà'],
    correct: 1,
    explanation: 'Art. 97, comma 2, Cost.: «I pubblici uffici sono organizzati secondo disposizioni di legge, in modo che siano assicurati il buon andamento e l’imparzialità dell’amministrazione».'
  },
  {
    id: 'cc-1',
    subject: 'Diritto civile',
    question: 'Quando si acquista la capacità giuridica?',
    options: ['Al compimento della maggiore età', 'Al momento del concepimento', 'Al momento della nascita', 'Con l’iscrizione nei registri dello stato civile'],
    correct: 2,
    explanation: 'Art. 1 c.c.: la capacità giuridica si acquista dal momento della nascita.'
  },
  {
    id: 'cc-2946',
    subject: 'Diritto civile',
    question: 'Salvi i casi in cui la legge dispone diversamente, i diritti si estinguono per prescrizione con il decorso di:',
    options: ['5 anni', '10 anni', '20 anni', '3 anni'],
    correct: 1,
    explanation: 'Art. 2946 c.c.: la prescrizione ordinaria è decennale.'
  },
  {
    id: 'l241-2',
    subject: 'Diritto amministrativo',
    question: 'In mancanza di un diverso termine fissato dalla legge o dai regolamenti, entro quanti giorni deve concludersi il procedimento amministrativo (L. 241/1990)?',
    options: ['30 giorni', '60 giorni', '90 giorni', '120 giorni'],
    correct: 0,
    explanation: 'Art. 2, comma 3, L. 241/1990: in assenza di diversa previsione, i procedimenti si concludono entro trenta giorni.'
  },
  {
    id: 'l241-oggetto',
    subject: 'Diritto amministrativo',
    question: 'La legge n. 241 del 1990 disciplina principalmente:',
    options: ['il pubblico impiego', 'il procedimento amministrativo e il diritto di accesso ai documenti', 'la contabilità di Stato', 'i contratti pubblici'],
    correct: 1,
    explanation: 'La L. 241/1990 detta le «Nuove norme in materia di procedimento amministrativo e di diritto di accesso ai documenti amministrativi».'
  },
  {
    id: 'dlgs-36-2023',
    subject: 'Contratti pubblici',
    question: 'Quale provvedimento contiene il vigente Codice dei contratti pubblici?',
    options: ['D.Lgs. 50/2016', 'D.Lgs. 163/2006', 'D.Lgs. 36/2023', 'L. 190/2012'],
    correct: 2,
    explanation: 'Il nuovo Codice dei contratti pubblici è il D.Lgs. 31 marzo 2023, n. 36, che ha sostituito il D.Lgs. 50/2016.'
  },
  {
    id: 'cad',
    subject: 'Diritto amministrativo',
    question: 'Il Codice dell’amministrazione digitale (CAD) è contenuto nel:',
    options: ['D.Lgs. 82/2005', 'D.Lgs. 196/2003', 'D.Lgs. 165/2001', 'D.P.R. 445/2000'],
    correct: 0,
    explanation: 'Il CAD è il D.Lgs. 7 marzo 2005, n. 82.'
  },
  {
    id: 'cp-314',
    subject: 'Diritto penale',
    question: 'Il reato di peculato è disciplinato dall’articolo:',
    options: ['317 c.p.', '318 c.p.', '314 c.p.', '323 c.p.'],
    correct: 2,
    explanation: 'Art. 314 c.p. (peculato). Il 317 è la concussione, il 318 la corruzione per l’esercizio della funzione.'
  },
  {
    id: 'cc-2',
    subject: 'Diritto civile',
    question: 'A quale età si acquista la capacità di agire?',
    options: ['16 anni', '18 anni', '21 anni', '14 anni'],
    correct: 1,
    explanation: 'Art. 2 c.c.: la maggiore età è fissata al compimento del diciottesimo anno; con essa si acquista la capacità di compiere tutti gli atti per i quali non sia stabilita un’età diversa.'
  }
];
