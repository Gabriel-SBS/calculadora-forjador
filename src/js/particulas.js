(function () {
  'use strict';
  var canvas = document.getElementById('embers');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  var embers = [], sparks = [], motes = [];
  var t = 0, last = 0, running = false, loopId = 0;

  var FORJA_KEY = 'forjador-modo-forja';
  var enabled = false;
  try { enabled = localStorage.getItem(FORJA_KEY) === '1'; } catch (err) {}
  var forjaSwitch = document.getElementById('forja-switch');

  function isDark() {
    var forced = document.documentElement.getAttribute('data-theme');
    if (forced) return forced === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // Cor por temperatura em cada aba (1 = quente, 0 = apagado)
  var RAMPS = {
    forja: [
      [0.00, 70, 14, 6],
      [0.20, 150, 30, 8],
      [0.42, 225, 70, 14],
      [0.62, 255, 128, 30],
      [0.80, 255, 186, 82],
      [0.92, 255, 226, 160],
      [1.00, 255, 248, 228]
    ],
    bombas: [
      [0.00, 72, 12, 16],
      [0.22, 165, 28, 32],
      [0.45, 226, 62, 48],
      [0.68, 255, 124, 52],
      [0.84, 255, 198, 92],
      [0.94, 255, 232, 168],
      [1.00, 255, 250, 234]
    ],
    herbalismo: [
      [0.00, 24, 58, 34],
      [0.25, 44, 118, 66],
      [0.50, 76, 166, 98],
      [0.72, 134, 208, 126],
      [0.88, 194, 236, 156],
      [0.96, 228, 248, 196],
      [1.00, 248, 255, 232]
    ]
  };
  var RAMP = RAMPS.forja;
  function rampColor(k, ramp) {
    var r = ramp || RAMP;
    k = Math.max(0, Math.min(1, k));
    for (var i = 1; i < r.length; i++) {
      if (k <= r[i][0]) {
        var a = r[i - 1], b = r[i], f = (k - a[0]) / (b[0] - a[0]);
        return [a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f, a[3] + (b[3] - a[3]) * f];
      }
    }
    return r[r.length - 1].slice(1);
  }
  function rgba(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a.toFixed(3) + ')'; }

  // Halos pré-renderizados por faixa de temperatura (muito mais leve que shadowBlur)
  var LEVELS = 24;
  function makeHalo(c, soft) {
    var s = document.createElement('canvas');
    s.width = s.height = 64;
    var g = s.getContext('2d');
    var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    if (soft) {
      // bokeh: disco desfocado com borda levemente mais clara
      grd.addColorStop(0, rgba(c, .55));
      grd.addColorStop(0.7, rgba(c, .45));
      grd.addColorStop(0.86, rgba(c, .5));
      grd.addColorStop(1, rgba(c, 0));
    } else {
      grd.addColorStop(0, rgba(c, .9));
      grd.addColorStop(0.12, rgba(c, .55));
      grd.addColorStop(0.35, rgba(c, .16));
      grd.addColorStop(1, rgba(c, 0));
    }
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return s;
  }
  var PALETTE_CACHE = {};
  var HALOS = [], BOKEH = [];
  var activeOficina = document.documentElement.getAttribute('data-oficina') || 'forja';
  var leaves = [], smokes = [], glows = [], glowCooldown = 0.4, grains = [], microSparks = [], wisps = [];

  // Névoa e grãos de pólvora (aba Bombas)
  function spawnGlow(initial) {
    var side = Math.random() < 0.78;
    var gx = side
      ? (Math.random() < 0.5 ? W * (0.04 + Math.random() * 0.22) : W * (0.74 + Math.random() * 0.22))
      : W * (0.24 + Math.random() * 0.52);
    var gy = H * (0.16 + Math.random() * 0.68);
    glows.push({
      x: gx, y: gy,
      r: 140 + Math.random() * 170,
      life: initial ? Math.random() * 0.5 : 0,
      speed: 0.32 + Math.random() * 0.26, // ~2-3s por ciclo
      amber: Math.random() < 0.45
    });
  }

  function spawnGrain(anywhere) {
    return {
      x: anywhere ? Math.random() * W : Math.random() * (W + 120) - 60,
      y: anywhere ? Math.random() * H : -10 - Math.random() * 40,
      vx: 7 + Math.random() * 14,
      vy: 16 + Math.random() * 26,
      r: 1.2 + Math.random() * 1.9,
      metallic: Math.random() < 0.28,
      sway: Math.random() * Math.PI * 2,
      igniteTimer: 1.2 + Math.random() * 6.4,
      igniting: 0
    };
  }

  var LEAF_COLORS_LIGHT = [
    [54, 118, 72],
    [78, 140, 82],
    [106, 152, 76],
    [42, 96, 62],
    [146, 134, 64]
  ];
  var LEAF_COLORS_DARK = [
    [98, 178, 122],
    [126, 196, 134],
    [152, 206, 118],
    [76, 148, 102],
    [194, 182, 102]
  ];

  function spawnLeaf(anywhere) {
    var z = 0.45 + Math.random() * 0.65;
    return {
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : -20 - Math.random() * 60,
      z: z,
      size: (7 + Math.random() * 9) * z,
      vy: (24 + Math.random() * 34) * z,
      swayAmp: (18 + Math.random() * 34) * z,
      swayFreq: 0.9 + Math.random() * 1.1,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 1.4,
      flip: Math.random() * Math.PI * 2,
      flipSpeed: 1.2 + Math.random() * 1.8,
      colorIdx: Math.floor(Math.random() * LEAF_COLORS_LIGHT.length),
      seed: Math.random() * 1000,
      life: anywhere ? Math.random() * 5 : 0
    };
  }

  function spawnSmoke(anywhere) {
    var z = 0.45 + Math.random() * 0.65;
    return {
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : H + 50 + Math.random() * 90,
      vx: (Math.random() - 0.5) * 14,
      vy: -(18 + Math.random() * 24) * z,
      r: (42 + Math.random() * 58) * z,
      grow: 5 + Math.random() * 7,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.35,
      a: 0.055 + Math.random() * 0.06,
      seed: Math.random() * 1000,
      life: anywhere ? Math.random() * 4 : 0,
      maxLife: 8 + Math.random() * 6
    };
  }

  function makeSmokePuff(rgb) {
    // 5 círculos sobrepostos pra imitar fumaça
    var s = document.createElement('canvas');
    s.width = s.height = 128;
    var g = s.getContext('2d');
    var lobes = [
      [64, 64, 44, 0.55],
      [44, 58, 34, 0.42],
      [84, 60, 34, 0.42],
      [58, 44, 30, 0.38],
      [70, 82, 32, 0.36]
    ];
    for (var i = 0; i < lobes.length; i++) {
      var lb = lobes[i];
      var grd = g.createRadialGradient(lb[0], lb[1], 0, lb[0], lb[1], lb[2]);
      grd.addColorStop(0, rgba(rgb, lb[3]));
      grd.addColorStop(0.55, rgba(rgb, lb[3] * 0.42));
      grd.addColorStop(1, rgba(rgb, 0));
      g.fillStyle = grd;
      g.beginPath();
      g.arc(lb[0], lb[1], lb[2], 0, Math.PI * 2);
      g.fill();
    }
    return s;
  }
  var SMOKE_DARK = makeSmokePuff([164, 156, 168]);
  var SMOKE_LIGHT = makeSmokePuff([64, 54, 58]);

  function applyParticlePalette(ofi) {
    var key = RAMPS[ofi] ? ofi : 'forja';
    activeOficina = key;
    RAMP = RAMPS[key];
    if (!PALETTE_CACHE[key]) {
      var hs = [], bs = [];
      for (var li = 0; li < LEVELS; li++) {
        var col = rampColor(li / (LEVELS - 1), RAMP);
        hs.push(makeHalo(col, false));
        bs.push(makeHalo(col, true));
      }
      PALETTE_CACHE[key] = { halos: hs, bokeh: bs };
    }
    HALOS = PALETTE_CACHE[key].halos;
    BOKEH = PALETTE_CACHE[key].bokeh;
    if (enabled && W && H) {
      sparks.length = 0;
      glows.length = 0;
      microSparks.length = 0;
      wisps.length = 0;
      resize();
      if (key === 'bombas') { spawnGlow(true); spawnGlow(true); }
      if (reduce) draw();
    }
  }
  applyParticlePalette(activeOficina);
  window.addEventListener('oficina-change', function (ev) {
    applyParticlePalette((ev && ev.detail && ev.detail.oficina) || 'forja');
  });
  var VIOLET = makeHalo([200, 160, 255], false);
  function lvl(k) { return Math.max(0, Math.min(LEVELS - 1, Math.round(k * (LEVELS - 1)))); }

  // Turbulência com soma de senoides
  function flowX(x, y, time) {
    return Math.sin(y * 0.011 + time * 0.9) * 0.6 + Math.sin(y * 0.027 - time * 1.7 + x * 0.004) * 0.4;
  }
  function flowY(x, y, time) {
    return Math.cos(x * 0.013 - time * 0.7) * 0.5 + Math.sin(x * 0.031 + time * 1.3) * 0.3;
  }
  function gust(time) {
    return Math.sin(time * 0.21) * 0.55 + Math.sin(time * 0.067 + 1.7) * 0.35 + Math.sin(time * 0.53) * 0.1;
  }

  // Partículas
  function spawnEmber(anywhere) {
    var z = 0.35 + Math.random() * 0.65;          // profundidade: 1 = perto
    var big = Math.random() < 0.12;
    return {
      x: Math.random() * W,
      y: anywhere ? H * (0.25 + Math.random() * 0.8) : H + 10 + Math.random() * 40,
      px: 0, py: 0,
      vx: (Math.random() - 0.5) * 20,
      vy: -(40 + Math.random() * 70) * z,
      z: z,
      r: (big ? 1.6 + Math.random() * 1.2 : 0.6 + Math.random() * 1.1) * (0.6 + z * 0.6),
      temp: 0.75 + Math.random() * 0.25,
      cool: 0.05 + Math.random() * 0.09,        // perda de temperatura por segundo
      buoy: 30 + Math.random() * 40,
      seed: Math.random() * 1000,
      flick: 6 + Math.random() * 14,
      tumble: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 6,
      life: anywhere ? Math.random() * 3 : 0
    };
  }
  function spawnMote() {
    // brasas maiores e desfocadas em primeiro plano
    return {
      x: Math.random() * W,
      y: H + 60 + Math.random() * H * 0.5,
      vx: (Math.random() - 0.5) * 8,
      vy: -(10 + Math.random() * 16),
      r: 18 + Math.random() * 34,
      temp: 0.62 + Math.random() * 0.28,
      seed: Math.random() * 1000,
      a: 0.04 + Math.random() * 0.05
    };
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var target = Math.round(Math.min(90, Math.max(28, W * H / 18000)));
    while (embers.length < target) embers.push(spawnEmber(true));
    if (embers.length > target) embers.length = target;
    var mt = W < 600 ? 3 : 6;
    while (motes.length < mt) { var m = spawnMote(); m.y = Math.random() * H; motes.push(m); }
    if (motes.length > mt) motes.length = mt;
    var lt = Math.round(Math.min(68, Math.max(28, W * H / 21000)));
    while (leaves.length < lt) leaves.push(spawnLeaf(true));
    if (leaves.length > lt) leaves.length = lt;
    var st = W < 600 ? 12 : 22;
    while (smokes.length < st) smokes.push(spawnSmoke(true));
    if (smokes.length > st) smokes.length = st;
    var gt = Math.round(Math.min(62, Math.max(28, W * H / 26000)));
    while (grains.length < gt) grains.push(spawnGrain(true));
    if (grains.length > gt) grains.length = gt;
    if (activeOficina === 'bombas' && !glows.length) {
      spawnGlow(true);
      spawnGlow(true);
    }
  }

  function burst(x, y, n, color) {
    if (!enabled || reduce) return;
    for (var i = 0; i < (n || 26); i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      var sp = 140 + Math.random() * 320;
      sparks.push({
        x: x, y: y, px: x, py: y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 0, maxLife: 0.45 + Math.random() * 0.75,
        r: 0.6 + Math.random() * 1.1,
        violet: color === 'purple' && Math.random() < 0.6
      });
    }
    if (!running) start();
  }

  // Simulação
  function step(dt) {
    t += dt;
    var g = gust(t);

    if (activeOficina === 'herbalismo') {
      // Folhas caindo com balanço lateral
      var wind = 10 + g * 18;
      for (var li = 0; li < leaves.length; li++) {
        var lf = leaves[li];
        lf.life += dt;
        var sway = Math.cos(lf.life * lf.swayFreq + lf.seed) * lf.swayAmp;
        lf.x += (sway + wind * lf.z) * dt;
        lf.y += (lf.vy + Math.sin(lf.life * lf.swayFreq * 2 + lf.seed) * 6) * dt;
        lf.rot += (lf.spin + sway * 0.015) * dt;
        lf.flip += lf.flipSpeed * dt;
        if (lf.y > H + 30 || lf.x > W + 60 || lf.x < -60) leaves[li] = spawnLeaf(false);
      }
      return;
    }

    if (activeOficina === 'bombas') {
      // Névoa de pólvora e grãos acendendo
      glowCooldown -= dt;
      if (glowCooldown <= 0 && glows.length < 3) {
        spawnGlow(false);
        glowCooldown = 0.9 + Math.random() * 1.25;
      }
      for (var gl = glows.length - 1; gl >= 0; gl--) {
        glows[gl].life += glows[gl].speed * dt;
        if (glows[gl].life >= 1) glows.splice(gl, 1);
      }

      for (var si = 0; si < smokes.length; si++) {
        var sm = smokes[si];
        sm.life += dt;
        sm.x += (sm.vx + g * 10 + Math.sin(t * 0.4 + sm.seed) * 10) * dt;
        sm.y += sm.vy * dt;
        sm.r += sm.grow * dt;
        sm.rot += sm.spin * dt;
        if (sm.life > sm.maxLife || sm.y < -sm.r * 2) smokes[si] = spawnSmoke(false);
      }

      for (var wi = wisps.length - 1; wi >= 0; wi--) {
        var ws = wisps[wi];
        ws.x += ws.vx * dt;
        ws.y += ws.vy * dt;
        ws.r += 12 * dt;
        ws.life += 1.05 * dt;
        if (ws.life >= 1) wisps.splice(wi, 1);
      }

      for (var gi = 0; gi < grains.length; gi++) {
        var gr = grains[gi];
        gr.sway += 1.1 * dt;
        gr.x += (gr.vx + Math.sin(gr.sway) * 11) * dt;
        gr.y += gr.vy * dt;
        gr.igniteTimer -= dt;

        if (gr.igniting > 0) {
          gr.igniting += dt;
          if (gr.igniting >= 0.27) {
            wisps.push({
              x: gr.x, y: gr.y,
              vx: (Math.random() - 0.5) * 11,
              vy: -(20 + Math.random() * 16),
              r: 7, life: 0
            });
            grains[gi] = spawnGrain(false);
          }
          continue;
        }

        if (gr.igniteTimer <= 0 && gr.y > H * 0.1 && gr.y < H * 0.88 && gr.x > 30 && gr.x < W - 30) {
          gr.igniting = 0.001;
          for (var ms = 0; ms < 3; ms++) {
            var ma = Math.random() * Math.PI * 2;
            var mv = 54 + Math.random() * 88;
            microSparks.push({
              x: gr.x, y: gr.y,
              vx: Math.cos(ma) * mv, vy: Math.sin(ma) * mv,
              life: 0, maxLife: 0.25 + Math.random() * 0.18
            });
          }
          continue;
        }
        if (gr.y > H + 12 || gr.x > W + 40) grains[gi] = spawnGrain(false);
      }

      for (var mi = microSparks.length - 1; mi >= 0; mi--) {
        var ms2 = microSparks[mi];
        ms2.x += ms2.vx * dt;
        ms2.y += ms2.vy * dt;
        ms2.vy += 140 * dt;
        ms2.life += dt;
        if (ms2.life >= ms2.maxLife) microSparks.splice(mi, 1);
      }

      // Faíscas ao escolher item raro (Forja.sparksAt)
      for (var sj = sparks.length - 1; sj >= 0; sj--) {
        var spk = sparks[sj];
        spk.px = spk.x; spk.py = spk.y;
        spk.life += dt;
        spk.vy += 520 * dt;
        spk.vx *= Math.pow(0.18, dt);
        spk.vy *= Math.pow(0.5, dt);
        spk.x += spk.vx * dt;
        spk.y += spk.vy * dt;
        if (spk.life > spk.maxLife) sparks.splice(sj, 1);
      }
      return;
    }

    // Forja: brasas subindo, bokeh e faíscas
    for (var i = 0; i < embers.length; i++) {
      var e = embers[i];
      e.px = e.x; e.py = e.y;
      e.life += dt;
      // empuxo diminui conforme esfria; turbulência mais forte em brasas leves
      var lift = e.buoy * (0.35 + e.temp);
      var fx = flowX(e.x, e.y, t + e.seed) * 90 + (18 + g * 34);
      var fy = flowY(e.x, e.y, t + e.seed) * 40 - lift;
      e.vx += (fx * e.z - e.vx) * Math.min(1, dt * 1.6);
      e.vy += (fy * e.z - e.vy) * Math.min(1, dt * 1.2);
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.tumble += e.spin * dt;
      e.temp -= e.cool * dt;
      if (e.temp <= 0.02 || e.y < -30 || e.x > W + 40 || e.x < -40) embers[i] = spawnEmber(false);
    }
    for (var m = 0; m < motes.length; m++) {
      var o = motes[m];
      o.x += (o.vx + (14 + g * 18) * 0.4 + Math.sin(t * 0.4 + o.seed) * 6) * dt;
      o.y += o.vy * dt;
      if (o.y < -o.r * 2 || o.x > W + o.r * 2) motes[m] = spawnMote();
    }
    for (var j = sparks.length - 1; j >= 0; j--) {
      var s = sparks[j];
      s.px = s.x; s.py = s.y;
      s.life += dt;
      s.vy += 520 * dt;          // gravidade
      s.vx *= Math.pow(0.18, dt); // arrasto do ar
      s.vy *= Math.pow(0.5, dt);
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      if (s.life > s.maxLife) sparks.splice(j, 1);
    }
  }

  // Desenho
  function drawLeaf(lf, dark) {
    var palette = dark ? LEAF_COLORS_DARK : LEAF_COLORS_LIGHT;
    var col = palette[lf.colorIdx];
    var fadeIn = Math.min(1, lf.life * 1.4);
    var fadeOut = lf.y > H - 90 ? Math.max(0, (H + 20 - lf.y) / 110) : 1;
    var alpha = fadeIn * fadeOut * (dark ? 0.34 : 0.42) * (0.55 + lf.z * 0.45);
    if (alpha <= 0.01) return;

    var s = lf.size;
    ctx.save();
    ctx.translate(lf.x, lf.y);
    ctx.rotate(lf.rot);
    ctx.scale(1, 0.32 + 0.68 * Math.abs(Math.cos(lf.flip)));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = rgba(col, 1);
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(s * 0.72, -s * 0.15, 0, s);
    ctx.quadraticCurveTo(-s * 0.72, -s * 0.15, 0, -s);
    ctx.fill();

    // nervura central
    ctx.globalAlpha = alpha * 0.55;
    ctx.strokeStyle = dark ? 'rgba(220,245,215,0.7)' : 'rgba(255,252,240,0.65)';
    ctx.lineWidth = Math.max(0.6, s * 0.07);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.75);
    ctx.lineTo(0, s * 1.15);
    ctx.stroke();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var dark = isDark();
    ctx.lineCap = 'round';

    if (activeOficina === 'herbalismo') {
      ctx.globalCompositeOperation = 'source-over';
      for (var li = 0; li < leaves.length; li++) drawLeaf(leaves[li], dark);
      ctx.globalAlpha = 1;
      return;
    }

    if (activeOficina === 'bombas') {
      // Clarões atrás da névoa
      for (var gl = 0; gl < glows.length; gl++) {
        var cw = glows[gl];
        var env = Math.sin(cw.life * Math.PI) * Math.pow(1 - cw.life, 0.42);
        var rad = cw.r * (0.72 + cw.life * 0.45);
        ctx.save();
        ctx.globalCompositeOperation = dark ? 'source-over' : 'multiply';
        var grad = ctx.createRadialGradient(cw.x, cw.y, 0, cw.x, cw.y, rad);
        if (dark) {
          var da = env * 0.32;
          if (cw.amber) {
            grad.addColorStop(0, 'rgba(255,184,82,' + da.toFixed(4) + ')');
            grad.addColorStop(0.45, 'rgba(220,76,42,' + (da * 0.5).toFixed(4) + ')');
            grad.addColorStop(1, 'rgba(220,76,42,0)');
          } else {
            grad.addColorStop(0, 'rgba(236,72,56,' + da.toFixed(4) + ')');
            grad.addColorStop(0.5, 'rgba(156,32,36,' + (da * 0.45).toFixed(4) + ')');
            grad.addColorStop(1, 'rgba(156,32,36,0)');
          }
        } else {
          var la = env * 0.34;
          if (cw.amber) {
            grad.addColorStop(0, 'rgba(208,78,18,' + la.toFixed(4) + ')');
            grad.addColorStop(0.45, 'rgba(180,44,24,' + (la * 0.55).toFixed(4) + ')');
            grad.addColorStop(1, 'rgba(180,44,24,0)');
          } else {
            grad.addColorStop(0, 'rgba(176,26,32,' + la.toFixed(4) + ')');
            grad.addColorStop(0.48, 'rgba(138,24,30,' + (la * 0.5).toFixed(4) + ')');
            grad.addColorStop(1, 'rgba(138,24,30,0)');
          }
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cw.x, cw.y, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Névoa girando
      ctx.globalCompositeOperation = dark ? 'source-over' : 'multiply';
      var smokeImg = dark ? SMOKE_DARK : SMOKE_LIGHT;
      for (var si = 0; si < smokes.length; si++) {
        var sm = smokes[si];
        var fIn = Math.min(1, sm.life / 1.6);
        var fOut = Math.max(0, 1 - sm.life / sm.maxLife);
        ctx.save();
        ctx.translate(sm.x, sm.y);
        ctx.rotate(sm.rot);
        ctx.globalAlpha = sm.a * fIn * fOut * (dark ? 1.55 : 2.1);
        ctx.drawImage(smokeImg, -sm.r * 1.25, -sm.r * 1.25, sm.r * 2.5, sm.r * 2.5);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      // Rastro de fumaça dos grãos
      for (var wi = 0; wi < wisps.length; wi++) {
        var ws = wisps[wi];
        var wa = Math.sin(ws.life * Math.PI) * (dark ? 0.18 : 0.26);
        var wg = ctx.createRadialGradient(ws.x, ws.y, 0, ws.x, ws.y, ws.r);
        var wrgb = dark ? '176,168,178' : '58,48,52';
        wg.addColorStop(0, 'rgba(' + wrgb + ',' + wa.toFixed(4) + ')');
        wg.addColorStop(1, 'rgba(' + wrgb + ',0)');
        ctx.fillStyle = wg;
        ctx.beginPath();
        ctx.arc(ws.x, ws.y, ws.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Grãos acendendo
      for (var gi = 0; gi < grains.length; gi++) {
        var gr = grains[gi];
        if (gr.igniting > 0) {
          var p4 = Math.min(1, gr.igniting / 0.27);
          var fa = Math.sin(p4 * Math.PI);
          var fr = 8 + p4 * 15;
          var fg = ctx.createRadialGradient(gr.x, gr.y, 0, gr.x, gr.y, fr);
          if (dark) {
            fg.addColorStop(0, 'rgba(255,240,186,' + (fa * 0.95).toFixed(3) + ')');
            fg.addColorStop(0.4, 'rgba(232,88,46,' + (fa * 0.65).toFixed(3) + ')');
            fg.addColorStop(1, 'rgba(232,88,46,0)');
          } else {
            fg.addColorStop(0, 'rgba(236,128,28,' + (fa * 0.95).toFixed(3) + ')');
            fg.addColorStop(0.4, 'rgba(176,30,26,' + (fa * 0.72).toFixed(3) + ')');
            fg.addColorStop(1, 'rgba(176,30,26,0)');
          }
          ctx.fillStyle = fg;
          ctx.beginPath();
          ctx.arc(gr.x, gr.y, fr, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }
        ctx.fillStyle = gr.metallic
          ? (dark ? 'rgba(204,192,182,0.52)' : 'rgba(78,66,64,0.62)')
          : (dark ? 'rgba(146,138,150,0.56)' : 'rgba(34,26,28,0.68)');
        ctx.beginPath();
        ctx.arc(gr.x, gr.y, gr.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Faíscas dos grãos
      for (var mi = 0; mi < microSparks.length; mi++) {
        var ms2 = microSparks[mi];
        var ma2 = Math.max(0, 1 - ms2.life / ms2.maxLife);
        ctx.fillStyle = dark
          ? 'rgba(255,214,120,' + (ma2 * 0.92).toFixed(3) + ')'
          : 'rgba(182,36,24,' + (ma2 * 0.95).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(ms2.x, ms2.y, 1.25, 0, Math.PI * 2);
        ctx.fill();
      }

      // Faíscas ao escolher item raro (Forja.sparksAt)
      if (sparks.length) {
        ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
        var dimB = dark ? 1 : 0.85;
        for (var sj = 0; sj < sparks.length; sj++) {
          var sp = sparks[sj];
          var kk = 1 - sp.life / sp.maxLife;
          if (kk <= 0) continue;
          var sc = sp.violet ? [225, 200, 255] : rampColor(0.55 + kk * 0.45);
          ctx.globalAlpha = kk * dimB;
          ctx.strokeStyle = rgba(sc, 1);
          ctx.lineWidth = sp.r * (0.6 + kk * 0.8);
          var sx = sp.x - (sp.x - sp.px) * 2.5, sy = sp.y - (sp.y - sp.py) * 2.5;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sp.x, sp.y); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      return;
    }

    ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
    var dim = dark ? 1 : 0.7;

    // bokeh
    for (var m = 0; m < motes.length; m++) {
      var o = motes[m];
      var fl = 0.8 + 0.2 * Math.sin(t * 1.3 + o.seed);
      ctx.globalAlpha = o.a * fl * dim;
      ctx.drawImage(BOKEH[lvl(o.temp)], o.x - o.r, o.y - o.r, o.r * 2, o.r * 2);
    }

    // brasas
    for (var i = 0; i < embers.length; i++) {
      var e = embers[i];
      var fadeIn = Math.min(1, e.life * 2);
      var fadeOut = Math.min(1, e.temp / 0.18);
      // brilho irregular com estalo ocasional
      var fl = 0.72 + 0.18 * Math.sin(t * e.flick + e.seed) + 0.1 * Math.sin(t * e.flick * 2.7 + e.seed * 3);
      var a = fadeIn * fadeOut * fl * dim;
      if (a <= 0.01) continue;
      var k = e.temp * (0.9 + 0.1 * fl);
      var c = rampColor(k);

      var halo = e.r * (6 + e.temp * 7);
      ctx.globalAlpha = a * (0.35 + e.z * 0.4);
      ctx.drawImage(HALOS[lvl(k)], e.x - halo, e.y - halo, halo * 2, halo * 2);

      // rastro: alinhado à velocidade, mais longo quanto mais rápido
      var dx = e.x - e.px, dy = e.y - e.py;
      var len = Math.sqrt(dx * dx + dy * dy);
      var stretch = Math.min(3.2, 1 + len * 0.9);
      var tx = e.x - dx * stretch, ty = e.y - dy * stretch;
      ctx.globalAlpha = a * 0.55;
      ctx.strokeStyle = rgba(rampColor(k * 0.8), 1);
      ctx.lineWidth = e.r * 1.1;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(e.x, e.y); ctx.stroke();

      // núcleo oval girando
      ctx.globalAlpha = a;
      ctx.fillStyle = rgba(rampColor(Math.min(1, k + 0.12)), 1);
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.tumble);
      ctx.beginPath();
      ctx.ellipse(0, 0, e.r * 1.25, e.r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // faíscas caindo
    for (var j = 0; j < sparks.length; j++) {
      var s = sparks[j];
      var kk = 1 - s.life / s.maxLife;
      var sc = s.violet ? [225, 200, 255] : rampColor(0.55 + kk * 0.45);
      ctx.globalAlpha = Math.max(0, kk) * dim;
      ctx.strokeStyle = rgba(sc, 1);
      ctx.lineWidth = s.r * (0.6 + kk * 0.8);
      var sx = s.x - (s.x - s.px) * 2.5, sy = s.y - (s.y - s.py) * 2.5;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(s.x, s.y); ctx.stroke();
      var hs = s.r * 7 * kk;
      ctx.globalAlpha = Math.max(0, kk) * 0.6 * dim;
      ctx.drawImage(s.violet ? VIOLET : HALOS[lvl(0.6 + kk * 0.4)], s.x - hs, s.y - hs, hs * 2, hs * 2);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  // Loop principal
  function start() {
    if (!enabled) return;
    if (reduce) { draw(); return; }
    if (running) return;
    running = true;
    last = 0;
    var id = ++loopId;
    requestAnimationFrame(function frame(now) {
      if (!running || id !== loopId) return;
      var dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      step(dt);
      draw();
      requestAnimationFrame(frame);
    });
  }
  function stop() {
    running = false;
    loopId++;
    sparks.length = 0;
    ctx.clearRect(0, 0, W, H);
  }
  function setEnabled(on) {
    enabled = !!on;
    document.documentElement.classList.toggle('forja-on', enabled);
    if (forjaSwitch) forjaSwitch.setAttribute('aria-checked', String(enabled));
    try { localStorage.setItem(FORJA_KEY, enabled ? '1' : '0'); } catch (err) {}
    if (enabled) {
      resize();
      // aquece a simulação para não começar com tudo parado
      if (!reduce) for (var w = 0; w < 40; w++) step(1 / 30);
      start();
    } else {
      stop();
    }
  }

  window.addEventListener('resize', function () { if (enabled) resize(); });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { stop(); } else { start(); }
  });
  if (forjaSwitch) forjaSwitch.addEventListener('click', function () { setEnabled(!enabled); });
  setEnabled(enabled);

  window.Forja = {
    sparksAt: function (el, color) {
      if (!el || !el.getBoundingClientRect) return;
      var r = el.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 30, color);
    },
    setEnabled: setEnabled
  };
})();
