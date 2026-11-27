  var herbalComboWrap = document.getElementById('herbal-combo-wrap');
  var herbalEquipInfo = document.getElementById('herbal-equip-info');
  var herbalInfoBtn = document.getElementById('herbal-info-btn');
  var herbalTipoInfo = document.getElementById('herbal-tipo-info');
  var herbalQtdInput = document.getElementById('herbal-qtd');
  var herbalInfoCard = document.getElementById('herbal-info-card');
  var herbalDetalhesSection = document.getElementById('herbal-detalhes-section');
  var herbalOrigemSeg = document.getElementById('herbal-origem-seg');
  var herbalOrigemBtns = Array.prototype.slice.call(herbalOrigemSeg.querySelectorAll('.seg-btn'));
  var herbalArtesaoSwitch = document.getElementById('herbal-artesao-switch');
  var herbalArtesaoSub = document.getElementById('herbal-artesao-sub');
  var herbalAjudanteSetting = document.getElementById('herbal-ajudante-setting');
  var herbalAjudanteSwitch = document.getElementById('herbal-ajudante-switch');
  var herbalModoSeg = document.getElementById('herbal-modo-seg');
  var herbalModoBtns = Array.prototype.slice.call(herbalModoSeg.querySelectorAll('.seg-btn'));
  var herbalLucroWrap = document.getElementById('herbal-lucro-wrap');
  var herbalLucroInput = document.getElementById('herbal-lucro');
  var herbalQtdPresetBtns = Array.prototype.slice.call(document.querySelectorAll('#herbal-qtd-presets .btn-chip'));
  var herbalLucroPresetBtns = Array.prototype.slice.call(document.querySelectorAll('#herbal-lucro-presets .btn-chip'));
  var ramosGridEl = document.getElementById('ramos-grid');
  var herbalComboEl = null;

  herbalTipoInfo.innerHTML =
    '<p class="ti-head">Sistema de Herbalismo · p. 148–150</p>' +
    '<ul>' +
    '<li><strong>Preparo:</strong> criar qualquer item herbáceo exige 1 hora e um Kit de Herbalismo (ou Kit de Venenos para venenos).</li>' +
    '<li><strong>Forragear ramos:</strong> 1 hora em ambiente não-urbano + teste de Natureza ou Sobrevivência CD 14 → role 1d20 na tabela e ganhe 2 ramos.</li>' +
    '<li><strong>Receitas memorizadas (p. 148–149):</strong> sem proficiência: máx. 2 · Natureza: 2 iniciais (máx. 4) · Kit de Herbalismo: 3 iniciais (máx. 6) · Curandeiro nv. 1+: sabe todas e ensina em 1 minuto (normalmente 1h).</li>' +
    '<li><strong>Ação bônus:</strong> a regra recomenda tomar poções e aplicar venenos com ação bônus (D&amp;D 2024).</li>' +
    '</ul>';
  herbalInfoBtn.addEventListener('click', function () {
    var open = herbalTipoInfo.hidden;
    herbalTipoInfo.hidden = !open;
    herbalInfoBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  function herbalById(id) {
    if (!id) return null;
    for (var i = 0; i < HERBAL_DB.length; i++) if (HERBAL_DB[i].id === id) return HERBAL_DB[i];
    return null;
  }

  function renderRamosTable() {
    ramosGridEl.innerHTML = '';
    RAMOS_DB.forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'ramo-row';
      var top = document.createElement('div');
      top.className = 'ramo-row-top';
      var nm = document.createElement('span');
      nm.className = 'ramo-row-name';
      var dot = document.createElement('span');
      dot.className = 'ramo-dot ramo-' + r.id;
      nm.appendChild(dot);
      nm.appendChild(document.createTextNode('Ramo ' + r.nome));
      var meta = document.createElement('span');
      meta.className = 'ramo-row-meta';
      meta.textContent = 'd20: ' + (r.min === r.max ? r.min : r.min + '–' + r.max) + ' · ' + fmtMoeda(r.preco) + ' (venda ' + fmtMoeda(r.preco / 2) + ')';
      top.appendChild(nm);
      top.appendChild(meta);
      var desc = document.createElement('p');
      desc.className = 'ramo-row-desc';
      desc.textContent = r.desc;
      row.appendChild(top);
      row.appendChild(desc);
      ramosGridEl.appendChild(row);
    });
  }
  renderRamosTable();

  function calcHerbal() {
    var h = herbalById(state.herbalId);
    if (!h) return null;
    var qtd = Math.max(1, Math.floor(num(state.herbalQtd, 1)));
    var ramosUnit = h.ramos.reduce(function (s, rm) {
      var pUnit = rm.precoUnit != null ? rm.precoUnit : (RAMOS_MAP[rm.id] ? RAMOS_MAP[rm.id].preco : 5);
      return s + pUnit * rm.qtd;
    }, 0);
    var extraUnit = h.extraCusto || 0;
    var custoRamosCheio = (ramosUnit + extraUnit) * qtd;
    var precoLojaTotal = h.preco * qtd;
    var disc = state.herbalArtesao ? (1 - ARTESAO_DESCONTO / 100) : 1;

    var proprio = 0;
    if (state.herbalOrigem === 'comprar-ramos') {
      proprio = custoRamosCheio * disc;
    } else if (state.herbalOrigem === 'forragear') {
      proprio = extraUnit * qtd * disc;
    } else {
      proprio = precoLojaTotal * disc;
    }
    var lucroPct = num(state.herbalLucro, 50);
    var baseVenda = proprio > 0 ? proprio : custoRamosCheio * disc;
    var lucroValor = state.herbalModo === 'vendido' ? baseVenda * (lucroPct / 100) : 0;
    var final = state.herbalModo === 'vendido' ? baseVenda + lucroValor : proprio;
    var horas = state.herbalOrigem === 'comprar-pronto' ? 0 : qtd * (state.herbalAjudante ? 0.5 : 1);
    return {
      h: h, qtd: qtd, ramosUnit: ramosUnit, extraUnit: extraUnit,
      custoRamosCheio: custoRamosCheio, precoLojaTotal: precoLojaTotal,
      disc: disc, proprio: proprio, baseVenda: baseVenda, lucroPct: lucroPct, lucroValor: lucroValor,
      final: final, horas: horas
    };
  }

  var ICON_STAR = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9z"/></svg>';
  var lastHerbalVantKey = '';

  function syncHerbalPresets() {
    var hq = String(state.herbalQtd || 1);
    herbalQtdPresetBtns.forEach(function (b) {
      var on = b.dataset.qtd === hq;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var hl = String(state.herbalLucro == null ? 50 : state.herbalLucro).trim();
    herbalLucroPresetBtns.forEach(function (b) {
      var on = b.dataset.lucro === hl;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function renderHerbalInfo(ch) {
    herbalDetalhesSection.hidden = false;
    var kitCurto = ch.h.categoria === 'Venenos' ? 'Kit de Venenos' : 'Kit de Herbalismo';
    var hChips = [
      { txt: 'Loja ' + fmtMoeda(ch.h.preco), main: true },
      { txt: 'Rende ' + ch.h.rende },
      { txt: '1h · ' + kitCurto }
    ];
    if (state.herbalOrigem === 'comprar-ramos' && ch.custoRamosCheio > ch.precoLojaTotal) {
      hChips.push({ txt: 'Mais barato comprar pronto (' + fmtMoeda(ch.precoLojaTotal) + ')', warn: true });
    }
    renderEquipChips(herbalEquipInfo, hChips);

    var enter = ch.h.id !== lastHerbalVantKey;
    lastHerbalVantKey = ch.h.id;

    // Mostra os detalhes da receita abaixo do formulário
    herbalInfoCard.innerHTML = '';

    var item = document.createElement('div');
    item.className = 'v-item' + (enter ? ' is-entering' : '');
    var head = document.createElement('div');
    head.className = 'v-head';
    var nm = document.createElement('span');
    nm.className = 'v-name';
    nm.textContent = ch.h.nome;
    var tg = document.createElement('span');
    tg.className = 'v-tag';
    tg.textContent = 'Loja ' + fmtMoeda(ch.h.preco) + ' · Rende ' + ch.h.rende;
    head.appendChild(nm);
    head.appendChild(tg);
    item.appendChild(head);

    var ingLbl = document.createElement('p');
    ingLbl.className = 'v-pills-label';
    ingLbl.textContent = 'Ramos necessários' + (ch.qtd > 1 ? ' (' + ch.qtd + ' lotes)' : '');
    item.appendChild(ingLbl);

    var ing = document.createElement('div');
    ing.className = 'recipe-ing v-pills-row-y';
    ch.h.ramos.forEach(function (rm) {
      var lbl = rm.label ? (ch.qtd > 1 ? ch.qtd + '× (' + rm.label + ')' : rm.label) : '';
      ing.appendChild(makeRamoPill(rm.id, rm.qtd * ch.qtd, lbl));
    });
    if (ch.h.extraText) {
      var ex = document.createElement('span');
      ex.className = 'ramo-pill';
      ex.textContent = (ch.qtd > 1 && ch.h.extraCusto > 0) ? (ch.qtd + '× ' + ch.h.extraText) : ch.h.extraText;
      ing.appendChild(ex);
    }
    item.appendChild(ing);

    var eff = document.createElement('div');
    eff.className = 'v-row v-pro';
    eff.innerHTML = '<span class="v-icon">' + ICON_PLUS + '</span><span class="v-text"></span>';
    eff.querySelector('.v-text').textContent = ch.h.efeito;
    item.appendChild(eff);

    if (ch.h.destaque === 'Forjador') {
      var fRow = document.createElement('div');
      fRow.className = 'v-row v-pro';
      fRow.innerHTML = '<span class="v-icon">' + ICON_STAR + '</span><span class="v-text"></span>';
      fRow.querySelector('.v-text').textContent = 'Essencial para o Forjador (p. 150): protege armas e armaduras contra ferrugem, umidade e a primeira tentativa de quebra durante 1 semana inteira.';
      item.appendChild(fRow);
    }
    herbalInfoCard.appendChild(item);
  }

  function updateHerbalismo() {
    herbalLucroWrap.hidden = state.herbalModo !== 'vendido';
    if (herbalAjudanteSetting) herbalAjudanteSetting.hidden = state.herbalOrigem === 'comprar-pronto';
    if (herbalArtesaoSub) {
      herbalArtesaoSub.textContent = state.herbalOrigem === 'forragear'
        ? 'Vale só na venda ou se a receita tiver item base extra'
        : 'Desconto na compra de ramos ou itens herbáceos não-mágicos';
    }
    syncHerbalPresets();
    var ch = calcHerbal();
    var labelTxt = state.herbalModo === 'vendido'
      ? 'Preço de venda'
      : state.herbalOrigem === 'forragear'
        ? 'Custo (ramos forrageados)'
        : state.herbalOrigem === 'comprar-pronto'
          ? 'Custo para comprar pronto'
          : 'Custo comprando os ramos';
    if (!ch) {
      herbalEquipInfo.hidden = true;
      herbalDetalhesSection.hidden = true;
      resultCard.classList.add('is-empty');
      resultEmptyEl.textContent = 'Escolha uma receita herbácea do Guia para calcular o custo.';
      resultEmptyEl.hidden = false;
      document.getElementById('cost-bar').classList.add('is-empty');
      compareSection.hidden = true;
      animateResult(0);
      resultLabel.textContent = labelTxt;
      cbLabel.textContent = labelTxt;
      if (kpiTimeLabelEl) kpiTimeLabelEl.textContent = state.herbalOrigem === 'comprar-pronto' ? 'Aquisição' : 'Tempo de preparo';
      resultTimeEl.textContent = '—';
      resultTimeSubEl.textContent = '';
      cbTime.textContent = '';
      formulaNote.textContent = 'Herbalismo (p. 148–150) · 1h por item · venda de ramos para herbolários por metade do preço';
      return;
    }
    renderHerbalInfo(ch);

    resultCard.classList.remove('is-empty');
    resultEmptyEl.hidden = true;
    document.getElementById('cost-bar').classList.remove('is-empty');
    compareSection.hidden = false;

    animateResult(ch.final);
    resultLabel.textContent = labelTxt;
    cbLabel.textContent = labelTxt;

    var kitNome = ch.h.categoria === 'Venenos' ? 'Kit de Venenos' : 'Kit de Herbalismo';
    if (kpiTimeLabelEl) kpiTimeLabelEl.textContent = state.herbalOrigem === 'comprar-pronto' ? 'Aquisição' : 'Tempo de preparo';
    resultTimeEl.textContent = state.herbalOrigem === 'comprar-pronto' ? 'Imediato' : (fmt(ch.horas) + 'h');
    resultTimeSubEl.textContent = state.herbalOrigem === 'comprar-pronto'
      ? '· compra em herbolário'
      : '· ' + kitNome + (state.herbalAjudante ? ' (ajudante)' : '');
    cbTime.textContent = resultTimeEl.textContent + ' ' + resultTimeSubEl.textContent;

    resultPropsEl.innerHTML = '';
    resultPropsEl.hidden = false;
    resultPropsEl.appendChild(propChip('Rende', ch.qtd > 1 ? ch.qtd + '× (' + ch.h.rende + ')' : ch.h.rende));
    resultPropsEl.appendChild(propChip('Valor de loja', fmtMoeda(ch.precoLojaTotal)));
    if (ch.h.destaque) {
      var dChip = propChip('Destaque', ch.h.destaque);
      dChip.classList.add('chip-obra');
      resultPropsEl.appendChild(dChip);
    }
    if (state.herbalModo === 'vendido' && ch.lucroValor > 0) {
      var hlChip = propChip('Lucro líquido', '+' + fmtMoeda(ch.lucroValor));
      hlChip.classList.add('chip-lucro');
      resultPropsEl.appendChild(hlChip);
    }

    breakdownEl.innerHTML = '';
    if (state.herbalOrigem === 'comprar-pronto') {
      breakdownEl.appendChild(bRow('Preço em loja (' + ch.qtd + '× ' + fmtMoeda(ch.h.preco) + ')', fmtMoeda(ch.precoLojaTotal)));
    } else {
      breakdownEl.appendChild(bRow(
        state.herbalOrigem === 'forragear' ? 'Ramos forrageados (1h / teste CD 14)' : 'Ramos necessários (' + ch.qtd + '× ' + fmtMoeda(ch.ramosUnit) + ')',
        state.herbalOrigem === 'forragear' ? 'grátis' : fmtMoeda(ch.ramosUnit * ch.qtd)
      ));
      if (ch.extraUnit > 0) {
        breakdownEl.appendChild(bRow('Item base adicional (' + ch.h.extraText + ')', fmtMoeda(ch.extraUnit * ch.qtd)));
      }
    }
    if (state.herbalArtesao && (ch.proprio > 0 || (state.herbalModo === 'vendido' && ch.baseVenda > 0))) {
      breakdownEl.appendChild(bRow('Talento Artesão (−20%)', '× 80%'));
    }
    if (state.herbalModo === 'vendido') {
      if (ch.proprio === 0) {
        breakdownEl.appendChild(bRow('Base de mercado dos ramos p/ venda', fmtMoeda(ch.baseVenda)));
      }
      breakdownEl.appendChild(bRow('+ margem de lucro (' + fmt(ch.lucroPct) + '%)', '+' + fmtMoeda(ch.lucroValor)));
    }
    breakdownEl.appendChild(bRow(state.herbalModo === 'vendido' ? 'Preço de venda' : 'Custo final', fmtMoeda(ch.final), true));

    formulaNote.textContent = 'Herbalismo (p. 148–150) · 1h por item · venda de ramos para herbolários por metade do preço';

    var refMax = Math.max(ch.precoLojaTotal, ch.custoRamosCheio);
    compareRowsEl.innerHTML = '';
    compareRowsEl.appendChild(cRow('Comprar pronto em loja (sem desconto)', fmtMoeda(ch.h.preco) + '/un.', ch.precoLojaTotal, ''));
    compareRowsEl.appendChild(cRow('Criar comprando ramos (sem desconto)', fmtMoeda(ch.ramosUnit + ch.extraUnit) + '/un.', ch.custoRamosCheio, deltaPct(ch.custoRamosCheio, refMax), false, 'loja'));
    compareRowsEl.appendChild(cRow(
      state.herbalModo === 'vendido' ? 'Seu preço de venda' : 'Sua escolha atual',
      state.herbalOrigem === 'forragear' ? 'forrageando ramos' : (state.herbalArtesao ? 'com Artesão (−20%)' : 'sem desconto'),
      ch.final,
      deltaPct(ch.final, refMax),
      true,
      'loja'
    ));
    scaleCompareBars();

    clearTimeout(liveTimer);
    liveTimer = setTimeout(function () {
      liveEl.textContent = labelTxt + ': ' + fmtMoeda(ch.final) + '. Tempo: ' + resultTimeEl.textContent;
    }, 600);
  }

  function resumoHerbalAtual() {
    var ch = calcHerbal();
    if (!ch) return null;
    return {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      oficina: 'herbalismo',
      nome: (ch.qtd > 1 ? ch.qtd + '× ' : '') + ch.h.nome,
      mats: [],
      mods: [],
      valor: ch.final,
      venda: state.herbalModo === 'vendido',
      horas: ch.horas,
      rende: ch.qtd > 1 ? ch.qtd + '× (' + ch.h.rende + ')' : ch.h.rende,
      detalhes: state.herbalOrigem === 'forragear' ? 'Ramos forrageados' : state.herbalOrigem === 'comprar-pronto' ? 'Comprado pronto' : 'Ramos comprados'
    };
  }

  herbalQtdInput.addEventListener('input', function () { state.herbalQtd = Math.max(1, Math.floor(num(herbalQtdInput.value, 1))); saveState(); update(); });
  herbalOrigemBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.herbalOrigem = btn.getAttribute('data-horigem');
      herbalOrigemBtns.forEach(function (x) {
        var on = x === btn;
        x.classList.toggle('active', on);
        x.setAttribute('aria-checked', on ? 'true' : 'false');
      });
      saveState();
      update();
    });
  });
  herbalArtesaoSwitch.addEventListener('click', function () {
    setArtesao(!state.artesao);
  });
  if (herbalAjudanteSwitch) {
    herbalAjudanteSwitch.addEventListener('click', function () {
      state.herbalAjudante = !state.herbalAjudante;
      herbalAjudanteSwitch.setAttribute('aria-checked', state.herbalAjudante ? 'true' : 'false');
      saveState();
      update();
    });
  }
  herbalQtdPresetBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      state.herbalQtd = Number(b.dataset.qtd);
      herbalQtdInput.value = state.herbalQtd;
      saveState();
      update();
    });
  });
  herbalLucroPresetBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      state.herbalLucro = Number(b.dataset.lucro);
      herbalLucroInput.value = state.herbalLucro;
      saveState();
      update();
    });
  });
  herbalModoBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.herbalModo = btn.getAttribute('data-hmodo');
      herbalModoBtns.forEach(function (x) {
        var on = x === btn;
        x.classList.toggle('active', on);
        x.setAttribute('aria-checked', on ? 'true' : 'false');
      });
      saveState();
      update();
    });
  });
  herbalLucroInput.addEventListener('input', function () {
    state.herbalLucro = Math.max(0, num(herbalLucroInput.value, 0));
    saveState();
    update();
  });
