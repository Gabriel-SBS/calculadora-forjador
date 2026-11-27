  function hydrateOficinas() {
    if (!bombaComboEl) {
      bombaComboEl = buildCatalogCombo(
        BOMBAS_DB,
        function () { return bombaById(state.bombaId); },
        'Buscar bomba (ex.: estilhaço, fumaça, santa granada)',
        'bomba-combo-label',
        function (b) { return fmtMoeda(b.preco) + ' · CD ' + b.cd + ' · ' + b.raio; },
        function (b) { state.bombaId = b.id; saveState(); update(); },
        function () { state.bombaId = ''; saveState(); update(); }
      );
      bombaComboWrap.innerHTML = '';
      bombaComboWrap.appendChild(bombaComboEl);
    } else {
      bombaComboEl._sync();
    }

    if (!herbalComboEl) {
      herbalComboEl = buildCatalogCombo(
        HERBAL_DB,
        function () { return herbalById(state.herbalId); },
        'Buscar receita (ex.: óleo de linhaça, cura, veneno)',
        'herbal-combo-label',
        function (h) { return fmtMoeda(h.preco) + ' · ' + h.rende; },
        function (h) { state.herbalId = h.id; saveState(); update(); },
        function () { state.herbalId = ''; saveState(); update(); }
      );
      herbalComboWrap.innerHTML = '';
      herbalComboWrap.appendChild(herbalComboEl);
    } else {
      herbalComboEl._sync();
    }

    if (!bmMunMatComboEl) {
      bmMunMatComboEl = buildCatalogCombo(
        MATERIALS_DB,
        function () { return state.bmMunMatId ? materialById(state.bmMunMatId) : null; },
        'Buscar material (ex.: aço, prata, tier b, metal)',
        'bm-mun-mat-label',
        function (m) { return 'Tier ' + m.tier + ' · ×' + m.mult + ' · ' + m.mod; },
        function (m) { state.bmMunMatId = m.id; saveState(); update(); },
        function () { state.bmMunMatId = ''; saveState(); update(); }
      );
      bmMunMatWrap.innerHTML = '';
      bmMunMatWrap.appendChild(bmMunMatComboEl);
    } else {
      bmMunMatComboEl._sync();
    }

    if (!bmPolvComboEl) {
      bmPolvComboEl = buildCatalogCombo(
        POLVORAS_BOMBA_DB,
        function () { return polvoraBombaById(state.bmPolvId); },
        'Buscar pólvora (ex.: negra, elukiana, vermelha)',
        'bm-polv-label',
        function (p) { return fmtMoeda(p.preco) + '/carga'; },
        function (p) { state.bmPolvId = p.id; saveState(); update(); },
        function () { state.bmPolvId = ''; saveState(); update(); }
      );
      bmPolvWrap.innerHTML = '';
      bmPolvWrap.appendChild(bmPolvComboEl);
    } else {
      bmPolvComboEl._sync();
    }

    if (state.bmMunId === 'Bala (1 unidade)') state.bmMunId = 'Bala — funda / arma de fogo (1 unidade)';
    bmMunSelect.value = state.bmMunId || '';
    bmMunCampo.mostrar(state.bmMunPde, state.bmMunPdeMoeda);
    bmAmmoQtdInput.value = state.bmMunModQtd == null ? 5 : state.bmMunModQtd;
    bmAmmoExistenteSwitch.setAttribute('aria-checked', state.bmMunModExistente ? 'true' : 'false');
    bmPressaSwitch.setAttribute('aria-checked', state.bmPressa ? 'true' : 'false');
    bmObraSwitch.setAttribute('aria-checked', state.bmObra ? 'true' : 'false');
    bmAjudanteSwitch.setAttribute('aria-checked', state.bmAjudante ? 'true' : 'false');
    bmPolvQtdInput.value = state.bmPolvQtd || 1;
    renderBmAmmoMods();
    setBmTipo(state.bmTipo || 'bomba', true);

    if (!bombaPolvoraComboEl) {
      bombaPolvoraComboEl = buildCatalogCombo(
        POLVORAS_BOMBA_DB,
        function () { return polvoraBombaById(state.bombaPolvora); },
        'Buscar carga de pólvora (padrão: Pólvora Negra)',
        'bomba-polvora-label',
        function (p) { return p.id === 'negra' ? 'Padrão' : '+' + fmtMoeda(p.preco - 5) + '/carga'; },
        function (p) { state.bombaPolvora = p.id; saveState(); update(); },
        function () { state.bombaPolvora = ''; saveState(); update(); }
      );
      bombaPolvoraWrap.innerHTML = '';
      bombaPolvoraWrap.appendChild(bombaPolvoraComboEl);
    } else {
      bombaPolvoraComboEl._sync();
    }

    bombaQtdInput.value = state.bombaQtd || 1;
    bombaDesInput.value = state.bombaDes == null ? 0 : state.bombaDes;
    bombaBpInput.value = state.bombaBp || 2;
    bombaLucroInput.value = state.bombaLucro == null ? 50 : state.bombaLucro;
    bombaForjadorSwitch.setAttribute('aria-checked', state.bombaForjador !== false ? 'true' : 'false');
    bombaArtesaoSwitch.setAttribute('aria-checked', state.bombaArtesao !== false ? 'true' : 'false');
    bombaPossuidosSwitch.setAttribute('aria-checked', state.bombaPossuidos ? 'true' : 'false');
    bombaMestreSwitch.setAttribute('aria-checked', state.bombaMestre ? 'true' : 'false');
    bombaFormatoBtns.forEach(function (x) {
      var on = x.getAttribute('data-bformato') === (state.bombaFormato || 'bomba');
      x.classList.toggle('active', on);
      x.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    bombaModoBtns.forEach(function (x) {
      var on = x.getAttribute('data-bmodo') === (state.bombaModo || 'proprio');
      x.classList.toggle('active', on);
      x.setAttribute('aria-checked', on ? 'true' : 'false');
    });

    herbalQtdInput.value = state.herbalQtd || 1;
    herbalArtesaoSwitch.setAttribute('aria-checked', state.herbalArtesao !== false ? 'true' : 'false');
    if (herbalAjudanteSwitch) herbalAjudanteSwitch.setAttribute('aria-checked', state.herbalAjudante ? 'true' : 'false');
    herbalOrigemBtns.forEach(function (x) {
      var on = x.getAttribute('data-horigem') === (state.herbalOrigem || 'comprar-ramos');
      x.classList.toggle('active', on);
      x.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    herbalLucroInput.value = state.herbalLucro == null ? 50 : state.herbalLucro;
    herbalModoBtns.forEach(function (x) {
      var on = x.getAttribute('data-hmodo') === (state.herbalModo || 'proprio');
      x.classList.toggle('active', on);
      x.setAttribute('aria-checked', on ? 'true' : 'false');
    });

    // Comparador de materiais lado a lado (Forja)
    if (!Array.isArray(state.compMats) || state.compMats.length !== 3) state.compMats = ['', '', ''];
    if (!window._compMatCombos) window._compMatCombos = [null, null, null];
    [0, 1, 2].forEach(function (slot) {
      var host = document.getElementById('comp-mat-' + slot);
      if (!host) return;
      if (!window._compMatCombos[slot]) {
        window._compMatCombos[slot] = buildCatalogCombo(
          MATERIALS_DB,
          function () { return state.compMats[slot] ? materialById(state.compMats[slot]) : null; },
          'Buscar material ' + (slot + 1) + ' (ex.: aço, mithral, tier b)',
          'comp-mat-' + slot + '-label',
          function (m) { return 'Tier ' + m.tier + ' · ×' + m.mult + (m.mod && m.mod !== '+0' && m.mod !== '0' ? ' · ' + m.mod : ''); },
          function (m) { state.compMats[slot] = m.id; saveState(); renderCompMateriais(); },
          function () { state.compMats[slot] = ''; saveState(); renderCompMateriais(); }
        );
        host.innerHTML = '';
        host.appendChild(window._compMatCombos[slot]);
      } else {
        window._compMatCombos[slot]._sync();
      }
    });
  }

  function hydrateForm() {
    if (state.mostrarDureza === undefined) state.mostrarDureza = true;
    if (!state.magicoRaridade) state.magicoRaridade = 'comum';
    pdeCampo.mostrar(state.pde, state.pdeMoeda);
    artesaoSwitch.setAttribute('aria-checked', state.artesao ? 'true' : 'false');
    materiaisSwitch.setAttribute('aria-checked', state.materiaisPossuidos ? 'true' : 'false');
    durezaSwitch.setAttribute('aria-checked', state.mostrarDureza ? 'true' : 'false');
    pressaSwitch.setAttribute('aria-checked', state.pressa ? 'true' : 'false');
    fracaoSwitch.setAttribute('aria-checked', state.fracaoFixa ? 'true' : 'false');
    lucroInput.value = state.lucro;
    syncLucroPresets();
    magicoRaridadeSelect.value = state.magicoRaridade || 'comum';
    peritoSwitch.setAttribute('aria-checked', state.peritoItensMagicos ? 'true' : 'false');
    especialistaSwitch.setAttribute('aria-checked', state.especialistaItensMagicos ? 'true' : 'false');
    syncAutoSwitches();
    excaliburSwitch.setAttribute('aria-checked', state.excalibur ? 'true' : 'false');
    SIMPLE_SWITCHES.forEach(function (sw) {
      document.getElementById(sw[0]).setAttribute('aria-checked', state[sw[1]] ? 'true' : 'false');
    });
    transmutNivelSelect.value = state.transmutNivel || '3';
    equipWrap.innerHTML = '';
    equipWrap.appendChild(buildEquipCombo());
    showEquipInfo();
    renderMods();
    syncMagicoRaridade();
    renderMaterials();
    setMode(state.modo || 'proprio');
    setTipo(state.tipoItem || 'arma');
    setPeso(state.peso || '');
    setArtesaoModo(state.artesaoModo || 'duplo');
    initTransmutCombos();
    hydrateOficinas();
    setArtesao(state.artesao !== false, true);
    setOficina(state.oficina || 'forja', true);
    update();
    updateMagicos();
  }

  state = loadState();
  hydrateForm();
  if (loadedFromShare) {
    showToast('Receita carregada do link compartilhado.');
    try {
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch (e) {}
  }

  // Barra de custo (celular): aparece quando o resultado sai da tela; toque leva até ele
  var costBar = document.getElementById('cost-bar');
  function setCostBar(show) {
    costBar.classList.toggle('show', show);
    costBar.tabIndex = show ? 0 : -1;
    costBar.setAttribute('aria-hidden', show ? 'false' : 'true');
  }
  setCostBar(false);
  costBar.addEventListener('click', function () {
    resultCard.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      setCostBar(!entries[0].isIntersecting);
    }, { threshold: 0.15 }).observe(resultCard);
  }

  // Exemplos clicáveis dentro de "Como funciona a pesquisa?"
  var SEARCH_INFO_TARGET = {
    'equip-search-info': '#equip-wrap .mat-search',
    'mat-search-info': '#materials-wrap .mat-search',
    'bomba-search-info': '#bomba-combo-wrap .mat-search',
    'bomba-polvora-search-info': '#bomba-polvora-wrap .mat-search',
    'bm-mat-search-info': '#bm-mun-mat-wrap .mat-search',
    'polv-search-info': '#bm-polv-wrap .mat-search',
    'herbal-search-info': '#herbal-combo-wrap .mat-search'
  };
  Object.keys(SEARCH_INFO_TARGET).forEach(function (infoId) {
    var box = document.getElementById(infoId);
    if (!box) return;
    Array.prototype.forEach.call(box.querySelectorAll('code'), function (codeEl) {
      codeEl.classList.add('search-ex');
      codeEl.setAttribute('role', 'button');
      codeEl.setAttribute('tabindex', '0');
      codeEl.title = 'Clique para buscar "' + codeEl.textContent + '"';
      function runExample() {
        var target = document.querySelector(SEARCH_INFO_TARGET[infoId]);
        if (!target) return;
        target.value = codeEl.textContent;
        target.focus();
        target.dispatchEvent(new Event('input', { bubbles: true }));
      }
      codeEl.addEventListener('click', runExample);
      codeEl.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); runExample(); }
      });
    });
  });

  // Atalho '/' foca a busca principal da aba ativa
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== '/' || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    var tag = ev.target && ev.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (ev.target && ev.target.isContentEditable)) return;
    var sel = state.oficina === 'herbalismo'
      ? '#herbal-combo-wrap .mat-search'
      : state.oficina === 'bombas'
        ? (state.bmTipo === 'municao' ? '#bm-mun-mat-wrap .mat-search' : state.bmTipo === 'polvora' ? '#bm-polv-wrap .mat-search' : '#bomba-combo-wrap .mat-search')
        : '#equip-wrap .mat-search';
    var input = document.querySelector(sel);
    if (!input) return;
    ev.preventDefault();
    input.focus();
    input.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  });
