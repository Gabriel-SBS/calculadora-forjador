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

  // Busca nos catálogos do Guia (bombas, pólvoras, receitas e materiais).
  // A lista só abre com texto digitado; Esc ou sair do campo volta ao item salvo.
  function catalogSearchBlob(it) {
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

  function buildCatalogCombo(items, getInitial, placeholder, labelId, formatMeta, onPick, onClear) {
    function nomeSalvo() {
      var cur = getInitial();
      return cur ? cur.nome : '';
    }
    var wrap = createCombo({
      placeholder: placeholder,
      labelId: labelId,
      value: nomeSalvo(),
      search: function (q) {
        var nq = normalizeSearch(q);
        return items.filter(function (it) { return catalogSearchBlob(it).indexOf(nq) !== -1; }).slice(0, 60);
      },
      group: function (it) {
        if (!it.categoria) return null;
        return { key: it.tier ? it.categoria + ' · Tier ' + it.tier : it.categoria, tier: it.tier };
      },
      meta: formatMeta,
      emptyText: 'Nenhum item encontrado.',
      selectOnFocus: true,
      restore: nomeSalvo,
      sparks: function (it) {
        if (it.tier === 'S' || it.id === 'santa_granada') return 'purple';
        return (it.tier === 'A' || it.destaque || it.preco >= 100) ? true : null;
      },
      onInput: function (texto) {
        if (!texto.trim() && onClear) { onClear(); return false; }
      },
      onClear: onClear,
      onPick: onPick
    });
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
