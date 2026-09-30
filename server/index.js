'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const { minify } = require('html-minifier-terser');
const config = require('./config');
const site = require('./data/site');

const DIST = path.join(__dirname, '..', 'dist');
const manifestPath = path.join(DIST, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('Build mancante: esegui "npm run build" prima di avviare il server.');
  process.exit(1);
}
const assets = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const app = express();
app.set('trust proxy', 1); // dietro al load balancer di Google
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
if (config.isProd) app.set('view cache', true);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://import.cdn.thinkific.com', 'https://files.cdn.thinkific.com'],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        // In locale (http) non forziamo l'upgrade a https degli asset.
        upgradeInsecureRequests: config.isProd ? [] : null
      }
    },
    crossOriginEmbedderPolicy: false
  })
);
app.use(compression());

// Asset con hash nel nome: cache lunga e immutabile.
app.use('/assets', express.static(path.join(DIST, 'public', 'assets'), { immutable: true, maxAge: '1y', index: false }));
app.use(express.static(path.join(DIST, 'public', 'static'), { maxAge: '1d', index: false }));

app.use(express.urlencoded({ extended: false, limit: '10kb' }));

app.use((req, res, next) => {
  res.locals.site = site;
  res.locals.assets = assets;
  res.locals.currentPath = req.path;
  res.locals.year = new Date().getFullYear();
  res.locals.metaDescription = site.description;
  res.locals.canonical = site.baseUrl + (req.path === '/' ? '' : req.path);
  next();
});

// HTML minificato prima dell'invio (in produzione con cache in memoria per le pagine statiche).
const htmlCache = new Map();
const minifyOptions = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  collapseBooleanAttributes: true,
  useShortDoctype: true
};
app.use((req, res, next) => {
  const key = req.method === 'GET' && Object.keys(req.query).length === 0 ? req.path : null;
  if (config.isProd && key && htmlCache.has(key)) {
    res.type('html').set('Cache-Control', 'public, max-age=300');
    return res.send(htmlCache.get(key));
  }
  const render = res.render.bind(res);
  res.render = (view, opts = {}) =>
    render(view, opts, async (err, html) => {
      if (err) return next(err);
      let out = html;
      try {
        out = await minify(html, minifyOptions);
      } catch {
        /* in caso di errore inviamo l'HTML non minificato */
      }
      if (config.isProd && key && res.statusCode === 200 && htmlCache.size < 200) htmlCache.set(key, out);
      if (res.statusCode === 200) res.set('Cache-Control', 'public, max-age=300');
      res.type('html').send(out);
    });
  next();
});

app.get('/healthz', (req, res) => res.type('text/plain').send('ok'));
app.use('/api', require('./routes/api'));
app.use('/', require('./routes/pages'));

app.use((req, res) => {
  res.status(404).render('pages/404', { title: 'Pagina non trovata | Giurello' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(JSON.stringify({ severity: 'ERROR', message: err.message, stack: err.stack, path: req.path }));
  if (res.headersSent) return;
  res.status(500).type('text/plain').send('Si è verificato un errore. Riprova più tardi.');
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(JSON.stringify({ severity: 'INFO', message: `Giurello in ascolto sulla porta ${config.port}` }));
  });
}

module.exports = app;
