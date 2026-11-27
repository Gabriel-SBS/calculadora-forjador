  var CATEGORIA_ORDER = ['Metais', 'Vegetais', 'Geológicos', 'Orgânicos'];
  var TIER_ORDER = ['D', 'C', 'B', 'A', 'S'];
  var CATEGORIA_ALIASES = {
    'Metais': ['metal', 'metais'],
    'Vegetais': ['vegetal', 'vegetais', 'madeira'],
    'Geológicos': ['geologico', 'geologicos', 'pedra', 'mineral', 'cristal'],
    'Orgânicos': ['organico', 'organicos']
  };

  var FORJADOR_DIVISOR = 2;
  var ARMADURA_FRACAO = 0.2;
  var DUREZA_RANK = { 'd4': 1, 'd6': 2, 'd8': 3, 'd10': 4, 'd12': 5, 'd20': 6, 'd100': 7, '∞': 8 };
  var TIER_HOURS = { D: 24, C: 24, B: 48, A: 96, S: 192 };
  var COMUM_HORAS_DIA = 8;
  var FORJADOR_HORAS_DIA = 12;
  // "Materiais exóticos e raros do mundo ... tier A e tier S" (p. 128)
  var TIERS_RAROS = { A: 1, S: 1 };

  function materialById(id) {
    for (var i = 0; i < MATERIALS_DB.length; i++) {
      if (MATERIALS_DB[i].id === id) return MATERIALS_DB[i];
    }
    return null;
  }

  function equipByNome(nome) {
    if (!nome) return null;
    for (var i = 0; i < EQUIP_DB.length; i++) if (EQUIP_DB[i].nome === nome) return EQUIP_DB[i];
    return null;
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

  // Armas e armaduras do Guia (munições ficam na oficina de Bombas)
  function searchEquip(q) {
    q = normalizeSearch(q);
    if (!q) return [];
    return EQUIP_DB.filter(function (e) {
      return (e.tipo === 'arma' || e.tipo === 'armadura') && normalizeSearch(e.nome + ' ' + e.grupo).indexOf(q) !== -1;
    });
  }

  function forjaMaxMateriais(s) {
    return s && s.excalibur && s.tipoItem === 'arma' ? 6 : 4;
  }

  function forjaModsSoma(s) {
    return (s.mods || []).reduce(function (t, i) { return t + (MODS_DB[i] ? MODS_DB[i][1] : 0); }, 0);
  }

  // Valor-base efetivo: PDE + modificações (p. 163).
  // PDE negativo conta como zero. O piso de 1 po só vale quando uma modificação
  // reduz o valor (Remoção de Maestria: "mínimo 1 po"); um PDE digitado abaixo
  // de 1 po, como o de uma clava, fica como está.
  function forjaBase(s) {
    var pdeItem = Math.max(0, num(s.pde, 0));
    var mods = forjaModsSoma(s);
    if (s.modExistente) return { valor: Math.max(0, mods), nota: 'só as modificações (item já existe)' };
    var v = pdeItem + mods;
    if (mods < 0 && pdeItem > 0) v = Math.max(Math.min(1, pdeItem), v);
    v = Math.max(0, v);
    return { valor: v, nota: mods ? 'PDE ' + fmt(pdeItem) + ' + modificações ' + fmt(mods) : '' };
  }

  function forjaCalc(s) {
    var base = forjaBase(s);
    var pde = base.valor;
    var sumMat = s.materials.reduce(function (t, m) { return t + Math.max(0, num(m.mult, 0)); }, 0);
    if (s.melhorDosMelhores) sumMat *= 2;
    var desconto = s.artesao ? ARTESAO_DESCONTO : 0;
    var divisor = FORJADOR_DIVISOR;
    var lucro = Math.max(0, num(s.lucro, 0));
    var discFactor = 1 - (desconto / 100);
    var duplo = !!s.artesao && s.artesaoModo !== 'simples';
    var possuidos = !!s.materiaisPossuidos;
    var conserto = s.modo === 'conserto';

    var cheioPadrao = pde * sumMat;
    var usaFracaoFixa = s.tipoItem === 'armadura' && !!s.fracaoFixa;

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
    var mm = s.tipoItem === 'municao' ? MUNICAO_MODS[s.municaoMod] : null;
    if (mm && !conserto) {
      var qtdMun = Math.max(1, Math.floor(num(s.municaoModQtd, 5)));
      var cheioMod = mm[1] * Math.ceil(qtdMun / mm[2]);
      var pagoMod = possuidos ? 0 : cheioMod * discFactor / divisor;
      modMun = { nome: mm[0], custo: mm[1], por: mm[2], qtd: qtdMun, cheio: cheioMod, pago: pagoMod, existente: !!s.municaoModExistente };
      proprio = modMun.existente ? pagoMod : proprio + pagoMod;
    }

    var temMaterialVivo = (s.materials || []).some(function (row) {
      var m = row.materialId ? materialById(row.materialId) : null;
      return !!(m && m.materialVivo);
    });
    var consertoVivo = conserto && temMaterialVivo;
    var consertoCheio = consertoVivo ? 0 : cheio / 2;
    var lucroValor = 0;
    var final = proprio;
    if (conserto) {
      final = consertoVivo ? 0 : proprio / 2;
    } else if (s.modo === 'vendido') {
      lucroValor = proprio * (lucro / 100);
      final = proprio + lucroValor;
    }
    var subiuPara1pc = minimoPc(final) !== final;
    final = minimoPc(final);

    return {
      pde: pde, sumMat: sumMat, desconto: desconto, divisor: divisor, lucro: lucro,
      pdeDesc: pdeDesc, matDesc: matDesc, subtotal: subtotal, proprio: proprio,
      cheio: cheio, cheioPadrao: cheioPadrao, usaFracaoFixa: usaFracaoFixa,
      lucroValor: lucroValor, final: final, possuidos: possuidos, baseNota: base.nota,
      duplo: duplo, modMun: modMun, proprioItem: proprioItem, conserto: conserto,
      consertoCheio: consertoCheio, consertoVivo: consertoVivo, subiuPara1pc: subiuPara1pc
    };
  }

  // Tempo de produção (p. 125, 130 e 171–172)
  function forjaTempo(s) {
    var tipo = s.tipoItem;
    var totalHoras, nota;

    if (tipo === 'municao' && s.municaoModExistente && MUNICAO_MODS[s.municaoMod]) {
      return { semTempo: 'mod-existente' };
    }

    if (tipo === 'polvora') {
      totalHoras = 8;
      nota = 'Pólvora: 8h de base, rende 1d4 unidades (p. 171).';
    } else {
      var tabela = tipo === 'municao' ? MUNICAO_HORAS : TIER_HOURS;
      var tiers = s.materials
        .map(function (m) { return m.tier; })
        .filter(function (t) { return t && tabela[t]; });

      if (!tiers.length) return { semTempo: 'sem-tier' };

      if (s.excalibur && tipo === 'arma') {
        totalHoras = TIER_HOURS.S;
        nota = 'Excalibur (20º nível, p. 128): forjar do zero leva o mesmo tempo de uma arma de um único material Tier S (' + totalHoras + 'h de base), mesmo combinando até 6 materiais.';
      } else {
        totalHoras = tiers.reduce(function (sum, t) { return sum + tabela[t]; }, 0);
        var tiersDesc = tiers.map(function (t) { return 'Tier ' + t + ' = ' + tabela[t] + 'h'; }).join(' + ');
        nota = (tipo === 'municao' ? 'Munições, rendem 2d4 unidades (p. 171). ' : '') +
          'Tempo somado por material, regra de Junção de Materiais (' + tiersDesc + ' = ' + fmt(totalHoras) + 'h de base).';
      }

      if (tipo === 'arma' || tipo === 'armadura') {
        if (s.peso === 'leve') {
          totalHoras = Math.max(0, totalHoras - 8);
          nota += ' Leve: −8h.';
        } else if (s.peso === 'pesado') {
          totalHoras += 8;
          nota += ' Pesado: +8h.';
        }
      }
    }

    var timeFactor = 1;
    var temMaterialRaro = tipo !== 'polvora' && s.materials.some(function (m) { return !!TIERS_RAROS[m.tier]; });
    var usaAuto = !!(s.criacoesAutomaticas && temMaterialRaro);
    if (usaAuto) {
      timeFactor *= 0.5;
      nota += ' Criações Automáticas (p. 130): ÷2 com ajuda da ferramenta automatizada em material raro (Tier A ou S).';
    }
    if (s.pressa) { timeFactor *= 0.5; nota += ' Pressa: ÷2, item sai com −1 no modificador.'; }
    if (tipo === 'municao' && MUNICAO_MODS[s.municaoMod]) nota += ' A modificação de munição não muda o tempo (o Guia não define um tempo para ela).';

    var forjadorHoras = totalHoras * 2 / 3 * timeFactor;
    var comumHoras = totalHoras * timeFactor;
    return {
      semTempo: null, nota: nota, usaAuto: usaAuto, baseHoras: totalHoras,
      forjadorHoras: forjadorHoras, forjadorAjudanteHoras: forjadorHoras / 2,
      comumHoras: comumHoras, comumAjudanteHoras: comumHoras / 2,
      horasEfetivas: s.ajudante ? forjadorHoras / 2 : forjadorHoras
    };
  }

  // Obra-Prima e O Melhor dos Melhores dão o mesmo +1 (até +3) e não somam:
  // o segundo "torna o item uma obra-prima" (p. 128)
  function modFinal(modBase, s) {
    var m = modBase;
    if (s.obraPrima || s.melhorDosMelhores) m = Math.min(3, m + 1);
    if (s.pressa) m -= 1;
    return m;
  }

  function forjaItemProps(s) {
    var known = s.materials
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

    return { dureza: bestDureza, mod: modFinal(bestMod, s), obra: !!(s.obraPrima || s.melhorDosMelhores) };
  }

  function forjaPeso(s) {
    var e = equipByNome(s.equipNome);
    if (!e || e.pesoKg == null) return null;
    var mult = 1;
    var notas = [];
    var forcaPesado = false;
    (s.materials || []).forEach(function (row) {
      var m = row.materialId ? materialById(row.materialId) : null;
      if (!m) return;
      if (m.pesoMult && m.pesoMult !== 1) {
        mult *= m.pesoMult;
        notas.push(m.nome + (m.pesoMult === 0.5 ? ' ÷2' : ' ×2'));
      }
      if (m.forcaPesado) forcaPesado = true;
    });
    var leveMod = (s.mods || []).indexOf(1) !== -1;
    if (leveMod) {
      mult *= 0.75;
      notas.push('Estrutura Leve −25%');
    }
    return { baseKg: e.pesoKg, finalKg: e.pesoKg * mult, mult: mult, leveMod: leveMod, forcaPesado: forcaPesado, notas: notas };
  }

  // Comparador: o mesmo item feito só com um material
  function forjaMaterialUnico(s, mat) {
    var pde = forjaBase(s).valor;
    var sumMat = mat.mult * (s.melhorDosMelhores ? 2 : 1);
    var disc = s.artesao ? (1 - ARTESAO_DESCONTO / 100) : 1;
    var duplo = !!s.artesao && s.artesaoModo !== 'simples';
    var usaFracao = s.tipoItem === 'armadura' && !!s.fracaoFixa;
    var cheio = usaFracao ? pde * ((1 - ARMADURA_FRACAO) + ARMADURA_FRACAO * sumMat) : pde * sumMat;
    var conserto = s.modo === 'conserto';
    var proprio = s.materiaisPossuidos ? 0 : (cheio * disc * (duplo ? disc : 1)) / FORJADOR_DIVISOR;
    if (conserto && !s.materiaisPossuidos) proprio /= 2;
    var lucroPct = Math.max(0, num(s.lucro, 0));
    var final = minimoPc(s.modo === 'vendido' ? proprio * (1 + lucroPct / 100) : proprio);

    var baseHoras = TIER_HOURS[mat.tier] || 24;
    var pesoEfetivo = mat.forcaPesado ? 'pesado' : s.peso;
    var adj = pesoEfetivo === 'leve' ? -8 : pesoEfetivo === 'pesado' ? 8 : 0;
    var horas = Math.max(1, baseHoras + adj) * (2 / 3);
    if (s.criacoesAutomaticas && TIERS_RAROS[mat.tier]) horas /= 2;
    if (s.pressa) horas /= 2;
    if (s.ajudante) horas /= 2;

    var eq = equipByNome(s.equipNome);
    var leveMod = (s.mods || []).indexOf(1) !== -1;
    var pesoKg = eq && eq.pesoKg != null ? eq.pesoKg * (mat.pesoMult || 1) * (leveMod ? 0.75 : 1) : null;

    return { mat: mat, final: final, horas: horas, modNum: modFinal(parseInt(mat.mod, 10) || 0, s), dureza: mat.dureza, pesoKg: pesoKg, forcaPesado: !!mat.forcaPesado };
  }
