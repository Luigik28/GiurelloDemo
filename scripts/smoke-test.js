'use strict';

// Verifica rapida: tutte le pagine rispondono 200 e le API funzionano. Uso: npm run build && npm run check
const app = require('../server/index');
const catalog = require('../server/data/catalog');
const assert = require('assert');

const server = app.listen(0, async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const get = (p) => fetch(base + p);
  const post = (p, body) => fetch(base + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  let failures = 0;
  const check = async (name, fn) => {
    try { await fn(); console.log(`  ok  ${name}`); } catch (e) { failures++; console.log(`  FAIL ${name}: ${e.message}`); }
  };

  const pages = ['/', '/concorsi', '/concorsi?tipo=dispensa&pagina=2', '/concorsi?q=inps', '/dispense', '/universita', '/podcast-e-altro', '/galletto', '/avvocato', '/chi-siamo', '/help', '/prova-simulatore', '/condizioni', '/carrello', '/accedi', '/robots.txt', '/sitemap.xml', '/healthz', ...catalog.areas.map((a) => `/concorsi/${a.id}`), ...catalog.products.map((p) => `/prodotto/${p.slug}`)];
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
    assert.match(r.text, /Entrate/);
  });
  await check('redirect vecchi percorsi', async () => {
    const r = await fetch(base + '/podcast-altro', { redirect: 'manual' });
    assert.strictEqual(r.status, 301);
  });
  await check('newsletter: validazione', async () => {
    const r = await post('/api/newsletter', { email: 'x' });
    assert.strictEqual(r.status, 422);
  });
  await check('galletto plan', async () => {
    const d = new Date(Date.now() + 45 * 864e5).toISOString().slice(0, 10);
    const slug = catalog.products.find((p) => p.type === 'simulatore').slug;
    const r = await (await post('/api/galletto/plan', { course: slug, examDate: d, daysPerWeek: 5 })).json();
    assert.ok(r.weeks >= 6 && r.schedule.length === r.weeks);
  });
  await check('contatti: validazione', async () => {
    const r = await post('/api/contact', { name: 'x', email: 'no' });
    assert.strictEqual(r.status, 422);
  });

  await check('nessun link a Thinkific nelle pagine', async () => {
    for (const p of ['/', '/concorsi', `/prodotto/${catalog.products[0].slug}`, '/help', '/chi-siamo']) {
      const html = await (await get(p)).text();
      assert.ok(!/thinkific/i.test(html), `thinkific in ${p}`);
    }
  });

  await check('acquisto demo: carrello → checkout → ordine → area studenti', async () => {
    const jar = {};
    const form = (o) => new URLSearchParams(o).toString();
    const req = async (path, opts = {}) => {
      const r = await fetch(base + path, {
        redirect: 'manual',
        ...opts,
        headers: { ...(opts.headers || {}), cookie: Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ') }
      });
      for (const c of r.headers.getSetCookie()) {
        const [kv] = c.split(';');
        const [k, v] = kv.split('=');
        if (v) jar[k] = v; else delete jar[k];
      }
      return r;
    };
    const postForm = (path, o) => req(path, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form(o) });
    const sim = catalog.products.find((p) => p.type === 'simulatore');
    let r = await postForm('/carrello/aggiungi', { slug: sim.slug });
    assert.strictEqual(r.status, 303);
    assert.match(await (await req('/carrello')).text(), new RegExp(sim.name.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    r = await postForm('/checkout', { firstName: 'Mario', lastName: 'Rossi', email: 'mario@example.com', method: 'card', cardNumber: '4000 0000 0000 0002', cardExpiry: '12/39', cardCvc: '123', terms: 'on' });
    assert.strictEqual(r.status, 422, 'la carta di rifiuto deve fallire');
    r = await postForm('/checkout', { firstName: 'Mario', lastName: 'Rossi', email: 'mario@example.com', method: 'card', cardNumber: '4242 4242 4242 4242', cardExpiry: '12/39', cardCvc: '123', terms: 'on' });
    assert.strictEqual(r.status, 303);
    const orderUrl = r.headers.get('location');
    assert.match(orderUrl, /^\/ordine\/G/);
    assert.match(await (await req(orderUrl)).text(), /Grazie/);
    const area = await (await req('/area-studenti')).text();
    assert.ok(area.includes('Ciao') && area.includes(orderUrl.split('/').pop()));
    assert.ok(!(await (await req('/carrello')).text()).includes('cart__row'), 'carrello svuotato');
  });

  server.close();
  console.log(failures ? `\n${failures} test falliti` : '\nTutti i test superati');
  process.exit(failures ? 1 : 0);
});
