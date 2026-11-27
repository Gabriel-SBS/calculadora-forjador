  function attachComboClear(wrap, input, onClear) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mat-clear-btn';
    btn.innerHTML = ICON_X;
    btn.setAttribute('aria-label', 'Limpar campo');
    btn.title = 'Limpar';
    function sync() { btn.hidden = !input.value; }
    btn.addEventListener('mousedown', function (ev) {
      ev.preventDefault();
      input.value = '';
      sync();
      if (onClear) onClear();
      else input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    });
    // detail 0 = click vindo do teclado; o mouse já foi tratado no mousedown
    btn.addEventListener('click', function (ev) {
      if (ev.detail !== 0) return;
      input.value = '';
      sync();
      if (onClear) onClear();
      else input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    });
    input.addEventListener('input', sync);
    wrap.appendChild(btn);
    sync();
    return sync;
  }

  var comboSeq = 0;

  // Busca com sugestões no padrão combobox + listbox: setas navegam, Enter escolhe, Esc fecha.

  // o = {
  //   placeholder, labelId | ariaLabel, value,
  //   search(q) -> itens já filtrados,
  //   group(item) -> { key, tier } | null,  meta(item) -> texto à direita,
  //   emptyText (null fecha a lista quando nada bate),
  //   onInput(texto) -> false impede abrir a lista,
  //   onPick(item), onClear(),
  //   restore() -> texto a recolocar no Esc/blur (omita para manter o digitado),
  //   enterPicksFirst (padrão true), selectOnFocus, openOnFocus,
  //   sparks(item) -> 'purple' | true | null
  // }
  function createCombo(o) {
    var id = 'combo-' + (++comboSeq);
    var wrap = document.createElement('div');
    wrap.className = 'mat-combo';

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'mat-search';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.placeholder = o.placeholder || '';
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', id + '-lista');
    if (o.labelId) input.setAttribute('aria-labelledby', o.labelId);
    if (o.ariaLabel) input.setAttribute('aria-label', o.ariaLabel);
    input.value = o.value || '';

    var dropdown = document.createElement('div');
    dropdown.className = 'mat-dropdown';
    dropdown.id = id + '-lista';
    dropdown.setAttribute('role', 'listbox');
    if (o.labelId) dropdown.setAttribute('aria-labelledby', o.labelId);
    if (o.ariaLabel) dropdown.setAttribute('aria-label', o.ariaLabel);
    dropdown.hidden = true;

    wrap.appendChild(input);
    var syncClear = attachComboClear(wrap, input, function () {
      close();
      if (o.onClear) o.onClear();
    });
    wrap.appendChild(dropdown);

    var opts = [];
    var items = [];
    var hi = -1;
    var touchingDrop = false;
    var enterPicksFirst = o.enterPicksFirst !== false;

    dropdown.addEventListener('touchstart', function () { touchingDrop = true; }, { passive: true });
    dropdown.addEventListener('touchend', function () {
      setTimeout(function () { touchingDrop = false; }, 180);
    }, { passive: true });

    function close() {
      dropdown.hidden = true;
      dropdown.innerHTML = '';
      opts = [];
      items = [];
      hi = -1;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
    }

    function restore() {
      if (!o.restore) return;
      input.value = o.restore() || '';
      syncClear();
    }

    function pick(item) {
      input.value = item.nome;
      syncClear();
      close();
      var sp = o.sparks ? o.sparks(item) : null;
      if (sp && window.Forja) window.Forja.sparksAt(input, sp === 'purple' ? 'purple' : undefined);
      o.onPick(item);
    }

    function highlight(idx) {
      if (!opts.length) return;
      if (hi >= 0 && opts[hi]) {
        opts[hi].classList.remove('active');
        opts[hi].setAttribute('aria-selected', 'false');
      }
      hi = (idx + opts.length) % opts.length;
      opts[hi].classList.add('active');
      opts[hi].setAttribute('aria-selected', 'true');
      input.setAttribute('aria-activedescendant', opts[hi].id);
      opts[hi].scrollIntoView({ block: 'nearest' });
    }

    function open(q) {
      dropdown.innerHTML = '';
      opts = [];
      hi = -1;
      input.removeAttribute('aria-activedescendant');
      if (!normalizeSearch(q)) { close(); return; }
      items = o.search(q) || [];

      if (!items.length) {
        if (o.emptyText == null) { close(); return; }
        var empty = document.createElement('div');
        empty.className = 'mat-option-empty';
        empty.textContent = o.emptyText;
        dropdown.appendChild(empty);
      } else {
        var lastGroup = null;
        items.forEach(function (it, k) {
          var g = o.group ? o.group(it) : null;
          if (g && g.key !== lastGroup) {
            lastGroup = g.key;
            var head = document.createElement('div');
            head.className = 'mat-group-label';
            head.setAttribute('role', 'presentation');
            if (g.tier) head.dataset.tier = g.tier;
            head.textContent = g.key;
            dropdown.appendChild(head);
          }
          var row = document.createElement('div');
          row.className = 'mat-option';
          row.id = id + '-op-' + k;
          row.setAttribute('role', 'option');
          row.setAttribute('aria-selected', 'false');
          var nm = document.createElement('span');
          nm.className = 'mo-name';
          nm.textContent = it.nome;
          row.appendChild(nm);
          var metaTxt = o.meta ? o.meta(it) : '';
          if (metaTxt) {
            var mt = document.createElement('span');
            mt.className = 'mo-mult';
            mt.textContent = metaTxt;
            row.appendChild(mt);
          }
          row.addEventListener('mousedown', function (ev) { ev.preventDefault(); pick(it); });
          dropdown.appendChild(row);
          opts.push(row);
        });
      }
      dropdown.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }

    input.addEventListener('input', function () {
      if (o.onInput && o.onInput(input.value) === false) { close(); return; }
      open(input.value);
    });
    input.addEventListener('focus', function () {
      if (o.selectOnFocus) input.select();
      if (o.openOnFocus && input.value) open(input.value);
    });
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        if (dropdown.hidden && input.value.trim()) { open(input.value); highlight(0); }
        else if (opts.length) highlight(hi < 0 ? 0 : hi + 1);
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        if (opts.length) highlight(hi <= 0 ? opts.length - 1 : hi - 1);
      } else if (ev.key === 'Enter' && !dropdown.hidden && items.length) {
        var alvo = hi >= 0 ? items[hi] : (enterPicksFirst || items.length === 1 ? items[0] : null);
        if (alvo) { ev.preventDefault(); pick(alvo); }
      } else if (ev.key === 'Escape') {
        if (!dropdown.hidden) ev.preventDefault();
        close();
        restore();
      }
    });
    input.addEventListener('blur', function () {
      setTimeout(function () {
        if (touchingDrop) return;
        close();
        restore();
      }, 150);
    });

    wrap._input = input;
    wrap._sync = function () { restore(); };
    wrap._syncClear = syncClear;
    wrap._close = close;
    return wrap;
  }
