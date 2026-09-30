'use strict';

// Verifica rapida: tutte le pagine rispondono 200 e le API funzionano. Uso: npm run build && npm run check
const app = require('../server/index');
const { courses } = require('../server/data/courses');
const assert = require('assert');

const server = app.listen(0, async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const get = (p) => fetch(base + p);
  const post = (p, body) => fetch(base + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  let failures = 0;
  const check = async (name, fn) => {
    try { await fn(); console.log(`  ok  ${name}`); } catch (e) { failures++; console.log(`  FAIL ${name}: ${e.message}`); }
  };

  const pages = ['/', '/concorsi', '/universita', '/galletto', '/simulatore', '/chi-siamo', '/contatti', '/privacy', '/condizioni', '/robots.txt', '/sitemap.xml', '/healthz', ...courses.map((c) => `/concorsi/${c.slug}`)];
  for (const p of pages) await check(`GET ${p}`, async () => assert.strictEqual((await get(p)).status, 200));
  await check('404', async () => assert.strictEqual((await get('/non-esiste')).status, 404));
  await check('CSP header', async () => assert.match((await get('/')).headers.get('content-security-policy'), /script-src 'self'/));

  await check('quiz: nessuna risposta nel payload + correzione server', async () => {
    const { questions } = await (await get('/api/quiz?count=5')).json();
    assert.strictEqual(questions.length, 5);
    assert.ok(!JSON.stringify(questions).includes('"correct"'));
    let found = false;
    for (let i = 0; i < 4; i++) {
      const r = await (await post('/api/quiz/answer', { token: questions[0].token, choice: i })).json();
      assert.ok(typeof r.correctChoice === 'number' && r.explanation);
      if (r.correct) { found = true; assert.strictEqual(r.correctChoice, i); }
    }
    assert.ok(found);
  });
  await check('quiz: token manomesso rifiutato', async () => {
    const r = await post('/api/quiz/answer', { token: 'abc.def', choice: 0 });
    assert.strictEqual(r.status, 400);
  });
  await check('galletto chat', async () => {
    const r = await (await post('/api/galletto/chat', { message: 'concorso agenzia delle entrate' })).json();
    assert.match(r.text, /Agenzia delle Entrate/);
  });
  await check('galletto plan', async () => {
    const d = new Date(Date.now() + 45 * 864e5).toISOString().slice(0, 10);
    const r = await (await post('/api/galletto/plan', { course: 'magistratura-tributaria', examDate: d, hoursPerDay: 2, daysPerWeek: 5 })).json();
    assert.ok(r.weeks >= 6 && r.schedule.length === r.weeks);
  });
  await check('contatti: validazione', async () => {
    const r = await post('/api/contact', { name: 'x', email: 'no' });
    assert.strictEqual(r.status, 422);
  });

  server.close();
  console.log(failures ? `\n${failures} test falliti` : '\nTutti i test superati');
  process.exit(failures ? 1 : 0);
});
