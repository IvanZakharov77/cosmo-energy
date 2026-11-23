// Small UI helpers for the site. No dependencies.
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  // ?static in the url turns animations off, handy for screenshots
  if (location.search.includes('static')) document.documentElement.classList.add('no-js');

  // mobile menu
  const burger = $('#burger');
  const menu = $('#menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 960) setMenu(false); });

  // highlight current section in the menu
  const links = $$('.nav a[href^="#"]:not(.btn)');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.map(a => $(a.getAttribute('href'))).filter(Boolean).forEach(s => spy.observe(s));

  // soft reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  // tabs
  const tabs = $$('.tabs__btn');
  tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
      $('#' + b.getAttribute('aria-controls')).hidden = !on;
    });
  }));

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
