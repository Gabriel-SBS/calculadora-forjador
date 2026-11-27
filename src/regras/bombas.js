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

  function bmDescontos(s) {
    return {
      discFactor: s.bombaArtesao ? (1 - ARTESAO_DESCONTO / 100) : 1,
      duplo: !!s.bombaArtesao && s.artesaoModo !== 'simples',
      divisor: s.bombaForjador ? FORJADOR_DIVISOR : 1
    };
  }
  function bmVenda(s, proprio) {
    var lucroPct = Math.max(0, num(s.bombaLucro, 50));
    var lucroValor = s.bombaModo === 'vendido' ? proprio * (lucroPct / 100) : 0;
    var final = proprio + lucroValor;
    return { lucroPct: lucroPct, lucroValor: lucroValor, final: minimoPc(final), subiuPara1pc: minimoPc(final) !== final };
  }

  function bombaCalc(s) {
    var b = bombaById(s.bombaId);
    if (!b) return null;
    var p = polvoraBombaById(s.bombaPolvora) || POLVORAS_BOMBA_DB[0];
    var isBombinha = s.bombaFormato === 'bombinha';
    var qtd = Math.max(1, Math.floor(num(s.bombaQtd, 1)));
    var cargasEfetivas = isBombinha ? 1 : b.cargas;
    var extraPolvoraUnit = p.id === 'negra' ? 0 : Math.max(0, (p.preco - 5) * cargasEfetivas);
    var polvoraBloqueada = isBombinha && p.id !== 'negra' &&
      !(b.id === 'fumaca' && p.id === 'fumegante') &&
      !(b.id === 'polvora');
    if (polvoraBloqueada) extraPolvoraUnit = 0;

    var precoUnitCheio = b.preco + extraPolvoraUnit;
    var cheioTotal = precoUnitCheio * qtd;

    var d = bmDescontos(s);
    var proprio = s.bombaPossuidos ? 0 : (cheioTotal * d.discFactor * (d.duplo ? d.discFactor : 1)) / d.divisor;
    var v = bmVenda(s, proprio);

    var des = Math.floor(num(s.bombaDes, 0));
    var bp = Math.max(2, Math.floor(num(s.bombaBp, 2)));
    var cdDetonacao = 8 + des + (s.bombaMestre ? bp : 0);

    return {
      b: b, p: p, isBombinha: isBombinha, qtd: qtd,
      cargasEfetivas: cargasEfetivas, extraPolvoraUnit: extraPolvoraUnit, polvoraBloqueada: polvoraBloqueada,
      cheioTotal: cheioTotal, proprio: proprio, lucroPct: v.lucroPct, lucroValor: v.lucroValor, final: v.final, subiuPara1pc: v.subiuPara1pc,
      discFactor: d.discFactor, duplo: d.duplo, divisor: d.divisor, cdDetonacao: cdDetonacao
    };
  }

  // Munição: preço de 4 unidades × material, rende 2d4 (p. 171)
  function municaoCalc(s) {
    var mat = s.bmMunMatId ? materialById(s.bmMunMatId) : null;
    var mm = MUNICAO_MODS[s.bmMunMod] || null;
    if (!mat && !(mm && s.bmMunModExistente)) return null;
    var pdeUnit = Math.max(0, num(s.bmMunPde, 0));
    var pdeLote = pdeUnit * 4;
    var cheioBase = mat ? pdeLote * mat.mult : 0;

    var d = bmDescontos(s);
    var proprioBase = s.bombaPossuidos ? 0 : (cheioBase * d.discFactor * (d.duplo ? d.discFactor : 1)) / d.divisor;

    var modMun = null;
    var proprio = proprioBase;
    if (mm) {
      var q = Math.max(1, Math.floor(num(s.bmMunModQtd, 5)));
      var cheioMod = mm[1] * Math.ceil(q / mm[2]);
      var pagoMod = s.bombaPossuidos ? 0 : (cheioMod * d.discFactor) / d.divisor;
      modMun = { nome: mm[0], custo: mm[1], por: mm[2], qtd: q, cheio: cheioMod, pago: pagoMod, existente: !!s.bmMunModExistente };
      proprio = modMun.existente ? pagoMod : proprioBase + pagoMod;
    }

    var cheioTotal = modMun ? (modMun.existente ? modMun.cheio : cheioBase + modMun.cheio) : cheioBase;
    var v = bmVenda(s, proprio);

    var horasBase = mat ? (MUNICAO_HORAS[mat.tier] || 1) : 1;
    var horas = modMun && modMun.existente
      ? null
      : horasBase * (s.bombaForjador ? 2 / 3 : 1) * (s.bmPressa ? 0.5 : 1) * (s.bmAjudante ? 0.5 : 1);

    var modNum = mat ? (parseInt(mat.mod, 10) || 0) : 0;
    if (s.bmObra) modNum = Math.min(3, modNum + 1);
    if (s.bmPressa) modNum -= 1;

    return {
      mat: mat, pdeUnit: pdeUnit, pdeLote: pdeLote, cheioBase: cheioBase, cheioTotal: cheioTotal,
      proprioBase: proprioBase, proprio: proprio, modMun: modMun,
      lucroPct: v.lucroPct, lucroValor: v.lucroValor, final: v.final, subiuPara1pc: v.subiuPara1pc,
      discFactor: d.discFactor, duplo: d.duplo, divisor: d.divisor,
      horasBase: horasBase, horas: horas, modNum: modNum
    };
  }

  // Pólvora: custa 2 unidades e rende 1d4 cargas em 8h base (p. 171)
  function polvoraCalc(s) {
    var p = polvoraBombaById(s.bmPolvId);
    if (!p) return null;
    var qtd = Math.max(1, Math.floor(num(s.bmPolvQtd, 1)));
    var cheioTotal = p.preco * 2 * qtd;
    var d = bmDescontos(s);
    var proprio = s.bombaPossuidos ? 0 : (cheioTotal * d.discFactor * (d.duplo ? d.discFactor : 1)) / d.divisor;
    var v = bmVenda(s, proprio);
    var horas = 8 * qtd * (s.bombaForjador ? 2 / 3 : 1) * (s.bmPressa ? 0.5 : 1) * (s.bmAjudante ? 0.5 : 1);
    return {
      p: p, qtd: qtd, cheioTotal: cheioTotal, proprio: proprio,
      lucroPct: v.lucroPct, lucroValor: v.lucroValor, final: v.final, subiuPara1pc: v.subiuPara1pc,
      discFactor: d.discFactor, duplo: d.duplo, divisor: d.divisor, horas: horas
    };
  }
