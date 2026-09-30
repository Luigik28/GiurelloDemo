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
  if (!nav) return;
  const bar = $('[data-progress]');
  const top = $('[data-to-top]');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 8);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
    if (top) top.hidden = y < 900;
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  top?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  $$('[data-drop]').forEach((drop) => {
    const btn = $('button', drop);
    btn.addEventListener('click', () => {
      const open = drop.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => {
      if (!drop.contains(e.target)) {
        drop.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
    drop.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        drop.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  });
}

/* Pannelli laterali (menu mobile e mini carrello) -------------------------- */
const drawers = {
  open(name, opener) {
    const d = $(`[data-drawer="${name}"]`);
    if (!d) return;
    d.hidden = false;
    d._opener = opener || document.activeElement;
    document.body.classList.add('is-locked');
    requestAnimationFrame(() => d.classList.add('is-open'));
    setTimeout(() => $('[data-drawer-close]', d)?.focus(), 50);
  },
  close(d) {
    if (!d || d.hidden) return;
    d.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    setTimeout(() => {
      d.hidden = true;
      d._opener?.focus?.();
    }, 280);
  }
};

function trapFocus(container, e) {
  const items = $$('a[href], button:not([disabled]), input, select, textarea, [tabindex="0"]', container).filter((x) => x.offsetParent !== null);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

function initDrawers() {
  $$('[data-drawer-open]').forEach((b) => b.addEventListener('click', () => drawers.open(b.dataset.drawerOpen, b)));
  $$('[data-drawer]').forEach((d) => {
    d.addEventListener('click', (e) => {
      if (e.target === d || e.target.closest('[data-drawer-close]')) drawers.close(d);
    });
    d.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') drawers.close(d);
      if (e.key === 'Tab') trapFocus(d, e);
    });
  });
}

/* Notifiche ----------------------------------------------------------------- */
function toast(message, { image, link, icon = true } = {}) {
  const box = $('[data-toasts]');
  if (!box) return;
  const t = el('div', { class: 'toast', role: 'status' });
  if (image) t.append(el('img', { src: image, alt: '' }));
  else if (icon) t.insertAdjacentHTML('beforeend', '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>');
  t.append(el('span', { text: message }));
  if (link) t.append(el('a', { href: link.href, text: link.label }));
  box.append(t);
  setTimeout(() => {
    t.classList.add('is-out');
    setTimeout(() => t.remove(), 300);
  }, 3600);
}

/* Carrello senza ricaricare la pagina ------------------------------------- */
function setBadge(sel, n) {
  $$(sel).forEach((b) => {
    b.textContent = n;
    b.hidden = !n;
  });
}

function renderMiniCart(data, highlight) {
  const box = $('[data-minicart]');
  if (!box) return;
  setBadge('[data-cart-count]', data.count);
  if (!data.count) {
    box.replaceChildren(el('div', { class: 'minicart__empty' }, [el('strong', { text: 'Il carrello è vuoto' }), el('span', { text: 'Scegli un simulatore, una dispensa o un corso.' }), el('a', { class: 'btn btn--primary', href: '/concorsi', text: 'Vai ai corsi' })]));
    return;
  }
  const items = el('div', { class: 'minicart__items' }, data.items.map((it) => {
    const rm = el('button', { type: 'button', 'aria-label': `Rimuovi ${it.name}` });
    rm.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    rm.addEventListener('click', async () => {
      const r = await api('/cart/remove', { slug: it.slug });
      if (!r.error) renderMiniCart(r);
    });
    return el('div', { class: `minicart__item${it.slug === highlight ? ' is-new' : ''}` }, [
      el('img', { src: it.image, alt: '' }),
      el('span', {}, [el('a', { href: `/prodotto/${it.slug}`, text: it.name }), el('small', { text: it.price })]),
      rm
    ]);
  }));
  box.replaceChildren(
    items,
    el('div', { class: 'minicart__total' }, [el('span', { text: 'Totale' }), el('span', { text: data.total })]),
    el('div', { class: 'minicart__actions' }, [el('a', { class: 'btn btn--primary btn--lg btn--block', href: '/checkout', text: 'Vai al pagamento' }), el('a', { class: 'btn btn--ghost btn--block', href: '/carrello', text: 'Vedi il carrello' })])
  );
}

function initCart() {
  // Icona carrello: apre il pannello laterale invece di cambiare pagina.
  $$('[data-cart-open]').forEach((a) =>
    a.addEventListener('click', async (e) => {
      if (e.metaKey || e.ctrlKey || location.pathname === '/carrello' || location.pathname === '/checkout') return;
      e.preventDefault();
      renderMiniCart(await api('/cart'));
      drawers.open('cart', a);
    })
  );
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('[data-add-form]');
    if (!form) return;
    if (e.submitter?.name === 'buyNow') return; // "Acquista ora" va direttamente al checkout
    e.preventDefault();
    const btn = e.submitter || $('button', form);
    btn.disabled = true;
    const slug = form.elements.slug.value;
    const r = await api('/cart/add', { slug });
    btn.disabled = false;
    if (r.error) return toast(r.error, { icon: false });
    btn.classList.add('is-done');
    setTimeout(() => btn.classList.remove('is-done'), 1500);
    renderMiniCart(r, slug);
    drawers.open('cart', btn);
  });
}

/* Preferiti ------------------------------------------------------------------ */
function initFavorites() {
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('[data-fav-form]');
    if (!form) return;
    e.preventDefault();
    const slug = form.elements.slug.value;
    const r = await api('/favorites/toggle', { slug });
    if (r.error) return;
    $$(`[data-fav-form] input[value="${CSS.escape(slug)}"]`).forEach((inp) => {
      const b = $('button', inp.form);
      b.classList.toggle('is-on', r.on);
      b.setAttribute('aria-pressed', String(r.on));
      b.classList.remove('pop');
      void b.offsetWidth;
      b.classList.add('pop');
      const label = $('[data-fav-label]', inp.form);
      if (label) label.textContent = r.on ? 'Salvato' : 'Salva';
    });
    setBadge('[data-fav-count]', r.count);
    toast(r.on ? 'Salvato nei preferiti' : 'Rimosso dai preferiti', r.on ? { link: { href: '/preferiti', label: 'Vedi' } } : {});
  });
}

/* Ricerca istantanea (Ctrl+K o "/") --------------------------------------- */
function initPalette() {
  const pal = $('[data-palette]');
  if (!pal) return;
  const input = $('[data-palette-input]', pal);
  const list = $('[data-palette-list]', pal);
  let opener = null;
  let active = -1;
  let timer = null;
  let seq = 0;

  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const highlight = (text, q) => {
    const span = el('strong');
    const terms = q.trim().split(/\s+/).filter((t) => t.length > 1).map(esc);
    if (!terms.length) { span.textContent = text; return span; }
    const re = new RegExp(`(${terms.join('|')})`, 'ig');
    text.split(re).forEach((part, i) => span.append(i % 2 ? el('mark', { text: part }) : part));
    return span;
  };
  const items = () => $$('[role="option"]', list);
  const select = (i) => {
    const all = items();
    if (!all.length) return;
    active = (i + all.length) % all.length;
    all.forEach((x, j) => x.setAttribute('aria-selected', String(j === active)));
    all[active].scrollIntoView({ block: 'nearest' });
  };

  async function run() {
    const q = input.value;
    const my = ++seq;
    const r = await api(`/search?q=${encodeURIComponent(q)}`);
    if (my !== seq) return; // risposta superata da una digitazione più recente
    const nodes = [];
    if (r.results?.length) {
      nodes.push(el('div', { class: 'palette__group', text: 'Corsi e prodotti' }));
      r.results.forEach((p) => {
        const a = el('a', { class: 'palette__item', href: `/prodotto/${p.slug}`, role: 'option' }, [
          el('img', { src: p.image, alt: '' }),
          el('span', {}, [highlight(p.name, q), el('small', { text: p.type + (p.isNew ? ' · Nuovo' : '') })]),
          el('em', { text: p.price })
        ]);
        nodes.push(a);
      });
    }
    if (r.pages?.length) {
      nodes.push(el('div', { class: 'palette__group', text: q ? 'Pagine' : 'Vai a' }));
      r.pages.forEach((p) => {
        const ico = el('span', { class: 'mega__ico' });
        ico.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
        nodes.push(el('a', { class: 'palette__item palette__item--page', href: p.href, role: 'option' }, [ico, el('span', {}, [el('strong', { text: p.label })])]));
      });
    }
    if (q && r.total > r.results.length) nodes.push(el('a', { class: 'palette__all', href: `/concorsi?q=${encodeURIComponent(q)}`, role: 'option', text: `Vedi tutti i ${r.total} risultati` }));
    if (q && !r.results?.length) nodes.unshift(el('div', { class: 'palette__empty', text: `Nessun corso per «${q}». Prova con il nome dell’ente o della materia.` }));
    list.replaceChildren(...nodes);
    active = -1;
    if (q) select(0);
  }

  const open = (seed = '') => {
    opener = document.activeElement;
    pal.hidden = false;
    document.body.classList.add('is-locked');
    requestAnimationFrame(() => pal.classList.add('is-open'));
    input.value = seed;
    input.focus();
    run();
  };
  const close = () => {
    pal.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    setTimeout(() => { pal.hidden = true; opener?.focus?.(); }, 200);
  };

  $$('[data-search-open]').forEach((b) => b.addEventListener('click', () => { $$('[data-drawer]').forEach((d) => drawers.close(d)); open(); }));
  // La ricerca della home apre la ricerca istantanea mentre si scrive.
  const hero = $('[data-hero-search] input');
  hero?.addEventListener('input', () => { const v = hero.value; hero.value = ''; open(v); });

  document.addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
      e.preventDefault();
      pal.hidden ? open() : close();
    }
  });
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 120); });
  pal.addEventListener('click', (e) => { if (e.target === pal) close(); });
  pal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); select(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); select(active - 1); }
    else if (e.key === 'Enter' && active >= 0 && items()[active]) { e.preventDefault(); location.href = items()[active].href; }
  });
}

/* Schede "Cosa stai preparando?" ------------------------------------------- */
function initTabs() {
  $$('[data-tabs]').forEach((root) => {
    const tabs = $$('[role="tab"]', root);
    const show = (tab) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        $(`#${t.getAttribute('aria-controls')}`).hidden = !on;
      });
      $$('.reveal', $(`#${tab.getAttribute('aria-controls')}`)).forEach((r) => r.classList.add('is-in'));
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(t));
      t.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        const next = tabs[(i + d + tabs.length) % tabs.length];
        next.focus();
        show(next);
      });
    });
  });
}

/* Percorso guidato ------------------------------------------------------------ */
function initWizard() {
  const form = $('[data-wizard]');
  if (!form) return;
  const steps = $$('[data-step]', form);
  const back = $('[data-wizard-back]', form);
  const submit = $('[data-wizard-submit]', form);
  const bar = $('[data-wizard-bar]', form);
  const count = $('[data-wizard-count]', form);
  let current = 0;

  const syncNeeds = () => {
    const goal = form.elements.goal.value;
    $$('[data-for-goal]', form).forEach((g) => {
      const on = g.dataset.forGoal === goal;
      g.hidden = !on;
      $$('input', g).forEach((i) => { i.disabled = !on; if (!on) i.checked = false; });
    });
    const titles = { concorso: 'In quale area è il tuo concorso?', universita: 'Di cosa hai bisogno?', avvocato: 'Come vuoi prepararti?' };
    $('[data-need-title]', form).textContent = titles[goal] || 'Di cosa hai bisogno?';
  };
  const go = (i) => {
    current = Math.max(0, Math.min(i, steps.length - 1));
    steps.forEach((s, j) => s.classList.toggle('is-current', j === current));
    bar.style.width = `${((current + 1) / steps.length) * 100}%`;
    count.textContent = `Domanda ${current + 1} di ${steps.length}`;
    back.hidden = current === 0;
    submit.hidden = current < steps.length - 1;
    $('input:checked, input:not([disabled])', steps[current])?.focus({ preventScroll: true });
  };
  form.addEventListener('change', (e) => {
    if (e.target.name === 'goal') syncNeeds();
    // Avanza da solo appena si sceglie una risposta.
    if (current < steps.length - 1) setTimeout(() => go(current + 1), 220);
  });
  back.addEventListener('click', () => go(current - 1));
  form.addEventListener('submit', (e) => {
    if (!form.elements.goal.value) { e.preventDefault(); go(0); }
  });
  syncNeeds();
  go(form.elements.goal.value ? 1 : 0);
}

/* Ordinamento del catalogo, barra d'acquisto, condivisione ----------------- */
function initMisc() {
  $$('[data-sort] select').forEach((s) => s.addEventListener('change', () => s.form.submit()));

  const buybar = $('[data-buybar]');
  const anchor = $('[data-buy-anchor]');
  if (buybar && anchor && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => buybar.classList.toggle('is-visible', !en.isIntersecting && en.boundingClientRect.top < 0)).observe(anchor);
  }

  $$('[data-share]').forEach((b) =>
    b.addEventListener('click', async () => {
      const data = { title: b.dataset.title, url: location.href };
      try {
        if (navigator.share) await navigator.share(data);
        else { await navigator.clipboard.writeText(location.href); toast('Link copiato negli appunti'); }
      } catch { /* condivisione annullata */ }
    })
  );
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
        node.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString('it-IT') + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    })
  );
  nums.forEach((n) => io.observe(n));
}

/* Caroselli ---------------------------------------------------------------- */
function initRails() {
  $$('[data-rail-nav]').forEach((nav) => {
    const track = $(`[data-rail="${nav.dataset.railNav}"]`);
    if (!track) return;
    const [prev, next] = $$('button', nav);
    const step = () => (track.firstElementChild?.getBoundingClientRect().width || 300) + 20;
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => {
      const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      track.scrollTo({ left: end ? 0 : track.scrollLeft + step(), behavior: 'smooth' });
    });
  });
}

/* Immagini prodotto: se il CDN non risponde mostriamo il segnaposto grafico */
function initImages() {
  const fallback = (img) => {
    const box = img.parentElement;
    img.remove();
    if (!box.querySelector('.pcard__ph')) box.prepend(el('div', { class: 'pcard__ph' }));
  };
  $$('.pcard__img img, .product__img img').forEach((img) => {
    if (img.complete && img.naturalWidth === 0) fallback(img);
    else img.addEventListener('error', () => fallback(img), { once: true });
  });
}

/* Newsletter ---------------------------------------------------------------- */
function initNewsletter() {
  const form = $('[data-newsletter]');
  if (!form) return;
  const msg = $('[data-newsletter-msg]', form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.consent = form.elements.consent.checked;
    const res = await api('/newsletter', data);
    msg.textContent = res.ok ? 'Grazie! Ti terremo aggiornato.' : Object.values(res.errors || { e: res.error })[0];
    if (res.ok) form.reset();
  });
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
        const card = el('article', { class: `card week${w.phase === 'Batterie di quiz' ? '' : ' week--review'}` }, [
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

/* Checkout (pagamento simulato) ------------------------------------------ */
function initCheckout() {
  const form = $('[data-checkout]');
  if (!form) return;
  const fields = $('[data-card-fields]', form);
  const rateNote = $('[data-rate-note]', form);
  const paypalNote = $('[data-paypal-note]', form);
  const sync = () => {
    const m = form.elements.method?.value;
    if (fields) fields.hidden = m === 'paypal';
    if (rateNote) rateNote.hidden = m !== 'rate';
    if (paypalNote) paypalNote.hidden = m !== 'paypal';
  };
  form.addEventListener('change', sync);
  sync();
  const num = form.elements.cardNumber;
  num?.addEventListener('input', () => {
    num.value = num.value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
  });
  const exp = form.elements.cardExpiry;
  exp?.addEventListener('input', () => {
    const d = exp.value.replace(/\D/g, '').slice(0, 4);
    exp.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  });
  form.addEventListener('submit', () => {
    const btn = $('button:last-of-type', form);
    if (btn) { btn.disabled = true; btn.textContent = 'Pagamento in corso…'; }
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
  initDrawers();
  initCart();
  initFavorites();
  initPalette();
  initTabs();
  initWizard();
  initMisc();
  initReveal();
  initCounters();
  initRails();
  initImages();
  initNewsletter();
  initQuiz();
  initGalletto();
  initContact();
  initCheckout();
  initCookie();
});
