/*
  Тактическая схема ARC Frigate для 3D-вида. Это не копия игровой модели, а схема:
  объёмы условные, важны только взаимное расположение и порядок действий.
  Оси: x — от кормы (−) к носу (+), y — вверх, z — к зрителю (правый борт).

  Категории (цвет задаётся темой в js/scene3d.js):
  0 корпус · 1 детали · 2 цели (уничтожить/прострелить) · 3 энергоядра · 4 лут
  5 опасность · 6 платформы Reclaimer · 7 рельеф · 8 то, с чем взаимодействуешь
*/
(function () {
  'use strict';
  var F = window.FT3D;
  if (!F) return;
  var M = F.M, V = F.v;
  var K = { HULL: 0, DETAIL: 1, TARGET: 2, CORE: 3, LOOT: 4, DANGER: 5, PLATFORM: 6, TERRAIN: 7, INTERACT: 8 };

  /* ───── профиль корпуса ───── */
  function seg(x, pts) {
    for (var i = 0; i < pts.length - 1; i++) {
      if (x <= pts[i + 1][0]) return V.lerp(pts[i][1], pts[i + 1][1], (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]));
    }
    return pts[pts.length - 1][1];
  }
  function top(x) { return seg(x, [[-52, 6], [-47, 8], [40, 8], [55, 3.4]]); }
  function bot(x) { return seg(x, [[-52, 2], [-48, -2], [-34, -6.8], [30, -6.8], [44, -1.6], [55, 3.4]]); }
  function wf(x) {
    if (x < -40) return V.lerp(0.62, 1, (x + 52) / 12);
    if (x <= 26) return 1;
    return 1 - Math.pow(Math.min(1, (x - 26) / 29), 1.6) * 0.94;
  }
  function sideZ(x, y) {
    var b = bot(x), t = top(x), f = wf(x);
    var yLow = V.lerp(b, t, 0.28), yMid = V.lerp(b, t, 0.62);
    if (y <= yLow) return V.lerp(3.2 * f, 6.2 * f, (y - b) / Math.max(0.01, yLow - b));
    if (y <= yMid) return V.lerp(6.2 * f, 8.8 * f, (y - yLow) / Math.max(0.01, yMid - yLow));
    return V.lerp(8.8 * f, 7.6 * f, (y - yMid) / Math.max(0.01, t - yMid));
  }
  function yMidAt(x) { return V.lerp(bot(x), top(x), 0.62); }

  function buildShip() {
    var g = new F.Geo();
    var solid = new F.Geo().solid(true); // части, которые закрывают точки от камеры

    // корпус
    var xs = [-52, -49, -46, -42, -38, -34, -28, -20, -12, -4, 4, 12, 20, 26, 30, 34, 38, 42, 46, 50, 53, 55];
    var sections = xs.map(function (x) {
      var t = top(x), b = bot(x), f = wf(x);
      var yLow = V.lerp(b, t, 0.28), yMid = V.lerp(b, t, 0.62);
      var wT = 7.6 * f, wM = 8.8 * f, wL = 6.2 * f, wB = 3.2 * f;
      return [[x, t, -wT], [x, t, wT], [x, yMid, wM], [x, yLow, wL], [x, b, wB], [x, b, -wB], [x, yLow, -wL], [x, yMid, -wM]];
    });
    F.loft(solid, sections, [K.HULL], [K.HULL, K.HULL]);

    // ограждение палубы и уступ вдоль борта (по нему идёт маршрут к панелям)
    [-1, 1].forEach(function (s) {
      F.beam(g, [-44, 8.55, s * 7.1], [38, 8.55, s * 7.1], 0.3, K.DETAIL);
      F.beam(g, [-42, yMidAt(0) + 0.1, s * 9.05], [26, yMidAt(0) + 0.1, s * 9.05], 0.4, K.DETAIL);
    });
    [-42, -22, 18, 33].forEach(function (x) { F.box(g, 4.5, 0.25, 6, M.t(x, 8.12, 0), K.DETAIL); });
    // двигатели на корме
    [-3.2, 3.2].forEach(function (z) {
      F.cylinder(g, 1.4, 1.6, 3, 12, M.chain(M.t(-52.6, 3.8, z), M.rz(Math.PI / 2)), K.DETAIL);
      F.cylinder(g, 1.05, 1.05, 0.3, 12, M.chain(M.t(-54.2, 3.8, z), M.rz(Math.PI / 2)), K.DETAIL, 0.7);
    });

    // надстройка: две опоры и балка
    [-10.5, 10.5].forEach(function (x) { F.frustum(solid, 5, 10, 4, 7.5, 8, M.t(x, 8, 0), K.HULL); });
    F.box(solid, 31, 2, 6.5, M.t(0, 17, 0), K.HULL);
    // малые ядра по краям балки
    [-13.8, 13.8].forEach(function (x) {
      F.box(g, 2.4, 1, 2.4, M.t(x, 18.5, 0), K.DETAIL);
      F.sphere(g, 1.6, 14, 7, M.t(x, 20.3, 0), K.CORE, 1);
    });
    // центральное ядро в клетке
    F.cylinder(g, 2.6, 2.9, 1.2, 14, M.t(0, 8.6, 0), K.DETAIL);
    F.cylinder(g, 0.8, 0.9, 2.2, 10, M.t(0, 10.2, 0), K.DETAIL);
    F.sphere(g, 2.4, 14, 8, M.t(0, 12.4, 0), K.CORE, 1);
    for (var k = 0; k < 4; k++) {
      var a = k / 4 * Math.PI * 2 + Math.PI / 4;
      F.beam(g, [Math.cos(a) * 3.2, 9.2, Math.sin(a) * 3.2], [Math.cos(a) * 3.2, 15.4, Math.sin(a) * 3.2], 0.25, K.DETAIL);
    }
    F.cylinder(g, 3.4, 3.4, 0.35, 14, M.t(0, 15.5, 0), K.DETAIL);
    // три рычага
    [-4, 0, 4].forEach(function (x) {
      F.box(g, 1.3, 0.6, 1.3, M.t(x, 8.3, 5.4), K.INTERACT);
      F.beam(g, [x, 8.5, 5.4], [x + 0.5, 10.6, 5.7], 0.28, K.INTERACT);
    });

    // Гидры: три секции друг на друге
    [[-30, 0, 0.4], [28, -3, 2.4], [36, 3, -1.1]].forEach(function (h) {
      var x = h[0], z = h[1], yaw = h[2];
      var rs = [2.6, 2.2, 1.8];
      for (var i = 0; i < 3; i++) {
        var y = 8 + 0.8 + i * 1.75;
        F.cylinder(solid, rs[i] * 0.92, rs[i], 1.5, 14, M.t(x, y, z), K.TARGET);
        var dir = yaw + i * 2.2;
        var dx = Math.cos(dir), dz = Math.sin(dir);
        F.beam(g, [x + dx * rs[i] * 0.7, y + 0.1, z + dz * rs[i] * 0.7], [x + dx * (rs[i] + 2.8), y + 0.25, z + dz * (rs[i] + 2.8)], 0.38, K.TARGET);
      }
    });

    // лифт «Move Up» на правом борту
    var zL = sideZ(23, 3.6) + 0.45;
    F.box(g, 2.6, 9.4, 0.8, M.t(23, 3.6, zL), K.INTERACT);
    F.box(g, 3, 0.3, 1.8, M.t(23, 1.4, zL + 0.6), K.INTERACT);
    // жёлтые узлы — по ним стреляют
    F.sphere(g, 0.65, 10, 5, M.t(17, 3.4, sideZ(17, 3.4) + 0.5), K.TARGET, 0.6);
    F.sphere(g, 0.65, 10, 5, M.t(47.5, 3.4, sideZ(47.5, 3.4) + 0.5), K.TARGET, 0.6);

    // боковые панели у кормы
    for (var px = -36; px <= -16; px += 4) {
      F.box(g, 3.4, 2.4, 0.3, M.chain(M.t(px, 3.9, sideZ(px, 3.9) + 0.2), M.rx(-0.2)), K.INTERACT);
    }
    // жёлтый вентиль
    var vz = sideZ(-39.2, 3.9) + 0.45;
    F.cylinder(g, 1.15, 1.15, 0.35, 14, M.chain(M.t(-39.2, 3.9, vz), M.rx(Math.PI / 2)), K.TARGET, 0.6);

    // трюм: проём и контейнеры
    F.box(g, 18, 3.4, 0.3, M.chain(M.t(-31, -4.85, 4.88), M.rx(0.627)), K.LOOT);
    [-37, -33.5, -30, -26.5].forEach(function (cx, i) {
      F.box(g, 2.6, 1.9 + (i % 2) * 0.5, 1.8, M.chain(M.t(cx, -5.1 + (i % 2) * 0.2, 5.2), M.rx(0.3)), K.LOOT);
    });
    // коридоры в носу
    for (var wx = 31; wx <= 42; wx += 2.6) F.box(g, 1.4, 0.7, 0.2, M.t(wx, 3.2, sideZ(wx, 3.2) + 0.08), K.LOOT, 0.5);

    // турели на днище
    [[-17, 0.35], [18, -0.35]].forEach(function (t) {
      F.sphere(solid, 2.5, 10, 6, M.t(t[0], -7.3, 0), K.DANGER);
      F.beam(g, [t[0], -8.2, 0], [t[0] + t[1] * 6, -13.5, 2.2], 0.6, K.DANGER);
      F.beam(g, [t[0], -8.2, 0], [t[0] + t[1] * 6, -13.5, -2.2], 0.6, K.DANGER);
    });
    // шлюз Reclaimer
    F.cylinder(g, 3.8, 3.4, 0.7, 14, M.t(0, -7.1, 0), K.PLATFORM);
    F.cylinder(g, 2.8, 2.8, 0.2, 14, M.t(0, -7.5, 0), K.PLATFORM, 0.6);

    return { geo: g, solid: solid };
  }

  function buildDisc() {
    var g = new F.Geo();
    F.cylinder(g, 3.1, 2.7, 0.7, 16, M.id(), K.PLATFORM);
    F.cylinder(g, 1.4, 1.6, 0.6, 12, M.t(0, 0.6, 0), K.PLATFORM);
    F.cylinder(g, 2.2, 2.2, 0.1, 16, M.t(0, -0.4, 0), K.PLATFORM, 0.8);
    return g;
  }

  // дроны сопровождения — это цели квеста (Rocketeer и Vaporizer)
  function buildDrone(kind) {
    var g = new F.Geo();
    if (kind === 'disc') {
      F.cylinder(g, 2.2, 1.8, 0.6, 14, M.id(), K.TARGET);
      F.cylinder(g, 0.9, 1.1, 0.6, 10, M.t(0, 0.55, 0), K.TARGET, 0.5);
      return g;
    }
    F.box(g, 3, 1.2, 1.8, M.id(), K.TARGET);
    [-1, 1].forEach(function (s) {
      F.cylinder(g, 0.55, 0.65, 1.8, 10, M.chain(M.t(-0.6, 0, s * 1.6), M.rx(Math.PI / 2)), K.TARGET);
    });
    return g;
  }

  // рельеф: тёмная поверхность и сетка, по краям — горы
  function buildTerrain() {
    var g = new F.Geo();
    function h(x, z) {
      var r = Math.sqrt(x * x + z * z);
      var n = Math.sin(x * 0.045 + 1.1) * Math.cos(z * 0.05 - 0.4) * 2.2 + Math.sin(x * 0.11 + z * 0.07) * 1.1;
      var ring = Math.max(0, r - 240);
      var peaks = (Math.sin(x * 0.031 + 0.5) * Math.cos(z * 0.027 + 1.7) * 0.5 + 0.75) * 0.5 + Math.abs(Math.sin(x * 0.06 + z * 0.04)) * 0.3;
      return -46 + n + ring * peaks;
    }
    var S = 24, R = 456;
    for (var x = -R; x < R; x += S) {
      for (var z = -R; z < R; z += S) {
        var a = [x, h(x, z), z], b = [x + S, h(x + S, z), z], c = [x + S, h(x + S, z + S), z + S], d = [x, h(x, z + S), z + S];
        var below = [x + S / 2, -400, z + S / 2];
        g.tri(a, b, c, K.TERRAIN, 0, below);
        g.tri(a, c, d, K.TERRAIN, 0, below);
        g.line(a, b, K.TERRAIN);
        g.line(a, d, K.TERRAIN);
      }
    }
    return g;
  }

  window.FTFrigateModel = {
    K: K, buildShip: buildShip, buildDisc: buildDisc, buildDrone: buildDrone, buildTerrain: buildTerrain,
    cores: [[0, 12.4, 0], [-13.8, 20.3, 0], [13.8, 20.3, 0]], sideZ: sideZ
  };
})();
