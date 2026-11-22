// Small UI helpers for the one-page site. No dependencies.
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  // header shadow and floating button
  const header = $('.header');
  const fab = $('#mbar');
  const hero = $('.hero');
  const contact = $('#contact');
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 20);
    const pastHero = y > hero.offsetHeight * 0.8;
    const atContact = contact.getBoundingClientRect().top < window.innerHeight * 0.6;
    fab.classList.toggle('is-visible', pastHero && !atContact);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // mobile menu
  const burger = $('#burger');
  const nav = $('#nav');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.documentElement.style.overflow = open ? 'hidden' : '';
    document.body.style.overflow = open ? 'hidden' : '';
    fab.classList.toggle('is-hidden', open);
  }
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 960) setMenu(false); });

  // highlight current section in the menu
  const links = $$('.nav a[href^="#"]:not(.btn)');
  const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  // ?static in the url turns animations off, handy for screenshots
  if (location.search.includes('static')) {
    document.documentElement.classList.add('no-js');
    $$('[data-count]').forEach(el => { el.textContent = (+el.dataset.count).toLocaleString('ru-RU'); delete el.dataset.count; });
    header.style.position = 'absolute';
    fab.style.display = 'none';
  }

  // reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el, i) => {
    // small stagger for items sitting in the same grid
    const sib = el.parentElement ? $$(':scope > .reveal', el.parentElement).indexOf(el) : 0;
    el.style.transitionDelay = Math.min(sib, 6) * 70 + 'ms';
    io.observe(el);
  });

  // count up numbers
  const counter = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const end = +el.dataset.count;
      const start = performance.now();
      const dur = 1400;
      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const v = Math.round(end * (1 - Math.pow(1 - p, 3)));
        el.textContent = v.toLocaleString('ru-RU');
        if (p < 1) requestAnimationFrame(tick);
      })(start);
      counter.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => counter.observe(el));

  // tabs
  const tabs = $$('.tabs__btn');
  tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
      const panel = $('#' + b.getAttribute('aria-controls'));
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
    });
  }));

  // reviews slider, native horizontal scroll with snap (swipe works by itself)
  const track = $('.slider__track');
  const slides = $$('.review', track);
  const prev = $('#prev'), next = $('#next'), cur = $('#cur'), total = $('#total');
  const pad = n => String(n).padStart(2, '0');
  function step() {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return slides[0].getBoundingClientRect().width + gap;
  }
  function pages() {
    return Math.max(1, Math.round((track.scrollWidth - track.clientWidth) / step()) + 1);
  }
  function update() {
    const max = track.scrollWidth - track.clientWidth;
    const i = Math.round(track.scrollLeft / step());
    cur.textContent = pad(Math.min(i + 1, pages()));
    total.textContent = pad(pages());
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
  }
  prev.addEventListener('click', () => track.scrollBy({ left: -step() }));
  next.addEventListener('click', () => track.scrollBy({ left: step() }));
  let raf = 0;
  track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
  window.addEventListener('resize', update);
  update();

  // keep only one FAQ item open
  const accs = $$('.acc');
  accs.forEach(d => d.addEventListener('toggle', () => {
    if (d.open) accs.forEach(o => { if (o !== d) o.open = false; });
  }));

  // form: simple validation, no backend yet
  const form = $('#form');
  const ok = $('#formOk');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    $$('input[required]', form).forEach(inp => {
      const wrap = inp.closest('.field, .check');
      const bad = inp.type === 'checkbox' ? !inp.checked : !inp.value.trim();
      wrap.classList.toggle('is-error', bad);
      if (bad && valid) { inp.focus(); valid = false; }
    });
    if (!valid) return;
    // TODO: send data to Telegram bot, email service or CRM
    form.reset();
    ok.hidden = false;
    setTimeout(() => { ok.hidden = true; }, 7000);
  });
  $$('input', form).forEach(inp => inp.addEventListener('input', () => {
    inp.closest('.field, .check')?.classList.remove('is-error');
  }));

  $('#year').textContent = new Date().getFullYear();
})();
