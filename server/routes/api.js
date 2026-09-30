'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const quiz = require('../services/quizService');
const galletto = require('../services/gallettoService');
const contact = require('../services/contactService');

const router = express.Router();

router.use(express.json({ limit: '10kb' }));
router.use(rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: 'draft-8', legacyHeaders: false }));
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.get('/quiz', (req, res) => {
  res.json({ questions: quiz.createSession({ count: req.query.count, subject: req.query.subject || undefined }) });
});

router.post('/quiz/answer', (req, res) => {
  const result = quiz.checkAnswer(req.body.token, req.body.choice);
  res.status(result.error ? 400 : 200).json(result);
});

router.post('/galletto/chat', (req, res) => {
  res.json(galletto.reply(req.body.message));
});

router.post('/galletto/plan', (req, res) => {
  const result = galletto.plan(req.body || {});
  res.status(result.error ? 400 : 200).json(result);
});

const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: 'draft-8', legacyHeaders: false });
router.post('/contact', contactLimiter, async (req, res) => {
  const result = await contact.submit(req.body);
  res.status(result.ok ? 200 : 422).json(result);
});

router.post('/newsletter', contactLimiter, async (req, res) => {
  const result = await contact.subscribe(req.body);
  res.status(result.ok ? 200 : 422).json(result);
});

router.use((req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = router;
