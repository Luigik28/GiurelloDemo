'use strict';

/**
 * Sincronizza il catalogo dal negozio Thinkific di Giurello (giurello.thinkific.com)
 * e lo salva in server/data/catalog.json. Il sito legge solo quel file.
 *
 * Uso: npm run sync-catalog
 */

const fs = require('fs');
const path = require('path');

const STORE = 'https://giurello.thinkific.com';
const OUT = path.join(__dirname, '..', 'server', 'data', 'catalog.json');

const decode = (s) =>
  String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
const clean = (s) => decode(String(s || '').replace(/<[^>]+>/g, ' ')).replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();

async function get(url) {
  for (let i = 0; i < 4; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 GiurelloSync' } });
      if (res.ok) return await res.text();
    } catch {
      /* nuovo tentativo */
    }
    await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
  }
  throw new Error(`Impossibile scaricare ${url}`);
}

function parseCards(html) {
  const out = [];
  const re = /<a class="card ([^"]*)" href="([^"]+)">([\s\S]*?)<\/a>\s*<\/li>/g;
  let m;
  while ((m = re.exec(html))) {
    const body = m[3];
    const pick = (r) => (body.match(r) || [])[1] || '';
    const priceRaw = [...body.matchAll(/<strong>([^<]+)<\/strong>/g)].map((x) => decode(x[1]).trim());
    const kind = clean(pick(/<span class="card__product-info">([\s\S]*?)<\/span>/));
    out.push({
      path: m[2],
      name: clean(pick(/<h3 class="card__name">([\s\S]*?)<\/h3>/)),
      kind,
      description: clean(pick(/<p class="card__description">([\s\S]*?)<\/p>/)),
      price: priceRaw[0] || '',
      image: decode(pick(/<img src="([^"]+)"/))
    });
  }
  return out;
}

async function listCollection(slug) {
  const items = [];
  let lastPage = 1;
  for (let page = 1; page <= lastPage && page < 100; page++) {
    const html = await get(`${STORE}/collections${slug ? '/' + slug : ''}?page=${page}`);
    const cards = parseCards(html);
    items.push(...cards);
    for (const x of html.matchAll(/page=(\d+)/g)) lastPage = Math.max(lastPage, Number(x[1]));
    if (!cards.length) break;
  }
  return items;
}

async function main() {
  const home = await get(`${STORE}/collections`);
  const collections = [...home.matchAll(/<a href="\/collections\/([a-z0-9-]+)"[^>]*id="category-name">\s*([^<]+?)\s*<\/a>/g)].map((m) => ({
    slug: m[1],
    name: decode(m[2])
  }));

  const byPath = new Map();
  for (const p of await listCollection('')) if (!byPath.has(p.path)) byPath.set(p.path, { ...p, collections: [] });

  for (const c of collections) {
    if (c.slug === 'products') continue;
    const items = await listCollection(c.slug);
    for (const it of items) {
      if (!byPath.has(it.path)) byPath.set(it.path, { ...it, collections: [] });
      byPath.get(it.path).collections.push(c.name);
    }
    console.log(`  ${c.name}: ${items.length}`);
  }

  const products = [...byPath.values()];
  fs.writeFileSync(OUT, JSON.stringify({ syncedAt: new Date().toISOString(), store: STORE, collections, products }, null, 1));
  console.log(`catalogo sincronizzato: ${products.length} prodotti → ${path.relative(process.cwd(), OUT)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
