'use strict';

const express = require('express');
const site = require('../data/site');
const { courses, categories, getCourse, categoryLabel } = require('../data/courses');
const university = require('../data/university');
const quiz = require('../services/quizService');
const galletto = require('../services/gallettoService');
const { TOPICS } = require('../services/contactService');

const router = express.Router();

const store = (path) => site.storeUrl + path;

router.get('/', (req, res) => {
  res.render('pages/home', {
    title: `${site.name} | ${site.tagline}`,
    featured: courses.filter((c) => c.featured),
    categories,
    courseCount: courses.length,
    categoryLabel,
    masterclass: university.masterclass
  });
});

router.get('/concorsi', (req, res) => {
  res.render('pages/concorsi', {
    title: 'Simulatori per concorsi pubblici | Giurello',
    metaDescription: 'Simulatori con quiz dalla banca dati ufficiale e piano di studio integrato per Agenzia delle Entrate, Magistratura tributaria, Ufficio del processo, INPS, Ripam e altri concorsi.',
    courses,
    categories,
    categoryLabel,
    active: req.query.categoria || 'tutti'
  });
});

router.get('/concorsi/:slug', (req, res, next) => {
  const course = getCourse(req.params.slug);
  if (!course) return next();
  res.render('pages/corso', {
    title: `${course.title} | Giurello`,
    metaDescription: course.summary,
    course,
    categoryLabel,
    buyUrl: store(course.storePath),
    related: courses.filter((c) => c.category === course.category && c.slug !== course.slug).slice(0, 3)
  });
});

router.get('/universita', (req, res) => {
  res.render('pages/universita', {
    title: 'Metodo di studio per Giurisprudenza | Giurello',
    metaDescription: 'Smart Legal Studies: la masterclass per imparare a studiare a Giurisprudenza. Corsi per materia e supporto per sessione, tesi e post-laurea.',
    ...university,
    masterclassUrl: store(university.masterclass.storePath)
  });
});

router.get('/galletto', (req, res) => {
  res.render('pages/galletto', {
    title: 'Galletto, il tuo tutor AI per lo studio del diritto | Giurello',
    metaDescription: 'Galletto pianifica il tuo studio, ti interroga con domande d’esame e analizza le tue risposte.',
    courseOptions: galletto.courseOptions(),
    selected: String(req.query.corso || '')
  });
});

router.get('/simulatore', (req, res) => {
  res.render('pages/simulatore', {
    title: 'Prova il simulatore quiz | Giurello',
    metaDescription: 'Mettiti alla prova con i quiz di diritto costituzionale, civile, amministrativo e penale.',
    subjects: quiz.subjects()
  });
});

router.get('/chi-siamo', (req, res) => {
  res.render('pages/chi-siamo', { title: 'Chi siamo | Giurello', metaDescription: 'Giurello è una start-up fondata da studenti per aiutare studenti e concorsisti del mondo giuridico.' });
});

router.get('/contatti', (req, res) => {
  res.render('pages/contatti', { title: 'Contatti | Giurello', metaDescription: 'Scrivi a Giurello: concorsi, università, Galletto AI e collaborazioni.', topics: TOPICS });
});

router.get('/privacy', (req, res) => res.render('pages/legal', { title: 'Privacy policy | Giurello', heading: 'Privacy policy', kind: 'privacy' }));
router.get('/condizioni', (req, res) => res.render('pages/legal', { title: 'Condizioni generali | Giurello', heading: 'Condizioni generali del servizio', kind: 'terms' }));

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${site.baseUrl}/sitemap.xml\n`);
});

router.get('/sitemap.xml', (req, res) => {
  const paths = ['/', '/concorsi', '/universita', '/galletto', '/simulatore', '/chi-siamo', '/contatti', ...courses.map((c) => `/concorsi/${c.slug}`)];
  const urls = paths.map((p) => `<url><loc>${site.baseUrl}${p}</loc></url>`).join('');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
});

module.exports = router;
