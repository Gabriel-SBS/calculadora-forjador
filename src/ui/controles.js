// Campos numéricos: valor negativo ou inválido ganha aviso junto ao campo
(function () {
  'use strict';
  function check(input) {
    var min = parseFloat(input.getAttribute('min'));
    var raw = input.value, v = parseFloat(raw);
    var bad = raw !== '' && (!isFinite(v) || (isFinite(min) && v < min));
    input.setAttribute('aria-invalid', bad ? 'true' : 'false');
    var group = input.closest('.field-group');
    if (!group) { input.title = bad ? (min > 0 ? 'Use um número a partir de ' + min + '.' : 'O valor não pode ser negativo.') : ''; return; }
    var msg = group.querySelector('.field-error');
    if (bad && !msg) {
      msg = document.createElement('p');
      msg.className = 'field-error';
      msg.id = (input.id || 'campo') + '-erro';
      msg.textContent = min > 0 ? 'Use um número a partir de ' + min + '.' : 'O valor não pode ser negativo.';
      group.appendChild(msg);
      input.setAttribute('aria-describedby', ((input.getAttribute('aria-describedby') || '') + ' ' + msg.id).trim());
    } else if (!bad && msg) {
      var ids = (input.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (x) { return x && x !== msg.id; });
      msg.remove();
      if (ids.length) input.setAttribute('aria-describedby', ids.join(' ')); else input.removeAttribute('aria-describedby');
    }
  }
  document.addEventListener('input', function (e) {
    if (e.target && e.target.matches && e.target.matches('input[type="number"][min]')) check(e.target);
  }, true);
  Array.prototype.forEach.call(document.querySelectorAll('input[type="number"][min]'), check);
})();

// Navegação por teclado nos botões segmentados e animação dos <details>
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var groups = document.querySelectorAll('.segmented[role="radiogroup"], .segmented[role="tablist"]');
  var pillUpdaters = [];

  Array.prototype.forEach.call(groups, function (group) {
    var btns = Array.prototype.slice.call(group.querySelectorAll('[role="radio"], [role="tab"]'));
    var pill = document.createElement('span');
    pill.className = 'seg-pill no-anim';
    pill.setAttribute('aria-hidden', 'true');
    group.insertBefore(pill, group.firstChild);
    group.classList.add('has-pill');
    var skipNextAnim = true;

    // Rádios marcam a escolha com aria-checked; abas, com aria-selected
    function isOn(b) { return b.getAttribute('aria-checked') === 'true' || b.getAttribute('aria-selected') === 'true'; }

    function updatePill(instant) {
      var checked = btns.filter(isOn)[0] || btns[0];
      if (!checked || !checked.offsetWidth) {
        skipNextAnim = true;
        return;
      }
      if (instant || skipNextAnim || reduce) {
        pill.classList.add('no-anim');
      } else {
        pill.classList.remove('no-anim');
      }
      pill.style.width = checked.offsetWidth + 'px';
      pill.style.height = checked.offsetHeight + 'px';
      pill.style.transform = 'translate3d(' + checked.offsetLeft + 'px,' + checked.offsetTop + 'px,0)';
      if (instant || skipNextAnim || reduce) {
        void pill.offsetWidth;
        pill.classList.remove('no-anim');
      }
      skipNextAnim = false;
    }

    function syncTabs() {
      var checked = btns.filter(isOn)[0] || btns[0];
      btns.forEach(function (b) { b.tabIndex = b === checked ? 0 : -1; });
      updatePill(false);
    }

    group.addEventListener('keydown', function (ev) {
      var i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      var next = null;
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') next = btns[(i + 1) % btns.length];
      else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') next = btns[(i - 1 + btns.length) % btns.length];
      else if (ev.key === 'Home') next = btns[0];
      else if (ev.key === 'End') next = btns[btns.length - 1];
      if (!next) return;
      ev.preventDefault();
      // Troca pelo teclado vai direto, sem animar
      skipNextAnim = true;
      next.click();
      next.focus();
    });

    new MutationObserver(syncTabs).observe(group, { subtree: true, attributes: true, attributeFilter: ['aria-checked', 'aria-selected'] });
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { updatePill(true); }).observe(group);
    }
    syncTabs();
    pillUpdaters.push(function () { updatePill(true); });
  });

  window.addEventListener('resize', function () {
    pillUpdaters.forEach(function (fn) { fn(); });
  });
  // Quando blocos ocultos (como #artesao-modo-wrap ou #peso-wrap) aparecem, reposiciona a pílula sem animar
  new MutationObserver(function () {
    pillUpdaters.forEach(function (fn) { fn(); });
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['hidden'] });

  // Abre e fecha os <details> de forma suave
  Array.prototype.forEach.call(document.querySelectorAll('details.mods, details.magicos, details.explain'), function (det) {
    var sum = det.querySelector('summary');
    if (!sum || !det.animate) return;
    var anim = null;
    sum.addEventListener('click', function (ev) {
      if (reduce) return;
      ev.preventDefault();
      if (anim) { anim.cancel(); anim = null; }
      var startH = det.offsetHeight;
      var isClosing = det.open;
      if (!isClosing) det.open = true;
      var endH = isClosing ? sum.offsetHeight : det.scrollHeight;
      det.style.overflow = 'hidden';
      anim = det.animate(
        [
          { height: startH + 'px', opacity: isClosing ? 1 : 0.92 },
          { height: endH + 'px', opacity: 1 }
        ],
        {
          duration: isClosing ? 165 : 220,
          easing: 'cubic-bezier(0.23, 1, 0.32, 1)'
        }
      );
      anim.onfinish = function () {
        if (isClosing) det.open = false;
        det.style.height = '';
        det.style.overflow = '';
        anim = null;
      };
      anim.oncancel = function () {
        det.style.height = '';
        det.style.overflow = '';
      };
    });
  });
})();
