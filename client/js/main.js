// Giurello – script client. Nessun dato sensibile qui: contenuti, risposte dei quiz
// e logica di Galletto restano sul server. In build questo file viene minificato e offuscato.

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const storage = {
  get(k) {
    try { return localStorage.getItem(k); } catch { return null; }
  },
  set(k, v) {
    try { localStorage.setItem(k, v); } catch { /* storage non disponibile */ }
  }
};

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) if (c) node.append(c);
  return node;
}

async function api(path, body) {
  const res = await fetch(`/api${path}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin'
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && !data.errors && !data.error) data.error = 'Si è verificato un errore. Riprova.';
  return data;
}

/* Tema --------------------------------------------------------------------- */
function initTheme() {
  const root = document.documentElement;
  const saved = storage.get('theme');
  if (saved) root.dataset.theme = saved;
  $$('[data-theme-toggle]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const dark = root.dataset.theme
        ? root.dataset.theme === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = dark ? 'light' : 'dark';
      storage.set('theme', root.dataset.theme);
    })
  );
}

/* Navigazione -------------------------------------------------------------- */
function initNav() {
  const nav = $('[data-nav]');
  const menu = $('#menu');
  const toggle = $('[data-menu-toggle]');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  toggle?.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  menu?.addEventListener('click', (e) => {
    if (e.target.closest('a')) menu.classList.remove('is-open');
  });
}

/* Animazioni --------------------------------------------------------------- */
function initReveal() {
  const items = $$('.reveal');
  if (!('IntersectionObserver' in window)) return items.forEach((i) => i.classList.add('is-in'));
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }),
    { rootMargin: '0px 0px -8% 0px' }
  );
  items.forEach((i, idx) => {
    i.style.transitionDelay = `${(idx % 4) * 70}ms`;
    io.observe(i);
  });
}

function initCounters() {
  const nums = $$('[data-count]');
  if (!nums.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const io = new IntersectionObserver((entries) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const node = e.target;
      const end = Number(node.dataset.count);
      const suffix = node.dataset.suffix || '';
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / 1200, 1);
        node.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    })
  );
  nums.forEach((n) => io.observe(n));
}

/* Catalogo concorsi -------------------------------------------------------- */
function initCatalog() {
  const grid = $('[data-catalog]');
  if (!grid) return;
  const cards = $$('.course-card', grid);
  const empty = $('[data-empty]');
  const input = $('[data-search-input]');
  const buttons = $$('[data-filter]');
  let active = grid.dataset.active || 'tutti';

  const apply = () => {
    const q = (input?.value || '').trim().toLowerCase();
    let shown = 0;
    cards.forEach((c) => {
      const ok = (active === 'tutti' || c.dataset.category === active) && (!q || c.dataset.search.includes(q));
      c.classList.toggle('is-hidden', !ok);
      if (ok) { shown++; c.classList.add('is-in'); }
    });
    empty.hidden = shown > 0;
  };

  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      active = b.dataset.filter;
      buttons.forEach((x) => x.classList.toggle('is-on', x === b));
      const url = new URL(location.href);
      if (active === 'tutti') url.searchParams.delete('categoria');
      else url.searchParams.set('categoria', active);
      history.replaceState(null, '', url);
      apply();
    })
  );
  input?.addEventListener('input', apply);
  apply();
}

/* Simulatore quiz ---------------------------------------------------------- */
function initQuiz() {
  const root = $('[data-quiz]');
  if (!root) return;
  const ui = {
    start: $('[data-quiz-start]', root),
    run: $('[data-quiz-run]', root),
    end: $('[data-quiz-end]', root),
    subject: $('[data-quiz-subject]', root),
    count: $('[data-quiz-count]', root),
    bar: $('[data-quiz-bar]', root),
    q: $('[data-quiz-q]', root),
    opts: $('[data-quiz-opts]', root),
    fb: $('[data-quiz-fb]', root),
    next: $('[data-quiz-next]', root),
    score: $('[data-quiz-score]', root),
    msg: $('[data-quiz-msg]', root)
  };
  const subjectBtns = $$('[data-subject]', root);
  let subject = '';
  let questions = [];
  let i = 0;
  let right = 0;

  subjectBtns.forEach((b) =>
    b.addEventListener('click', () => {
      subject = b.dataset.subject;
      subjectBtns.forEach((x) => x.classList.toggle('is-on', x === b));
    })
  );

  const show = (step) => {
    ui.start.hidden = step !== 'start';
    ui.run.hidden = step !== 'run';
    ui.end.hidden = step !== 'end';
  };

  async function start() {
    const qs = new URLSearchParams({ count: '5' });
    if (subject) qs.set('subject', subject);
    const data = await api(`/quiz?${qs}`);
    questions = data.questions || [];
    i = 0;
    right = 0;
    if (!questions.length) return;
    show('run');
    render();
  }

  function render() {
    const q = questions[i];
    ui.subject.textContent = q.subject;
    ui.count.textContent = `${i + 1} / ${questions.length}`;
    ui.bar.style.width = `${(i / questions.length) * 100}%`;
    ui.q.textContent = q.question;
    ui.fb.hidden = true;
    ui.next.hidden = true;
    ui.opts.replaceChildren(
      ...q.options.map((text, idx) => {
        const b = el('button', { type: 'button', class: 'opt' }, [el('b', { text: 'ABCD'[idx] }), el('span', { text })]);
        b.addEventListener('click', () => answer(idx));
        return b;
      })
    );
  }

  async function answer(idx) {
    const btns = $$('.opt', ui.opts);
    btns.forEach((b) => (b.disabled = true));
    const res = await api('/quiz/answer', { token: questions[i].token, choice: idx });
    if (res.error) {
      ui.fb.className = 'quiz__fb is-wrong';
      ui.fb.replaceChildren(el('p', { text: res.error }));
      ui.fb.hidden = false;
      return;
    }
    if (res.correct) right++;
    btns[res.correctChoice]?.classList.add('is-right');
    if (!res.correct) btns[idx].classList.add('is-wrong');
    ui.fb.className = `quiz__fb${res.correct ? '' : ' is-wrong'}`;
    ui.fb.replaceChildren(el('strong', { text: res.correct ? 'Esatto!' : 'Risposta errata' }), el('p', { text: res.explanation }));
    ui.fb.hidden = false;
    ui.next.textContent = i === questions.length - 1 ? 'Vedi il risultato' : 'Prossima domanda';
    ui.next.hidden = false;
    ui.bar.style.width = `${((i + 1) / questions.length) * 100}%`;
    ui.next.focus();
  }

  ui.next.addEventListener('click', () => {
    i++;
    if (i < questions.length) return render();
    const pct = right / questions.length;
    ui.score.textContent = `${right}/${questions.length}`;
    ui.msg.textContent =
      pct === 1 ? 'Perfetto! Sei pronto per un simulatore completo.'
        : pct >= 0.6 ? 'Buon risultato: con un po’ di ripetizione costante arrivi al 100%.'
          : 'Niente panico: è proprio per questo che esistono i quiz. Poco, ma ogni giorno.';
    show('end');
  });
  $('[data-quiz-go]', root).addEventListener('click', start);
  $('[data-quiz-again]', root).addEventListener('click', () => show('start'));
}

/* Galletto ----------------------------------------------------------------- */
function initGalletto() {
  const form = $('[data-chat-form]');
  if (form) {
    const log = $('[data-chat-log]');
    const input = form.elements.message;
    const push = (node) => {
      log.append(node);
      log.scrollTop = log.scrollHeight;
    };
    const send = async (text) => {
      if (!text.trim()) return;
      push(el('div', { class: 'bubble bubble--user', text }));
      const typing = el('div', { class: 'typing' }, [el('span'), el('span'), el('span')]);
      push(typing);
      const [res] = await Promise.all([api('/galletto/chat', { message: text }), new Promise((r) => setTimeout(r, 650))]);
      typing.remove();
      const bubble = el('div', { class: 'bubble bubble--bot' }, [el('span', { text: res.text || res.error })]);
      if (res.actions?.length) {
        bubble.append(
          el('div', { class: 'bubble__actions' }, res.actions.map((a) => {
            const link = el('a', { class: 'chip', href: a.href, text: a.label });
            if (a.course) link.dataset.course = a.course;
            return link;
          }))
        );
      }
      push(bubble);
      const hit = res.actions?.find((a) => a.course);
      const sel = $('[data-plan-form] select[name="course"]');
      if (hit && sel) sel.value = hit.course;
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value;
      input.value = '';
      send(text);
    });
    $('[data-chat-suggest]')?.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (b) send(b.textContent);
    });
  }

  const plan = $('[data-plan-form]');
  if (!plan) return;
  const out = $('[data-plan-out]');
  const err = $('[data-plan-error]');
  const date = $('[data-min-today]', plan);
  const d = new Date();
  date.min = d.toISOString().slice(0, 10);
  d.setDate(d.getDate() + 42);
  if (!date.value) date.value = d.toISOString().slice(0, 10);

  plan.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('button', plan);
    btn.disabled = true;
    const data = Object.fromEntries(new FormData(plan));
    const res = await api('/galletto/plan', data);
    btn.disabled = false;
    if (res.error) {
      err.textContent = res.error;
      err.hidden = false;
      return;
    }
    err.hidden = true;
    const stat = (v, l) => el('div', {}, [el('strong', { text: String(v) }), el('span', { text: l })]);
    out.replaceChildren(
      el('h2', { text: `Il tuo piano per «${res.course.title}»` }),
      el('div', { class: 'plan-summary' }, [
        stat(res.daysLeft, 'giorni alla prova'),
        stat(res.weeks, 'settimane'),
        stat(res.quizPerDay, 'quiz al giorno'),
        stat(res.totalQuiz.toLocaleString('it-IT'), 'quiz in totale')
      ]),
      el('div', { class: 'plan-weeks' }, res.schedule.map((w, idx) => {
        const card = el('article', { class: `card week${w.phase === 'Studio e quiz' ? '' : ' week--review'}` }, [
          el('header', {}, [el('strong', { text: `Settimana ${w.week}` }), el('span', { class: 'chip', text: w.phase })]),
          el('ul', {}, w.focus.map((f) => el('li', { text: f }))),
          el('p', { class: 'q', text: `${w.quiz} quiz` }),
          el('p', { text: w.tip })
        ]);
        card.style.animationDelay = `${idx * 60}ms`;
        return card;
      }))
    );
    out.hidden = false;
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* Contatti ----------------------------------------------------------------- */
function initContact() {
  const form = $('[data-contact-form]');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('button', form);
    btn.disabled = true;
    const data = Object.fromEntries(new FormData(form));
    data.consent = form.elements.consent.checked;
    const res = await api('/contact', data);
    btn.disabled = false;
    $$('[data-err]', form).forEach((n) => (n.textContent = ''));
    if (res.ok) {
      form.reset();
      $('[data-contact-ok]', form).hidden = false;
      return;
    }
    const errors = res.errors || { message: res.error || 'Errore di invio.' };
    for (const [k, v] of Object.entries(errors)) {
      const n = $(`[data-err="${k}"]`, form);
      if (n) n.textContent = v;
    }
  });
}

/* Cookie ------------------------------------------------------------------- */
function initCookie() {
  const bar = $('[data-cookie]');
  if (!bar || storage.get('cookie-ok')) return;
  bar.hidden = false;
  $('[data-cookie-ok]', bar).addEventListener('click', () => {
    storage.set('cookie-ok', '1');
    bar.hidden = true;
  });
}

document.documentElement.classList.add('js');
initTheme();
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  initCounters();
  initCatalog();
  initQuiz();
  initGalletto();
  initContact();
  initCookie();
});
