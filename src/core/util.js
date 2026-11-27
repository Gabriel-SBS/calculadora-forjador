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
