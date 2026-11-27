  var CATEGORIA_ORDER = ['Metais', 'Vegetais', 'Geológicos', 'Orgânicos'];
  var TIER_ORDER = ['D', 'C', 'B', 'A', 'S'];

  function materialById(id) {
    for (var i = 0; i < MATERIALS_DB.length; i++) {
      if (MATERIALS_DB[i].id === id) return MATERIALS_DB[i];
    }
    return null;
  }


  var CATEGORIA_ALIASES = {
    'Metais': ['metal', 'metais'],
    'Vegetais': ['vegetal', 'vegetais', 'madeira'],
    'Geológicos': ['geologico', 'geologicos', 'pedra', 'mineral', 'cristal'],
    'Orgânicos': ['organico', 'organicos']
  };

  var DIACRITICS_RE = new RegExp(String.fromCharCode(0x5b) + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + String.fromCharCode(0x5d), 'g');

  function normalizeSearch(s) {
    return (s || '').toString().normalize('NFD').replace(DIACRITICS_RE, '').toLowerCase().trim();
  }

  MATERIALS_DB.forEach(function (m) {
    var aliases = CATEGORIA_ALIASES[m.categoria] || [];
    m._blob = normalizeSearch(m.nome + ' ' + m.categoria + ' tier ' + m.tier + ' ' + aliases.join(' '));
  });

  function searchMaterials(query) {
    var q = normalizeSearch(query);
    if (!q) return [];
    var out = [];
    CATEGORIA_ORDER.forEach(function (categoria) {
      TIER_ORDER.forEach(function (tier) {
        MATERIALS_DB.forEach(function (m) {
          if (m.categoria === categoria && m.tier === tier && m._blob.indexOf(q) !== -1) out.push(m);
        });
      });
    });
    return out;
  }

  var ARTESAO_DESCONTO = 20;
  var FORJADOR_DIVISOR = 2;
  var ARMADURA_FRACAO = 0.2;


  var DEFAULTS = {
    oficina: 'forja',
    pde: '',
    materials: [
      { materialId: '', name: '', mult: '', tier: '' }
    ],
    equipNome: '',
    peso: '',
    mods: [],
    modExistente: false,
    obraPrima: false,
    melhorDosMelhores: false,
    excalibur: false,
    artesao: true,
    artesaoModo: 'duplo',
    materiaisPossuidos: false,
    pressa: false,
    ajudante: false,
    mostrarDureza: true,
    tipoItem: 'arma',
    fracaoFixa: false,
    modo: 'proprio',
    lucro: 30,
    magicoRaridade: 'comum',
    magicoCustoBase: '',
    magicoTempoBase: '',
    encantarExistente: false,
    desencantado: false,
    peritoItensMagicos: false,
    especialistaItensMagicos: false,
    criacoesAutomaticas: false,
    versadoItensMagicos: false,
    transmutNivel: '3',
    transmutOrigemId: '',
    transmutDestinoId: '',
    compMats: ['', '', ''],
    // Oficina Bombas e Munições
    bmTipo: 'bomba',
    bombaId: '',
    bombaFormato: 'bomba',
    bombaQtd: 1,
    bombaPolvora: '',
    bombaForjador: true,
    bombaArtesao: true,
    bombaPossuidos: false,
    bombaDes: 0,
    bombaBp: 2,
    bombaMestre: false,
    bombaModo: 'proprio',
    bombaLucro: 50,
    bmMunId: '',
    bmMunPde: '',
    bmMunMatId: '',
    bmMunMod: -1,
    bmMunModQtd: 5,
    bmMunModExistente: false,
    bmPressa: false,
    bmObra: false,
    bmAjudante: false,
    bmPolvId: '',
    bmPolvQtd: 1,
    // Oficina Herbalismo
    herbalId: '',
    herbalQtd: 1,
    herbalOrigem: 'comprar-ramos',
    herbalArtesao: true,
    herbalAjudante: false,
    herbalModo: 'proprio',
    herbalLucro: 50
  };

  var DUREZA_RANK = { 'd4': 1, 'd6': 2, 'd8': 3, 'd10': 4, 'd12': 5, 'd20': 6, 'd100': 7, '∞': 8 };

  var TIER_HOURS = { D: 24, C: 24, B: 48, A: 96, S: 192 };
  var COMUM_HORAS_DIA = 8;
  var FORJADOR_HORAS_DIA = 12;

  var state = null;

  var loadedFromShare = false;

  function encodeShareState() {
    var diff = { oficina: state.oficina || 'forja' };
    Object.keys(DEFAULTS).forEach(function (k) {
      if (k === 'compMats') return;
      if (JSON.stringify(state[k]) !== JSON.stringify(DEFAULTS[k])) diff[k] = state[k];
    });
    var json = JSON.stringify(diff);
    var bytes = unescape(encodeURIComponent(json));
    return btoa(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function decodeShareState() {
    try {
      var q = window.location.search || '';
      var m = q.match(/[?&]s=([A-Za-z0-9_-]+)/);
      if (!m) return null;
      var b64 = m[1].replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      var json = decodeURIComponent(escape(atob(b64)));
      var parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== 'object') return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function loadState() {
    var shared = decodeShareState();
    if (shared) {
      var fromUrl = JSON.parse(JSON.stringify(DEFAULTS));
      Object.keys(shared).forEach(function (k) {
        if (k in DEFAULTS) fromUrl[k] = shared[k];
      });
      if (!Array.isArray(fromUrl.materials) || !fromUrl.materials.length) {
        fromUrl.materials = JSON.parse(JSON.stringify(DEFAULTS.materials));
      }
      if (!Array.isArray(fromUrl.mods)) fromUrl.mods = [];
      if (!Array.isArray(fromUrl.compMats)) fromUrl.compMats = ['', '', ''];
      loadedFromShare = true;
      return fromUrl;
    }
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULTS));
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.materials) || !parsed.materials.length) {
        return JSON.parse(JSON.stringify(DEFAULTS));
      }
      var merged = JSON.parse(JSON.stringify(DEFAULTS));
      Object.keys(parsed).forEach(function (k) { merged[k] = parsed[k]; });
      if (!Array.isArray(merged.mods)) merged.mods = [];
      if (!Array.isArray(merged.compMats) || merged.compMats.length !== 3) merged.compMats = ['', '', ''];
      return merged;
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULTS));
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* ignore */ }
  }

  function fmt(n) {
    if (!isFinite(n)) return '0';
    var rounded = Math.round(n * 100) / 100;
    return rounded.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  // 1 po = 10 pp = 100 pc (sem electro/platina, arredonda em pc)
  function moedas(n) {
    var c = Math.round(Math.abs(isFinite(n) ? n : 0) * 100);
    var partes = [];
    var po = Math.floor(c / 100), pp = Math.floor((c % 100) / 10), pc = c % 10;
    if (po) partes.push([po.toLocaleString('pt-BR'), 'po']);
    if (pp) partes.push([String(pp), 'pp']);
    if (pc) partes.push([String(pc), 'pc']);
    if (!partes.length) partes.push(['0', 'po']);
    return { neg: n < 0 && c > 0, partes: partes };
  }
  function fmtMoeda(n) {
    var m = moedas(n);
    return (m.neg ? '−' : '') + m.partes.map(function (p) { return p[0] + ' ' + p[1]; }).join(' ');
  }
  // Destaca a moeda principal e diminui o resto
  function htmlMoeda(n) {
    var m = moedas(n);
    return m.partes.map(function (p, i) {
      return '<span class="coin' + (i ? ' coin-sm' : '') + '" data-coin="' + p[1] + '"><span class="coin-n">' + (i === 0 && m.neg ? '−' : '') + p[0] + '</span><span class="unit">' + p[1] + '</span></span>';
    }).join('');
  }

  function num(v, fallback) {
    var n = parseFloat(v);
    return isFinite(n) ? n : (fallback || 0);
  }

  // Elementos da tela
  var pdeInput = document.getElementById('pde');
  var artesaoSwitch = document.getElementById('artesao-switch');
  var artesaoModoWrap = document.getElementById('artesao-modo-wrap');
  var artesaoModoBtns = Array.prototype.slice.call(document.querySelectorAll('#artesao-modo .seg-btn, #bomba-artesao-modo .seg-btn'));
  var artesaoExplica = document.getElementById('artesao-explica');
  var materiaisSwitch = document.getElementById('materiais-switch');
  var durezaSwitch = document.getElementById('dureza-switch');
  var resultPropsEl = document.getElementById('result-props');
  var lucroInput = document.getElementById('lucro');
  var lucroWrap = document.getElementById('lucro-wrap');
  var rowsWrap = document.getElementById('material-rows');
  var addBtn = document.getElementById('add-material');
  var capNote = document.getElementById('mat-cap-note');
  var segBtns = Array.prototype.slice.call(document.querySelectorAll('#mode-segmented .seg-btn'));
  var tipoBtns = Array.prototype.slice.call(document.querySelectorAll('#tipo-segmented .seg-btn'));
  var fracaoSwitch = document.getElementById('fracao-switch');
  var fracaoWrap = document.getElementById('fracao-wrap');
  var magicoRaridadeSelect = document.getElementById('magico-raridade');
  var magicoCustoInput = document.getElementById('magico-custo');
  var magicoTempoInput = document.getElementById('magico-tempo');
  var peritoSwitch = document.getElementById('perito-switch');
  var especialistaSwitch = document.getElementById('especialista-switch');
  var magicoResultEl = document.getElementById('magico-result');
  var transmutOrigemWrap = document.getElementById('transmut-origem-wrap');
  var transmutDestinoWrap = document.getElementById('transmut-destino-wrap');
  var transmutResultEl = document.getElementById('transmut-result');
  var resultEl = document.getElementById('result');
  var resultLabel = document.getElementById('result-label');
  var breakdownEl = document.getElementById('breakdown');
  var compareRowsEl = document.getElementById('compare-rows');
  var vantagensRowsEl = document.getElementById('vantagens-rows');
  var productionRowsEl = document.getElementById('production-rows');
  var productionNoteEl = document.getElementById('production-note');
  var resultTimeEl = document.getElementById('result-time');
  var resultTimeSubEl = document.getElementById('result-time-sub');
  var lastForjadorHoras = null;
  var resultEmptyEl = document.getElementById('result-empty');
  var compareSection = document.getElementById('compare-section');
  var cbTime = document.getElementById('cb-time');
  var liveEl = document.getElementById('live-result');
  var liveTimer = 0;
  var pressaSwitch = document.getElementById('pressa-switch');
  var formulaNote = document.getElementById('formula-note');
  var resetBtn = document.getElementById('reset-btn');
  var equipWrap = document.getElementById('equip-wrap');
  var equipInfo = document.getElementById('equip-info');
  var pdeLabel = document.getElementById('pde-label');
  var pesoWrap = document.getElementById('peso-wrap');
  var pesoBtns = Array.prototype.slice.call(document.querySelectorAll('#peso-segmented .seg-btn'));
  var juncaoInfo = document.getElementById('juncao-info');
  var modsList = document.getElementById('mods-list');
  var modsTotal = document.getElementById('mods-total');
  var transmutNivelSelect = document.getElementById('transmut-nivel');

  // Switches simples (id do botão, chave no estado e ação)
  var SIMPLE_SWITCHES = [
    ['existente-switch', 'modExistente', 'main'],
    ['obra-switch', 'obraPrima', 'main'],
    ['ajudante-switch', 'ajudante', 'main'],
    ['melhor-switch', 'melhorDosMelhores', 'main'],
    ['encantar-switch', 'encantarExistente', 'magic'],
    ['desencantado-switch', 'desencantado', 'magic'],
    ['versado-switch', 'versadoItensMagicos', 'magic']
  ];

  var autoForjSwitch = document.getElementById('auto-forj-switch');
  var excaliburSwitch = document.getElementById('excalibur-switch');
  var excaliburSetting = document.getElementById('excalibur-setting');
  var consertoNoteEl = document.getElementById('conserto-note');
  var forjHighCountEl = document.getElementById('forj-high-count');
  var magicosActiveCountEl = document.getElementById('magicos-active-count');
  var lucroPresetBtns = Array.prototype.slice.call(document.querySelectorAll('#lucro-presets .btn-chip'));

  function maxMaterials() {
    return state && state.excalibur && state.tipoItem === 'arma' ? 6 : 4;
  }

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
    input.addEventListener('input', sync);
    wrap.appendChild(btn);
    sync();
    return sync;
  }

  function buildMaterialCombo(idx, mat, multInput, tierSelect) {
    var wrap = document.createElement('div');
    wrap.className = 'mat-combo';

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'mat-search';
    input.autocomplete = 'off';
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-autocomplete', 'list');
    input.placeholder = 'Buscar material (ex: coral, metal, prata)';
    input.value = mat.name || '';
    input.setAttribute('aria-label', 'Material ' + (idx + 1));

    var dropdown = document.createElement('div');
    dropdown.className = 'mat-dropdown';
    dropdown.setAttribute('role', 'listbox');
    dropdown.hidden = true;

    var activeIndex = -1;
    var currentMatches = [];

    function closeDropdown() {
      dropdown.hidden = true;
      dropdown.innerHTML = '';
      input.setAttribute('aria-expanded', 'false');
      activeIndex = -1;
      currentMatches = [];
    }

    function pick(m) {
      state.materials[idx].materialId = m.id;
      state.materials[idx].name = m.nome;
      state.materials[idx].mult = m.mult;
      state.materials[idx].tier = m.tier;
      input.value = m.nome;
      syncClear();
      var rowEl = input.closest('.material-row');
      if (rowEl) rowEl.dataset.tier = m.tier;
      if (m.tier === 'S' && window.Forja) window.Forja.sparksAt(input, 'purple');
      else if (m.tier === 'A' && window.Forja) window.Forja.sparksAt(input);
      multInput.value = m.mult;
      tierSelect.value = m.tier;
      multInput.disabled = true;
      tierSelect.disabled = true;
      multInput.title = tierSelect.title = 'Definido pelo material — apague o nome para digitar um material personalizado';
      saveState();
      closeDropdown();
      if (m.forcaPesado && state.peso !== 'pesado') setPeso('pesado');
      else update();
    }

    function highlight(newIndex) {
      var opts = dropdown.querySelectorAll('.mat-option');
      if (!opts.length) return;
      if (activeIndex >= 0 && opts[activeIndex]) opts[activeIndex].classList.remove('active');
      activeIndex = Math.max(0, Math.min(newIndex, opts.length - 1));
      opts[activeIndex].classList.add('active');
      opts[activeIndex].scrollIntoView({ block: 'nearest' });
    }

    function openDropdown(query) {
      var matches = searchMaterials(query);
      currentMatches = matches;
      activeIndex = -1;
      dropdown.innerHTML = '';

      if (!query) { closeDropdown(); return; }

      if (!matches.length) {
        var empty = document.createElement('div');
        empty.className = 'mat-option-empty';
        empty.textContent = 'Nenhum material encontrado — será salvo como nome personalizado.';
        dropdown.appendChild(empty);
      } else {
        var lastGroup = null;
        matches.forEach(function (m) {
          var groupKey = m.categoria + ' — Tier ' + m.tier;
          if (groupKey !== lastGroup) {
            var head = document.createElement('div');
            head.className = 'mat-group-label';
            head.dataset.tier = m.tier;
            head.textContent = groupKey;
            dropdown.appendChild(head);
            lastGroup = groupKey;
          }
          var opt = document.createElement('div');
          opt.className = 'mat-option';
          opt.setAttribute('role', 'option');
          var nameSpan = document.createElement('span');
          nameSpan.className = 'mo-name';
          nameSpan.textContent = m.nome;
          var multSpan = document.createElement('span');
          multSpan.className = 'mo-mult';
          var modTxt = m.mod && m.mod !== '+0' && m.mod !== '0' ? ' · ' + m.mod : '';
          multSpan.textContent = '×' + m.mult + modTxt;
          opt.appendChild(nameSpan);
          opt.appendChild(multSpan);
          opt.addEventListener('mousedown', function (e) {
            e.preventDefault();
            pick(m);
          });
          dropdown.appendChild(opt);
        });
      }
      dropdown.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }

    input.addEventListener('input', function () {
      state.materials[idx].materialId = '';
      state.materials[idx].name = input.value;
      multInput.disabled = false;
      tierSelect.disabled = false;
      multInput.title = tierSelect.title = '';
      saveState();
      openDropdown(input.value);
      update();
    });

    input.addEventListener('focus', function () {
      if (input.value) openDropdown(input.value);
    });

    input.addEventListener('blur', function () {
      setTimeout(closeDropdown, 120);
    });

    input.addEventListener('keydown', function (e) {
      if (dropdown.hidden) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlight(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlight(activeIndex - 1);
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && currentMatches[activeIndex]) {
          e.preventDefault();
          pick(currentMatches[activeIndex]);
        } else if (currentMatches.length === 1) {
          e.preventDefault();
          pick(currentMatches[0]);
        }
      } else if (e.key === 'Escape') {
        closeDropdown();
        input.blur();
      }
    });

    wrap.appendChild(input);
    var syncClear = attachComboClear(wrap, input);
    wrap.appendChild(dropdown);
    return wrap;
  }

  var newRowIndex = -1;
  function renderMaterials() {
    rowsWrap.innerHTML = '';
    state.materials.forEach(function (mat, idx) {
      var row = document.createElement('div');
      row.className = 'material-row' + (idx === newRowIndex ? ' is-new' : '');
      if (mat.tier) row.dataset.tier = mat.tier;

      var topLine = document.createElement('div');
      topLine.className = 'mat-row-top';

      var multInput = document.createElement('input');
      multInput.type = 'number';
      multInput.min = '0';
      multInput.step = '0.1';
      multInput.placeholder = '×PDE';
      multInput.value = mat.mult === '' || mat.mult == null ? '' : mat.mult;
      multInput.setAttribute('aria-label', 'Multiplicador do material ' + (idx + 1));
      multInput.addEventListener('input', function () {
        state.materials[idx].mult = multInput.value;
        saveState();
        update();
      });

      var tierSelect = document.createElement('select');
      tierSelect.className = 'tier-select';
      tierSelect.setAttribute('aria-label', 'Tier do material ' + (idx + 1));
      ['', 'D', 'C', 'B', 'A', 'S'].forEach(function (t) {
        var opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t || '—';
        tierSelect.appendChild(opt);
      });
      tierSelect.value = mat.tier || '';
      multInput.disabled = !!mat.materialId;
      tierSelect.disabled = !!mat.materialId;
      var lockedTitle = 'Definido pelo material — apague o nome para digitar um material personalizado';
      multInput.title = mat.materialId ? lockedTitle : '';
      tierSelect.title = mat.materialId ? lockedTitle : '';
      tierSelect.addEventListener('change', function () {
        state.materials[idx].tier = tierSelect.value;
        if (tierSelect.value) row.dataset.tier = tierSelect.value; else delete row.dataset.tier;
        saveState();
        update();
      });

      var combo = buildMaterialCombo(idx, mat, multInput, tierSelect);

      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'btn-remove';
      removeBtn.innerHTML = ICON_X;
      removeBtn.setAttribute('aria-label', 'Remover material ' + (idx + 1));
      removeBtn.disabled = state.materials.length <= 1;
      removeBtn.addEventListener('click', function () {
        if (row.classList.contains('is-leaving')) return;
        function doRemove() {
          state.materials.splice(idx, 1);
          newRowIndex = -1;
          saveState();
          renderMaterials();
          update();
        }
        if (reduceMotion) { doRemove(); return; }
        row.classList.add('is-leaving');
        setTimeout(doRemove, 145);
      });

      topLine.appendChild(combo);
      topLine.appendChild(tierSelect);
      topLine.appendChild(multInput);
      topLine.appendChild(removeBtn);
      row.appendChild(topLine);
      rowsWrap.appendChild(row);
    });

    var maxMat = maxMaterials();
    addBtn.disabled = state.materials.length >= maxMat;
    capNote.textContent = 'Máximo de ' + maxMat + ' materiais' + (maxMat === 6 ? ' (Excalibur)' : '') + ' — além disso, não altera o custo.';
    capNote.hidden = state.materials.length < maxMat;
  }

  function modsSum() {
    return (state.mods || []).reduce(function (s, i) { return s + (MODS_DB[i] ? MODS_DB[i][1] : 0); }, 0);
  }

  // Valor-base efetivo: PDE + modificações (p. 163)
  function baseValue() {
    var pdeItem = num(state.pde, 0);
    var mods = modsSum();
    if (state.modExistente) return { valor: Math.max(0, mods), nota: 'só as modificações (item já existe)' };
    var v = pdeItem + mods;
    if (pdeItem > 0) v = Math.max(1, v);
    return { valor: v, nota: mods ? 'PDE ' + fmt(pdeItem) + ' + modificações ' + fmt(mods) : '' };
  }

  function calculate() {
    var base = baseValue();
    var pde = base.valor;
    var sumMat = state.materials.reduce(function (s, m) { return s + num(m.mult, 0); }, 0);
    if (state.melhorDosMelhores) sumMat *= 2;
    var desconto = state.artesao ? ARTESAO_DESCONTO : 0;
    var divisor = FORJADOR_DIVISOR;
    var lucro = num(state.lucro, 0);
    var discFactor = 1 - (desconto / 100);
    var duplo = !!state.artesao && state.artesaoModo !== 'simples';
    var possuidos = !!state.materiaisPossuidos;
    var conserto = state.modo === 'conserto';

    var cheioPadrao = pde * sumMat;
    var usaFracaoFixa = state.tipoItem === 'armadura' && !!state.fracaoFixa;

    var cheio, pdeDesc, matDesc, subtotal, proprio;
    if (usaFracaoFixa) {
      cheio = pde * (1 - ARMADURA_FRACAO) + pde * ARMADURA_FRACAO * sumMat;
      pdeDesc = null;
      matDesc = null;
      subtotal = cheio * discFactor * (duplo ? discFactor : 1);
      proprio = possuidos ? 0 : subtotal / divisor;
    } else {
      cheio = cheioPadrao;
      pdeDesc = pde * discFactor;
      matDesc = duplo ? sumMat * discFactor : sumMat;
      subtotal = pdeDesc * matDesc;
      proprio = possuidos ? 0 : subtotal / divisor;
    }

    // Mod de munição soma por unidade, fora do multiplicador do material
    var proprioItem = proprio;
    var modMun = null;
    var mm = state.tipoItem === 'municao' ? MUNICAO_MODS[state.municaoMod] : null;
    if (mm && !conserto) {
      var qtdMun = Math.max(1, Math.floor(num(state.municaoModQtd, 5)));
      var cheioMod = mm[1] * Math.ceil(qtdMun / mm[2]);
      var pagoMod = possuidos ? 0 : cheioMod * discFactor / divisor;
      modMun = { nome: mm[0], custo: mm[1], por: mm[2], qtd: qtdMun, cheio: cheioMod, pago: pagoMod, existente: !!state.municaoModExistente };
      proprio = modMun.existente ? pagoMod : proprio + pagoMod;
    }

    var temMaterialVivo = (state.materials || []).some(function (row) {
      var m = row.materialId ? materialById(row.materialId) : null;
      return !!(m && m.materialVivo);
    });
    var consertoVivo = conserto && temMaterialVivo;
    var consertoCheio = consertoVivo ? 0 : cheio / 2;
    var lucroValor = 0;
    var final = proprio;
    if (conserto) {
      final = consertoVivo ? 0 : proprio / 2;
    } else if (state.modo === 'vendido') {
      lucroValor = proprio * (lucro / 100);
      final = proprio + lucroValor;
    }

    return {
      pde: pde, sumMat: sumMat, desconto: desconto, divisor: divisor, lucro: lucro,
      pdeDesc: pdeDesc, matDesc: matDesc, subtotal: subtotal, proprio: proprio,
      cheio: cheio, cheioPadrao: cheioPadrao, usaFracaoFixa: usaFracaoFixa,
      lucroValor: lucroValor, final: final, possuidos: possuidos, baseNota: base.nota,
      duplo: duplo, modMun: modMun, proprioItem: proprioItem, conserto: conserto,
      consertoCheio: consertoCheio, consertoVivo: consertoVivo
    };
  }

  function bRow(label, value, isFinal) {
    var row = document.createElement('div');
    row.className = 'b-row' + (isFinal ? ' b-final' : '');
    var l = document.createElement('span');
    l.className = 'b-label';
    l.textContent = label;
    var v = document.createElement('span');
    v.className = 'b-value';
    v.textContent = value;
    row.appendChild(l);
    row.appendChild(v);
    return row;
  }

  function cRow(name, formula, value, delta, highlight, refLabel) {
    var row = document.createElement('div');
    row.className = 'compare-row' + (highlight ? ' c-highlight' : '');

    var label = document.createElement('div');
    label.className = 'c-label';
    var nameEl = document.createElement('span');
    nameEl.className = 'c-name';
    nameEl.textContent = name;
    var formulaEl = document.createElement('span');
    formulaEl.className = 'c-formula';
    formulaEl.textContent = formula;
    label.appendChild(nameEl);
    label.appendChild(formulaEl);

    var right = document.createElement('div');
    right.className = 'c-right';
    var valueEl = document.createElement('span');
    valueEl.className = 'c-value';
    valueEl.textContent = fmtMoeda(value);
    right.appendChild(valueEl);
    if (delta) {
      var deltaEl = document.createElement('span');
      deltaEl.className = 'c-delta';
      deltaEl.textContent = delta + ' vs. ' + (refLabel || 'ferreiro comum');
      right.appendChild(deltaEl);
    }

    var bar = document.createElement('div');
    bar.className = 'c-bar';
    bar.setAttribute('aria-hidden', 'true');
    bar.appendChild(document.createElement('span'));
    row.dataset.value = value;

    row.appendChild(label);
    row.appendChild(right);
    row.appendChild(bar);
    return row;
  }

  // Barras do comparativo: proporcionais ao maior valor da lista
  function scaleCompareBars() {
    var rows = compareRowsEl.querySelectorAll('.compare-row');
    var max = 0;
    Array.prototype.forEach.call(rows, function (r) { max = Math.max(max, parseFloat(r.dataset.value) || 0); });
    Array.prototype.forEach.call(rows, function (r) {
      var v = parseFloat(r.dataset.value) || 0;
      r.querySelector('.c-bar span').style.transform = 'scaleX(' + (max > 0 ? Math.max(0.015, v / max) : 0) + ')';
    });
  }

  function capFirst(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  }

  function clauseTargets(clause) {
    var s = clause.toLowerCase();
    var t = {};
    var hasArmasComMun = /armas?\s+com\s+(a\s+propriedade\s+)?muni[cç][aã]o/.test(s);
    var hasArmasCorpo = /armas?\s+corpo\s+a\s+corpo|armas?\s+de\s+(corte|perfura|concuss|arremesso)|arremesso/.test(s);
    var hasArmasDist = /armas?\s+[àa]\s+dist[âa]ncia|ou\s+[àa]\s+dist[âa]ncia/.test(s);
    var hasArmasMunSlash = /armas?\/muni[cç]/.test(s);
    var hasArmasGen = /\barmas?\b/.test(s) && !hasArmasComMun && !hasArmasCorpo && !hasArmasDist && !hasArmasMunSlash;
    var hasMunicao = hasArmasMunSlash || /(?:^|[\s,/(])muni[cç][oõ]es\b|disparos\s+de\s+muni[cç][aã]o|\bmuni[cç][aã]o\s+(com|gera|quebra)/.test(s);
    var hasArmadura = /\barmaduras?\b/.test(s);
    var hasEscudo = /\bescudos?\b/.test(s);
    var hasFoco = /\bfocos?\b|\bcanalizadores?\b/.test(s);

    if (hasArmasCorpo || hasArmasMunSlash || hasArmasGen) t.melee = true;
    if (hasArmasComMun || hasArmasDist || hasArmasMunSlash || hasArmasGen) t.ranged = true;
    if (hasMunicao) t.municao = true;
    if (hasArmadura) t.armadura = true;
    if (hasEscudo) t.escudo = true;
    if (hasFoco) t.foco = true;
    return t;
  }

  function matchesItemCtx(targets, itemCtx) {
    var keys = Object.keys(targets);
    if (!keys.length || !itemCtx || itemCtx === 'all') return true;
    if (itemCtx === 'arma_all') return !!(targets.melee || targets.ranged);
    if (itemCtx === 'armadura_escudo') return !!(targets.armadura || targets.escudo);
    return !!targets[itemCtx];
  }

  function cleanClauseForCtx(txt, itemCtx) {
    if (!txt || !itemCtx || itemCtx === 'all') return txt;
    var s = txt;
    if (itemCtx === 'municao') {
      s = s
        .replace(/armas\s+corpo\s+a\s+corpo,\s*de\s+arremesso\s+ou\s+(?:à\s+distância|muni[cç][oõ]es)/gi, 'munições')
        .replace(/armas\s+de\s+(?:corte\/perfura[cç][aã]o|concuss[aã]o)\s+e\s+muni[cç][oõ]es/gi, 'munições')
        .replace(/armas\s+corpo\s+a\s+corpo\s+e\s+muni[cç][oõ]es/gi, 'munições')
        .replace(/armas,\s*escudos\s+e\s+muni[cç][oõ]es/gi, 'munições')
        .replace(/armas\s+e\s+muni[cç][oõ]es/gi, 'munições')
        .replace(/armas\/muni[cç][oõ]es/gi, 'munições')
        .replace(/muni[cç][oõ]es\s+e\s+armas\s+de\s+arremesso/gi, 'munições')
        .replace(/\b(em\s+)armas\s+corpo\s+a\s+corpo,\s*de\s+arremesso\s+ou\s+muni[cç][oõ]es/gi, '$1munições')
        .replace(/\barmas\s+corpo\s+a\s+corpo\s+ou\s+muni[cç][oõ]es/gi, 'munições')
        .replace(/\s*\(exceto\s+muni[cç][oõ]es\)/gi, '');
    } else {
      // Na Forja não há munição: remove referências a munições das frases de armas/escudos
      s = s
        .replace(/armas\/muni[cç][oõ]es/gi, 'armas')
        .replace(/armas\s+de\s+corte\/perfura[cç][aã]o\s+e\s+muni[cç][oõ]es/gi, 'armas de corte/perfuração')
        .replace(/armas\s+corpo\s+a\s+corpo,\s*de\s+arremesso\s+ou\s+muni[cç][oõ]es/gi, 'armas corpo a corpo ou de arremesso')
        .replace(/armas\s+corpo\s+a\s+corpo\s+e\s+muni[cç][oõ]es/gi, 'armas corpo a corpo')
        .replace(/armas\s+e\s+muni[cç][oõ]es/gi, 'armas')
        .replace(/armas,\s*escudos\s+e\s+muni[cç][oõ]es/gi, itemCtx === 'escudo' ? 'escudos' : 'armas')
        .replace(/muni[cç][oõ]es\s+e\s+armas\s+de\s+arremesso/gi, 'armas de arremesso')
        .replace(/,\s*de\s+arremesso\s+ou\s+muni[cç][oõ]es/gi, ' ou de arremesso')
        .replace(/\s*\(armas\/muni[cç][oõ]es\)/gi, ' (armas)')
        .replace(/\s*\(sempre\s+ativa\s+em\s+cr[ií]ticos\s+de\s+arma\s+ou\s+disparos\s+de\s+muni[cç][aã]o\)/gi, ' (sempre ativa em críticos de arma)');
      if (itemCtx === 'armadura') {
        s = s
          .replace(/armaduras\s+m[ée]dias\/pesadas\s+e\s+escudos/gi, 'armaduras médias/pesadas')
          .replace(/armaduras\/escudos/gi, 'armaduras')
          .replace(/armaduras\s+e\s+escudos/gi, 'armaduras')
          .replace(/armadura\s+ou\s+escudo/gi, 'armadura');
      } else if (itemCtx === 'escudo') {
        s = s
          .replace(/armaduras\s+m[ée]dias\/pesadas\s+e\s+escudos/gi, 'escudos')
          .replace(/armaduras\/escudos/gi, 'escudos')
          .replace(/armaduras\s+e\s+escudos/gi, 'escudos')
          .replace(/armadura\s+ou\s+escudo/gi, 'escudo');
      }
    }
    return capFirst(s.trim());
  }

  function filterMaterialClauses(text, itemCtx) {
    if (!text) return [];
    var sharedPrefix = '';
    var body = text;
    var m = text.match(/^(Ao sofrer ou canalizar[^:]+:|Material vivo(?:\s+[^:]+)?\:)\s*(.+)$/i);
    if (m && m[2].indexOf(';') !== -1) {
      sharedPrefix = m[1];
      body = m[2];
    }
    var parts = body.split(';').map(function (p) { return p.replace(/^[,;\s]+|[,;\s]+$/g, ''); }).filter(Boolean);
    var out = [];
    if (sharedPrefix && /^Material vivo/i.test(sharedPrefix)) {
      out.push(sharedPrefix.replace(/:$/, '') + '.');
      sharedPrefix = '';
    }
    parts.forEach(function (p) {
      var targets = clauseTargets(p);
      if (matchesItemCtx(targets, itemCtx)) {
        var cleaned = cleanClauseForCtx(p, itemCtx);
        var txt = sharedPrefix ? (sharedPrefix + ' ' + cleaned.charAt(0).toLowerCase() + cleaned.slice(1)) : cleaned;
        out.push(/[.!?]$/.test(txt) ? txt : txt + '.');
      }
    });
    return out;
  }

  function currentForjaCtx() {
    if (state.equipNome) {
      var eq = null;
      EQUIP_DB.forEach(function (x) { if (x.nome === state.equipNome) eq = x; });
      if (eq) {
        if (eq.grupo === 'Escudos') return 'escudo';
        if (eq.grupo === 'Focos de Conjuração') return 'foco';
        if (eq.tipo === 'armadura') return 'armadura';
        if (RANGED_AMMO_SET[eq.nome]) return 'ranged';
        return 'melee';
      }
    }
    if (state.tipoItem === 'armadura') return 'armadura_escudo';
    return 'arma_all';
  }

  var lastVantKey = '';
  function renderVantagens() {
    vantagensRowsEl.innerHTML = '';
    var known = state.materials
      .map(function (m) { return m.materialId ? materialById(m.materialId) : null; })
      .filter(Boolean);

    if (!known.length) {
      lastVantKey = '';
      var empty = document.createElement('p');
      empty.className = 'v-empty';
      empty.textContent = 'Selecione materiais da lista (em vez de "Personalizado") para ver as vantagens e desvantagens de cada um.';
      vantagensRowsEl.appendChild(empty);
      return;
    }

    var itemCtx = currentForjaCtx();
    var vantKey = known.map(function (m) { return m.id; }).join(',') + '|' + state.mostrarDureza + '|' + itemCtx;
    var animateIn = lastVantKey !== '' && vantKey !== lastVantKey;
    lastVantKey = vantKey;

    known.forEach(function (m) {
      var item = document.createElement('div');
      item.className = 'v-item' + (animateIn ? ' is-entering' : '');

      var head = document.createElement('div');
      head.className = 'v-head';
      var name = document.createElement('span');
      name.className = 'v-name';
      name.textContent = m.nome;
      var tag = document.createElement('span');
      tag.className = 'v-tag';
      var badge = document.createElement('span');
      badge.className = 'tier-badge';
      badge.dataset.tier = m.tier;
      badge.textContent = 'Tier ' + m.tier;
      var meta = document.createElement('span');
      meta.textContent = m.categoria + ' · ×' + m.mult +
        (state.mostrarDureza ? ' · ' + m.dureza : '') + ' · ' + m.mod;
      tag.appendChild(badge);
      tag.appendChild(meta);
      head.appendChild(name);
      head.appendChild(tag);
      item.appendChild(head);

      var pros = filterMaterialClauses(m.vantagens, itemCtx);
      if (pros.length) {
        pros.forEach(function (txt) {
          var pro = document.createElement('div');
          pro.className = 'v-row v-pro';
          pro.innerHTML = '<span class="v-icon">' + ICON_PLUS + '</span><span class="v-text"></span>';
          pro.querySelector('.v-text').textContent = txt;
          item.appendChild(pro);
        });
      } else {
        var none = document.createElement('div');
        none.className = 'v-row v-dim';
        none.innerHTML = '<span class="v-icon">' + ICON_PLUS + '</span><span class="v-text"></span>';
        none.querySelector('.v-text').textContent = 'Sem propriedade específica para este tipo de item (mantém o bônus e a dureza do material).';
        item.appendChild(none);
      }

      var cons = filterMaterialClauses(m.desvantagens, itemCtx);
      cons.forEach(function (txt) {
        var con = document.createElement('div');
        con.className = 'v-row v-con';
        con.innerHTML = '<span class="v-icon">' + ICON_MINUS + '</span><span class="v-text"></span>';
        con.querySelector('.v-text').textContent = txt;
        item.appendChild(con);
      });

      vantagensRowsEl.appendChild(item);
    });
  }

  function fmtTempo(horas, horasPorDia) {
    var dias = Math.ceil(horas / horasPorDia);
    return fmt(horas) + 'h (' + dias + (dias === 1 ? ' dia' : ' dias') + ')';
  }

  function pRow(name, sub, value, isBest) {
    var row = document.createElement('div');
    row.className = 'p-row' + (isBest ? ' p-best' : '');
    var label = document.createElement('div');
    label.className = 'p-label';
    var nameEl = document.createElement('span');
    nameEl.className = 'p-name';
    nameEl.textContent = name;
    var subEl = document.createElement('span');
    subEl.className = 'p-sub';
    subEl.textContent = sub;
    label.appendChild(nameEl);
    label.appendChild(subEl);
    var valueEl = document.createElement('span');
    valueEl.className = 'p-value';
    valueEl.textContent = value;
    row.appendChild(label);
    row.appendChild(valueEl);
    return row;
  }

  function renderProduction() {
    productionRowsEl.innerHTML = '';
    var tipo = state.tipoItem;
    var totalHoras, noteText;

    if (tipo === 'municao' && state.municaoModExistente && MUNICAO_MODS[state.municaoMod]) {
      productionNoteEl.textContent = 'Só a modificação de munições que você já tem: o Guia não define um tempo para isso (p. 160). Combine com o Mestre.';
      resultTimeEl.textContent = '—';
      resultTimeSubEl.textContent = 'sem tempo no Guia';
      lastForjadorHoras = null;
      return;
    }

    if (tipo === 'polvora') {
      totalHoras = 8;
      noteText = 'Pólvora: 8h de base, rende 1d4 unidades (p. 171).';
    } else {
      var tabela = tipo === 'municao' ? MUNICAO_HORAS : TIER_HOURS;
      var tiers = state.materials
        .map(function (m) { return m.tier; })
        .filter(function (t) { return t && tabela[t]; });

      if (!tiers.length) {
        productionNoteEl.textContent = 'Escolha um Tier para cada material (preenchido automaticamente ao selecionar da lista) para calcular o tempo de produção.';
        resultTimeEl.textContent = '—';
        resultTimeSubEl.textContent = 'escolha o tier';
        lastForjadorHoras = null;
        return;
      }

      if (state.excalibur && tipo === 'arma') {
        totalHoras = TIER_HOURS.S;
        noteText = 'Excalibur (20º nível, p. 128): forjar do zero leva o mesmo tempo de uma arma de um único material Tier S (' + totalHoras + 'h de base), mesmo combinando até 6 materiais.';
      } else {
        totalHoras = tiers.reduce(function (sum, t) { return sum + tabela[t]; }, 0);
        var tiersDesc = tiers.map(function (t) { return 'Tier ' + t + ' = ' + tabela[t] + 'h'; }).join(' + ');
        noteText = (tipo === 'municao' ? 'Munições, rendem 2d4 unidades (p. 171). ' : '') +
          'Tempo somado por material, regra de Junção de Materiais (' + tiersDesc + ' = ' + fmt(totalHoras) + 'h de base).';
      }

      if (tipo === 'arma' || tipo === 'armadura') {
        if (state.peso === 'leve') {
          totalHoras = Math.max(0, totalHoras - 8);
          noteText += ' Leve: −8h.';
        } else if (state.peso === 'pesado') {
          totalHoras += 8;
          noteText += ' Pesado: +8h.';
        }
      }
    }

    var timeFactor = 1;
    var temMaterialRaro = tipo !== 'polvora' && state.materials.some(function (m) {
      return m.tier === 'B' || m.tier === 'A' || m.tier === 'S';
    });
    var usaAuto = !!(state.criacoesAutomaticas && temMaterialRaro);
    if (usaAuto) {
      timeFactor *= 0.5;
      noteText += ' Criações Automáticas (p. 130): ÷2 com ajuda da ferramenta automatizada em material raro.';
    }
    if (state.pressa) { timeFactor *= 0.5; noteText += ' Pressa: ÷2, item sai com −1 no modificador.'; }
    if (tipo === 'municao' && MUNICAO_MODS[state.municaoMod]) noteText += ' A modificação de munição não muda o tempo (o Guia não define um tempo para ela).';
    productionNoteEl.textContent = noteText;

    var forjadorHoras = totalHoras * 2 / 3 * timeFactor;
    var forjadorAjudanteHoras = forjadorHoras / 2;
    var comumHoras = totalHoras * timeFactor;
    var comumAjudanteHoras = comumHoras / 2;

    var horasEfetivas = state.ajudante ? forjadorAjudanteHoras : forjadorHoras;
    lastForjadorHoras = horasEfetivas;
    var diasForjador = Math.ceil(horasEfetivas / FORJADOR_HORAS_DIA);
    resultTimeEl.textContent = fmt(horasEfetivas) + 'h';
    resultTimeSubEl.textContent = '· ' + diasForjador + (diasForjador === 1 ? ' dia' : ' dias') + (state.ajudante ? ' (ajudante)' : '');

    productionRowsEl.appendChild(pRow(
      'Forjador (sozinho)' + (usaAuto ? ' + Criações Automáticas' : ''),
      'Trabalhador Itinerante: 2/3 do tempo' + (usaAuto ? ' · ÷2 ferramenta automatizada' : '') + ' · ' + FORJADOR_HORAS_DIA + 'h de trabalho/dia',
      fmtTempo(forjadorHoras, FORJADOR_HORAS_DIA),
      !state.ajudante
    ));
    productionRowsEl.appendChild(pRow(
      'Forjador (com ajudante)' + (usaAuto ? ' + Criações Automáticas' : ''),
      'metade do tempo do Forjador · ' + FORJADOR_HORAS_DIA + 'h/dia',
      fmtTempo(forjadorAjudanteHoras, FORJADOR_HORAS_DIA),
      !!state.ajudante
    ));
    productionRowsEl.appendChild(pRow(
      'Outra classe, não-Forjador (sozinho)',
      'tempo padrão da tabela · ' + COMUM_HORAS_DIA + 'h de trabalho/dia',
      fmtTempo(comumHoras, COMUM_HORAS_DIA)
    ));
    productionRowsEl.appendChild(pRow(
      'Outra classe, não-Forjador (com ajudante)',
      'metade do tempo padrão · ' + COMUM_HORAS_DIA + 'h/dia',
      fmtTempo(comumAjudanteHoras, COMUM_HORAS_DIA)
    ));
  }

  function itemProps() {
    var known = state.materials
      .map(function (m) { return m.materialId ? materialById(m.materialId) : null; })
      .filter(Boolean);
    if (!known.length) return null;

    var bestDureza = known[0].dureza;
    var bestRank = DUREZA_RANK[bestDureza] || 0;
    var bestMod = parseInt(known[0].mod, 10) || 0;

    known.forEach(function (m) {
      var r = DUREZA_RANK[m.dureza] || 0;
      if (r > bestRank) { bestRank = r; bestDureza = m.dureza; }
      var modNum = parseInt(m.mod, 10) || 0;
      if (modNum > bestMod) bestMod = modNum;
    });

    var obra = state.obraPrima || state.melhorDosMelhores;
    if (obra) bestMod = Math.min(3, bestMod + 1);
    if (state.pressa) bestMod -= 1;

    return { dureza: bestDureza, mod: bestMod, obra: obra };
  }

  // Junção de Materiais (p. 171–172): classifica SS / SA e avisa o que não tem efeito
  function renderJuncao() {
    var mats = state.materials.filter(function (m) { return m.tier; });
    juncaoInfo.innerHTML = '';
    if (state.tipoItem === 'polvora') {
      juncaoInfo.hidden = false;
      juncaoInfo.textContent = 'Pólvora não usa materiais: o custo é o de 2 pólvoras.';
      return;
    }
    if (mats.length < 2) { juncaoInfo.hidden = true; return; }
    juncaoInfo.hidden = false;
    var nS = mats.filter(function (m) { return m.tier === 'S'; }).length;
    var head = document.createElement('div');
    var warn = [];
    if (state.excalibur && state.tipoItem === 'arma') {
      var nNaoS = mats.length - nS;
      head.innerHTML = '<strong>Excalibur (Artefato, 20º nível, p. 128)</strong> — até 4 materiais Tier S + 2 materiais Tier A ou mais baixo, com todos os efeitos dos 6 materiais.';
      if (nS > 4) warn.push('A Excalibur comporta no máximo 4 materiais Tier S (você selecionou ' + nS + ').');
      if (nNaoS > 2) warn.push('Além dos até 4 materiais Tier S, a Excalibur comporta no máximo 2 materiais de Tier A ou mais baixo (você selecionou ' + nNaoS + ').');
    } else if (nS >= 2) {
      head.innerHTML = '<strong>Equipamento Tier SS</strong> — dois materiais Tier S.';
      if (mats.length > 2) warn.push('Os materiais além dos dois Tier S só trazem propriedades “Geral” ou “Material Vivo”.');
      if (nS > 2) warn.push('Um terceiro Tier S não soma propriedades exclusivas.');
    } else {
      head.innerHTML = '<strong>Equipamento Tier ' + mats.map(function (m) { return m.tier; }).sort(function (a, b) {
        return TIER_ORDER.indexOf(b) - TIER_ORDER.indexOf(a);
      }).join('') + '</strong> — até 4 materiais, sem repetir Tier S. Dureza e bônus: o maior entre eles.';
    }
    juncaoInfo.appendChild(head);
    warn.forEach(function (w) {
      var d = document.createElement('div');
      d.className = 'jw';
      d.innerHTML = ICON_WARN;
      d.appendChild(document.createTextNode(w));
      juncaoInfo.appendChild(d);
    });
  }

  function propChip(label, value) {
    var chip = document.createElement('span');
    chip.className = 'prop-chip';
    var k = document.createElement('span');
    k.className = 'p-k';
    k.textContent = label;
    var v = document.createElement('span');
    v.className = 'p-v';
    v.textContent = value;
    chip.appendChild(k);
    chip.appendChild(v);
    return chip;
  }

  function fmtKg(kg) {
    if (kg == null || !isFinite(kg)) return '';
    var rounded = Math.round(kg * 100) / 100;
    return rounded.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' kg';
  }

  function calcItemWeight() {
    var e = null;
    EQUIP_DB.forEach(function (x) { if (x.nome === state.equipNome) e = x; });
    if (!e || e.pesoKg == null) return null;
    var mult = 1;
    var notas = [];
    var forcaPesado = false;
    (state.materials || []).forEach(function (row) {
      var m = row.materialId ? materialById(row.materialId) : null;
      if (!m) return;
      if (m.pesoMult && m.pesoMult !== 1) {
        mult *= m.pesoMult;
        notas.push(m.nome + (m.pesoMult === 0.5 ? ' ÷2' : ' ×2'));
      }
      if (m.forcaPesado) forcaPesado = true;
    });
    var leveMod = (state.mods || []).indexOf(1) !== -1;
    if (leveMod) {
      mult *= 0.75;
      notas.push('Estrutura Leve −25%');
    }
    return {
      baseKg: e.pesoKg,
      finalKg: e.pesoKg * mult,
      mult: mult,
      leveMod: leveMod,
      forcaPesado: forcaPesado,
      notas: notas
    };
  }

  var RANGED_AMMO_SET = {
    'Estilingue': 1, 'Funda': 1, 'Arco curto': 1, 'Besta leve': 1, 'Zarabatana': 1,
    'Besta de mão': 1, 'Besta dupla': 1, 'Besta de repetição': 1, 'Besta automática': 1,
    'Arco longo': 1, 'Arco composto': 1, 'Besta pesada': 1, 'Arco Colossal': 1, 'Besta Colossal': 1,
    'Mosquete': 1, 'Pistola': 1, 'Bacamarte': 1, 'Canhão': 1, 'Arcabuz': 1
  };
  function modAplicacao() {
    if (state.tipoItem === 'armadura') return 'CA';
    if (state.equipNome) {
      var eq = null;
      EQUIP_DB.forEach(function (x) { if (x.nome === state.equipNome) eq = x; });
      if (eq) {
        if (eq.grupo === 'Focos de Conjuração') return 'Ataque de magia';
        if (eq.grupo === 'Instrumentos e Acessórios') return 'Teste';
        if (RANGED_AMMO_SET[eq.nome]) return 'Só ataque';
      }
    }
    return 'Ataque e dano';
  }

  var lastPropKey = '';
  function renderResultProps(c) {
    var soModMun = state.tipoItem === 'municao' && state.municaoModExistente && !!MUNICAO_MODS[state.municaoMod];
    var props = state.tipoItem === 'polvora' || soModMun ? null : itemProps();
    var w = state.tipoItem === 'polvora' || soModMun ? null : calcItemWeight();
    var lucro = (state.modo === 'vendido' && c && c.lucroValor > 0) ? c.lucroValor : 0;
    resultPropsEl.innerHTML = '';
    if (!props && !w && !lucro) {
      lastPropKey = '';
      resultPropsEl.hidden = true;
      return;
    }
    var hasMithral = false;
    var hasForcaPesado = false;
    (state.materials || []).forEach(function (row) {
      var m = row.materialId ? materialById(row.materialId) : null;
      if (!m) return;
      if (m.id === 'metal_mithral') hasMithral = true;
      if (m.forcaPesado) hasForcaPesado = true;
    });
    var modTarget = modAplicacao();
    var exc = !!(state.excalibur && state.tipoItem === 'arma');
    var propKey = [
      props ? props.dureza : '',
      props ? props.mod : '',
      props ? props.obra : '',
      state.pressa,
      state.mostrarDureza,
      exc,
      w ? w.finalKg : '',
      w ? w.notas.join(',') : '',
      hasMithral,
      hasForcaPesado,
      modTarget,
      lucro
    ].join('|');
    var animateIn = lastPropKey !== '' && propKey !== lastPropKey;
    lastPropKey = propKey;

    resultPropsEl.hidden = false;
    if (props && state.mostrarDureza) {
      var durChip = propChip('Dureza', props.dureza);
      if (animateIn) durChip.classList.add('is-entering');
      resultPropsEl.appendChild(durChip);
    }
    if (props) {
      var tags = [];
      if (props.obra) tags.push('Obra-Prima');
      if (state.pressa) tags.push('Pressa');
      var modChip = propChip('Modificador · ' + modTarget + (tags.length ? ' (' + tags.join(', ') + ')' : ''), (props.mod > 0 ? '+' : '') + props.mod);
      if (props.obra) modChip.classList.add('chip-obra');
      if (animateIn) modChip.classList.add('is-entering');
      resultPropsEl.appendChild(modChip);
    }
    if (w) {
      var pesoChip = propChip('Peso' + (w.notas.length ? ' (' + w.notas.join(', ') + ')' : ''), fmtKg(w.finalKg));
      if (animateIn) pesoChip.classList.add('is-entering');
      resultPropsEl.appendChild(pesoChip);
    }
    if (hasMithral) {
      var miChip = propChip('Mithral', 'Sem req. Força / Furtividade');
      if (animateIn) miChip.classList.add('is-entering');
      resultPropsEl.appendChild(miChip);
    }
    if (hasForcaPesado) {
      var fpChip = propChip('Requisito', 'Pesado · +2 Força');
      if (animateIn) fpChip.classList.add('is-entering');
      resultPropsEl.appendChild(fpChip);
    }
    if (exc) {
      var excChip = propChip('Artefato', 'Excalibur');
      excChip.classList.add('chip-excalibur');
      if (animateIn) excChip.classList.add('is-entering');
      resultPropsEl.appendChild(excChip);
    }
    if (lucro > 0) {
      var lucChip = propChip('Lucro líquido', '+' + fmtMoeda(lucro));
      lucChip.classList.add('chip-lucro');
      if (animateIn) lucChip.classList.add('is-entering');
      resultPropsEl.appendChild(lucChip);
    }
  }

  var FIREARMS_SET = { 'Mosquete': 1, 'Pistola': 1, 'Bacamarte': 1, 'Canhão': 1, 'Arcabuz': 1 };
  var modsWarnEl = document.getElementById('mods-warn');
  function renderModsWarn() {
    if (!modsWarnEl) return;
    var avisos = [];
    var mods = state.mods || [];
    if (mods.indexOf(2) !== -1 && state.peso === 'pesado') {
      avisos.push('Estrutura Ocultável exige item sem propriedade Pesada / armadura não pesada.');
    }
    if (mods.indexOf(3) !== -1 && (state.tipoItem === 'armadura' || (state.equipNome && !FIREARMS_SET[state.equipNome]))) {
      avisos.push('Câmara Expandida se aplica apenas a armas de fogo (com Ignição).');
    }
    if (mods.indexOf(0) !== -1 && state.tipoItem === 'armadura') {
      avisos.push('Dano Extra se aplica apenas a armas corpo a corpo ou de arremesso.');
    }
    if (mods.indexOf(4) !== -1 && state.tipoItem === 'armadura') {
      avisos.push('Suporte para Baioneta se aplica apenas a armas com Munição ou focos.');
    }
    if (!avisos.length) {
      modsWarnEl.hidden = true;
      modsWarnEl.innerHTML = '';
      return;
    }
    modsWarnEl.hidden = false;
    modsWarnEl.innerHTML = '<div class="mw-head">' + ICON_WARN + '<span>Atenção à compatibilidade (você ainda pode manter se o Mestre liberar)</span></div><ul>' +
      avisos.map(function (a) { return '<li>' + a + '</li>'; }).join('') + '</ul>';
  }

  function buildSimpleCombo(placeholder, initialId, onPick, labelId) {
    var wrap = document.createElement('div');
    wrap.className = 'mat-combo';

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'mat-search';
    input.autocomplete = 'off';
    input.placeholder = placeholder;
    if (labelId) input.setAttribute('aria-labelledby', labelId);
    var initial = initialId ? materialById(initialId) : null;
    input.value = initial ? initial.nome : '';

    var dropdown = document.createElement('div');
    dropdown.className = 'mat-dropdown';
    dropdown.hidden = true;

    function close() {
      dropdown.hidden = true;
      dropdown.innerHTML = '';
    }

    function open(query) {
      var matches = searchMaterials(query);
      dropdown.innerHTML = '';
      if (!query || !matches.length) { close(); return; }
      var lastGroup = null;
      matches.forEach(function (m) {
        var groupKey = m.categoria + ' — Tier ' + m.tier;
        if (groupKey !== lastGroup) {
          var head = document.createElement('div');
          head.className = 'mat-group-label';
          head.dataset.tier = m.tier;
          head.textContent = groupKey;
          dropdown.appendChild(head);
          lastGroup = groupKey;
        }
        var opt = document.createElement('div');
        opt.className = 'mat-option';
        opt.setAttribute('role', 'option');
        var nameSpan = document.createElement('span');
        nameSpan.className = 'mo-name';
        nameSpan.textContent = m.nome;
        var multSpan = document.createElement('span');
        multSpan.className = 'mo-mult';
        multSpan.textContent = 'Tier ' + m.tier;
        opt.appendChild(nameSpan);
        opt.appendChild(multSpan);
        opt.addEventListener('mousedown', function (e) {
          e.preventDefault();
          input.value = m.nome;
          syncSimpleClear();
          close();
          onPick(m.id);
        });
        dropdown.appendChild(opt);
      });
      dropdown.hidden = false;
    }

    input.addEventListener('input', function () {
      onPick('');
      open(input.value);
    });
    input.addEventListener('focus', function () {
      input.select();
    });
    input.addEventListener('blur', function () {
      setTimeout(close, 120);
    });

    wrap.appendChild(input);
    var syncSimpleClear = attachComboClear(wrap, input, function () {
      close();
      onPick('');
    });
    wrap.appendChild(dropdown);
    return wrap;
  }

  function initTransmutCombos() {
    transmutOrigemWrap.innerHTML = '';
    transmutOrigemWrap.appendChild(buildSimpleCombo('Buscar material', state.transmutOrigemId, function (id) {
      state.transmutOrigemId = id;
      saveState();
      updateMagicos();
    }, 'origem-label'));
    transmutDestinoWrap.innerHTML = '';
    transmutDestinoWrap.appendChild(buildSimpleCombo('Buscar material', state.transmutDestinoId, function (id) {
      state.transmutDestinoId = id;
      saveState();
      updateMagicos();
    }, 'destino-label'));
  }

  function mgLine(label, value) {
    var row = document.createElement('div');
    row.className = 'mg-line';
    var l = document.createElement('span');
    l.textContent = label;
    var v = document.createElement('span');
    v.className = 'mg-v';
    v.textContent = value;
    row.appendChild(l);
    row.appendChild(v);
    return row;
  }

  function mgWarning(text) {
    var p = document.createElement('p');
    p.className = 'mg-warning';
    p.textContent = text;
    return p;
  }

  function syncMagicoRaridade() {
    var t = RARIDADE_TABELA[state.magicoRaridade];
    var personalizado = !t;
    magicoCustoInput.disabled = !personalizado;
    magicoTempoInput.disabled = !personalizado;
    if (t) {
      state.magicoCustoBase = t.custo;
      state.magicoTempoBase = t.horas;
    }
    magicoCustoInput.value = state.magicoCustoBase;
    magicoTempoInput.value = state.magicoTempoBase;
  }

  function fmtHorasDias(h) {
    return fmt(h) + 'h (' + Math.ceil(h / COMUM_HORAS_DIA) + ' dias de 8h · ' + Math.ceil(h / FORJADOR_HORAS_DIA) + ' dias de 12h)';
  }

  function updateMagicos() {
    var raridadeAtual = state.magicoRaridade;
    var t = RARIDADE_TABELA[raridadeAtual];
    var elegivelEspecialista = raridadeAtual === 'comum' || raridadeAtual === 'incomum';
    var excaliburLendario = !!(state.excalibur && state.tipoItem === 'arma' && raridadeAtual === 'lendario');

    var custoEnc = num(state.magicoCustoBase, 0);
    if (state.peritoItensMagicos) custoEnc /= 2;
    var horas = num(state.magicoTempoBase, 0);
    var notasTempo = [];
    if (excaliburLendario) {
      horas = 0;
      notasTempo.push('Excalibur: +0h para o efeito lendário (p. 128)');
    } else {
      if (state.especialistaItensMagicos && elegivelEspecialista) { horas /= 4; notasTempo.push('÷4 Especialista'); }
      if (state.criacoesAutomaticas) { horas /= 2; notasTempo.push('÷2 Criações Automáticas'); }
      if (state.versadoItensMagicos) { horas /= 2; notasTempo.push('÷2 Versado'); }
      if (state.desencantado) { horas /= 2; notasTempo.push('÷2 item desencantado'); }
    }

    magicoResultEl.innerHTML = '';
    var custoItem = state.encantarExistente ? 0 : calculate().final;
    magicoResultEl.appendChild(mgLine('Custo do encantamento', fmtMoeda(custoEnc) + (state.peritoItensMagicos ? ' (÷2 Perito)' : '')));
    magicoResultEl.appendChild(mgLine(
      state.encantarExistente ? 'Item base (já possui)' : 'Fabricação do item (resultado acima)',
      fmtMoeda(custoItem)
    ));
    magicoResultEl.appendChild(mgLine('Custo total', fmtMoeda(custoEnc + custoItem)));
    magicoResultEl.appendChild(mgLine('Tempo do encantamento', (excaliburLendario ? '0h' : fmtHorasDias(horas)) + (notasTempo.length ? ' · ' + notasTempo.join(', ') : '')));
    if (!state.encantarExistente) {
      if (lastForjadorHoras != null) {
        var totalMagHoras = lastForjadorHoras + horas;
        magicoResultEl.appendChild(mgLine('Tempo total (fabricação + encantamento)', fmt(totalMagHoras) + 'h (' + Math.ceil(totalMagHoras / FORJADOR_HORAS_DIA) + ' dias de ' + FORJADOR_HORAS_DIA + 'h do Forjador)'));
      } else {
        magicoResultEl.appendChild(mgLine('Tempo de fabricação do item', 'veja Tempo de Produção, somado ao do encantamento'));
      }
    }

    if (t && t.material && !excaliburLendario) {
      var temMaterial = state.materials.some(function (m) { return t.material.indexOf(m.materialId) !== -1; });
      if (!temMaterial) {
        magicoResultEl.appendChild(mgWarning('Raridade ' + magicoRaridadeSelect.options[magicoRaridadeSelect.selectedIndex].text +
          ' exige ' + RARIDADE_MATERIAL_NOME[raridadeAtual] + ' (ou material superior) entre os materiais do item.'));
      }
    }

    // Transmutação do Forjador Alquimista (p. 130-131)
    var nivel = parseInt(state.transmutNivel, 10) || 3;
    var origem = materialById(state.transmutOrigemId);
    var destino = materialById(state.transmutDestinoId);
    transmutResultEl.innerHTML = '';

    if (!origem || !destino) {
      transmutResultEl.appendChild(mgWarning('Escolha o material de origem e de destino.'));
      syncMagicosBadge();
      return;
    }
    var rOrigem = TIER_ORDER.indexOf(origem.tier);
    var rDestino = TIER_ORDER.indexOf(destino.tier);
    var maxTier = nivel >= 13 ? 3 : (nivel >= 7 ? 2 : 1); // índice em TIER_ORDER: C=1, B=2, A=3
    if (nivel < 7 && origem.categoria !== destino.categoria) {
      transmutResultEl.appendChild(mgWarning('No 3º nível os materiais precisam ser da mesma categoria (' + origem.categoria + ' → ' + destino.categoria + '). A Transmutação Avançada (7º) libera isso.'));
      return;
    }
    if (rOrigem > maxTier || rDestino > maxTier) {
      transmutResultEl.appendChild(mgWarning('Neste nível o limite é Tier ' + TIER_ORDER[maxTier] + '.'));
      return;
    }
    if (rDestino < rOrigem) {
      transmutResultEl.appendChild(mgWarning('Só é possível manter o tier ou subir, não regredir.'));
      return;
    }

    var pde = baseValue().valor;
    var custoTransmut = 0.5 * pde * destino.mult;
    var complexa = rOrigem >= 2 || rDestino >= 2;
    var tempoTransmut = complexa ? 8 : 1 + (rDestino - rOrigem);
    var notaCusto = 'metade do valor do equipamento no material de destino';
    if (nivel >= 13 && rDestino <= 2 && rOrigem <= 2) { custoTransmut = 0; notaCusto = 'Transmutação Suprema: grátis até Tier B'; }

    transmutResultEl.appendChild(mgLine('Custo (' + notaCusto + ')', fmtMoeda(custoTransmut)));
    transmutResultEl.appendChild(mgLine('Tempo de trabalho', fmt(tempoTransmut) + 'h' + (complexa ? ' (Tier B ou A: 8h por material transformado)' : ' (Tier D/C: 1h + 1h por tier acima)')));
    syncMagicosBadge();
  }

  function syncMagicosBadge() {
    if (!magicosActiveCountEl) return;
    var partes = [];
    if (state.magicoRaridade && state.magicoRaridade !== 'comum') {
      var opt = magicoRaridadeSelect && magicoRaridadeSelect.options[magicoRaridadeSelect.selectedIndex];
      partes.push(opt ? opt.text : state.magicoRaridade);
    }
    var optsAtivas = 0;
    if (state.encantarExistente) optsAtivas++;
    if (state.desencantado) optsAtivas++;
    if (state.peritoItensMagicos) optsAtivas++;
    if (state.especialistaItensMagicos) optsAtivas++;
    if (state.versadoItensMagicos) optsAtivas++;
    if (optsAtivas) partes.push(optsAtivas === 1 ? '1 opção' : optsAtivas + ' opções');
    if (state.transmutOrigemId && state.transmutDestinoId) partes.push('Transmutação');
    magicosActiveCountEl.textContent = partes.join(' · ');
  }

  function syncHighLevelBadge() {
    if (!forjHighCountEl) return;
    var n = 0;
    if (state.melhorDosMelhores) n++;
    if (state.criacoesAutomaticas) n++;
    if (state.excalibur && state.tipoItem === 'arma') n++;
    forjHighCountEl.textContent = n ? (n === 1 ? '1 ativo' : n + ' ativos') : '';
  }

  function deltaPct(value, cheio) {
    if (!cheio) return '';
    var pct = (1 - value / cheio) * 100;
    if (pct <= 0.05) return '';
    return '−' + fmt(pct) + '%';
  }

  var shownValue = null, animId = 0;
  var resultCard = document.getElementById('result-card');
  var cbValue = document.getElementById('cb-value');
  var cbLabel = document.getElementById('cb-label');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Enquanto digita, atualiza direto sem animar o número
  var lastTypedAt = 0;
  document.addEventListener('input', function (e) {
    if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) lastTypedAt = performance.now();
  }, true);
  function modeLabel() {
    if (state.modo === 'vendido') return 'Preço de venda';
    if (state.modo === 'conserto') return 'Custo para consertar';
    return 'Custo para forjar';
  }
  function animateResult(target) {
    cbLabel.textContent = modeLabel();
    if (shownValue === null || reduceMotion || !isFinite(target) || performance.now() - lastTypedAt < 400) {
      shownValue = target;
      resultEl.innerHTML = htmlMoeda(target);
      cbValue.textContent = fmtMoeda(target);
      return;
    }
    if (Math.abs(target - shownValue) < 0.005) return;
    var from = shownValue, t0 = performance.now(), dur = 280, id = ++animId;
    shownValue = target;
    (function tick(now) {
      if (id !== animId) return;
      var k = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      var v = from + (target - from) * e;
      resultEl.innerHTML = htmlMoeda(v);
      cbValue.textContent = fmtMoeda(v);
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  // Mostra o que falta preencher em vez de zeros
  function emptyReason(c) {
    if (c.modMun && c.modMun.existente) return '';
    if (state.tipoItem === 'municao' && state.municaoModExistente) return 'Escolha uma modificação de munição para calcular o custo.';
    if (!(c.pde > 0)) {
      if (state.modExistente) return 'Marque pelo menos uma modificação para calcular o custo.';
      return 'Informe o PDE ou escolha um equipamento do Guia para calcular o custo.';
    }
    if (!(c.sumMat > 0)) return 'Escolha pelo menos um material (ou digite o multiplicador) para calcular o custo.';
    return '';
  }

  var pdeMoedaEl = document.getElementById('pde-moeda');
  var kpiTimeLabelEl = document.getElementById('kpi-time-label');
  function update() {
    if (state.oficina === 'bombas') { updateBombas(); return; }
    if (state.oficina === 'herbalismo') { updateHerbalismo(); return; }
    if (kpiTimeLabelEl) kpiTimeLabelEl.textContent = 'Tempo do Forjador';
    var c = calculate();
    // PDE fracionado sai em pp/pc
    var pdeNum = num(state.pde, 0);
    pdeMoedaEl.hidden = !(pdeNum > 0 && Math.round(pdeNum * 100) % 100 !== 0);
    pdeMoedaEl.textContent = fmt(pdeNum) + ' po = ' + fmtMoeda(pdeNum);
    var vazio = emptyReason(c);
    resultCard.classList.toggle('is-empty', !!vazio);
    resultEmptyEl.hidden = !vazio;
    resultEmptyEl.textContent = vazio;
    compareSection.hidden = !!vazio || !!(c.modMun && c.modMun.existente);
    document.getElementById('cost-bar').classList.toggle('is-empty', !!vazio);

    animateResult(c.final);
    resultLabel.textContent = modeLabel();

    breakdownEl.innerHTML = '';
    if (c.baseNota) {
      breakdownEl.appendChild(bRow('Valor-base (' + c.baseNota + ')', fmtMoeda(c.pde)));
    }
    if (state.melhorDosMelhores && state.tipoItem !== 'polvora') {
      breakdownEl.appendChild(bRow('O Melhor dos Melhores: dobro de materiais', 'Σ × 2 = ' + fmt(c.sumMat)));
    }
    if (c.usaFracaoFixa) {
      breakdownEl.appendChild(bRow(
        'Preço cheio, fração fixa (' + fmt((1 - ARMADURA_FRACAO) * 100) + '% fixo + ' + fmt(ARMADURA_FRACAO * 100) + '% × Σ materiais)',
        fmtMoeda(c.cheio)
      ));
      breakdownEl.appendChild(bRow('Preço padrão do livro, para referência (PDE × Σ materiais)', fmtMoeda(c.cheioPadrao)));
      if (c.possuidos) {
        breakdownEl.appendChild(bRow('Materiais já em posse (Trabalhador Itinerante)', 'grátis — só o tempo'));
      } else {
        breakdownEl.appendChild(bRow('Com desconto (' + fmtMoeda(c.cheio) + ' × ' + (100 - c.desconto) + '%' + (c.duplo ? ' × ' + (100 - c.desconto) + '%' : '') + ')', fmtMoeda(c.subtotal)));
        breakdownEl.appendChild(bRow('Subtotal (÷ ' + fmt(c.divisor) + ' de mão de obra)', fmtMoeda(c.proprioItem)));
      }
    } else {
      breakdownEl.appendChild(bRow('Preço cheio, sem desconto (PDE × Σ materiais)', fmtMoeda(c.cheio)));
      if (c.possuidos) {
        breakdownEl.appendChild(bRow('Materiais já em posse (Trabalhador Itinerante)', 'grátis — só o tempo'));
      } else {
        breakdownEl.appendChild(bRow('PDE com desconto (' + fmtMoeda(c.pde) + ' × ' + (100 - c.desconto) + '%)', fmtMoeda(c.pdeDesc)));
        breakdownEl.appendChild(bRow(c.duplo
          ? 'Σ materiais com desconto (' + fmt(c.sumMat) + ' × ' + (100 - c.desconto) + '%)'
          : 'Σ materiais (desconto só uma vez)', fmt(c.matDesc)));
        breakdownEl.appendChild(bRow('Subtotal (÷ ' + fmt(c.divisor) + ' de mão de obra)', fmtMoeda(c.proprioItem)));
      }
    }
    if (c.modMun) {
      if (c.modMun.existente) breakdownEl.innerHTML = '';
      var porTxt = c.modMun.por === 1 ? fmtMoeda(c.modMun.custo) + ' cada' : fmtMoeda(c.modMun.custo) + ' a cada ' + c.modMun.por;
      breakdownEl.appendChild(bRow(c.modMun.nome + ' (' + porTxt + ', ' + c.modMun.qtd + (c.modMun.qtd === 1 ? ' munição)' : ' munições)'), fmtMoeda(c.modMun.cheio)));
      breakdownEl.appendChild(bRow(c.possuidos
        ? 'Modificação com materiais em posse'
        : 'Modificação' + (c.desconto ? ' com desconto (' + (100 - c.desconto) + '%)' : '') + ' ÷ ' + fmt(c.divisor) + ' de mão de obra',
        c.possuidos ? 'grátis' : (c.modMun.existente ? '' : '+') + fmtMoeda(c.modMun.pago)));
    }
    if (c.conserto && !c.possuidos) {
      breakdownEl.appendChild(bRow('Conserto de item quebrado (metade do valor do item, p. 173)', '÷ 2'));
    }
    if (state.modo === 'vendido') {
      breakdownEl.appendChild(bRow('+ margem de lucro (' + fmt(c.lucro) + '%)', '+' + fmtMoeda(c.lucroValor)));
    }
    breakdownEl.appendChild(bRow(c.conserto ? 'Custo do conserto' : state.modo === 'vendido' ? 'Preço de venda' : 'Custo final', fmtMoeda(c.final), true));

    if (consertoNoteEl && c.conserto) {
      consertoNoteEl.textContent = c.consertoVivo
        ? 'Material vivo quebrado não se conserta com po: exige magia de ressurreição, sem gasto em ouro (p. 173).'
        : 'Um item quebrado (penalidade −5) custa metade do valor do item novo para consertar (p. 173). Reparar +1 de durabilidade antes de quebrar é grátis em um Descanso Curto com ferramentas.';
    }

    var formulaStr = c.consertoVivo
      ? 'material vivo quebrado — magia de ressurreição (0 po, p. 173)'
      : c.possuidos
      ? 'materiais em posse — grátis (Trabalhador Itinerante)' + (state.modo === 'vendido' ? ' + lucro' : '')
      : c.conserto
        ? (c.usaFracaoFixa
          ? '((PDE × ' + fmt((1 - ARMADURA_FRACAO) * 100) + '% + PDE × ' + fmt(ARMADURA_FRACAO * 100) + '% × Σ multiplicadores) × desconto ÷ 2 conserto) ÷ divisor'
          : ((c.duplo ? '(PDE × desconto) × (Σ multiplicadores × desconto)' : '(PDE × desconto) × Σ multiplicadores') + ' ÷ 2 conserto ÷ divisor'))
        : c.modMun && c.modMun.existente
          ? 'modificação × desconto ÷ divisor' + (state.modo === 'vendido' ? ' + lucro' : '')
          : c.usaFracaoFixa
            ? '(PDE × ' + fmt((1 - ARMADURA_FRACAO) * 100) + '% + PDE × ' + fmt(ARMADURA_FRACAO * 100) + '% × Σ multiplicadores) × desconto ÷ divisor' + (state.modo === 'vendido' ? ' + lucro' : '')
            : (c.duplo ? '(PDE × desconto) × (Σ multiplicadores × desconto) ÷ divisor' : '(PDE × desconto) × Σ multiplicadores ÷ divisor') + (c.modMun ? ' + modificação' : '') + (state.modo === 'vendido' ? ' + lucro' : '');
    formulaNote.textContent = formulaStr;

    var baseRef = c.conserto ? c.consertoCheio : c.cheio;
    var comMaterial = baseRef / 2;
    compareRowsEl.innerHTML = '';
    if (c.conserto) {
      compareRowsEl.appendChild(cRow('Valor cheio do item novo', 'PDE × Σ materiais', c.cheio, ''));
      compareRowsEl.appendChild(cRow('Ferreiro comum (conserto de item quebrado, p. 173)', '(PDE × Σ materiais) ÷ 2', c.consertoCheio, ''));
    } else if (c.usaFracaoFixa) {
      compareRowsEl.appendChild(cRow('Preço padrão do livro (sem fração fixa)', 'PDE × Σ materiais', c.cheioPadrao, ''));
      compareRowsEl.appendChild(cRow('Ferreiro comum (com fração fixa)', fmt((1 - ARMADURA_FRACAO) * 100) + '% fixo + ' + fmt(ARMADURA_FRACAO * 100) + '% × material', c.cheio, deltaPct(c.cheio, c.cheioPadrao)));
    } else {
      compareRowsEl.appendChild(cRow('Ferreiro comum', 'PDE × Σ materiais', c.cheio, ''));
    }
    if (state.artesao && !c.conserto) {
      compareRowsEl.appendChild(cRow('Ferreiro, levando o material pronto', '(PDE × Σ materiais) ÷ 2', comMaterial, deltaPct(comMaterial, c.cheio)));
    }
    var seuLabel = (c.conserto ? 'Seu custo para consertar' : state.modo === 'vendido' ? 'Seu preço de venda' : 'Seu custo') +
      (c.possuidos
        ? ' (materiais em posse)'
        : ' (Forjador' + (state.artesao ? ' + Artesão' : ', sem Artesão') + ')');
    compareRowsEl.appendChild(cRow(
      seuLabel,
      formulaStr,
      c.final,
      deltaPct(c.final, baseRef),
      true
    ));
    scaleCompareBars();

    renderVantagens();
    renderProduction();
    renderResultProps(c);
    renderModsWarn();
    renderJuncao();
    renderCompMateriais();
    syncHighLevelBadge();
    updateMagicos();

    // Atualiza o tempo na barra mobile e no aviso de acessibilidade
    var temTempo = resultTimeEl.textContent !== '—';
    cbTime.textContent = temTempo ? resultTimeEl.textContent + ' ' + resultTimeSubEl.textContent : '';
    clearTimeout(liveTimer);
    liveTimer = setTimeout(function () {
      if (vazio) { liveEl.textContent = vazio; return; }
      liveEl.textContent = resultLabel.textContent + ': ' + fmtMoeda(c.final) +
        (temTempo ? '. Tempo do Forjador: ' + resultTimeEl.textContent + resultTimeSubEl.textContent.replace('·', ',') : '');
    }, 700);
  }

  // Comparador de materiais
  var compMatGridEl = document.getElementById('comp-mat-grid');
  function calcSingleMaterial(mat) {
    var base = baseValue();
    var pde = base.valor;
    var sumMat = mat.mult * (state.melhorDosMelhores ? 2 : 1);
    var disc = state.artesao ? (1 - ARTESAO_DESCONTO / 100) : 1;
    var duplo = !!state.artesao && state.artesaoModo !== 'simples';
    var usaFracao = state.tipoItem === 'armadura' && !!state.fracaoFixa;
    var cheio = usaFracao ? pde * ((1 - ARMADURA_FRACAO) + ARMADURA_FRACAO * sumMat) : pde * sumMat;
    var conserto = state.modo === 'conserto';
    var proprio = state.materiaisPossuidos
      ? 0
      : (cheio * disc * (duplo ? disc : 1)) / FORJADOR_DIVISOR;
    if (conserto && !state.materiaisPossuidos) proprio /= 2;
    var lucroPct = num(state.lucro, 0);
    var final = state.modo === 'vendido' ? proprio * (1 + lucroPct / 100) : proprio;

    var baseHoras = TIER_HOURS[mat.tier] || 24;
    var pesoEfetivo = mat.forcaPesado ? 'pesado' : state.peso;
    var adj = pesoEfetivo === 'leve' ? -8 : pesoEfetivo === 'pesado' ? 8 : 0;
    var horas = Math.max(1, baseHoras + adj) * (2 / 3);
    if (state.criacoesAutomaticas && (mat.tier === 'A' || mat.tier === 'S')) horas /= 2;
    if (state.pressa) horas /= 2;
    if (state.ajudante) horas /= 2;

    var modNum = parseInt(mat.mod, 10) || 0;
    if (state.obraPrima) modNum = Math.min(3, modNum + 1);
    if (state.melhorDosMelhores && modNum < 3) modNum += 1;
    if (state.pressa) modNum -= 1;

    var eq = null;
    EQUIP_DB.forEach(function (x) { if (x.nome === state.equipNome) eq = x; });
    var leveMod = (state.mods || []).indexOf(1) !== -1;
    var pesoKg = eq && eq.pesoKg != null ? eq.pesoKg * (mat.pesoMult || 1) * (leveMod ? 0.75 : 1) : null;

    return { mat: mat, final: final, horas: horas, modNum: modNum, dureza: mat.dureza, pesoKg: pesoKg, forcaPesado: !!mat.forcaPesado };
  }

  function renderCompMateriais() {
    if (!compMatGridEl) return;
    compMatGridEl.innerHTML = '';
    var pdeVal = baseValue().valor;
    var ids = (state.compMats || []).filter(Boolean);
    var list = ids.map(function (id) { return materialById(id); }).filter(Boolean);
    if (!(pdeVal > 0)) {
      var p0 = document.createElement('p');
      p0.className = 'cm-empty';
      p0.textContent = 'Informe o PDE ou escolha um equipamento acima para comparar materiais.';
      compMatGridEl.appendChild(p0);
      return;
    }
    if (!list.length) {
      var p1 = document.createElement('p');
      p1.className = 'cm-empty';
      p1.textContent = 'Escolha 2 ou 3 materiais nos campos acima para ver custo, tempo, dureza e modificador lado a lado.';
      compMatGridEl.appendChild(p1);
      return;
    }
    var rows = list.map(calcSingleMaterial);
    var minCost = Math.min.apply(null, rows.map(function (r) { return r.final; }));
    var maxMod = Math.max.apply(null, rows.map(function (r) { return r.modNum; }));

    rows.forEach(function (r) {
      var isCheapest = rows.length > 1 && r.final === minCost;
      var card = document.createElement('div');
      card.className = 'cm-card' + (isCheapest ? ' cm-best' : '');
      var head = document.createElement('div');
      head.className = 'cm-head';
      var nm = document.createElement('span');
      nm.className = 'cm-name';
      nm.textContent = r.mat.nome;
      var bd = document.createElement('span');
      bd.className = 'tier-badge';
      bd.dataset.tier = r.mat.tier;
      bd.textContent = r.mat.tier;
      head.appendChild(nm);
      head.appendChild(bd);
      card.appendChild(head);

      var pr = document.createElement('div');
      pr.className = 'cm-price';
      pr.textContent = fmtMoeda(r.final);
      card.appendChild(pr);

      if (isCheapest) {
        var tag = document.createElement('span');
        tag.className = 'cm-badge';
        tag.textContent = 'Mais econômico';
        card.appendChild(tag);
      } else if (rows.length > 1 && r.modNum === maxMod && maxMod > Math.min.apply(null, rows.map(function (x) { return x.modNum; }))) {
        var tag2 = document.createElement('span');
        tag2.className = 'cm-badge';
        tag2.textContent = 'Maior bônus';
        card.appendChild(tag2);
      }

      var stats = [
        ['Tempo (Forjador)', fmt(r.horas) + 'h'],
        ['Modificador', fmtMod(r.modNum)],
        ['Dureza', state.mostrarDureza ? r.dureza : '—'],
        ['Multiplicador', '×' + r.mat.mult]
      ];
      if (r.pesoKg != null) {
        stats.push(['Peso', fmtKg(r.pesoKg) + (r.forcaPesado ? ' · Pesado' : '')]);
      }
      stats.forEach(function (st) {
        var line = document.createElement('div');
        line.className = 'cm-stat';
        var k = document.createElement('span');
        k.textContent = st[0];
        var v = document.createElement('strong');
        v.textContent = st[1];
        line.appendChild(k);
        line.appendChild(v);
        card.appendChild(line);
      });

      var useBtn = document.createElement('button');
      useBtn.type = 'button';
      useBtn.className = 'btn-ghost cm-use-btn';
      useBtn.textContent = 'Usar este';
      useBtn.addEventListener('click', function () {
        state.materials = [{ materialId: r.mat.id, name: r.mat.nome, mult: r.mat.mult, tier: r.mat.tier }];
        if (r.mat.forcaPesado && state.peso !== 'pesado') setPeso('pesado');
        saveState();
        renderMaterials();
        update();
        updateMagicos();
        showToast('Material aplicado: ' + r.mat.nome);
        var matSec = document.getElementById('sec-mat');
        if (matSec && matSec.getBoundingClientRect().top < 0) {
          matSec.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
      });
      card.appendChild(useBtn);
      compMatGridEl.appendChild(card);
    });
  }

  // Busca de equipamento do Guia
  function searchEquip(q) {
    q = normalizeSearch(q);
    if (!q) return [];
    return EQUIP_DB.filter(function (e) {
      return (e.tipo === 'arma' || e.tipo === 'armadura') && normalizeSearch(e.nome + ' ' + e.grupo).indexOf(q) !== -1;
    });
  }

  function showEquipInfo() {
    var e = null;
    EQUIP_DB.forEach(function (x) { if (x.nome === state.equipNome) e = x; });
    if (!e) { equipInfo.hidden = true; equipInfo.innerHTML = ''; return; }
    var chips = [
      { txt: e.grupo, main: true },
      { txt: 'PDE ' + fmtMoeda(e.pde) }
    ];
    if (e.pesoKg != null) chips.push({ txt: fmtKg(e.pesoKg) });
    if (e.peso) chips.push({ txt: e.peso === 'leve' ? 'Leve (−8h)' : 'Pesado (+8h)' });
    else chips.push({ txt: 'Normal' });
    if (e.maestria) chips.push({ txt: 'Maestria: ' + e.maestria });
    equipInfo.innerHTML = '';
    chips.forEach(function (ch) {
      var s = document.createElement('span');
      s.className = 'eq-chip' + (ch.main ? ' eq-chip-main' : '');
      s.textContent = ch.txt;
      equipInfo.appendChild(s);
    });
    equipInfo.hidden = false;
  }

  function buildEquipCombo() {
    var wrap = document.createElement('div');
    wrap.className = 'mat-combo';
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'mat-search';
    input.autocomplete = 'off';
    input.placeholder = 'Buscar arma, armadura, escudo ou foco';
    input.setAttribute('aria-labelledby', 'equip-label');
    input.value = state.equipNome || '';
    var dropdown = document.createElement('div');
    dropdown.className = 'mat-dropdown';
    dropdown.hidden = true;

    function close() { dropdown.hidden = true; dropdown.innerHTML = ''; }
    function pick(e) {
      state.equipNome = e.nome;
      state.pde = e.pde;
      pdeInput.value = e.pde;
      input.value = e.nome;
      syncEquipClear();
      close();
      setTipo(e.tipo);
      setPeso(e.peso);
      showEquipInfo();
      renderMods();
      updateMagicos();
    }
    function open(q) {
      var matches = searchEquip(q).slice(0, 60);
      dropdown.innerHTML = '';
      if (!q || !matches.length) { close(); return; }
      var last = null;
      matches.forEach(function (e) {
        if (e.grupo !== last) {
          var head = document.createElement('div');
          head.className = 'mat-group-label';
          head.textContent = e.grupo;
          dropdown.appendChild(head);
          last = e.grupo;
        }
        var opt = document.createElement('div');
        opt.className = 'mat-option';
        opt.setAttribute('role', 'option');
        var n = document.createElement('span');
        n.className = 'mo-name';
        n.textContent = e.nome;
        var p = document.createElement('span');
        p.className = 'mo-mult';
        p.textContent = fmtMoeda(e.pde) + (e.pesoKg != null ? ' · ' + fmtKg(e.pesoKg) : '');
        opt.appendChild(n);
        opt.appendChild(p);
        opt.addEventListener('mousedown', function (ev) { ev.preventDefault(); pick(e); });
        dropdown.appendChild(opt);
      });
      dropdown.hidden = false;
    }
    input.addEventListener('input', function () {
      state.equipNome = '';
      equipInfo.hidden = true;
      saveState();
      open(input.value);
    });
    input.addEventListener('focus', function () { input.select(); });
    input.addEventListener('blur', function () { setTimeout(close, 120); });
    wrap.appendChild(input);
    var syncEquipClear = attachComboClear(wrap, input, function () {
      state.equipNome = '';
      equipInfo.hidden = true;
      close();
      renderMods();
      saveState();
      update();
    });
    wrap.appendChild(dropdown);
    return wrap;
  }

  // Modificações
  var showAllMods = false;
  function modIsCompatible(idx) {
    var ctx = currentForjaCtx();
    var eq = null;
    if (state.equipNome) {
      EQUIP_DB.forEach(function (x) { if (x.nome === state.equipNome) eq = x; });
    }
    var isWeapon = ctx === 'melee' || ctx === 'ranged' || ctx === 'arma_all';
    var isMelee = ctx === 'melee' || ctx === 'arma_all';
    var isRanged = ctx === 'ranged' || ctx === 'arma_all';
    var isFirearm = eq ? !!FIREARMS_SET[eq.nome] : ctx === 'arma_all';
    var isCrossbow = eq ? /besta/i.test(eq.nome) : ctx === 'arma_all';
    var hasMaestria = eq ? !!eq.maestria : (ctx !== 'foco' && ctx !== 'armadura');

    switch (idx) {
      case 1: case 5: case 6: case 9: case 11: return true;
      case 2: return state.peso !== 'pesado';
      case 0: case 13: case 19: case 23: case 24: case 25: return isMelee;
      case 8: return isMelee && (!eq || state.peso === 'leve');
      case 3: return isFirearm;
      case 4: return isRanged || ctx === 'foco';
      case 7: return isWeapon;
      case 10: return isCrossbow;
      case 12: return isFirearm || isCrossbow;
      case 14: case 15: case 17: return hasMaestria;
      case 16: return isWeapon || ctx === 'escudo' || ctx === 'armadura_escudo';
      case 18: case 21: return isRanged;
      case 20: case 22: return isWeapon;
      default: return true;
    }
  }

  function renderMods() {
    modsList.innerHTML = '';
    var hiddenCount = 0;
    MODS_DB.forEach(function (m, i) {
      var checked = state.mods.indexOf(i) !== -1;
      var compat = modIsCompatible(i);
      if (!showAllMods && !compat && !checked) {
        hiddenCount++;
        return;
      }
      var lab = document.createElement('label');
      lab.className = 'mod-item';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = checked;
      cb.addEventListener('change', function () {
        var pos = state.mods.indexOf(i);
        if (cb.checked && pos === -1) state.mods.push(i);
        if (!cb.checked && pos !== -1) state.mods.splice(pos, 1);
        saveState();
        updateModsTotal();
        update();
        updateMagicos();
      });
      var name = document.createElement('span');
      name.className = 'mod-name';
      name.textContent = m[0];
      var cost = document.createElement('span');
      cost.className = 'mod-cost';
      cost.textContent = (m[1] > 0 ? '+' : m[1] < 0 ? '−' : '') + Math.abs(m[1]) + ' po';
      var desc = document.createElement('span');
      desc.className = 'mod-desc';
      desc.textContent = m[2] + ' — ' + m[3];
      lab.appendChild(cb);
      lab.appendChild(name);
      lab.appendChild(cost);
      lab.appendChild(desc);
      modsList.appendChild(lab);
    });
    if (hiddenCount > 0 || showAllMods) {
      var toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'btn-ghost mods-toggle-all';
      toggleBtn.textContent = showAllMods
        ? 'Mostrar só compatíveis com este item'
        : 'Mostrar todas as modificações (+' + hiddenCount + ' de outros tipos)';
      toggleBtn.addEventListener('click', function () {
        showAllMods = !showAllMods;
        renderMods();
      });
      modsList.appendChild(toggleBtn);
    }
    updateModsTotal();
  }

  function updateModsTotal() {
    var n = state.mods.length;
    var s = modsSum();
    modsTotal.textContent = n
      ? n + (n === 1 ? ' escolhida · ' : ' escolhidas · ') + (s >= 0 ? '+' : '−') + Math.abs(s) + ' po no valor-base'
      : '';
  }

  function setPeso(peso) {
    state.peso = peso || '';
    pesoBtns.forEach(function (btn) {
      var active = btn.dataset.peso === state.peso;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });
    renderMods();
    saveState();
    update();
  }

  var ARTESAO_EXPLICA = {
    duplo: 'O Forjador faz duas compras de itens não-mágicos: primeiro compra a matéria-prima de um NPC (−20%) e depois paga a fabricação do item (−20% de novo). ' +
      'Descontos seguidos se multiplicam, não se somam: 0,8 × 0,8 = 0,64. Você paga 64% do preço, ou seja, 36% de desconto (e não 40%). É a leitura usada na nossa mesa.',
    simples: 'O talento Artesão dá 20% de desconto ao comprar um item não-mágico. Como o Forjador fabrica o item ele mesmo, a única compra é a da matéria-prima: ' +
      'você paga 80% do preço, 20% de desconto. É a leitura literal do talento; use esta se o seu Mestre não aceitar o desconto duas vezes.'
  };
  function setArtesaoModo(modo) {
    state.artesaoModo = modo === 'simples' ? 'simples' : 'duplo';
    artesaoModoBtns.forEach(function (btn) {
      var active = btn.dataset.artmodo === state.artesaoModo;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });
    artesaoExplica.textContent = ARTESAO_EXPLICA[state.artesaoModo];
    var bmArtExp = document.getElementById('bomba-artesao-explica');
    if (bmArtExp) bmArtExp.textContent = ARTESAO_EXPLICA[state.artesaoModo];
    artesaoModoWrap.hidden = !state.artesao;
    saveState();
    update();
  }

  function setMode(mode) {
    state.modo = mode;
    segBtns.forEach(function (btn) {
      var active = btn.dataset.mode === mode;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });
    lucroWrap.hidden = mode !== 'vendido';
    consertoNoteEl.hidden = mode !== 'conserto';
    saveState();
    update();
  }

  // Como funciona a criação de cada tipo (Guia de Xyleff Sualky, p. 124-125 e 170-172)
  var COMO_FUNCIONA = {
    arma: {
      titulo: 'Criar uma arma',
      itens: [
        'Custo: PDE × a soma dos multiplicadores dos materiais. O Forjador paga só a matéria-prima, metade do preço; se já tem os materiais, não paga nada.',
        'Modificações somam ao PDE antes de multiplicar pelo material (p. 163).',
        'Tempo por tier: C/D 24h, B 48h, A 96h, S 192h. Com mais de um material, o tempo de cada um se soma.',
        'Leve tira 8h, Pesada soma 8h. O Forjador trabalha em 2/3 do tempo e aguenta 12h por dia.',
        'Até 4 materiais: dureza e bônus ficam com o maior. Pressa corta o tempo pela metade e dá −1.',
        'Obra-Prima com 20 natural (17–20 com Prodígio): +1, até +3.',
        'Teste de dureza (opcional, p. 172–173): 4+ não sofre desgaste; 1–3 aplica −1 cumulativo (se já estiver negativo, quebra; em −5 quebra automático). Um Descanso Curto com ferramentas recupera +1.'
      ],
      fonte: 'p. 124–125, 163 e 170–173'
    },
    armadura: {
      titulo: 'Criar uma armadura ou escudo',
      itens: [
        'Mesmas regras da arma: PDE × materiais, o Forjador paga metade, e o tempo por tier se soma entre os materiais.',
        'Armadura leve tira 8h; armadura pesada soma 8h. Escudos entram aqui.',
        'O modificador do material vira bônus (ou penalidade) de CA.',
        'Teste de dureza (opcional, p. 172–173): 4+ não sofre desgaste; 1–3 aplica −1 cumulativo (quebra quando a penalidade zera a CA da armadura ou escudo). Descanso Curto com ferramentas recupera +1.',
        'Fração fixa é uma regra opcional desta calculadora, fora do Guia: só 20% do PDE é multiplicado pelo material, para suavizar armaduras caras.'
      ],
      fonte: 'p. 169–173'
    }
  };
  var tipoInfoBtn = document.getElementById('tipo-info-btn');
  var tipoInfoEl = document.getElementById('tipo-info');
  function renderTipoInfo() {
    var info = COMO_FUNCIONA[state.tipoItem] || COMO_FUNCIONA.arma;
    tipoInfoEl.innerHTML = '';
    var h = document.createElement('h3'); h.id = 'tipo-info-titulo'; h.textContent = info.titulo;
    var ul = document.createElement('ul');
    info.itens.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
    var src = document.createElement('p'); src.className = 'src'; src.textContent = 'Guia de Xyleff Sualky, ' + info.fonte + '.';
    tipoInfoEl.appendChild(h); tipoInfoEl.appendChild(ul); tipoInfoEl.appendChild(src);
  }
  tipoInfoBtn.addEventListener('click', function () {
    var abrir = tipoInfoEl.hidden;
    if (abrir) renderTipoInfo();
    tipoInfoEl.hidden = !abrir;
    tipoInfoBtn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
  });

  // Bloqueios por tipo na Forja (Arma vs Armadura)
  function applyTipoLocks(tipo) {
    var maxMat = maxMaterials();
    document.getElementById('mat-sub').textContent = 'Até ' + maxMat + ' materiais; cada um multiplica o PDE';
    excaliburSetting.hidden = tipo !== 'arma';
    if (!tipoInfoEl.hidden) renderTipoInfo();
  }

  function setTipo(tipo) {
    if (tipo !== 'arma' && tipo !== 'armadura') tipo = 'arma';
    state.tipoItem = tipo;
    if (tipo !== 'arma' && state.materials.length > 4) {
      state.materials = state.materials.slice(0, 4);
    }
    applyTipoLocks(tipo);
    renderMaterials();
    tipoBtns.forEach(function (btn) {
      var active = btn.dataset.tipo === tipo;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });
    fracaoWrap.hidden = tipo !== 'armadura';
    renderMods();
    saveState();
    update();
  }

  function setArtesao(on, silent) {
    var val = !!on;
    state.artesao = val;
    state.bombaArtesao = val;
    state.herbalArtesao = val;
    var str = val ? 'true' : 'false';
    artesaoSwitch.setAttribute('aria-checked', str);
    artesaoModoWrap.hidden = !val;
    var bmSw = document.getElementById('bomba-artesao-switch');
    var bmWrap = document.getElementById('bomba-artesao-modo-wrap');
    var hbSw = document.getElementById('herbal-artesao-switch');
    if (bmSw) bmSw.setAttribute('aria-checked', str);
    if (bmWrap) bmWrap.hidden = !val;
    if (hbSw) hbSw.setAttribute('aria-checked', str);
    if (!silent) { saveState(); update(); }
  }

  // Eventos dos campos fixos
  pdeInput.addEventListener('input', function () {
    state.pde = pdeInput.value;
    state.equipNome = '';
    equipInfo.hidden = true;
    saveState();
    update();
    updateMagicos();
  });
  artesaoSwitch.addEventListener('click', function () {
    setArtesao(!state.artesao);
  });
  materiaisSwitch.addEventListener('click', function () {
    state.materiaisPossuidos = !state.materiaisPossuidos;
    materiaisSwitch.setAttribute('aria-checked', state.materiaisPossuidos ? 'true' : 'false');
    saveState();
    update();
  });
  durezaSwitch.addEventListener('click', function () {
    state.mostrarDureza = !state.mostrarDureza;
    durezaSwitch.setAttribute('aria-checked', state.mostrarDureza ? 'true' : 'false');
    saveState();
    update();
  });
  pressaSwitch.addEventListener('click', function () {
    state.pressa = !state.pressa;
    pressaSwitch.setAttribute('aria-checked', state.pressa ? 'true' : 'false');
    saveState();
    update();
  });
  fracaoSwitch.addEventListener('click', function () {
    state.fracaoFixa = !state.fracaoFixa;
    fracaoSwitch.setAttribute('aria-checked', state.fracaoFixa ? 'true' : 'false');
    saveState();
    update();
  });
  magicoRaridadeSelect.addEventListener('change', function () {
    state.magicoRaridade = magicoRaridadeSelect.value;
    syncMagicoRaridade();
    saveState();
    updateMagicos();
  });
  magicoCustoInput.addEventListener('input', function () {
    state.magicoCustoBase = magicoCustoInput.value;
    saveState();
    updateMagicos();
  });
  magicoTempoInput.addEventListener('input', function () {
    state.magicoTempoBase = magicoTempoInput.value;
    saveState();
    updateMagicos();
  });
  peritoSwitch.addEventListener('click', function () {
    state.peritoItensMagicos = !state.peritoItensMagicos;
    peritoSwitch.setAttribute('aria-checked', state.peritoItensMagicos ? 'true' : 'false');
    saveState();
    updateMagicos();
  });
  especialistaSwitch.addEventListener('click', function () {
    state.especialistaItensMagicos = !state.especialistaItensMagicos;
    especialistaSwitch.setAttribute('aria-checked', state.especialistaItensMagicos ? 'true' : 'false');
    saveState();
    updateMagicos();
  });
  function syncLucroPresets() {
    var cur = String(state.lucro == null ? '' : state.lucro).trim();
    lucroPresetBtns.forEach(function (b) {
      var on = b.dataset.lucro === cur;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  lucroInput.addEventListener('input', function () {
    state.lucro = lucroInput.value;
    syncLucroPresets();
    saveState();
    update();
  });
  lucroPresetBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      state.lucro = Number(b.dataset.lucro);
      lucroInput.value = state.lucro;
      syncLucroPresets();
      saveState();
      update();
    });
  });

  function syncAutoSwitches() {
    var val = state.criacoesAutomaticas ? 'true' : 'false';
    if (autoForjSwitch) autoForjSwitch.setAttribute('aria-checked', val);
  }
  function toggleCriacoesAutomaticas() {
    state.criacoesAutomaticas = !state.criacoesAutomaticas;
    syncAutoSwitches();
    saveState();
    update();
    updateMagicos();
  }
  if (autoForjSwitch) autoForjSwitch.addEventListener('click', toggleCriacoesAutomaticas);

  excaliburSwitch.addEventListener('click', function () {
    state.excalibur = !state.excalibur;
    excaliburSwitch.setAttribute('aria-checked', state.excalibur ? 'true' : 'false');
    if (!state.excalibur && state.materials.length > 4) {
      state.materials = state.materials.slice(0, 4);
    }
    applyTipoLocks(state.tipoItem);
    saveState();
    renderMaterials();
    update();
    updateMagicos();
  });

  SIMPLE_SWITCHES.forEach(function (sw) {
    var el = document.getElementById(sw[0]);
    el.addEventListener('click', function () {
      state[sw[1]] = !state[sw[1]];
      el.setAttribute('aria-checked', state[sw[1]] ? 'true' : 'false');
      saveState();
      if (sw[2] === 'main') update();
      updateMagicos();
    });
  });
  pesoBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { setPeso(btn.dataset.peso); updateMagicos(); });
  });
  transmutNivelSelect.addEventListener('change', function () {
    state.transmutNivel = transmutNivelSelect.value;
    saveState();
    updateMagicos();
  });

  artesaoModoBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { setArtesaoModo(btn.dataset.artmodo); });
  });

  addBtn.addEventListener('click', function () {
    if (state.materials.length >= maxMaterials()) return;
    state.materials.push({ materialId: '', name: '', mult: '', tier: '' });
    newRowIndex = state.materials.length - 1;
    saveState();
    renderMaterials();
    update();
  });

  segBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { setMode(btn.dataset.mode); });
  });
  tipoBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { setTipo(btn.dataset.tipo); });
  });

  // Toast com opção de desfazer
  var toastEl = document.getElementById('toast');
  var toastMsg = document.getElementById('toast-msg');
  var toastAction = document.getElementById('toast-undo');
  var toastFn = null, toastTimer = 0, toastEndAt = 0, toastRem = 0, toastHover = false;
  function scheduleToast(ms) {
    clearTimeout(toastTimer);
    toastRem = ms;
    toastEndAt = performance.now() + ms;
    if (!toastHover && !document.hidden) {
      toastTimer = setTimeout(hideToast, ms);
    }
  }
  function pauseToast() {
    if (toastEl.hidden || !toastEl.classList.contains('show')) return;
    clearTimeout(toastTimer);
    toastRem = Math.max(800, toastEndAt - performance.now());
  }
  function resumeToast() {
    if (toastEl.hidden || !toastEl.classList.contains('show') || toastHover || document.hidden) return;
    scheduleToast(toastRem || 2500);
  }
  toastEl.addEventListener('mouseenter', function () { toastHover = true; pauseToast(); });
  toastEl.addEventListener('mouseleave', function () { toastHover = false; resumeToast(); });
  toastEl.addEventListener('touchstart', function () { toastHover = true; pauseToast(); }, { passive: true });
  toastEl.addEventListener('touchend', function () { toastHover = false; resumeToast(); }, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pauseToast(); else resumeToast();
  });
  function hideToast() {
    clearTimeout(toastTimer);
    toastEl.classList.remove('show');
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 250);
    toastFn = null;
  }
  function showToast(msg, actionLabel, actionFn, ms) {
    clearTimeout(toastTimer);
    toastMsg.textContent = msg;
    toastFn = actionFn || null;
    toastAction.hidden = !actionFn;
    toastAction.textContent = actionLabel || '';
    toastEl.hidden = false;
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    scheduleToast(ms || (actionFn ? 8000 : 3000));
  }
  toastAction.addEventListener('click', function () {
    var fn = toastFn;
    hideToast();
    if (fn) fn();
  });

  // Restaurar padrão com "Desfazer" (mantém a oficina ativa)
  resetBtn.addEventListener('click', function () {
    var snapshot = JSON.stringify(state);
    var curOfi = state.oficina;
    state = JSON.parse(JSON.stringify(DEFAULTS));
    state.oficina = curOfi;
    saveState();
    hydrateForm();
    showToast('Valores restaurados para o padrão.', 'Desfazer', function () {
      state = JSON.parse(snapshot);
      saveState();
      hydrateForm();
    });
  });
