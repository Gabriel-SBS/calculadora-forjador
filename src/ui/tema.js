(function () {
  'use strict';
  var btn = document.getElementById('theme-btn');
  if (!btn) return;
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  // Cada app diz no <html> (data-tema-key) em que chave guarda o tema
  var TEMA_KEY = root.getAttribute('data-tema-key') || 'tema';

  function current() {
    var forced = root.getAttribute('data-theme');
    if (forced === 'light' || forced === 'dark') return forced;
    return mq && mq.matches ? 'dark' : 'light';
  }
  function sync() {
    var t = current();
    btn.setAttribute('data-current', t);
    var label = t === 'dark' ? 'Mudar para tema diurno' : 'Mudar para tema noturno';
    btn.setAttribute('aria-label', label);
    btn.title = label;
    // A barra do navegador acompanha o fundo da aba e do tema atuais
    var bg = getComputedStyle(root).getPropertyValue('--bg').trim();
    if (themeMeta && bg) themeMeta.setAttribute('content', bg);
  }
  window.addEventListener('oficina-change', sync);
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function apply(next) {
    root.setAttribute('data-theme', next);
    try { localStorage.setItem(TEMA_KEY, next); } catch (e) {}
    sync();
  }

  btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition || reduce) { apply(next); return; }

    // Calcula origem e raio da transição a partir do botão
    var r = btn.getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    var raio = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    root.style.setProperty('--wave-x', x + 'px');
    root.style.setProperty('--wave-y', y + 'px');
    root.style.setProperty('--wave-max', Math.ceil(raio + 440) + 'px');
    root.classList.add('theme-wave');
    var transition = document.startViewTransition(function () { apply(next); });
    function limpar() {
      root.classList.remove('theme-wave');
      ['--wave-x', '--wave-y', '--wave-max'].forEach(function (p) { root.style.removeProperty(p); });
    }
    transition.finished.then(limpar, limpar);
  });
  if (mq && mq.addEventListener) mq.addEventListener('change', sync);
  sync();
})();
