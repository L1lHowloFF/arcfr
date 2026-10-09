/* 3D-сцены: Фрегат в шапке и интерактивная 3D-карта в разделе «Фрегат». */
(function () {
  'use strict';
  var F = window.FT3D, FM = window.FTFrigateModel, FT = window.FT || {}, UI = FT.ui || {};
  var reduceMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var heroHost = document.getElementById('heroShip');

  if (!F || !FM || !F.supported()) {
    if (UI.disable3d) UI.disable3d();
    if (heroHost) heroHost.hidden = true;
    document.documentElement.classList.add('no-3d');
    return;
  }

  var M = F.M, V = F.v;
  // палитры: категории как в js/frigate-model.js
  // 0 корпус, 1 детали, 2 цели, 3 ядра, 4 лут, 5 опасность, 6 платформы, 7 рельеф, 8 взаимодействие
  var STYLES = {
    dark: {
      pal: [[0.34, 0.8, 0.98], [0.2, 0.47, 0.6], [1, 0.7, 0.22], [1, 0.55, 0.14], [0.78, 0.94, 1],
        [1, 0.32, 0.4], [0.45, 0.98, 0.82], [0.11, 0.25, 0.32], [0.92, 0.96, 1], [1, 1, 1]],
      face: [0.025, 0.05, 0.065], amb: 1, keyAmt: 0.5, tint: 0.05, rim: 0.45,
      fog: [0.04, 0.09, 0.12], fogNear: 170, fogFar: 560, fogMax: 0.95, lineAlpha: 0.9, xray: 0.13, additive: true, scanAmt: 0.55
    },
    light: {
      pal: [[0.1, 0.25, 0.34], [0.35, 0.48, 0.56], [0.83, 0.47, 0], [0.96, 0.45, 0.05], [0.08, 0.42, 0.62],
        [0.78, 0.07, 0.18], [0.05, 0.5, 0.44], [0.62, 0.7, 0.75], [0.1, 0.12, 0.14], [0, 0, 0]],
      face: [0.93, 0.95, 0.96], amb: 0.88, keyAmt: 0.18, tint: 0.04, rim: 0.2,
      fog: [0.86, 0.9, 0.92], fogNear: 170, fogFar: 560, fogMax: 0.9, lineAlpha: 0.9, xray: 0.12, additive: false, scanAmt: 0.3
    }
  };
  function theme() { return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }
  var scenes = [];
  function applyTheme() {
    var st = STYLES[theme()];
    scenes.forEach(function (S) {
      var s = S.r.style;
      var pal = new Float32Array(30);
      st.pal.forEach(function (c, i) { pal[i * 3] = c[0]; pal[i * 3 + 1] = c[1]; pal[i * 3 + 2] = c[2]; });
      s.pal = pal;
      ['face', 'amb', 'keyAmt', 'tint', 'rim', 'fog', 'fogNear', 'fogFar', 'fogMax', 'lineAlpha', 'xray', 'additive'].forEach(function (k) { s[k] = st[k]; });
      S.scanAmt = st.scanAmt;
    });
    trail = getComputedStyle(document.documentElement).getPropertyValue('--trail').trim() || '#F0485C';
  }
  var trail = '#F0485C';
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  var DRONES = [
    { R: 54, h: 24, speed: 0.11, phase: 0.3, kind: 'rocket' },
    { R: 61, h: 17, speed: 0.085, phase: 2.6, kind: 'rocket' },
    { R: 47, h: 29, speed: -0.07, phase: 4.2, kind: 'disc' }
  ];

  function makeScene(canvas, opts) {
    var r = new F.Renderer(canvas);
    var ship = FM.buildShip();
    var S = {
      r: r,
      solid: r.mesh(ship.solid),
      detail: r.mesh(ship.geo),
      dock: r.mesh(FM.buildDisc()),
      mover: r.mesh(FM.buildDisc()),
      parked: opts.ground ? r.mesh(FM.buildDisc()) : null,
      drones: DRONES.map(function (d) { return r.mesh(FM.buildDrone(d.kind)); }),
      terrain: opts.ground ? r.mesh(FM.buildTerrain(), { xray: false, edgeAngle: 181 }) : null,
      occ: new Float32Array(ship.solid.occ || []),
      dronePos: [0, 20, 50],
      group: M.id()
    };
    scenes.push(S);
    return S;
  }

  // движение платформ и дронов; group — матрица всего корабля
  function animate(S, t, group) {
    var G = group || M.id();
    S.group = G;
    S.solid.matrix = G;
    S.detail.matrix = G;
    S.dock.matrix = M.mul(G, M.t(0, -9, 0));
    var k = 0.5 - 0.5 * Math.cos(t * Math.PI * 2 / 16);
    S.mover.matrix = M.mul(G, M.chain(M.t(0, -10.5 - 29 * k, 0), M.ry(t * 0.35)));
    if (S.parked) S.parked.matrix = M.t(0, -43.8, 0);
    DRONES.forEach(function (d, i) {
      var a = d.phase + d.speed * t;
      var pos = [d.R * Math.cos(a), d.h + 2 * Math.sin(t * 0.7 + i), d.R * Math.sin(a)];
      var yaw = -a - Math.PI / 2 + (d.speed < 0 ? Math.PI : 0);
      var m = M.mul(G, M.chain(M.t(pos[0], pos[1], pos[2]), M.ry(yaw), M.rx(0.12 * Math.sign(d.speed))));
      S.drones[i].matrix = m;
      if (i === 0) S.dronePos = M.apply(m, [0, 0, 0]);
    });
  }

  function sizeCanvas(c, dpr) {
    var w = Math.max(1, Math.round(c.clientWidth * dpr)), h = Math.max(1, Math.round(c.clientHeight * dpr));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  }

  function drawGlows(ctx, cam, w, h, group, strength) {
    var focal = h / (2 * Math.tan(cam.fov / 2));
    ctx.globalCompositeOperation = 'lighter';
    FM.cores.forEach(function (c) {
      var p = cam.project(M.apply(group, c), w, h);
      if (!p || !p.front) return;
      var rad = Math.max(10, 2.6 * focal / p.depth * 3.2);
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
      g.addColorStop(0, 'rgba(255,170,80,' + (0.55 * strength) + ')');
      g.addColorStop(0.35, 'rgba(255,128,32,' + (0.2 * strength) + ')');
      g.addColorStop(1, 'rgba(255,110,20,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
  }

  // запуск цикла только когда сцена видна
  function loop(host, isActive, frame) {
    var visible = false, running = false;
    function tick() {
      var should = visible && isActive() && !document.hidden;
      if (should && !running) { running = true; requestAnimationFrame(step); }
      if (!should) running = false;
    }
    function step(now) {
      if (!running) return;
      frame(now);
      requestAnimationFrame(step);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; tick(); }, { threshold: 0.01 }).observe(host);
    } else { visible = true; }
    document.addEventListener('visibilitychange', tick);
    tick();
    return tick;
  }

  /* ───────────── Шапка: Фрегат над горами ───────────── */
  (function () {
    var canvas = document.getElementById('heroCanvas');
    var glow = document.getElementById('heroGlow');
    if (!heroHost || !canvas) return;
    var S;
    try { S = makeScene(canvas, { ground: false }); } catch (e) { heroHost.hidden = true; return; }
    applyTheme();
    var cam = new F.Camera({ target: [2, 2, 0], dist: 118, az: 0.78, el: 0.05, fov: 0.6 });
    var base = { az: 0.78, el: 0.05 };
    var par = { x: 0, y: 0, tx: 0, ty: 0 };
    var hero = document.querySelector('.hero');
    if (hero && !reduceMotion) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        par.tx = (e.clientX - r.left) / r.width * 2 - 1;
        par.ty = (e.clientY - r.top) / r.height * 2 - 1;
      });
    }
    var gctx = glow.getContext('2d');
    var t0 = performance.now();
    function frame(now) {
      var t = reduceMotion ? 6 : (now - t0) / 1000;
      par.x += (par.tx - par.x) * 0.04;
      par.y += (par.ty - par.y) * 0.04;
      cam.az = base.az + Math.sin(t * 0.05) * 0.22 + par.x * 0.16;
      cam.el = base.el + par.y * 0.05;
      var G = M.chain(M.t(0, Math.sin(t * 0.55) * 1.3, 0), M.ry(Math.sin(t * 0.11) * 0.08), M.rz(Math.sin(t * 0.4) * 0.018));
      animate(S, t, G);
      S.r.style.scan = reduceMotion ? 0 : S.scanAmt;
      S.r.style.scanY = -12 + ((t * 7) % 40);
      S.r.render(cam);
      var w = canvas.clientWidth, h = canvas.clientHeight;
      sizeCanvas(glow, S.r.dpr);
      gctx.setTransform(S.r.dpr, 0, 0, S.r.dpr, 0, 0);
      gctx.clearRect(0, 0, w, h);
      drawGlows(gctx, cam, w, h, G, 0.9 + Math.sin(t * 2.1) * 0.1);
    }
    if (reduceMotion) {
      requestAnimationFrame(frame);
      window.addEventListener('resize', function () { requestAnimationFrame(frame); });
      new MutationObserver(function () { requestAnimationFrame(frame); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    } else {
      loop(heroHost, function () { return true; }, frame);
    }
  })();

  /* ───────────── Снег в шапке ───────────── */
  (function () {
    var c = document.getElementById('heroSnow');
    var hero = document.querySelector('.hero');
    if (!c || !hero) return;
    var ctx = c.getContext('2d');
    var flakes = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
      var n = Math.round(Math.min(160, c.clientWidth * c.clientHeight / 9000));
      flakes = [];
      for (var i = 0; i < n; i++) flakes.push(newFlake(true));
    }
    function newFlake(any) {
      var z = Math.random();
      return {
        x: Math.random() * c.clientWidth, y: any ? Math.random() * c.clientHeight : -6,
        r: 0.5 + z * 1.6, v: 12 + z * 34, drift: (Math.random() - 0.5) * 14, ph: Math.random() * 6.28, a: 0.25 + z * 0.65
      };
    }
    var last = performance.now();
    function draw(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      var w = c.clientWidth, h = c.clientHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      var light = theme() === 'light';
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        if (!reduceMotion) {
          f.y += f.v * dt;
          f.x += (f.drift + Math.sin(now / 1000 + f.ph) * 8) * dt;
          if (f.y > h + 6) flakes[i] = f = newFlake(false);
          if (f.x > w + 6) f.x = -6; else if (f.x < -6) f.x = w + 6;
        }
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = light ? 'rgba(90,120,140,' + (f.a * 0.55) + ')' : 'rgba(235,245,255,' + f.a + ')';
        ctx.fill();
      }
    }
    resize();
    window.addEventListener('resize', resize);
    if (reduceMotion) { draw(performance.now()); return; }
    loop(hero, function () { return true; }, draw);
  })();

  /* ───────────── 3D-карта Фрегата ───────────── */
  (function () {
    var host = document.getElementById('v3d');
    var canvas = document.getElementById('v3dCanvas');
    var hud = document.getElementById('v3dHud');
    var markersEl = document.getElementById('v3dMarkers');
    var fmap = document.getElementById('frigateMap');
    var D = FT.frigate3d;
    if (!host || !canvas || !D || !UI.frigateHotspots) return;
    var S;
    try { S = makeScene(canvas, { ground: true }); } catch (e) { if (UI.disable3d) UI.disable3d(); return; }
    applyTheme();

    var start = D.start;
    var cam = new F.Camera({ target: start.target, dist: start.dist, az: start.az, el: start.el, fov: 0.62, minDist: 28, maxDist: 260, minEl: -0.3, maxEl: 1.3 });
    var autoRotate = !reduceMotion;
    var controls = F.attachControls(host, cam, { onInteract: function () { autoRotate = false; }, wheelNeedsFocus: true });
    var hint = document.getElementById('v3dHint');
    host.addEventListener('pointerdown', function (e) {
      if (!(e.target.closest && e.target.closest('button'))) host.focus({ preventScroll: true });
      if (hint) setTimeout(function () { hint.classList.add('is-hidden'); }, 2500);
    });

    function anchor(id) {
      var a = D.anchors[id];
      if (a === 'drone') return S.dronePos;
      return a || null;
    }
    function point(item) { return typeof item === 'string' ? anchor(item) : item; }

    // точки
    var marks = [];
    UI.frigateHotspots.forEach(function (h) {
      if (!D.anchors[h.id]) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'hs hs--' + h.type + (h.kind ? ' k-' + h.kind : '') + (UI.isDone(h.id) ? ' is-done' : '');
      b.setAttribute('data-id', h.id);
      b.setAttribute('aria-pressed', UI.frigateSelected() === h.id ? 'true' : 'false');
      b.setAttribute('aria-label', h.type === 'route' ? 'Шаг ' + h.step + ': ' + h.title : UI.frigateKind[h.type] + ': ' + h.title);
      b.innerHTML = h.type === 'route' ? '<span class="blaze">' + h.step + '</span>' : UI.frigateIcons[h.type];
      b.addEventListener('click', function () { UI.selectFrigate(h.id, false); });
      markersEl.appendChild(b);
      marks.push({ id: h.id, el: b, occluded: false });
    });

    function focusOn(id) {
      autoRotate = false;
      var v = D.views[id];
      var ms = reduceMotion ? 1 : 1100;
      if (v) cam.flyTo(v, ms);
      else {
        var a = anchor(id);
        if (a) cam.flyTo({ target: a.slice(), dist: Math.min(cam.dist, 66) }, ms);
      }
    }
    UI.selectListeners.push(function (id) { if (active) focusOn(id); });

    $$('[data-v3d]', host).forEach(function (b) {
      b.addEventListener('click', function () {
        var act = b.getAttribute('data-v3d');
        autoRotate = false;
        if (act === 'in') cam.flyTo({ dist: Math.max(cam.minDist, cam.dist * 0.72) }, reduceMotion ? 1 : 350);
        else if (act === 'out') cam.flyTo({ dist: Math.min(cam.maxDist, cam.dist * 1.35) }, reduceMotion ? 1 : 350);
        else cam.flyTo(start, reduceMotion ? 1 : 900);
      });
    });
    function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

    var hctx = hud.getContext('2d');
    var lastOcc = 0;
    var occCache = {};
    var t0 = performance.now();

    function drawPath(items, prefix, dash, width, offset, w, h) {
      var pts = items.map(function (it, i) {
        var p = point(it);
        if (!p) return null;
        var key = typeof it === 'string' ? it : prefix + i;
        var pr = cam.project(p, w, h);
        pr.occ = occCache[key];
        return pr;
      });
      for (var i = 0; i < pts.length - 1; i++) {
        var a = pts[i], b = pts[i + 1];
        if (!a || !b || !a.front || !b.front) continue;
        var dim = a.occ && b.occ;
        hctx.globalAlpha = dim ? 0.3 : 1;
        hctx.setLineDash([]);
        hctx.lineCap = 'round';
        hctx.strokeStyle = theme() === 'light' ? 'rgba(255,255,255,0.75)' : 'rgba(4,10,14,0.6)';
        hctx.lineWidth = width + 3;
        hctx.beginPath(); hctx.moveTo(a.x, a.y); hctx.lineTo(b.x, b.y); hctx.stroke();
        hctx.setLineDash(dash);
        hctx.lineDashOffset = offset;
        hctx.strokeStyle = trail;
        hctx.lineWidth = width;
        hctx.beginPath(); hctx.moveTo(a.x, a.y); hctx.lineTo(b.x, b.y); hctx.stroke();
      }
      hctx.globalAlpha = 1;
      hctx.setLineDash([]);
    }

    function updateOcclusion(eye) {
      marks.forEach(function (m) {
        var p = anchor(m.id);
        m.occluded = p ? F.occluded(S.occ, eye, p) : false;
        occCache[m.id] = m.occluded;
      });
      [[D.route, 'r'], [D.exit, 'x']].forEach(function (pair) {
        pair[0].forEach(function (it, i) {
          if (typeof it === 'string') return;
          occCache[pair[1] + i] = F.occluded(S.occ, eye, it);
        });
      });
    }

    function frame(now) {
      var t = reduceMotion ? 6 : (now - t0) / 1000;
      controls.step();
      cam.update(now);
      if (autoRotate && !controls.dragging() && !cam.tween) cam.az += 0.0011;
      animate(S, t, M.id());
      var mats = S.r.render(cam);
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (now - lastOcc > 140) { updateOcclusion(mats.eye); lastOcc = now; }
      // точки
      marks.forEach(function (m) {
        var p = cam.project(anchor(m.id), w, h);
        var out = !p.front || p.x < -16 || p.y < -16 || p.x > w + 16 || p.y > h + 16;
        m.el.style.display = out ? 'none' : '';
        if (out) return;
        m.el.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px) translate(-50%,-50%)';
        m.el.style.zIndex = String(1000 - Math.round(p.depth));
        m.el.classList.toggle('is-occluded', m.occluded);
      });
      // свечение и маршрут
      sizeCanvas(hud, S.r.dpr);
      hctx.setTransform(S.r.dpr, 0, 0, S.r.dpr, 0, 0);
      hctx.clearRect(0, 0, w, h);
      drawGlows(hctx, cam, w, h, M.id(), 1);
      if (!fmap || !fmap.classList.contains('hide-route')) {
        var off = reduceMotion ? 0 : -(t * 16) % 40;
        drawPath(D.route, 'r', [11, 8], 3.2, off, w, h);
        drawPath(D.exit, 'x', [0.5, 9], 3.6, off, w, h);
      }
    }

    var active = UI.frigateView ? UI.frigateView() === '3d' : true;
    var tick = loop(host, function () { return active; }, frame);
    UI.viewListeners.push(function (v) { active = v === '3d'; tick(); });
  })();
})();
