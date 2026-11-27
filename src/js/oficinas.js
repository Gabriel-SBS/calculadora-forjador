  var OFICINA_KEY = 'forjador-oficina';
  var OFICINA_META = {
    forja: {
      title: 'Forja de Equipamento',
      sub: 'Armas, armaduras, escudos, focos e instrumentos do Guia, com cálculo de custo, materiais e tempo de forja.',
      forjaLabel: 'Modo forja',
      themeLight: '#b0551f',
      themeDark: '#1a1815'
    },
    bombas: {
      title: 'Bombas e Munições',
      sub: 'As 16 bombas e bombinhas (p. 216–220), munições com modificações (p. 160) e as 11 pólvoras do Guia.',
      forjaLabel: 'Modo pólvora',
      themeLight: '#a82c2c',
      themeDark: '#171619'
    },
    herbalismo: {
      title: 'Herbalismo e Poções',
      sub: 'As 23 receitas herbáceas e os 8 ramos do Guia (p. 148–150), com cálculo de custo, tempo e venda.',
      forjaLabel: 'Modo jardim',
      themeLight: '#2c6b44',
      themeDark: '#131915'
    }
  };

  var heroTitleEl = document.getElementById('hero-title');
  var heroSubEl = document.getElementById('hero-sub');
  var durezaViewWrap = document.getElementById('dureza-view-wrap');
  var forjaLabelEl = document.getElementById('forja-label');
  var oficinaSegEl = document.getElementById('oficina-segmented');
  var oficinaBtns = Array.prototype.slice.call(oficinaSegEl.querySelectorAll('.seg-btn'));
  var oficinaPanels = Array.prototype.slice.call(document.querySelectorAll('[data-oficina-panel]'));

  function setOficina(ofi, silent) {
    if (ofi !== 'forja' && ofi !== 'bombas' && ofi !== 'herbalismo') ofi = 'forja';
    state.oficina = ofi;
    document.documentElement.setAttribute('data-oficina', ofi);
    try { localStorage.setItem(OFICINA_KEY, ofi); } catch (e) {}

    var meta = OFICINA_META[ofi];
    heroTitleEl.textContent = meta.title;
    heroSubEl.textContent = meta.sub;
    forjaLabelEl.textContent = meta.forjaLabel;
    durezaViewWrap.hidden = ofi !== 'forja';

    oficinaBtns.forEach(function (b) {
      var on = b.getAttribute('data-oficina') === ofi;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    oficinaPanels.forEach(function (p) {
      p.hidden = p.getAttribute('data-oficina-panel') !== ofi;
    });

    // Notifica o canvas de partículas e a barra de tema
    window.dispatchEvent(new CustomEvent('oficina-change', { detail: { oficina: ofi } }));
    if (!silent) {
      saveState();
      update();
    }
  }

  oficinaBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      setOficina(b.getAttribute('data-oficina'));
    });
  });

  // Selos dos ramos de herbalismo
  function makeRamoPill(id, qtd, extraLabel) {
    var r = RAMOS_MAP[id];
    var sp = document.createElement('span');
    sp.className = 'ramo-pill';
    if (r) {
      var dot = document.createElement('span');
      dot.className = 'ramo-dot ramo-' + r.id;
      sp.appendChild(dot);
      sp.appendChild(document.createTextNode(qtd + '× ' + r.nome + ' (' + fmtMoeda(r.preco * qtd) + ')' + (extraLabel ? ' ' + extraLabel : '')));
    } else {
      sp.textContent = extraLabel || (qtd + '× ramo');
    }
    return sp;
  }

  // Busca com dropdown que só abre quando o usuário digita
  function buildCatalogCombo(items, getInitial, placeholder, labelId, formatMeta, onPick, onClear) {
    var wrap = document.createElement('div');
    wrap.className = 'mat-combo';
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'mat-search';
    input.autocomplete = 'off';
    input.placeholder = placeholder;
    input.setAttribute('aria-labelledby', labelId);
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-autocomplete', 'list');
    var dropdown = document.createElement('div');
    dropdown.className = 'mat-dropdown';
    dropdown.setAttribute('role', 'listbox');
    dropdown.hidden = true;
    wrap.appendChild(input);
    var syncCatClear = attachComboClear(wrap, input, function () {
      close();
      if (onClear) onClear();
    });
    wrap.appendChild(dropdown);

    var opts = [];
    var hi = -1;
    var touchingDrop = false;

    dropdown.addEventListener('touchstart', function () { touchingDrop = true; }, { passive: true });
    dropdown.addEventListener('touchend', function () {
      setTimeout(function () { touchingDrop = false; }, 180);
    }, { passive: true });

    function syncInput() {
      var cur = getInitial();
      input.value = cur ? cur.nome : '';
      syncCatClear();
    }
    syncInput();

    function close() {
      dropdown.hidden = true;
      dropdown.innerHTML = '';
      opts = [];
      hi = -1;
      input.setAttribute('aria-expanded', 'false');
    }
    function pick(item) {
      input.value = item.nome;
      syncCatClear();
      close();
      if (window.Forja && (item.tier === 'S' || item.id === 'santa_granada')) {
        window.Forja.sparksAt(input, 'purple');
      } else if (window.Forja && (item.tier === 'A' || item.destaque || item.preco >= 100)) {
        window.Forja.sparksAt(input);
      }
      onPick(item);
    }
    function highlight(idx) {
      if (!opts.length) return;
      if (hi >= 0 && opts[hi]) opts[hi].classList.remove('active');
      hi = Math.max(0, Math.min(idx, opts.length - 1));
      opts[hi].classList.add('active');
      opts[hi].scrollIntoView({ block: 'nearest' });
    }
    function itemSearchBlob(it) {
      if (it._blob) return it._blob;
      if (it._catBlob) return it._catBlob;
      var parts = [it.nome, it.categoria || '', it.efeito || '', it.receita || ''];
      if (it.cd != null) parts.push('cd ' + it.cd);
      if (it.tr) parts.push(it.tr);
      if (it.ramos && it.ramos.length) {
        it.ramos.forEach(function (rm) {
          if (RAMOS_MAP[rm.id]) parts.push('ramo ' + RAMOS_MAP[rm.id].nome);
          if (rm.alt) parts.push(rm.alt);
        });
      }
      it._catBlob = normalizeSearch(parts.join(' '));
      return it._catBlob;
    }

    function open(q) {
      var nq = normalizeSearch(q);
      dropdown.innerHTML = '';
      opts = [];
      hi = -1;
      // Só abre com texto digitado
      if (!nq) { close(); return; }

      var list = items.filter(function (it) {
        return itemSearchBlob(it).indexOf(nq) !== -1;
      }).slice(0, 60);

      if (!list.length) {
        var empty = document.createElement('div');
        empty.className = 'mat-option-empty';
        empty.textContent = 'Nenhum item encontrado.';
        dropdown.appendChild(empty);
      } else {
        var lastGroup = null;
        list.forEach(function (it) {
          var groupKey = it.categoria ? (it.tier ? it.categoria + ' — Tier ' + it.tier : it.categoria) : null;
          if (groupKey && groupKey !== lastGroup) {
            lastGroup = groupKey;
            var grp = document.createElement('div');
            grp.className = 'mat-group-label';
            if (it.tier) grp.dataset.tier = it.tier;
            grp.textContent = lastGroup;
            dropdown.appendChild(grp);
          }
          var row = document.createElement('div');
          row.className = 'mat-option';
          row.setAttribute('role', 'option');
          var nm = document.createElement('span');
          nm.className = 'mo-name';
          nm.textContent = it.nome;
          var mt = document.createElement('span');
          mt.className = 'mo-mult';
          mt.textContent = formatMeta(it);
          row.appendChild(nm);
          row.appendChild(mt);
          row.addEventListener('mousedown', function (ev) { ev.preventDefault(); pick(it); });
          dropdown.appendChild(row);
          opts.push(row);
        });
      }
      dropdown.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }

    input.addEventListener('focus', function () {
      input.select();
    });
    input.addEventListener('input', function () {
      if (!input.value.trim() && onClear) {
        close();
        onClear();
        return;
      }
      open(input.value);
    });
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        if (dropdown.hidden && input.value.trim()) open(input.value);
        else if (opts.length) highlight(hi < 0 ? 0 : (hi + 1) % opts.length);
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        if (opts.length) highlight(hi <= 0 ? opts.length - 1 : hi - 1);
      } else if (ev.key === 'Enter' && !dropdown.hidden && opts.length) {
        ev.preventDefault();
        var target = opts[hi >= 0 ? hi : 0];
        if (target) target.dispatchEvent(new MouseEvent('mousedown'));
      } else if (ev.key === 'Escape') {
        close();
        syncInput();
      }
    });
    input.addEventListener('blur', function () {
      setTimeout(function () {
        if (touchingDrop) return;
        close();
        syncInput();
      }, 150);
    });

    wrap._sync = syncInput;
    return wrap;
  }

  // Abre e fecha os blocos de ajuda da pesquisa
  Array.prototype.forEach.call(document.querySelectorAll('[data-info-toggle]'), function (btn) {
    btn.addEventListener('click', function () {
      var target = document.getElementById(btn.getAttribute('data-info-toggle'));
      if (!target) return;
      var open = target.hidden;
      target.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
