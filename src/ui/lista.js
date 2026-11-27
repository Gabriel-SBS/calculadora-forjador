  var SITE_URL = 'https://gabriel-sbs.github.io/calculadora-forjador/';
  var TIPO_NOME = { arma: 'Arma', armadura: 'Armadura', municao: 'Munição', polvora: 'Pólvora' };

  function fmtHorasForjador(h) {
    if (h == null || !isFinite(h)) return '';
    var dias = Math.ceil(h / FORJADOR_HORAS_DIA);
    return fmt(h) + 'h (' + dias + (dias === 1 ? ' dia' : ' dias') + ' de ' + FORJADOR_HORAS_DIA + 'h)';
  }
  function fmtMod(m) { return (m >= 0 ? '+' : '−') + Math.abs(m); }

  function resumoAtual() {
    var snap = encodeShareState();
    if (state.oficina === 'bombas') {
      var rb = resumoBombaAtual();
      if (rb) rb.snap = snap;
      return rb;
    }
    if (state.oficina === 'herbalismo') {
      var rh = resumoHerbalAtual();
      if (rh) rh.snap = snap;
      return rh;
    }
    var c = calculate();
    if (emptyReason(c)) return null;
    var soModMun = !!(c.modMun && c.modMun.existente);
    var props = soModMun ? null : itemProps();
    var w = state.tipoItem === 'polvora' || soModMun ? null : calcItemWeight();
    var mats = state.tipoItem === 'polvora' || soModMun ? [] : state.materials
      .filter(function (m) { return m.name || m.materialId; })
      .map(function (m) {
        var db = m.materialId ? materialById(m.materialId) : null;
        return (db ? db.nome : m.name) + (m.tier ? ' (' + m.tier + ')' : '');
      });
    return {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      oficina: 'forja',
      nome: state.equipNome || (TIPO_NOME[state.tipoItem] || 'Item') + ' (PDE ' + fmt(num(state.pde, 0)) + ')',
      mats: mats,
      mods: state.tipoItem === 'municao'
        ? (MUNICAO_MODS[state.municaoMod] ? [MUNICAO_MODS[state.municaoMod][0] + ' (' + Math.max(1, Math.floor(num(state.municaoModQtd, 5))) + ')'] : [])
        : (state.mods || []).map(function (i) { return MODS_DB[i] && MODS_DB[i][0]; }).filter(Boolean),
      valor: c.final,
      venda: state.modo === 'vendido',
      conserto: state.modo === 'conserto',
      excalibur: !!(state.excalibur && state.tipoItem === 'arma'),
      horas: lastForjadorHoras,
      dureza: props && state.mostrarDureza ? props.dureza : null,
      mod: props ? props.mod : null,
      pesoKg: w ? w.finalKg : null,
      snap: snap,
      obra: !!(props && props.obra),
      pressa: !!state.pressa,
      rende: soModMun || state.modo === 'conserto' ? '' : state.tipoItem === 'municao' ? '2d4 unidades' : state.tipoItem === 'polvora' ? '1d4 unidades' : ''
    };
  }

  function linhaTitulo(r) {
    return r.nome + (r.excalibur ? ' [Excalibur]' : '') + (r.mats && r.mats.length ? ' de ' + r.mats.join(' + ') : '');
  }

  function textoResumo(r) {
    var q = Math.max(1, r.qtd || 1);
    var prefixDone = r.feito ? '[✓] ' : '';
    var qPrefix = q > 1 ? q + '× ' : '';
    var valorTotal = (r.valor || 0) * q;
    var horasTotal = r.horas != null ? r.horas * q : null;
    if (r.oficina === 'bombas') {
      var lb = [prefixDone + qPrefix + r.nome];
      lb.push((r.venda ? 'Preço de venda: ' : 'Custo: ') + fmtMoeda(valorTotal) + (r.rende ? ' (' + r.rende + ')' : ''));
      if (horasTotal != null) lb.push('Tempo: ' + fmtHorasForjador(horasTotal));
      if (r.detalhes) lb.push(r.detalhes);
      if (r.receita) lb.push('Receita: ' + r.receita);
      return lb.join('\n');
    }
    if (r.oficina === 'herbalismo') {
      var lh = [prefixDone + qPrefix + r.nome];
      lh.push((r.venda ? 'Preço de venda: ' : 'Custo: ') + fmtMoeda(valorTotal) + (r.rende ? ' (rende ' + r.rende + ')' : ''));
      if (horasTotal != null) lh.push('Tempo: ' + fmt(horasTotal) + 'h');
      if (r.detalhes) lh.push(r.detalhes);
      return lh.join('\n');
    }
    var linhas = [prefixDone + qPrefix + linhaTitulo(r)];
    var prefixo = r.conserto ? 'Custo para consertar: ' : r.venda ? 'Preço de venda: ' : 'Custo para forjar: ';
    linhas.push(prefixo + fmtMoeda(valorTotal) + (r.rende ? ' (rende ' + r.rende + ')' : ''));
    if (horasTotal != null) linhas.push('Tempo do Forjador: ' + fmtHorasForjador(horasTotal));
    var props = [];
    var tags = [r.obra ? 'Obra-Prima' : '', r.pressa ? 'Pressa' : ''].filter(Boolean);
    if (r.mod != null) props.push('Modificador ' + fmtMod(r.mod) + (tags.length ? ' (' + tags.join(', ') + ')' : ''));
    if (r.dureza) props.push('Dureza ' + r.dureza);
    if (r.pesoKg != null) props.push('Peso ' + fmtKg(r.pesoKg));
    if (props.length) linhas.push(props.join(' · '));
    if (r.mods && r.mods.length) linhas.push('Modificações: ' + r.mods.join(', '));
    return linhas.join('\n');
  }

  function copiarTexto(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texto);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = texto;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      if (ok) resolve(); else reject(new Error('copy'));
    });
  }

  var ICON_CHECK = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  function morphBtn(btn, confirmedHtml) {
    if (!btn) return;
    if (!btn._origHtml) btn._origHtml = btn.innerHTML;
    clearTimeout(btn._morphTimer);
    clearTimeout(btn._revertTimer);
    btn.classList.add('is-morphing');
    btn._morphTimer = setTimeout(function () {
      btn.innerHTML = confirmedHtml;
      btn.classList.remove('is-morphing');
      btn.classList.add('is-confirmed');
    }, 95);
    btn._revertTimer = setTimeout(function () {
      btn.classList.add('is-morphing');
      setTimeout(function () {
        btn.innerHTML = btn._origHtml;
        btn.classList.remove('is-morphing', 'is-confirmed');
      }, 95);
    }, 1500);
  }

  var copyBtnEl = document.getElementById('copy-btn');
  copyBtnEl.addEventListener('click', function () {
    var r = resumoAtual();
    if (!r) return;
    copiarTexto(textoResumo(r) + '\n' + SITE_URL).then(function () {
      morphBtn(copyBtnEl, ICON_CHECK + ' Copiado');
      showToast('Resultado copiado. É só colar no chat da mesa.');
    }, function () {
      showToast('Não consegui copiar automaticamente neste navegador.');
    });
  });

  var shareBtnEl = document.getElementById('share-btn');
  if (shareBtnEl) {
    shareBtnEl.addEventListener('click', function () {
      var r = resumoAtual();
      if (!r) return;
      var base = (window.location.protocol === 'http:' || window.location.protocol === 'https:')
        ? window.location.origin + window.location.pathname
        : SITE_URL;
      var url = base + '?s=' + encodeShareState();
      copiarTexto(url).then(function () {
        morphBtn(shareBtnEl, ICON_CHECK + ' Link copiado');
        showToast('Link da receita copiado. Quem abrir vê esta conta preenchida.');
      }, function () {
        showToast('Não consegui copiar o link automaticamente neste navegador.');
      });
    });
  }

  // Lista da sessão (itens salvos, quantidades e totais)
  var LISTA_KEY = 'forjador-lista-v1';
  var listaSection = document.getElementById('lista-section');
  var listaItemsEl = document.getElementById('lista-items');
  var listaTotalEl = document.getElementById('lista-total');
  var lista = [];
  try { lista = JSON.parse(localStorage.getItem(LISTA_KEY) || '[]'); } catch (e) { lista = []; }
  if (!Array.isArray(lista)) lista = [];

  function salvarLista() {
    try { localStorage.setItem(LISTA_KEY, JSON.stringify(lista)); } catch (e) {}
  }
  function totaisLista() {
    var po = 0, horas = 0, semTempo = 0, pendPo = 0, pendHoras = 0, feitos = 0, totalQtd = 0, kg = 0, pendKg = 0;
    lista.forEach(function (r) {
      var q = Math.max(1, r.qtd || 1);
      var v = (r.valor || 0) * q;
      var h = r.horas != null ? r.horas * q : null;
      var w = r.pesoKg != null ? r.pesoKg * q : 0;
      po += v;
      kg += w;
      totalQtd += q;
      if (h != null) horas += h; else semTempo++;
      if (r.feito) {
        feitos++;
      } else {
        pendPo += v;
        pendKg += w;
        if (h != null) pendHoras += h;
      }
    });
    return { po: po, horas: horas, semTempo: semTempo, pendPo: pendPo, pendHoras: pendHoras, feitos: feitos, totalQtd: totalQtd, kg: kg, pendKg: pendKg };
  }

  function renderLista() {
    listaSection.hidden = !lista.length;
    listaItemsEl.innerHTML = '';
    lista.forEach(function (r, idx) {
      var q = Math.max(1, r.qtd || 1);
      var li = document.createElement('li');
      li.className = 'lista-item' + (r.feito ? ' is-done' : '');

      var chk = document.createElement('button');
      chk.type = 'button';
      chk.className = 'li-check';
      chk.innerHTML = ICON_CHECK;
      chk.setAttribute('aria-pressed', r.feito ? 'true' : 'false');
      chk.setAttribute('aria-label', (r.feito ? 'Desmarcar ' : 'Marcar como fabricado: ') + r.nome);
      chk.title = r.feito ? 'Já fabricado (clique para reabrir)' : 'Marcar como fabricado';
      chk.addEventListener('click', function () {
        r.feito = !r.feito;
        salvarLista();
        renderLista();
      });

      var info = document.createElement('div');
      info.className = 'li-info';
      var nome = document.createElement('span');
      nome.className = 'li-nome';
      var ofi = r.oficina || 'forja';
      var tag = document.createElement('span');
      tag.className = 'li-tag li-tag-' + ofi;
      tag.textContent = ofi === 'bombas'
        ? (r.subtipo === 'municao' ? 'Munição' : r.subtipo === 'polvora' ? 'Pólvora' : 'Bomba')
        : ofi === 'herbalismo' ? 'Herbal' : 'Forja';
      nome.appendChild(tag);
      nome.appendChild(document.createTextNode(r.nome + (r.mod != null ? ' ' + fmtMod(r.mod) : '')));
      var sub = document.createElement('span');
      sub.className = 'li-sub';
      if (ofi === 'bombas' || ofi === 'herbalismo') {
        sub.textContent = [r.rende ? 'rende ' + r.rende : '', r.detalhes || ''].filter(Boolean).join(' · ');
      } else {
        sub.textContent = [r.excalibur ? 'Excalibur' : '', (r.mats || []).join(' + '), r.obra ? 'Obra-Prima' : '', r.pressa ? 'Pressa' : '', (r.mods || []).length ? r.mods.length + (r.mods.length === 1 ? ' modificação' : ' modificações') : '', r.rende ? 'rende ' + r.rende : '']
          .filter(Boolean).join(' · ');
      }
      var qtyWrap = document.createElement('div');
      qtyWrap.className = 'li-qty';
      var btnDec = document.createElement('button');
      btnDec.type = 'button';
      btnDec.className = 'li-qty-btn';
      btnDec.textContent = '−';
      btnDec.disabled = q <= 1;
      btnDec.setAttribute('aria-label', 'Diminuir quantidade de ' + r.nome);
      btnDec.addEventListener('click', function () {
        if ((r.qtd || 1) <= 1) return;
        r.qtd = (r.qtd || 1) - 1;
        salvarLista();
        renderLista();
      });
      var qtyVal = document.createElement('span');
      qtyVal.className = 'li-qty-val';
      qtyVal.textContent = q + '×';
      var btnInc = document.createElement('button');
      btnInc.type = 'button';
      btnInc.className = 'li-qty-btn';
      btnInc.textContent = '+';
      btnInc.setAttribute('aria-label', 'Aumentar quantidade de ' + r.nome);
      btnInc.addEventListener('click', function () {
        r.qtd = Math.min(99, (r.qtd || 1) + 1);
        salvarLista();
        renderLista();
      });
      qtyWrap.appendChild(btnDec);
      qtyWrap.appendChild(qtyVal);
      qtyWrap.appendChild(btnInc);
      if (r.snap) {
        var btnOpen = document.createElement('button');
        btnOpen.type = 'button';
        btnOpen.className = 'btn-ghost li-open-btn';
        btnOpen.textContent = 'Abrir';
        btnOpen.title = 'Recarregar este item na calculadora';
        btnOpen.addEventListener('click', function () {
          var parsed = decodeJsonB64(r.snap);
          if (!linkDesteApp(parsed)) return;
          state = Object.assign(JSON.parse(JSON.stringify(DEFAULTS)), parsed);
          saveState();
          hydrateForm();
          window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
          showToast(r.nome + ' carregado na calculadora.');
        });
        qtyWrap.appendChild(btnOpen);
      }

      info.appendChild(nome);
      if (sub.textContent) info.appendChild(sub);
      info.appendChild(qtyWrap);

      var nums = document.createElement('div');
      nums.className = 'li-nums';
      var v = document.createElement('span');
      v.className = 'li-valor';
      v.textContent = fmtMoeda((r.valor || 0) * q) + (r.conserto ? ' (conserto)' : r.venda ? ' (venda)' : '');
      var h = document.createElement('span');
      h.className = 'li-horas';
      h.textContent = r.horas != null ? fmt(r.horas * q) + 'h' : 'tempo: Mestre';
      nums.appendChild(v);
      nums.appendChild(h);
      var rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'btn-remove';
      rm.innerHTML = ICON_X;
      rm.setAttribute('aria-label', 'Tirar ' + r.nome + ' da lista');
      rm.addEventListener('click', function () {
        if (li.classList.contains('is-leaving')) return;
        function doRemoveItem() {
          var removido = lista.splice(idx, 1)[0];
          salvarLista();
          renderLista();
          showToast(removido.nome + ' saiu da lista.', 'Desfazer', function () {
            lista.splice(Math.min(idx, lista.length), 0, removido);
            salvarLista();
            renderLista();
          });
        }
        if (reduceMotion) { doRemoveItem(); return; }
        li.classList.add('is-leaving');
        setTimeout(doRemoveItem, 145);
      });
      li.appendChild(chk);
      li.appendChild(info);
      li.appendChild(nums);
      li.appendChild(rm);
      listaItemsEl.appendChild(li);
    });
    var t = totaisLista();
    var clearDoneBtnEl = document.getElementById('lista-clear-done-btn');
    if (clearDoneBtnEl) clearDoneBtnEl.hidden = t.feitos === 0;
    listaTotalEl.innerHTML = '';
    var tl = document.createElement('span');
    tl.className = 'lt-label';
    tl.textContent = 'Total · ' + t.totalQtd + (t.totalQtd === 1 ? ' item' : ' itens') + (t.kg > 0 ? ' · ' + fmtKg(t.kg) : '');
    var tv = document.createElement('span');
    tv.className = 'lt-valor';
    tv.textContent = fmtMoeda(t.po);
    var th = document.createElement('span');
    th.className = 'lt-horas';
    th.textContent = (t.horas ? fmtHorasForjador(t.horas) + ' de trabalho, um item após o outro' : '') +
      (t.semTempo ? (t.horas ? ' · ' : '') + t.semTempo + ' sem tempo definido' : '');
    listaTotalEl.appendChild(tl);
    listaTotalEl.appendChild(tv);
    if (th.textContent) listaTotalEl.appendChild(th);
    if (t.feitos > 0) {
      var tp = document.createElement('span');
      tp.className = 'lt-pend';
      tp.textContent = t.feitos === lista.length
        ? 'Todos os itens marcados como fabricados.'
        : 'Pendente (' + (lista.length - t.feitos) + '): ' + fmtMoeda(t.pendPo) +
          (t.pendHoras ? ' · ' + fmtHorasForjador(t.pendHoras) : '') +
          (t.pendKg > 0 ? ' · ' + fmtKg(t.pendKg) : '');
      listaTotalEl.appendChild(tp);
    }
  }

  var addListaBtnEl = document.getElementById('add-lista-btn');
  addListaBtnEl.addEventListener('click', function () {
    var r = resumoAtual();
    if (!r) return;
    lista.push(r);
    salvarLista();
    renderLista();
    morphBtn(addListaBtnEl, ICON_CHECK + ' Adicionado');
    var t = totaisLista();
    showToast('Adicionado. Lista: ' + t.totalQtd + (t.totalQtd === 1 ? ' item' : ' itens') + ' · ' + fmtMoeda(t.po) + '.', 'Ver lista', function () {
      listaSection.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }, 5000);
  });

  var listaCopyBtnEl = document.getElementById('lista-copy-btn');
  listaCopyBtnEl.addEventListener('click', function () {
    if (!lista.length) return;
    var t = totaisLista();
    var partes = lista.map(textoResumo);
    partes.push('Total: ' + t.totalQtd + (t.totalQtd === 1 ? ' item' : ' itens') + ' · ' + fmtMoeda(t.po) +
      (t.horas ? ' · ' + fmtHorasForjador(t.horas) : '') +
      (t.kg > 0 ? ' · ' + fmtKg(t.kg) : ''));
    copiarTexto(partes.join('\n\n') + '\n' + SITE_URL).then(function () {
      morphBtn(listaCopyBtnEl, ICON_CHECK + ' Copiada');
      showToast('Lista copiada.');
    }, function () {
      showToast('Não consegui copiar automaticamente neste navegador.');
    });
  });

  var listaShareBtnEl = document.getElementById('lista-share-btn');
  if (listaShareBtnEl) {
    listaShareBtnEl.addEventListener('click', function () {
      if (!lista.length) return;
      var base = (window.location.protocol === 'http:' || window.location.protocol === 'https:')
        ? window.location.origin + window.location.pathname
        : SITE_URL;
      var url = base + '?l=' + encodeJsonB64({ app: APP_ID, v: APP_LINK_V, itens: lista });
      copiarTexto(url).then(function () {
        morphBtn(listaShareBtnEl, ICON_CHECK + ' Link copiado');
        showToast('Link da lista copiado. Quem abrir recebe todos os itens.');
      }, function () {
        showToast('Não consegui copiar o link automaticamente neste navegador.');
      });
    });
  }

  var listaClearDoneBtn = document.getElementById('lista-clear-done-btn');
  if (listaClearDoneBtn) {
    listaClearDoneBtn.addEventListener('click', function () {
      var copia = lista.slice();
      var removidos = lista.filter(function (r) { return r.feito; }).length;
      if (!removidos) return;
      lista = lista.filter(function (r) { return !r.feito; });
      salvarLista();
      renderLista();
      showToast(removidos + (removidos === 1 ? ' item concluído removido.' : ' itens concluídos removidos.'), 'Desfazer', function () {
        lista = copia;
        salvarLista();
        renderLista();
      });
    });
  }

  document.getElementById('lista-clear-btn').addEventListener('click', function () {
    var copia = lista.slice();
    lista = [];
    salvarLista();
    renderLista();
    showToast('Lista limpa.', 'Desfazer', function () {
      lista = copia;
      salvarLista();
      renderLista();
    });
  });

  (function loadSharedLista() {
    var q = window.location.search || '';
    var m = q.match(/[?&]l=([A-Za-z0-9_-]+)/);
    if (!m) return;
    var parsed = decodeJsonB64(m[1]);
    // Links antigos mandavam a lista pura; os novos vêm com app e versão
    var itens = Array.isArray(parsed) ? parsed : (linkDesteApp(parsed) && Array.isArray(parsed.itens) ? parsed.itens : null);
    if (itens) itens = itens.filter(function (r) { return r && typeof r === 'object' && typeof r.nome === 'string'; });
    if (!itens || !itens.length) return;
    var anterior = lista.slice();
    lista = itens;
    salvarLista();
    try {
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch (e) {}
    setTimeout(function () {
      if (anterior.length) {
        showToast('Lista compartilhada carregada (' + lista.length + ' itens).', 'Restaurar anterior', function () {
          lista = anterior;
          salvarLista();
          renderLista();
        }, 6000);
      } else {
        showToast('Lista compartilhada carregada (' + lista.length + ' itens).');
      }
    }, 200);
  })();

  renderLista();
