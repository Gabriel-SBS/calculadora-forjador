  function herbalById(id) {
    if (!id) return null;
    for (var i = 0; i < HERBAL_DB.length; i++) if (HERBAL_DB[i].id === id) return HERBAL_DB[i];
    return null;
  }

  function herbalCalc(s) {
    var h = herbalById(s.herbalId);
    if (!h) return null;
    var qtd = Math.max(1, Math.floor(num(s.herbalQtd, 1)));
    var ramosUnit = h.ramos.reduce(function (t, rm) {
      var pUnit = rm.precoUnit != null ? rm.precoUnit : (RAMOS_MAP[rm.id] ? RAMOS_MAP[rm.id].preco : 5);
      return t + pUnit * rm.qtd;
    }, 0);
    var extraUnit = h.extraCusto || 0;
    var custoRamosCheio = (ramosUnit + extraUnit) * qtd;
    var precoLojaTotal = h.preco * qtd;
    var disc = s.herbalArtesao ? (1 - ARTESAO_DESCONTO / 100) : 1;

    var proprio = 0;
    if (s.herbalOrigem === 'comprar-ramos') {
      proprio = custoRamosCheio * disc;
    } else if (s.herbalOrigem === 'forragear') {
      proprio = extraUnit * qtd * disc;
    } else {
      proprio = precoLojaTotal * disc;
    }
    var lucroPct = Math.max(0, num(s.herbalLucro, 50));
    var baseVenda = proprio > 0 ? proprio : custoRamosCheio * disc;
    var lucroValor = s.herbalModo === 'vendido' ? baseVenda * (lucroPct / 100) : 0;
    var final = s.herbalModo === 'vendido' ? baseVenda + lucroValor : proprio;
    var horas = s.herbalOrigem === 'comprar-pronto' ? 0 : qtd * (s.herbalAjudante ? 0.5 : 1);
    return {
      h: h, qtd: qtd, ramosUnit: ramosUnit, extraUnit: extraUnit,
      custoRamosCheio: custoRamosCheio, precoLojaTotal: precoLojaTotal,
      disc: disc, proprio: proprio, baseVenda: baseVenda, lucroPct: lucroPct, lucroValor: lucroValor,
      final: minimoPc(final), subiuPara1pc: minimoPc(final) !== final, horas: horas
    };
  }
