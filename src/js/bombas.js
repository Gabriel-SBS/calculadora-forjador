  // =========================================================
  // Oficina 2: Bombas, Munições e Pólvora (p. 160, 171, 216–220)
  // =========================================================
  var bmTipoSeg = document.getElementById('bm-tipo-seg');
  var bmTipoBtns = Array.prototype.slice.call(bmTipoSeg.querySelectorAll('.seg-btn'));
  var bmViewBomba = document.getElementById('bm-view-bomba');
  var bmViewMunicao = document.getElementById('bm-view-municao');
  var bmViewPolvora = document.getElementById('bm-view-polvora');
  var bmCdGroup = document.getElementById('bm-cd-group');
  var bmTempoGroup = document.getElementById('bm-tempo-group');
  var bmObraSetting = document.getElementById('bm-obra-setting');
  var bmAlqSub = document.getElementById('bm-alq-sub');
  var bmFooterNote = document.getElementById('bm-footer-note');
  var bombaDetalhesTitle = document.getElementById('bomba-detalhes-title');
  var bombaDetalhesSection = document.getElementById('bomba-detalhes-section');

  var bombaComboWrap = document.getElementById('bomba-combo-wrap');
  var bombaEquipInfo = document.getElementById('bomba-equip-info');
  var bombaInfoBtn = document.getElementById('bomba-info-btn');
  var bombaTipoInfo = document.getElementById('bomba-tipo-info');
  var bombaPolvoraWrap = document.getElementById('bomba-polvora-wrap');
  var bombaPolvoraInfo = document.getElementById('bomba-polvora-info');
  var bombaQtdInput = document.getElementById('bomba-qtd');
  var bombaQtdLabel = document.getElementById('bomba-qtd-label');
  var bombaInfoCard = document.getElementById('bomba-info-card');
  var bombaFormatoSeg = document.getElementById('bomba-formato-seg');
  var bombaFormatoBtns = Array.prototype.slice.call(bombaFormatoSeg.querySelectorAll('.seg-btn'));
  var bombaForjadorSwitch = document.getElementById('bomba-forjador-switch');
  var bombaArtesaoSwitch = document.getElementById('bomba-artesao-switch');
  var bombaArtesaoSub = document.getElementById('bomba-artesao-sub');
  var bombaArtesaoModoWrap = document.getElementById('bomba-artesao-modo-wrap');
  var bombaPossuidosSwitch = document.getElementById('bomba-possuidos-switch');
  var bombaDesInput = document.getElementById('bomba-des');
  var bombaBpInput = document.getElementById('bomba-bp');
  var bombaMestreSwitch = document.getElementById('bomba-mestre-switch');
  var bombaModoSeg = document.getElementById('bomba-modo-seg');
  var bombaModoBtns = Array.prototype.slice.call(bombaModoSeg.querySelectorAll('.seg-btn'));
  var bombaLucroWrap = document.getElementById('bomba-lucro-wrap');
  var bombaLucroInput = document.getElementById('bomba-lucro');

  // Controles de Munição
  var bmMunSelect = document.getElementById('bm-mun-select');
  var bmMunPdeInput = document.getElementById('bm-mun-pde');
  var bmMunInfo = document.getElementById('bm-mun-info');
  var bmMunMatWrap = document.getElementById('bm-mun-mat-wrap');
  var bmAmmoModsList = document.getElementById('bm-ammo-mods-list');
  var bmAmmoModsTotal = document.getElementById('bm-ammo-mods-total');
  var bmAmmoQtdInput = document.getElementById('bm-ammo-qtd');
  var bmAmmoExistenteSwitch = document.getElementById('bm-ammo-existente-switch');
  var bmPressaSwitch = document.getElementById('bm-pressa-switch');
  var bmObraSwitch = document.getElementById('bm-obra-switch');

  // Controles de Pólvora
  var bmPolvWrap = document.getElementById('bm-polv-wrap');
  var bmPolvInfo = document.getElementById('bm-polv-info');
  var bmPolvQtdInput = document.getElementById('bm-polv-qtd');

  var bombaComboEl = null;
  var bombaPolvoraComboEl = null;
  var bmMunMatComboEl = null;
  var bmPolvComboEl = null;

  var MUNICOES_LIST = EQUIP_DB.filter(function (e) { return e.tipo === 'municao'; });
  var emptyMunOpt = document.createElement('option');
  emptyMunOpt.value = '';
  emptyMunOpt.textContent = 'Escolha a munição (opcional)';
  bmMunSelect.appendChild(emptyMunOpt);
  MUNICOES_LIST.forEach(function (m) {
    var opt = document.createElement('option');
    opt.value = m.nome;
    opt.textContent = m.nome + ' — ' + fmtMoeda(m.pde);
    bmMunSelect.appendChild(opt);
  });

  var BM_INFO_HTML = {
    bomba:
      '<p class="ti-head">Bombas e Bombinhas · p. 216–217</p><ul>' +
      '<li><strong>Bomba inteira:</strong> arremessada com ação de Usar Objeto (12 m) ou com pavio de até 5 rodadas. Exige 1 carga de pólvora (ou 2 na de Pólvora e Empurrão).</li>' +
      '<li><strong>Bombinhas:</strong> 1 bomba (ou mesmos ingredientes) rende <strong>2d4 bombinhas</strong> em 1 minuto sem teste, ou compre cada uma por <strong>¼ do preço</strong>.</li>' +
      '<li><strong>Munição explosiva:</strong> dispare em zarabatanas, arremesse a 12 m ou amarre em flechas/virotes (1 ação + linha).</li></ul>',
    municao:
      '<p class="ti-head">Criação de Munições · p. 160 e 171</p><ul>' +
      '<li><strong>Lote:</strong> paga o valor de <strong>4 munições</strong> × multiplicador do material e rende <strong>2d4 unidades</strong>.</li>' +
      '<li><strong>Tempo por Tier:</strong> C/D = 1h · B = 6h · A = 12h · S = 24h (o Forjador conclui em 2/3 desse tempo).</li>' +
      '<li><strong>Modificações (p. 160):</strong> cada munição pode ter 1 modificação de preço fixo, fora do multiplicador do material.</li></ul>',
    polvora:
      '<p class="ti-head">Criação de Pólvoras · p. 160 e 171</p><ul>' +
      '<li><strong>Lote:</strong> paga o preço de <strong>2 cargas</strong> e rende <strong>1d4 cargas</strong>. Não usa materiais nem modificações.</li>' +
      '<li><strong>Tempo:</strong> 8 horas de base por lote (5,33h para o Forjador pelo Trabalhador Itinerante).</li>' +
      '<li><strong>Uso em bombas:</strong> com Kit de Alquimista e uma ação, substitua a Pólvora Negra de qualquer bomba por uma carga especial (p. 217).</li>' +
      '<li><strong>Especialista em Pólvora (p. 212):</strong> talento que permite consumir 2 cargas diferentes no mesmo disparo com Ignição (sem combinar duas elementais) e reduz Emperrado em −2.</li></ul>'
  };

  function syncBmInfoHtml() {
    var k = state.bmTipo || 'bomba';
    bombaTipoInfo.innerHTML = BM_INFO_HTML[k] || BM_INFO_HTML.bomba;
  }
  bombaInfoBtn.addEventListener('click', function () {
    syncBmInfoHtml();
    var open = bombaTipoInfo.hidden;
    bombaTipoInfo.hidden = !open;
    bombaInfoBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  function bombaById(id) {
    if (!id) return null;
    for (var i = 0; i < BOMBAS_DB.length; i++) if (BOMBAS_DB[i].id === id) return BOMBAS_DB[i];
    return null;
  }
  function polvoraBombaById(id) {
    if (!id) return null;
    for (var i = 0; i < POLVORAS_BOMBA_DB.length; i++) if (POLVORAS_BOMBA_DB[i].id === id) return POLVORAS_BOMBA_DB[i];
    return null;
  }

  function renderBmAmmoMods() {
    bmAmmoModsList.innerHTML = '';
    [['Nenhuma', 0, 1, 'Munição comum, só com o material escolhido.']].concat(MUNICAO_MODS).forEach(function (m, k) {
      var idx = k - 1;
      var lbl = document.createElement('label');
      lbl.className = 'mod-item';
      var r = document.createElement('input');
      r.type = 'radio';
      r.name = 'bm-municao-mod';
      r.checked = (state.bmMunMod === undefined ? -1 : state.bmMunMod) === idx;
      r.addEventListener('change', function () {
        state.bmMunMod = idx;
        saveState();
        updateBmAmmoModsTotal();
        update();
      });
      var nm = document.createElement('span');
      nm.className = 'mod-name';
      nm.textContent = m[0];
      var cs = document.createElement('span');
      cs.className = 'mod-cost';
      cs.textContent = idx < 0 ? '' : fmtMoeda(m[1]) + (m[2] === 1 ? ' cada' : ' a cada ' + m[2]);
      var ds = document.createElement('span');
      ds.className = 'mod-desc';
      ds.textContent = m[3];
      lbl.appendChild(r);
      lbl.appendChild(nm);
      lbl.appendChild(cs);
      lbl.appendChild(ds);
      bmAmmoModsList.appendChild(lbl);
    });
    updateBmAmmoModsTotal();
  }

  function updateBmAmmoModsTotal() {
    var m = MUNICAO_MODS[state.bmMunMod];
    if (!m) { bmAmmoModsTotal.textContent = ''; return; }
    var q = Math.max(1, Math.floor(num(state.bmMunModQtd, 5)));
    bmAmmoModsTotal.textContent = m[0] + ' (' + fmtMoeda(m[1] * Math.ceil(q / m[2])) + ')';
  }

  function setBmTipo(tipo, silent) {
    if (tipo !== 'bomba' && tipo !== 'municao' && tipo !== 'polvora') tipo = 'bomba';
    state.bmTipo = tipo;
    bmTipoBtns.forEach(function (b) {
      var on = b.getAttribute('data-bmtipo') === tipo;
      b.classList.toggle('active', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    bmViewBomba.hidden = tipo !== 'bomba';
    bmViewMunicao.hidden = tipo !== 'municao';
    bmViewPolvora.hidden = tipo !== 'polvora';
    bmCdGroup.hidden = tipo !== 'bomba';
    bmTempoGroup.hidden = tipo === 'bomba';
    bmObraSetting.hidden = tipo !== 'municao';
    bmAlqSub.textContent = tipo === 'bomba'
      ? 'Talentos, custos de oficina e cálculo da CD de detonação'
      : tipo === 'municao'
        ? 'Descontos, tempo por tier e qualidade da munição'
        : 'Descontos e tempo de preparo da pólvora (8h base)';
    bmFooterNote.textContent = tipo === 'bomba'
      ? 'Requer Kit de Alquimista. Com proficiência, a bomba só explode na mão em falha crítica (p. 216).'
      : tipo === 'municao'
        ? 'Munições recebem o modificador apenas no dano (p. 169). Cada lote rende 2d4 unidades (p. 171).'
        : 'Cada lote de pólvora custa 2 unidades e rende 1d4 cargas em 8h base (p. 171).';
    syncBmInfoHtml();
    if (!silent) { saveState(); update(); }
  }

  bmTipoBtns.forEach(function (b) {
    b.addEventListener('click', function () { setBmTipo(b.getAttribute('data-bmtipo')); });
  });

  // --- Cálculos dos 3 sub-modos ---
  function calcBombas() {
    var b = bombaById(state.bombaId);
    if (!b) return null;
    var p = polvoraBombaById(state.bombaPolvora) || POLVORAS_BOMBA_DB[0];
    var isBombinha = state.bombaFormato === 'bombinha';
    var qtd = Math.max(1, Math.floor(num(state.bombaQtd, 1)));
    var cargasEfetivas = isBombinha ? 1 : b.cargas;
    var extraPolvoraUnit = p.id === 'negra' ? 0 : Math.max(0, (p.preco - 5) * cargasEfetivas);
    var polvoraBloqueada = isBombinha && p.id !== 'negra' &&
      !(b.id === 'fumaca' && p.id === 'fumegante') &&
      !(b.id === 'polvora');
    if (polvoraBloqueada) extraPolvoraUnit = 0;

    var precoUnitCheio = b.preco + extraPolvoraUnit;
    var cheioTotal = precoUnitCheio * qtd;

    var discFactor = state.bombaArtesao ? (1 - ARTESAO_DESCONTO / 100) : 1;
    var duplo = !!state.bombaArtesao && state.artesaoModo !== 'simples';
    var divisor = state.bombaForjador ? FORJADOR_DIVISOR : 1;

    var proprio = state.bombaPossuidos
      ? 0
      : (cheioTotal * discFactor * (duplo ? discFactor : 1)) / divisor;

    var lucroPct = num(state.bombaLucro, 50);
    var lucroValor = state.bombaModo === 'vendido' ? proprio * (lucroPct / 100) : 0;
    var final = proprio + lucroValor;

    var des = Math.floor(num(state.bombaDes, 0));
    var bp = Math.max(2, Math.floor(num(state.bombaBp, 2)));
    var cdDetonacao = 8 + des + (state.bombaMestre ? bp : 0);

    return {
      b: b, p: p, isBombinha: isBombinha, qtd: qtd,
      cargasEfetivas: cargasEfetivas, extraPolvoraUnit: extraPolvoraUnit, polvoraBloqueada: polvoraBloqueada,
      cheioTotal: cheioTotal, proprio: proprio, lucroPct: lucroPct, lucroValor: lucroValor, final: final,
      discFactor: discFactor, duplo: duplo, divisor: divisor, cdDetonacao: cdDetonacao
    };
  }

  function calcBmMunicao() {
    var mat = state.bmMunMatId ? materialById(state.bmMunMatId) : null;
    var mm = MUNICAO_MODS[state.bmMunMod] || null;
    if (!mat && !(mm && state.bmMunModExistente)) return null;
    var pdeUnit = Math.max(0, num(state.bmMunPde, 0));
    var pdeLote = pdeUnit * 4;
    var cheioBase = mat ? pdeLote * mat.mult : 0;

    var discFactor = state.bombaArtesao ? (1 - ARTESAO_DESCONTO / 100) : 1;
    var duplo = !!state.bombaArtesao && state.artesaoModo !== 'simples';
    var divisor = state.bombaForjador ? FORJADOR_DIVISOR : 1;
    var proprioBase = state.bombaPossuidos ? 0 : (cheioBase * discFactor * (duplo ? discFactor : 1)) / divisor;

    var mm = MUNICAO_MODS[state.bmMunMod] || null;
    var modMun = null;
    var proprio = proprioBase;
    if (mm) {
      var q = Math.max(1, Math.floor(num(state.bmMunModQtd, 5)));
      var cheioMod = mm[1] * Math.ceil(q / mm[2]);
      var pagoMod = state.bombaPossuidos ? 0 : (cheioMod * discFactor) / divisor;
      modMun = { nome: mm[0], custo: mm[1], por: mm[2], qtd: q, cheio: cheioMod, pago: pagoMod, existente: !!state.bmMunModExistente };
      proprio = modMun.existente ? pagoMod : proprioBase + pagoMod;
    }

    var cheioTotal = modMun ? (modMun.existente ? modMun.cheio : cheioBase + modMun.cheio) : cheioBase;
    var lucroPct = num(state.bombaLucro, 50);
    var lucroValor = state.bombaModo === 'vendido' ? proprio * (lucroPct / 100) : 0;
    var final = proprio + lucroValor;

    var horasBase = mat ? (MUNICAO_HORAS[mat.tier] || 1) : 1;
    var horas = modMun && modMun.existente
      ? null
      : horasBase * (state.bombaForjador ? 2 / 3 : 1) * (state.bmPressa ? 0.5 : 1);

    var modNum = mat ? (parseInt(mat.mod, 10) || 0) : 0;
    if (state.bmObra) modNum = Math.min(3, modNum + 1);
    if (state.bmPressa) modNum -= 1;

    return {
      mat: mat, pdeUnit: pdeUnit, pdeLote: pdeLote, cheioBase: cheioBase, cheioTotal: cheioTotal,
      proprioBase: proprioBase, proprio: proprio, modMun: modMun,
      lucroPct: lucroPct, lucroValor: lucroValor, final: final,
      discFactor: discFactor, duplo: duplo, divisor: divisor,
      horasBase: horasBase, horas: horas, modNum: modNum
    };
  }

  function calcBmPolvora() {
    var p = polvoraBombaById(state.bmPolvId);
    if (!p) return null;
    var qtd = Math.max(1, Math.floor(num(state.bmPolvQtd, 1)));
    var cheioTotal = p.preco * 2 * qtd;
    var discFactor = state.bombaArtesao ? (1 - ARTESAO_DESCONTO / 100) : 1;
    var duplo = !!state.bombaArtesao && state.artesaoModo !== 'simples';
    var divisor = state.bombaForjador ? FORJADOR_DIVISOR : 1;
    var proprio = state.bombaPossuidos ? 0 : (cheioTotal * discFactor * (duplo ? discFactor : 1)) / divisor;
    var lucroPct = num(state.bombaLucro, 50);
    var lucroValor = state.bombaModo === 'vendido' ? proprio * (lucroPct / 100) : 0;
    var final = proprio + lucroValor;
    var horas = 8 * qtd * (state.bombaForjador ? 2 / 3 : 1) * (state.bmPressa ? 0.5 : 1);
    return {
      p: p, qtd: qtd, cheioTotal: cheioTotal, proprio: proprio,
      lucroPct: lucroPct, lucroValor: lucroValor, final: final,
      discFactor: discFactor, duplo: duplo, divisor: divisor, horas: horas
    };
  }

  // --- Renderização de detalhes na seção plana .vantagens ---
  var ICON_NOTE = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 7h14M5 12h14M5 17h9"/></svg>';
  var lastBmVantKey = '';

  function renderBombaInfo(cb) {
    bombaDetalhesSection.hidden = false;
    bombaDetalhesTitle.textContent = 'Receita e efeitos da bomba';
    var raioEfetivo = (cb.p.id === 'poderosa' && !cb.isBombinha) ? cb.b.raio + ' (×2 Poderosa)' : cb.b.raio;
    bombaEquipInfo.textContent = 'Preço base ' + fmtMoeda(cb.b.preco) + ' · CD Fab. ' + cb.b.cd + ' · Raio ' + (cb.isBombinha ? '1,5 m / 1 alvo' : raioEfetivo) + ' · TR ' + cb.b.tr;
    bombaEquipInfo.hidden = false;
    if (bombaPolvoraInfo) {
      if (!state.bombaPolvora) {
        bombaPolvoraInfo.hidden = true;
      } else {
        bombaPolvoraInfo.textContent = cb.p.id === 'negra'
          ? 'Carga padrão da receita · sem custo adicional (' + fmtMoeda(cb.p.preco) + '/carga)'
          : cb.polvoraBloqueada
            ? cb.p.categoria + ' · não se aplica a esta bombinha (p. 216)'
            : cb.p.categoria + ' · +' + fmtMoeda(cb.p.preco - 5) + '/carga (' + fmtMoeda(cb.p.preco) + ' cheia)';
        bombaPolvoraInfo.hidden = false;
      }
    }

    var vKey = 'b:' + cb.b.id + ':' + cb.p.id + ':' + (cb.isBombinha ? 1 : 0);
    var enter = vKey !== lastBmVantKey;
    lastBmVantKey = vKey;

    bombaInfoCard.innerHTML = '';
    var item = document.createElement('div');
    item.className = 'v-item' + (enter ? ' is-entering' : '');
    var head = document.createElement('div');
    head.className = 'v-head';
    var nm = document.createElement('span');
    nm.className = 'v-name';
    nm.textContent = cb.b.nome + (cb.isBombinha ? ' (Bombinha)' : '');
    var tg = document.createElement('span');
    tg.className = 'v-tag';
    tg.textContent = 'CD Fab. ' + cb.b.cd + ' · CD Detonação ' + cb.cdDetonacao + ' · TR ' + cb.b.tr;
    head.appendChild(nm);
    head.appendChild(tg);
    item.appendChild(head);

    var rRow = document.createElement('div');
    rRow.className = 'v-row v-pro';
    rRow.innerHTML = '<span class="v-icon">' + ICON_PLUS + '</span><span class="v-text"></span>';
    rRow.querySelector('.v-text').textContent = cb.isBombinha ? cb.b.bombinha : cb.b.efeito;
    item.appendChild(rRow);

    var recRow = document.createElement('div');
    recRow.className = 'v-row v-dim';
    recRow.innerHTML = '<span class="v-icon">' + ICON_NOTE + '</span><span class="v-text"></span>';
    recRow.querySelector('.v-text').textContent = 'Receita: ' + cb.b.receita;
    item.appendChild(recRow);

    if (cb.b.ramos && cb.b.ramos.length) {
      var pillsWrap = document.createElement('div');
      pillsWrap.className = 'recipe-ing v-pills-row';
      cb.b.ramos.forEach(function (rm) { pillsWrap.appendChild(makeRamoPill(rm.id, rm.qtd, rm.alt || '')); });
      item.appendChild(pillsWrap);
    }
    bombaInfoCard.appendChild(item);

    if (cb.p.id !== 'negra') {
      var pItem = document.createElement('div');
      pItem.className = 'v-item' + (enter ? ' is-entering' : '');
      var pHead = document.createElement('div');
      pHead.className = 'v-head';
      var pNm = document.createElement('span');
      pNm.className = 'v-name';
      pNm.textContent = cb.p.nome;
      var pTg = document.createElement('span');
      pTg.className = 'v-tag';
      pTg.textContent = cb.polvoraBloqueada ? 'Não se aplica a esta bombinha (p. 216)' : '+' + fmtMoeda(cb.p.preco - 5) + ' por carga';
      pHead.appendChild(pNm);
      pHead.appendChild(pTg);
      pItem.appendChild(pHead);

      var pRow = document.createElement('div');
      pRow.className = 'v-row ' + (cb.polvoraBloqueada ? 'v-con' : 'v-pro');
      pRow.innerHTML = '<span class="v-icon">' + (cb.polvoraBloqueada ? ICON_WARN : ICON_PLUS) + '</span><span class="v-text"></span>';
      pRow.querySelector('.v-text').textContent = cb.polvoraBloqueada
        ? 'Bombinhas não recebem propriedades de pólvoras especiais (apenas Pólvora Negra), salvo quando a descrição da bombinha permite.'
        : cb.p.efeito;
      pItem.appendChild(pRow);
      bombaInfoCard.appendChild(pItem);
    }
  }

  function municaoPesoKg(cm) {
    var m = null;
    MUNICOES_LIST.forEach(function (x) { if (x.nome === state.bmMunId) m = x; });
    if (!m || m.pesoKg == null) return null;
    var mult = cm && cm.mat && cm.mat.pesoMult ? cm.mat.pesoMult : 1;
    return m.pesoKg * mult;
  }

  function renderBmMunInfo(cm) {
    var colossalNote = (state.bmMunId || '').indexOf('colossal') !== -1 ? ' · +1 kg/un. (evita ½ dano em armas colossais, p. 159)' : '';
    var kgUnit = municaoPesoKg(cm);
    var pesoNote = kgUnit != null ? ' · Peso (20 un.): ' + fmtKg(kgUnit * 20) : '';
    bmMunInfo.textContent = '1 unidade = ' + fmtMoeda(cm.pdeUnit) + ' · Lote (4×) = ' + fmtMoeda(cm.pdeLote) + ' · rende 2d4 unidades' + pesoNote + colossalNote;
    if (!cm.mat) { bombaDetalhesSection.hidden = true; return; }
    bombaDetalhesSection.hidden = false;
    bombaDetalhesTitle.textContent = 'Material da munição';
    var vKey = 'm:' + cm.mat.id;
    var enter = vKey !== lastBmVantKey;
    lastBmVantKey = vKey;
    bombaInfoCard.innerHTML = '';

    var item = document.createElement('div');
    item.className = 'v-item' + (enter ? ' is-entering' : '');
    var head = document.createElement('div');
    head.className = 'v-head';
    var nm = document.createElement('span');
    nm.className = 'v-name';
    nm.textContent = cm.mat.nome;
    var tg = document.createElement('span');
    tg.className = 'v-tag';
    var badge = document.createElement('span');
    badge.className = 'tier-badge';
    badge.dataset.tier = cm.mat.tier;
    badge.textContent = 'Tier ' + cm.mat.tier;
    var meta = document.createElement('span');
    meta.textContent = cm.mat.categoria + ' · ×' + cm.mat.mult + ' · ' + cm.mat.dureza + ' · ' + cm.mat.mod;
    tg.appendChild(badge);
    tg.appendChild(meta);
    head.appendChild(nm);
    head.appendChild(tg);
    item.appendChild(head);

    var pros = filterMaterialClauses(cm.mat.vantagens, 'municao');
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
      none.querySelector('.v-text').textContent = 'Sem propriedade mecânica adicional para munições além do bônus no dano.';
      item.appendChild(none);
    }

    var cons = filterMaterialClauses(cm.mat.desvantagens, 'municao');
    cons.forEach(function (txt) {
      var con = document.createElement('div');
      con.className = 'v-row v-con';
      con.innerHTML = '<span class="v-icon">' + ICON_MINUS + '</span><span class="v-text"></span>';
      con.querySelector('.v-text').textContent = txt;
      item.appendChild(con);
    });
    bombaInfoCard.appendChild(item);
  }

  function renderBmPolvInfo(cp) {
    bombaDetalhesSection.hidden = false;
    bombaDetalhesTitle.textContent = 'Propriedades da pólvora';
    bmPolvInfo.textContent = '1 carga = ' + fmtMoeda(cp.p.preco) + ' · Lote (2×) = ' + fmtMoeda(cp.p.preco * 2) + ' · rende 1d4 cargas';
    bmPolvInfo.hidden = false;
    var vKey = 'p:' + cp.p.id;
    var enter = vKey !== lastBmVantKey;
    lastBmVantKey = vKey;
    bombaInfoCard.innerHTML = '';

    var item = document.createElement('div');
    item.className = 'v-item' + (enter ? ' is-entering' : '');
    var head = document.createElement('div');
    head.className = 'v-head';
    var nm = document.createElement('span');
    nm.className = 'v-name';
    nm.textContent = cp.p.nome;
    var tg = document.createElement('span');
    tg.className = 'v-tag';
    tg.textContent = fmtMoeda(cp.p.preco) + '/carga · 8h base por lote';
    head.appendChild(nm);
    head.appendChild(tg);
    item.appendChild(head);

    if (cp.p.efeitoArma) {
      var proArma = document.createElement('div');
      proArma.className = 'v-row v-pro';
      proArma.innerHTML = '<span class="v-icon">' + ICON_PLUS + '</span><span class="v-text"></span>';
      proArma.querySelector('.v-text').textContent = 'Em armas de fogo (p. 159): ' + cp.p.efeitoArma;
      item.appendChild(proArma);
    }
    var pro = document.createElement('div');
    pro.className = 'v-row v-pro';
    pro.innerHTML = '<span class="v-icon">' + ICON_PLUS + '</span><span class="v-text"></span>';
    pro.querySelector('.v-text').textContent = 'Em bombas (p. 217): ' + cp.p.efeito;
    item.appendChild(pro);
    bombaInfoCard.appendChild(item);
  }

  // --- Update principal da Oficina Bombas e Munições ---
  function updateBombas() {
    bombaArtesaoSub.textContent = '−20% em compras de itens não-mágicos';
    if (bombaArtesaoModoWrap) bombaArtesaoModoWrap.hidden = !state.bombaArtesao;
    bombaLucroWrap.hidden = state.bombaModo !== 'vendido';

    var modo = state.bmTipo || 'bomba';
    resultCard.classList.remove('is-empty');
    resultEmptyEl.hidden = true;
    document.getElementById('cost-bar').classList.remove('is-empty');
    compareSection.hidden = false;

    function showBmEmpty(msg) {
      bombaDetalhesSection.hidden = true;
      resultCard.classList.add('is-empty');
      resultEmptyEl.textContent = msg;
      resultEmptyEl.hidden = false;
      document.getElementById('cost-bar').classList.add('is-empty');
      compareSection.hidden = true;
      animateResult(0);
      var lbl = state.bombaModo === 'vendido' ? 'Preço de venda' : 'Custo para fabricar';
      resultLabel.textContent = lbl;
      cbLabel.textContent = lbl;
      if (kpiTimeLabelEl) kpiTimeLabelEl.textContent = modo === 'bomba' ? 'Rendimento / Kit' : (modo === 'polvora' ? 'Tempo de preparo' : 'Tempo de produção');
      resultTimeEl.textContent = '—';
      resultTimeSubEl.textContent = '';
      cbTime.textContent = '';
      formulaNote.textContent = modo === 'municao'
        ? 'Munições (p. 160 e 171) · 4 unidades × material → rende 2d4'
        : modo === 'polvora'
          ? 'Pólvoras (p. 160 e 171) · preço de 2 unidades → rende 1d4 · 8h base'
          : 'Bombas (p. 216–220) · 1 bomba = 2d4 bombinhas';
    }

    if (modo === 'municao') {
      if (state.bmMunModExistente && !(state.bmMunMod >= 0 && MUNICAO_MODS[state.bmMunMod])) {
        bmMunInfo.textContent = 'Só modificação em munições já existentes (p. 160)';
        showBmEmpty('Escolha uma modificação de munição para calcular o custo.');
        return;
      }
      var cm = calcBmMunicao();
      if (!cm) {
        bmMunInfo.textContent = 'Custo de 4 unidades · rende 2d4 munições (p. 171)';
        showBmEmpty('Escolha o material da munição para calcular o custo.');
        return;
      }
      renderBmMunInfo(cm);
      if (!(cm.pdeUnit > 0) && !(cm.modMun && cm.modMun.existente)) {
        showBmEmpty('Informe o PDE da munição para calcular o custo.');
        return;
      }
      animateResult(cm.final);
      var mLabel = state.bombaModo === 'vendido' ? 'Preço de venda' : 'Custo para fabricar';
      resultLabel.textContent = mLabel;
      cbLabel.textContent = mLabel;

      if (kpiTimeLabelEl) kpiTimeLabelEl.textContent = 'Tempo de produção';
      if (cm.horas == null) {
        resultTimeEl.textContent = '—';
        resultTimeSubEl.textContent = '· combine com o Mestre';
      } else {
        resultTimeEl.textContent = fmt(cm.horas) + 'h';
        resultTimeSubEl.textContent = '· rende 2d4 un.';
      }
      cbTime.textContent = resultTimeEl.textContent + ' ' + resultTimeSubEl.textContent;

      resultPropsEl.innerHTML = '';
      resultPropsEl.hidden = !cm.mat;
      if (cm.mat) {
        resultPropsEl.appendChild(propChip('Dano', fmtMod(cm.modNum)));
        resultPropsEl.appendChild(propChip('Dureza', cm.mat.dureza));
      }
      if (state.bmObra) {
        var oChip = propChip('Qualidade', 'Obra-Prima');
        oChip.classList.add('chip-obra');
        resultPropsEl.appendChild(oChip);
      }
      if (state.bombaModo === 'vendido' && cm.lucroValor > 0) {
        resultPropsEl.hidden = false;
        var mlChip = propChip('Lucro líquido', '+' + fmtMoeda(cm.lucroValor));
        mlChip.classList.add('chip-lucro');
        resultPropsEl.appendChild(mlChip);
      }

      breakdownEl.innerHTML = '';
      if (!cm.modMun || !cm.modMun.existente) {
        breakdownEl.appendChild(bRow('Lote de 4 munições × ' + cm.mat.nome + ' (×' + cm.mat.mult + ')', fmtMoeda(cm.cheioBase)));
        if (state.bombaPossuidos) {
          breakdownEl.appendChild(bRow('Materiais em posse', 'grátis'));
        } else {
          if (state.bombaArtesao) breakdownEl.appendChild(bRow('Talento Artesão (' + (cm.duplo ? '−36%' : '−20%') + ')', fmtMoeda(cm.cheioBase * cm.discFactor * (cm.duplo ? cm.discFactor : 1))));
          if (state.bombaForjador) breakdownEl.appendChild(bRow('Trabalhador Itinerante', '÷ 2'));
        }
      }
      if (cm.modMun) {
        var porTxt = cm.modMun.por === 1 ? fmtMoeda(cm.modMun.custo) + '/un.' : fmtMoeda(cm.modMun.custo) + ' a cada ' + cm.modMun.por;
        breakdownEl.appendChild(bRow(cm.modMun.nome + ' (' + cm.modMun.qtd + ' un., ' + porTxt + ')', state.bombaPossuidos ? 'grátis' : '+' + fmtMoeda(cm.modMun.pago)));
      }
      if (state.bombaModo === 'vendido') breakdownEl.appendChild(bRow('+ margem de lucro (' + fmt(cm.lucroPct) + '%)', '+' + fmtMoeda(cm.lucroValor)));
      breakdownEl.appendChild(bRow(state.bombaModo === 'vendido' ? 'Preço de venda' : 'Custo final', fmtMoeda(cm.final), true));

      formulaNote.textContent = 'Munições (p. 160 e 171) · 4 unidades × material → rende 2d4 · modificações fora do multiplicador';

      compareRowsEl.innerHTML = '';
      compareRowsEl.appendChild(cRow('Comprar em loja / ferreiro comum', 'preço cheio do Guia', cm.cheioTotal, ''));
      compareRowsEl.appendChild(cRow(
        state.bombaModo === 'vendido' ? 'Seu preço de venda' : 'Seu custo de fabricação',
        state.bombaPossuidos ? 'materiais em posse' : (state.bombaForjador ? 'Forjador ÷2' : 'preço base') + (state.bombaArtesao ? (cm.duplo ? ' · Artesão −36%' : ' · Artesão −20%') : ''),
        cm.final, deltaPct(cm.final, cm.cheioTotal), true
      ));
      scaleCompareBars();
      clearTimeout(liveTimer);
      liveTimer = setTimeout(function () {
        liveEl.textContent = mLabel + ': ' + fmtMoeda(cm.final) + (cm.horas != null ? '. Tempo: ' + fmt(cm.horas) + 'h' : '');
      }, 600);
      return;
    }

    if (modo === 'polvora') {
      var cp = calcBmPolvora();
      if (!cp) {
        bmPolvInfo.hidden = true;
        showBmEmpty('Escolha uma pólvora do Guia para calcular o custo.');
        return;
      }
      renderBmPolvInfo(cp);
      animateResult(cp.final);
      var pLabel = state.bombaModo === 'vendido' ? 'Preço de venda' : 'Custo para fabricar';
      resultLabel.textContent = pLabel;
      cbLabel.textContent = pLabel;

      if (kpiTimeLabelEl) kpiTimeLabelEl.textContent = 'Tempo de preparo';
      resultTimeEl.textContent = fmt(cp.horas) + 'h';
      resultTimeSubEl.textContent = '· rende ' + (cp.qtd === 1 ? '1d4' : cp.qtd + 'd4') + ' cargas';
      cbTime.textContent = resultTimeEl.textContent + ' ' + resultTimeSubEl.textContent;

      resultPropsEl.innerHTML = '';
      resultPropsEl.hidden = false;
      resultPropsEl.appendChild(propChip('Rende', (cp.qtd === 1 ? '1d4' : cp.qtd + 'd4') + ' cargas'));
      resultPropsEl.appendChild(propChip('1 carga', fmtMoeda(cp.p.preco)));
      if (state.bombaModo === 'vendido' && cp.lucroValor > 0) {
        var plChip = propChip('Lucro líquido', '+' + fmtMoeda(cp.lucroValor));
        plChip.classList.add('chip-lucro');
        resultPropsEl.appendChild(plChip);
      }

      breakdownEl.innerHTML = '';
      breakdownEl.appendChild(bRow(cp.p.nome + ' (' + (cp.qtd * 2) + ' cargas base)', fmtMoeda(cp.cheioTotal)));
      if (state.bombaPossuidos) {
        breakdownEl.appendChild(bRow('Ingredientes em posse', 'grátis'));
      } else {
        if (state.bombaArtesao) breakdownEl.appendChild(bRow('Talento Artesão (' + (cp.duplo ? '−36%' : '−20%') + ')', fmtMoeda(cp.cheioTotal * cp.discFactor * (cp.duplo ? cp.discFactor : 1))));
        if (state.bombaForjador) breakdownEl.appendChild(bRow('Trabalhador Itinerante', '÷ 2'));
      }
      if (state.bombaModo === 'vendido') breakdownEl.appendChild(bRow('+ margem de lucro (' + fmt(cp.lucroPct) + '%)', '+' + fmtMoeda(cp.lucroValor)));
      breakdownEl.appendChild(bRow(state.bombaModo === 'vendido' ? 'Preço de venda' : 'Custo final', fmtMoeda(cp.final), true));

      formulaNote.textContent = 'Pólvoras (p. 160 e 171) · preço de 2 unidades → rende 1d4 · 8h base por lote';

      compareRowsEl.innerHTML = '';
      compareRowsEl.appendChild(cRow('Comprar pronta em alquimista (2 cargas/lote)', 'preço cheio', cp.cheioTotal, ''));
      compareRowsEl.appendChild(cRow(
        state.bombaModo === 'vendido' ? 'Seu preço de venda' : 'Seu custo de fabricação',
        state.bombaPossuidos ? 'ingredientes em posse' : (state.bombaForjador ? 'Forjador ÷2' : 'preço base') + (state.bombaArtesao ? (cp.duplo ? ' · Artesão −36%' : ' · Artesão −20%') : ''),
        cp.final, deltaPct(cp.final, cp.cheioTotal), true, 'alquimista'
      ));
      scaleCompareBars();
      clearTimeout(liveTimer);
      liveTimer = setTimeout(function () {
        liveEl.textContent = pLabel + ': ' + fmtMoeda(cp.final) + '. Tempo: ' + fmt(cp.horas) + 'h';
      }, 600);
      return;
    }

    // Modo padrão: Bomba
    var cb = calcBombas();
    if (!cb) {
      bombaEquipInfo.hidden = true;
      if (bombaPolvoraInfo) bombaPolvoraInfo.hidden = !state.bombaPolvora;
      showBmEmpty('Escolha uma bomba do Guia para calcular o custo.');
      return;
    }
    bombaQtdLabel.textContent = cb.isBombinha ? 'Lotes de 2d4 bombinhas' : 'Quantidade de bombas';
    renderBombaInfo(cb);

    animateResult(cb.final);
    var labelTxt = state.bombaModo === 'vendido'
      ? 'Preço de venda'
      : (cb.isBombinha ? 'Custo dos lotes de bombinhas' : 'Custo para fabricar');
    resultLabel.textContent = labelTxt;
    cbLabel.textContent = labelTxt;

    if (kpiTimeLabelEl) kpiTimeLabelEl.textContent = cb.isBombinha ? 'Rendimento (1 min/lote)' : 'Rendimento / Kit';
    resultTimeEl.textContent = cb.isBombinha ? (cb.qtd === 1 ? '2d4 un.' : (cb.qtd * 2) + 'd4 un.') : (cb.qtd + (cb.qtd === 1 ? ' bomba' : ' bombas'));
    resultTimeSubEl.textContent = '· Kit de Alquimista';
    cbTime.textContent = resultTimeEl.textContent + ' ' + resultTimeSubEl.textContent;

    resultPropsEl.innerHTML = '';
    resultPropsEl.hidden = false;
    resultPropsEl.appendChild(propChip('CD Detonação', String(cb.cdDetonacao)));
    resultPropsEl.appendChild(propChip('CD Fabricação', String(cb.b.cd)));
    resultPropsEl.appendChild(propChip('Raio', cb.isBombinha ? '1,5 m / 1 alvo' : cb.b.raio));
    if (cb.isBombinha) {
      resultPropsEl.appendChild(propChip('Peso', '0,1 kg/un.'));
    }
    if (state.bombaMestre) {
      var mChip = propChip('Ação', 'Bônus (Mestre)');
      mChip.classList.add('chip-obra');
      resultPropsEl.appendChild(mChip);
    }
    if (state.bombaModo === 'vendido' && cb.lucroValor > 0) {
      var blChip = propChip('Lucro líquido', '+' + fmtMoeda(cb.lucroValor));
      blChip.classList.add('chip-lucro');
      resultPropsEl.appendChild(blChip);
    }

    breakdownEl.innerHTML = '';
    breakdownEl.appendChild(bRow(cb.b.nome + ' × ' + cb.qtd + (cb.isBombinha ? ' lote(s) de 2d4' : ''), fmtMoeda(cb.b.preco * cb.qtd)));
    if (cb.extraPolvoraUnit > 0) {
      breakdownEl.appendChild(bRow('Troca para ' + cb.p.nome + ' (' + cb.cargasEfetivas + ' carga/bomba)', '+' + fmtMoeda(cb.extraPolvoraUnit * cb.qtd)));
    }
    if (state.bombaPossuidos) {
      breakdownEl.appendChild(bRow('Ingredientes já em posse', 'grátis'));
    } else {
      if (state.bombaArtesao) {
        breakdownEl.appendChild(bRow('Talento Artesão (' + (cb.duplo ? '−36%' : '−20%') + ')', fmtMoeda(cb.cheioTotal * cb.discFactor * (cb.duplo ? cb.discFactor : 1))));
      }
      if (state.bombaForjador) {
        breakdownEl.appendChild(bRow('Trabalhador Itinerante (só matéria-prima)', '÷ 2'));
      }
    }
    if (state.bombaModo === 'vendido') {
      breakdownEl.appendChild(bRow('+ margem de lucro (' + fmt(cb.lucroPct) + '%)', '+' + fmtMoeda(cb.lucroValor)));
    }
    breakdownEl.appendChild(bRow(state.bombaModo === 'vendido' ? 'Preço de venda' : 'Custo final', fmtMoeda(cb.final), true));

    formulaNote.textContent = 'Bombas (p. 216–220) · CD = 8 + DES' + (state.bombaMestre ? ' + BP (Mestre das Bombas)' : '') + ' · 1 bomba = 2d4 bombinhas';

    compareRowsEl.innerHTML = '';
    compareRowsEl.appendChild(cRow('Comprar pronta em alquimista', 'preço cheio do Guia', cb.cheioTotal, ''));
    if (cb.isBombinha) {
      compareRowsEl.appendChild(cRow('Comprar 4 bombinhas avulsas por lote', '¼ do preço cada', cb.b.preco * cb.qtd, deltaPct(cb.b.preco * cb.qtd, cb.cheioTotal), false, 'alquimista'));
    }
    compareRowsEl.appendChild(cRow(
      state.bombaModo === 'vendido' ? 'Seu preço de venda' : 'Seu custo de fabricação',
      state.bombaPossuidos ? 'ingredientes em posse' : (state.bombaForjador ? 'Forjador ÷2' : 'preço base') + (state.bombaArtesao ? (cb.duplo ? ' · Artesão −36%' : ' · Artesão −20%') : ''),
      cb.final,
      deltaPct(cb.final, cb.cheioTotal),
      true,
      'alquimista'
    ));
    scaleCompareBars();

    clearTimeout(liveTimer);
    liveTimer = setTimeout(function () {
      liveEl.textContent = labelTxt + ': ' + fmtMoeda(cb.final) + '. CD de detonação ' + cb.cdDetonacao;
    }, 600);
  }

  function resumoBombaAtual() {
    if (state.bmTipo === 'municao') {
      if (state.bmMunModExistente && !(state.bmMunMod >= 0 && MUNICAO_MODS[state.bmMunMod])) return null;
      var cm = calcBmMunicao();
      if (!cm || (!(cm.pdeUnit > 0) && !(cm.modMun && cm.modMun.existente))) return null;
      var baseNome = (state.bmMunId || 'Munição').replace(' (1 unidade)', '');
      var kgUnit = municaoPesoKg(cm);
      var pesoTxt = kgUnit != null ? ' · Peso (20 un.) ' + fmtKg(kgUnit * 20) : '';
      return {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        oficina: 'bombas',
        subtipo: 'municao',
        nome: baseNome + (cm.mat ? ' — ' + cm.mat.nome + ' (' + cm.mat.tier + ')' : ''),
        mats: [],
        mods: [],
        valor: cm.final,
        venda: state.bombaModo === 'vendido',
        horas: cm.horas,
        rende: cm.modMun && cm.modMun.existente ? '' : '2d4 unidades',
        detalhes: (cm.mat ? 'Dano ' + fmtMod(cm.modNum) + ' · Dureza ' + cm.mat.dureza : 'Modificação em munição existente') + (cm.modMun ? ' · ' + cm.modMun.nome + ' (' + cm.modMun.qtd + ')' : '') + pesoTxt
      };
    }
    if (state.bmTipo === 'polvora') {
      var cp = calcBmPolvora();
      if (!cp) return null;
      return {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        oficina: 'bombas',
        subtipo: 'polvora',
        nome: (cp.qtd > 1 ? cp.qtd + '× ' : '') + cp.p.nome,
        mats: [],
        mods: [],
        valor: cp.final,
        venda: state.bombaModo === 'vendido',
        horas: cp.horas,
        rende: (cp.qtd === 1 ? '1d4' : cp.qtd + 'd4') + ' cargas',
        detalhes: cp.p.efeito
      };
    }
    var cb = calcBombas();
    if (!cb) return null;
    var nome = (cb.qtd > 1 ? cb.qtd + '× ' : '') + cb.b.nome +
      (cb.isBombinha ? ' (Bombinhas)' : '') +
      (cb.p.id !== 'negra' && !cb.polvoraBloqueada ? ' [' + cb.p.nome + ']' : '');
    return {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      oficina: 'bombas',
      subtipo: 'bomba',
      nome: nome,
      mats: [],
      mods: [],
      valor: cb.final,
      venda: state.bombaModo === 'vendido',
      horas: cb.isBombinha ? +(cb.qtd / 60).toFixed(2) : null,
      rende: cb.isBombinha ? (cb.qtd === 1 ? '2d4 bombinhas' : (cb.qtd * 2) + 'd4 bombinhas') : '',
      detalhes: 'CD Detonação ' + cb.cdDetonacao + ' · CD Fab. ' + cb.b.cd + ' · Raio ' + (cb.isBombinha ? '1,5 m / 1 alvo · Peso 0,1 kg/un.' : cb.b.raio) + ' · TR ' + cb.b.tr,
      receita: cb.b.receita
    };
  }

  // Listeners
  bombaQtdInput.addEventListener('input', function () { state.bombaQtd = Math.max(1, Math.floor(num(bombaQtdInput.value, 1))); saveState(); update(); });
  bombaDesInput.addEventListener('input', function () { state.bombaDes = num(bombaDesInput.value, 0); saveState(); update(); });
  bombaBpInput.addEventListener('input', function () { state.bombaBp = Math.max(2, Math.floor(num(bombaBpInput.value, 2))); saveState(); update(); });
  bombaLucroInput.addEventListener('input', function () { state.bombaLucro = Math.max(0, num(bombaLucroInput.value, 0)); saveState(); update(); });

  bmMunSelect.addEventListener('change', function () {
    state.bmMunId = bmMunSelect.value;
    var found = MUNICOES_LIST.filter(function (m) { return m.nome === state.bmMunId; })[0];
    if (found) { state.bmMunPde = found.pde; bmMunPdeInput.value = found.pde; }
    saveState(); update();
  });
  bmMunPdeInput.addEventListener('input', function () { state.bmMunPde = Math.max(0, num(bmMunPdeInput.value, 0)); saveState(); update(); });
  bmAmmoQtdInput.addEventListener('input', function () { state.bmMunModQtd = Math.max(1, Math.floor(num(bmAmmoQtdInput.value, 5))); updateBmAmmoModsTotal(); saveState(); update(); });
  bmPolvQtdInput.addEventListener('input', function () { state.bmPolvQtd = Math.max(1, Math.floor(num(bmPolvQtdInput.value, 1))); saveState(); update(); });

  bombaFormatoBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.bombaFormato = btn.getAttribute('data-bformato');
      bombaFormatoBtns.forEach(function (x) {
        var on = x === btn;
        x.classList.toggle('active', on);
        x.setAttribute('aria-checked', on ? 'true' : 'false');
      });
      saveState(); update();
    });
  });
  bombaModoBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.bombaModo = btn.getAttribute('data-bmodo');
      bombaModoBtns.forEach(function (x) {
        var on = x === btn;
        x.classList.toggle('active', on);
        x.setAttribute('aria-checked', on ? 'true' : 'false');
      });
      saveState(); update();
    });
  });

  bombaArtesaoSwitch.addEventListener('click', function () {
    setArtesao(!state.artesao);
  });

  [
    [bombaForjadorSwitch, 'bombaForjador'],
    [bombaPossuidosSwitch, 'bombaPossuidos'],
    [bombaMestreSwitch, 'bombaMestre'],
    [bmAmmoExistenteSwitch, 'bmMunModExistente'],
    [bmPressaSwitch, 'bmPressa'],
    [bmObraSwitch, 'bmObra']
  ].forEach(function (pair) {
    pair[0].addEventListener('click', function () {
      state[pair[1]] = !state[pair[1]];
      pair[0].setAttribute('aria-checked', state[pair[1]] ? 'true' : 'false');
      saveState(); update();
    });
  });
