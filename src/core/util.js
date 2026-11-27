  var DIACRITICS_RE = new RegExp(String.fromCharCode(0x5b) + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + String.fromCharCode(0x5d), 'g');

  function normalizeSearch(s) {
    return (s || '').toString().normalize('NFD').replace(DIACRITICS_RE, '').toLowerCase().trim();
  }

  function num(v, fallback) {
    var n = parseFloat(v);
    return isFinite(n) ? n : (fallback || 0);
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
    // Menos de 1 PC não vira zero: um item de osso de 1 PC sai a 0,32 PC
    if (!partes.length && isFinite(n) && n !== 0) {
      partes.push([(Math.abs(n) * 100).toLocaleString('pt-BR', { maximumSignificantDigits: 2 }), 'pc']);
      return { neg: n < 0, partes: partes };
    }
    if (!partes.length) partes.push(['0', 'po']);
    return { neg: n < 0 && c > 0, partes: partes };
  }
  // Na tela as siglas vão em maiúsculas (PO, PP, PC); a chave interna continua minúscula
  function fmtMoeda(n) {
    var m = moedas(n);
    return (m.neg ? '−' : '') + m.partes.map(function (p) { return p[0] + ' ' + p[1].toUpperCase(); }).join(' ');
  }
  // Destaca a moeda principal e diminui o resto
  function htmlMoeda(n) {
    var m = moedas(n);
    return m.partes.map(function (p, i) {
      return '<span class="coin' + (i ? ' coin-sm' : '') + '" data-coin="' + p[1] + '"><span class="coin-n">' + (i === 0 && m.neg ? '−' : '') + p[0] + '</span><span class="unit">' + p[1].toUpperCase() + '</span></span>';
    }).join('');
  }

  // Não existe moeda menor que 1 PC: custo acima de zero e abaixo disso vira 1 PC
  var MENOR_VALOR_PO = 0.01;
  function minimoPc(v) { return v > 0 && v < MENOR_VALOR_PO ? MENOR_VALOR_PO : v; }

  // Campos de preço aceitam PO, PP ou PC; a conta e o estado ficam sempre em PO
  var MOEDA_POR_PO = { po: 1, pp: 10, pc: 100 };
  var MOEDA_PASSO = { po: '0.01', pp: '0.1', pc: '1' };

  function moedaValida(m) { return MOEDA_POR_PO[m] ? m : 'po'; }
  // O arredondamento só tira o ruído do ponto flutuante (0,07 × 100 = 7,000000000000001)
  function paraPo(valor, moeda) { return Math.round(valor / MOEDA_POR_PO[moedaValida(moeda)] * 1e8) / 1e8; }
  function dePo(po, moeda) { return Math.round(po * MOEDA_POR_PO[moedaValida(moeda)] * 1e8) / 1e8; }

  function fmtKg(kg) {
    if (kg == null || !isFinite(kg)) return '';
    var rounded = Math.round(kg * 100) / 100;
    return rounded.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' kg';
  }

  function fmtTempo(horas, horasPorDia) {
    var dias = Math.ceil(horas / horasPorDia);
    return fmt(horas) + 'h (' + dias + (dias === 1 ? ' dia' : ' dias') + ')';
  }

  // Links ?s= e ?l= levam app e versão: quando o Forjador e o Cozinheiro morarem
  // no mesmo site, um não carrega por engano o link do outro.
  var APP_ID = 'forjador';
  var APP_LINK_V = 1;

  function encodeJsonB64(obj) {
    var json = JSON.stringify(obj);
    var bytes = unescape(encodeURIComponent(json));
    return btoa(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decodeJsonB64(str) {
    try {
      var b64 = String(str).replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      return JSON.parse(decodeURIComponent(escape(atob(b64))));
    } catch (e) { return null; }
  }
  // Links antigos (sem app) continuam valendo; links de outro app são recusados
  function linkDesteApp(obj) {
    return !!obj && typeof obj === 'object' && (obj.app == null || obj.app === APP_ID);
  }
