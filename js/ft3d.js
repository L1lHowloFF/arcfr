/*
  FT3D — маленький WebGL-движок для тактической 3D-схемы Фрегата.
  Без внешних библиотек. Рисует в стиле голограммы: тёмные грани, светящиеся рёбра,
  цвет рёбер зависит от категории (корпус, цель, лут, опасность и т.д.).
  Плюс орбитальная камера, проекция точек на экран и проверка перекрытия.
*/
(function () {
  'use strict';

  /* ───────────── векторы и матрицы (column-major, как в WebGL) ───────────── */
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function mul(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function len(a) { return Math.sqrt(dot(a, a)); }
  function norm(a) { var l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerp3(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }

  var M = {
    id: function () { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; },
    mul: function (a, b) {
      var o = new Array(16);
      for (var c = 0; c < 4; c++) {
        for (var r = 0; r < 4; r++) {
          o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
        }
      }
      return o;
    },
    chain: function () {
      var m = M.id();
      for (var i = 0; i < arguments.length; i++) m = M.mul(m, arguments[i]);
      return m;
    },
    t: function (x, y, z) { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]; },
    s: function (x, y, z) { return [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]; },
    rx: function (a) { var c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]; },
    ry: function (a) { var c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; },
    rz: function (a) { var c = Math.cos(a), s = Math.sin(a); return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; },
    perspective: function (fovy, aspect, near, far) {
      var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
      return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
    },
    lookAt: function (eye, center, up) {
      var z = norm(sub(eye, center));
      var x = norm(cross(up, z));
      var y = cross(z, x);
      return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1];
    },
    basis: function (x, y, z, o) { return [x[0], x[1], x[2], 0, y[0], y[1], y[2], 0, z[0], z[1], z[2], 0, o[0], o[1], o[2], 1]; },
    apply: function (m, p) {
      var x = p[0], y = p[1], z = p[2];
      return [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]];
    },
    apply4: function (m, p) {
      var x = p[0], y = p[1], z = p[2];
      return [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14], m[3] * x + m[7] * y + m[11] * z + m[15]];
    },
    normal3: function (m) { return [m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]]; }
  };

  /* ───────────── геометрия ─────────────
     Вершина грани: x, y, z, nx, ny, nz, категория, свечение.
     Категория — индекс цвета в палитре темы. */
  function Geo() { this.d = []; this.count = 0; this.occ = null; this.extra = []; }

  Geo.prototype.tri = function (a, b, c, cat, emit, center) {
    var n = cross(sub(b, a), sub(c, a));
    var l = len(n);
    if (l < 1e-9) return;
    if (center) {
      var g = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
      if (dot(n, sub(g, center)) < 0) { var t = b; b = c; c = t; n = mul(n, -1); }
    }
    n = mul(n, 1 / l);
    var e = emit || 0, d = this.d, k = cat || 0;
    [a, b, c].forEach(function (p) { d.push(p[0], p[1], p[2], n[0], n[1], n[2], k, e); });
    this.count += 3;
    if (this.occ) this.occ.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
  };
  Geo.prototype.quad = function (a, b, c, d, cat, emit, center) {
    this.tri(a, b, c, cat, emit, center);
    this.tri(a, c, d, cat, emit, center);
  };
  Geo.prototype.solid = function (on) { this.occ = on ? (this.occ || []) : null; return this; };
  // отдельная линия (для сетки рельефа)
  Geo.prototype.line = function (a, b, cat) { this.extra.push(a[0], a[1], a[2], cat, b[0], b[1], b[2], cat); };

  // рёбра, где соседние грани сходятся под углом больше порога, плюс открытые края
  Geo.prototype.edges = function (thresholdDeg) {
    var cosT = Math.cos((thresholdDeg || 28) * Math.PI / 180);
    var d = this.d, map = {}, out = [];
    function key(x, y, z) { return Math.round(x * 200) + ',' + Math.round(y * 200) + ',' + Math.round(z * 200); }
    for (var i = 0; i < this.count; i += 3) {
      var vs = [i, i + 1, i + 2].map(function (v) { var o = v * 8; return [d[o], d[o + 1], d[o + 2]]; });
      var o0 = i * 8, n = [d[o0 + 3], d[o0 + 4], d[o0 + 5]], cat = d[o0 + 6];
      for (var e = 0; e < 3; e++) {
        var a = vs[e], b = vs[(e + 1) % 3];
        var ka = key(a[0], a[1], a[2]), kb = key(b[0], b[1], b[2]);
        if (ka === kb) continue;
        var k = ka < kb ? ka + '|' + kb : kb + '|' + ka;
        var rec = map[k];
        if (!rec) map[k] = { a: a, b: b, n: [n], cat: cat };
        else rec.n.push(n);
      }
    }
    Object.keys(map).forEach(function (k) {
      var r = map[k], show = r.n.length === 1;
      if (!show) {
        for (var j = 1; j < r.n.length && !show; j++) if (dot(r.n[0], r.n[j]) < cosT) show = true;
      }
      if (show) out.push(r.a[0], r.a[1], r.a[2], r.cat, r.b[0], r.b[1], r.b[2], r.cat);
    });
    return out.concat(this.extra);
  };

  function cats(c) {
    return Array.isArray(c) ? { top: c[0], side: c[1], bot: c[2] == null ? c[1] : c[2] } : { top: c, side: c, bot: c };
  }

  function box(g, w, h, d, m, c, emit) {
    var x = w / 2, y = h / 2, z = d / 2, k = cats(c);
    var P = [[-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z], [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]].map(function (p) { return M.apply(m, p); });
    var ctr = M.apply(m, [0, 0, 0]);
    g.quad(P[3], P[2], P[6], P[7], k.top, emit, ctr);
    g.quad(P[0], P[1], P[5], P[4], k.bot, emit, ctr);
    g.quad(P[0], P[1], P[2], P[3], k.side, emit, ctr);
    g.quad(P[4], P[5], P[6], P[7], k.side, emit, ctr);
    g.quad(P[0], P[4], P[7], P[3], k.side, emit, ctr);
    g.quad(P[1], P[5], P[6], P[2], k.side, emit, ctr);
  }

  function frustum(g, wb, db, wt, dt, h, m, c, emit) {
    var k = cats(c);
    var P = [[-wb / 2, 0, -db / 2], [wb / 2, 0, -db / 2], [wb / 2, 0, db / 2], [-wb / 2, 0, db / 2],
      [-wt / 2, h, -dt / 2], [wt / 2, h, -dt / 2], [wt / 2, h, dt / 2], [-wt / 2, h, dt / 2]].map(function (p) { return M.apply(m, p); });
    var ctr = M.apply(m, [0, h / 2, 0]);
    g.quad(P[4], P[5], P[6], P[7], k.top, emit, ctr);
    g.quad(P[0], P[1], P[2], P[3], k.bot, emit, ctr);
    for (var i = 0; i < 4; i++) {
      var j = (i + 1) % 4;
      g.quad(P[i], P[j], P[j + 4], P[i + 4], k.side, emit, ctr);
    }
  }

  function cylinder(g, rTop, rBot, h, seg, m, c, emit) {
    var k = cats(c);
    var ctr = M.apply(m, [0, 0, 0]);
    var top = [], bot = [];
    for (var i = 0; i < seg; i++) {
      var a = i / seg * Math.PI * 2;
      top.push(M.apply(m, [Math.cos(a) * rTop, h / 2, Math.sin(a) * rTop]));
      bot.push(M.apply(m, [Math.cos(a) * rBot, -h / 2, Math.sin(a) * rBot]));
    }
    var tc = M.apply(m, [0, h / 2, 0]), bc = M.apply(m, [0, -h / 2, 0]);
    for (var j = 0; j < seg; j++) {
      var n = (j + 1) % seg;
      if (rTop > 0) g.quad(bot[j], bot[n], top[n], top[j], k.side, emit, ctr);
      else g.tri(bot[j], bot[n], tc, k.side, emit, ctr);
      if (rTop > 0) g.tri(tc, top[j], top[n], k.top, emit, ctr);
      if (rBot > 0) g.tri(bc, bot[n], bot[j], k.bot, emit, ctr);
    }
  }

  function sphere(g, r, ws, hs, m, c, emit) {
    var ctr = M.apply(m, [0, 0, 0]);
    var rows = [];
    for (var i = 0; i <= hs; i++) {
      var v = i / hs * Math.PI, row = [];
      for (var j = 0; j < ws; j++) {
        var u = j / ws * Math.PI * 2;
        row.push(M.apply(m, [Math.cos(u) * Math.sin(v) * r, Math.cos(v) * r, Math.sin(u) * Math.sin(v) * r]));
      }
      rows.push(row);
    }
    for (var y = 0; y < hs; y++) {
      for (var x = 0; x < ws; x++) {
        var n = (x + 1) % ws;
        g.quad(rows[y][x], rows[y][n], rows[y + 1][n], rows[y + 1][x], c, emit, ctr);
      }
    }
  }

  function beam(g, from, to, t, c, emit) {
    var dir = sub(to, from), L = len(dir);
    if (L < 1e-6) return;
    var y = mul(dir, 1 / L);
    var ref = Math.abs(y[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    var x = norm(cross(ref, y)), z = cross(x, y);
    box(g, t, L, t, M.basis(x, y, z, mul(add(from, to), 0.5)), c, emit);
  }

  function loft(g, sections, edgeCats, capCats) {
    function centroid(s) {
      var c = [0, 0, 0];
      s.forEach(function (p) { c = add(c, p); });
      return mul(c, 1 / s.length);
    }
    for (var i = 0; i < sections.length - 1; i++) {
      var A = sections[i], B = sections[i + 1], N = A.length;
      var ctr = mul(add(centroid(A), centroid(B)), 0.5);
      for (var j = 0; j < N; j++) {
        var k = (j + 1) % N;
        g.quad(A[j], A[k], B[k], B[j], edgeCats[j % edgeCats.length], 0, ctr);
      }
    }
    if (capCats) {
      [0, sections.length - 1].forEach(function (idx, w) {
        var S = sections[idx], c0 = centroid(S);
        var out = idx === 0 ? sub(c0, centroid(sections[1])) : sub(c0, centroid(sections[idx - 1]));
        var inner = sub(c0, mul(norm(out), 5));
        for (var j = 0; j < S.length; j++) g.tri(c0, S[j], S[(j + 1) % S.length], capCats[w], 0, inner);
      });
    }
  }

  /* ───────────── шейдеры ───────────── */
  var FACE_VS = [
    'attribute vec3 aPos; attribute vec3 aNor; attribute float aCat; attribute float aEmit;',
    'uniform mat4 uProj; uniform mat4 uView; uniform mat4 uModel; uniform mat3 uNormal; uniform vec3 uCam; uniform vec3 uPal[10];',
    'varying vec3 vNor; varying vec3 vCol; varying float vEmit; varying float vDepth; varying vec3 vToCam; varying float vY;',
    'void main(){',
    '  vec4 wp = uModel * vec4(aPos, 1.0);',
    '  vec4 vp = uView * wp;',
    '  gl_Position = uProj * vp;',
    '  vNor = uNormal * aNor; vCol = uPal[int(aCat + 0.5)]; vEmit = aEmit; vDepth = -vp.z; vToCam = uCam - wp.xyz; vY = wp.y;',
    '}'
  ].join('\n');
  var FACE_FS = [
    'precision mediump float;',
    'varying vec3 vNor; varying vec3 vCol; varying float vEmit; varying float vDepth; varying vec3 vToCam; varying float vY;',
    'uniform vec3 uFace; uniform float uAmb; uniform float uKeyAmt; uniform vec3 uKeyDir; uniform float uTint; uniform float uRim;',
    'uniform vec3 uFog; uniform float uFogNear; uniform float uFogFar; uniform float uFogMax; uniform float uScanY; uniform float uScan;',
    'void main(){',
    '  vec3 n = normalize(vNor);',
    '  vec3 v = normalize(vToCam);',
    '  if (dot(n, v) < 0.0) n = -n;',
    '  float k = max(dot(n, uKeyDir), 0.0);',
    '  float rim = pow(1.0 - max(dot(n, v), 0.0), 2.2);',
    '  vec3 col = uFace * (uAmb + uKeyAmt * k) + vCol * (uTint + rim * uRim);',
    '  float s = (1.0 - smoothstep(0.0, 2.4, abs(vY - uScanY))) * uScan;',
    '  col += vCol * s * 0.3;',
    '  col = mix(col, vCol * 1.1 + vec3(0.12), vEmit);',
    '  float fog = smoothstep(uFogNear, uFogFar, vDepth) * uFogMax * (1.0 - vEmit * 0.6);',
    '  gl_FragColor = vec4(mix(col, uFog, fog), 1.0);',
    '}'
  ].join('\n');
  var LINE_VS = [
    'attribute vec3 aPos; attribute float aCat;',
    'uniform mat4 uProj; uniform mat4 uView; uniform mat4 uModel; uniform vec3 uPal[10];',
    'varying vec3 vCol; varying float vDepth; varying float vY;',
    'void main(){',
    '  vec4 wp = uModel * vec4(aPos, 1.0);',
    '  vec4 vp = uView * wp;',
    '  gl_Position = uProj * vp;',
    '  vCol = uPal[int(aCat + 0.5)]; vDepth = -vp.z; vY = wp.y;',
    '}'
  ].join('\n');
  var LINE_FS = [
    'precision mediump float;',
    'varying vec3 vCol; varying float vDepth; varying float vY;',
    'uniform float uAlpha; uniform float uFogNear; uniform float uFogFar; uniform float uFogMax; uniform float uScanY; uniform float uScan;',
    'void main(){',
    '  float fog = smoothstep(uFogNear, uFogFar, vDepth) * uFogMax;',
    '  float s = (1.0 - smoothstep(0.0, 2.4, abs(vY - uScanY))) * uScan;',
    '  float a = clamp(uAlpha * (1.0 - fog) + s * 0.5, 0.0, 1.0);',
    '  gl_FragColor = vec4((vCol + vec3(s * 0.45)) * a, a);',
    '}'
  ].join('\n');

  function program(gl, vs, fs, attrs, unis) {
    var p = gl.createProgram();
    [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]].forEach(function (s) {
      var sh = gl.createShader(s[0]);
      gl.shaderSource(sh, s[1]);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
      gl.attachShader(p, sh);
    });
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var o = { p: p, a: {}, u: {} };
    attrs.forEach(function (n) { o.a[n] = gl.getAttribLocation(p, n); });
    unis.forEach(function (n) { o.u[n] = gl.getUniformLocation(p, n); });
    return o;
  }

  function Renderer(canvas) {
    var gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true }) ||
      canvas.getContext('experimental-webgl', { alpha: true, antialias: true });
    if (!gl) throw new Error('WebGL недоступен');
    this.gl = gl;
    this.canvas = canvas;
    this.meshes = [];
    this.dpr = 1;
    this.face = program(gl, FACE_VS, FACE_FS, ['aPos', 'aNor', 'aCat', 'aEmit'],
      ['uProj', 'uView', 'uModel', 'uNormal', 'uCam', 'uPal', 'uFace', 'uAmb', 'uKeyAmt', 'uKeyDir', 'uTint', 'uRim',
        'uFog', 'uFogNear', 'uFogFar', 'uFogMax', 'uScanY', 'uScan']);
    this.line = program(gl, LINE_VS, LINE_FS, ['aPos', 'aCat'],
      ['uProj', 'uView', 'uModel', 'uPal', 'uAlpha', 'uFogNear', 'uFogFar', 'uFogMax', 'uScanY', 'uScan']);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    // стиль задаётся снаружи (палитра темы), здесь значения по умолчанию
    this.style = {
      pal: new Float32Array(30), face: [0.03, 0.06, 0.08], amb: 0.9, keyAmt: 0.6, keyDir: norm([-0.45, 0.8, 0.55]),
      tint: 0.06, rim: 0.5, fog: [0.05, 0.1, 0.13], fogNear: 160, fogFar: 520, fogMax: 0.9,
      lineAlpha: 0.85, xray: 0.12, additive: true, scanY: -999, scan: 0
    };
  }

  Renderer.prototype.mesh = function (geo, opts) {
    var gl = this.gl;
    opts = opts || {};
    var m = { matrix: M.id(), visible: true, xray: opts.xray !== false, faces: opts.faces !== false, lines: opts.lines !== false };
    m.fbuf = gl.createBuffer();
    m.lbuf = gl.createBuffer();
    this.update(m, geo, opts.edgeAngle);
    this.meshes.push(m);
    return m;
  };
  Renderer.prototype.update = function (m, geo, edgeAngle) {
    var gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, m.fbuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geo.d), gl.STATIC_DRAW);
    m.fcount = geo.count;
    var lines = geo.edges(edgeAngle);
    gl.bindBuffer(gl.ARRAY_BUFFER, m.lbuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.STATIC_DRAW);
    m.lcount = lines.length / 4;
  };

  Renderer.prototype.resize = function () {
    var c = this.canvas;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(c.clientWidth * dpr)), h = Math.max(1, Math.round(c.clientHeight * dpr));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    this.dpr = dpr;
    return { w: c.clientWidth, h: c.clientHeight };
  };

  Renderer.prototype.render = function (cam) {
    var gl = this.gl, S = this.style;
    var size = this.resize();
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var mats = cam.matrices(size.w / Math.max(1, size.h));
    var proj = new Float32Array(mats.proj), view = new Float32Array(mats.view);
    var i, m;

    // 1. грани
    var F = this.face;
    gl.useProgram(F.p);
    gl.disable(gl.BLEND);
    gl.depthMask(true);
    gl.depthFunc(gl.LESS);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1, 1);
    gl.uniformMatrix4fv(F.u.uProj, false, proj);
    gl.uniformMatrix4fv(F.u.uView, false, view);
    gl.uniform3fv(F.u.uCam, mats.eye);
    gl.uniform3fv(F.u.uPal, S.pal);
    gl.uniform3fv(F.u.uFace, S.face); gl.uniform1f(F.u.uAmb, S.amb); gl.uniform1f(F.u.uKeyAmt, S.keyAmt);
    gl.uniform3fv(F.u.uKeyDir, S.keyDir); gl.uniform1f(F.u.uTint, S.tint); gl.uniform1f(F.u.uRim, S.rim);
    gl.uniform3fv(F.u.uFog, S.fog); gl.uniform1f(F.u.uFogNear, S.fogNear); gl.uniform1f(F.u.uFogFar, S.fogFar); gl.uniform1f(F.u.uFogMax, S.fogMax);
    gl.uniform1f(F.u.uScanY, S.scanY); gl.uniform1f(F.u.uScan, S.scan);
    for (i = 0; i < this.meshes.length; i++) {
      m = this.meshes[i];
      if (!m.visible || !m.faces || !m.fcount) continue;
      gl.bindBuffer(gl.ARRAY_BUFFER, m.fbuf);
      gl.enableVertexAttribArray(F.a.aPos); gl.vertexAttribPointer(F.a.aPos, 3, gl.FLOAT, false, 32, 0);
      gl.enableVertexAttribArray(F.a.aNor); gl.vertexAttribPointer(F.a.aNor, 3, gl.FLOAT, false, 32, 12);
      gl.enableVertexAttribArray(F.a.aCat); gl.vertexAttribPointer(F.a.aCat, 1, gl.FLOAT, false, 32, 24);
      gl.enableVertexAttribArray(F.a.aEmit); gl.vertexAttribPointer(F.a.aEmit, 1, gl.FLOAT, false, 32, 28);
      gl.uniformMatrix4fv(F.u.uModel, false, new Float32Array(m.matrix));
      gl.uniformMatrix3fv(F.u.uNormal, false, new Float32Array(M.normal3(m.matrix)));
      gl.drawArrays(gl.TRIANGLES, 0, m.fcount);
    }
    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.disableVertexAttribArray(F.a.aNor);
    gl.disableVertexAttribArray(F.a.aEmit);

    // 2. рёбра: видимые, затем «рентген» сквозь корпус
    var L = this.line;
    gl.useProgram(L.p);
    gl.enable(gl.BLEND);
    if (S.additive) gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    else gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    gl.uniformMatrix4fv(L.u.uProj, false, proj);
    gl.uniformMatrix4fv(L.u.uView, false, view);
    gl.uniform3fv(L.u.uPal, S.pal);
    gl.uniform1f(L.u.uFogNear, S.fogNear); gl.uniform1f(L.u.uFogFar, S.fogFar); gl.uniform1f(L.u.uFogMax, S.fogMax);
    gl.uniform1f(L.u.uScanY, S.scanY); gl.uniform1f(L.u.uScan, S.scan);
    [[true, S.lineAlpha], [false, S.xray]].forEach(function (pass) {
      if (pass[1] <= 0) return;
      if (pass[0]) { gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); } else gl.disable(gl.DEPTH_TEST);
      gl.uniform1f(L.u.uAlpha, pass[1]);
      for (var j = 0; j < this.meshes.length; j++) {
        var mm = this.meshes[j];
        if (!mm.visible || !mm.lines || !mm.lcount) continue;
        if (!pass[0] && !mm.xray) continue;
        gl.bindBuffer(gl.ARRAY_BUFFER, mm.lbuf);
        gl.enableVertexAttribArray(L.a.aPos); gl.vertexAttribPointer(L.a.aPos, 3, gl.FLOAT, false, 16, 0);
        gl.enableVertexAttribArray(L.a.aCat); gl.vertexAttribPointer(L.a.aCat, 1, gl.FLOAT, false, 16, 12);
        gl.uniformMatrix4fv(L.u.uModel, false, new Float32Array(mm.matrix));
        gl.drawArrays(gl.LINES, 0, mm.lcount);
      }
    }, this);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    return mats;
  };

  /* ───────────── орбитальная камера ───────────── */
  function Camera(o) {
    this.target = (o.target || [0, 0, 0]).slice();
    this.dist = o.dist || 100;
    this.az = o.az || 0;
    this.el = o.el || 0.3;
    this.fov = o.fov || 0.62;
    this.minDist = o.minDist || 20; this.maxDist = o.maxDist || 400;
    this.minEl = o.minEl == null ? -0.15 : o.minEl; this.maxEl = o.maxEl == null ? 1.35 : o.maxEl;
    this.near = o.near || 1; this.far = o.far || 1400;
    this.last = null;
  }
  Camera.prototype.eye = function () {
    var c = Math.cos(this.el);
    return [this.target[0] + this.dist * c * Math.sin(this.az), this.target[1] + this.dist * Math.sin(this.el), this.target[2] + this.dist * c * Math.cos(this.az)];
  };
  Camera.prototype.matrices = function (aspect) {
    var eye = this.eye();
    var proj = M.perspective(this.fov, aspect, this.near, this.far);
    var view = M.lookAt(eye, this.target, [0, 1, 0]);
    this.last = { proj: proj, view: view, vp: M.mul(proj, view), eye: eye };
    return this.last;
  };
  Camera.prototype.project = function (p, w, h) {
    if (!this.last) return null;
    var c = M.apply4(this.last.vp, p);
    if (c[3] <= 0.01) return { x: -9999, y: -9999, front: false, depth: 0 };
    return { x: (c[0] / c[3] * 0.5 + 0.5) * w, y: (1 - (c[1] / c[3] * 0.5 + 0.5)) * h, front: true, depth: c[3] };
  };
  Camera.prototype.clamp = function () {
    this.dist = Math.max(this.minDist, Math.min(this.maxDist, this.dist));
    this.el = Math.max(this.minEl, Math.min(this.maxEl, this.el));
  };
  Camera.prototype.flyTo = function (to, ms) {
    var from = { target: this.target.slice(), dist: this.dist, az: this.az, el: this.el };
    var dest = {
      target: to.target ? to.target.slice() : from.target,
      dist: to.dist != null ? to.dist : from.dist,
      el: to.el != null ? to.el : from.el,
      az: to.az != null ? to.az : from.az
    };
    var d = dest.az - from.az;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    dest.az = from.az + d;
    this.tween = { from: from, to: dest, t0: performance.now(), ms: ms || 900 };
  };
  Camera.prototype.update = function (now) {
    var tw = this.tween;
    if (!tw) return false;
    var t = Math.min(1, (now - tw.t0) / tw.ms);
    var e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    this.target = lerp3(tw.from.target, tw.to.target, e);
    this.dist = lerp(tw.from.dist, tw.to.dist, e);
    this.az = lerp(tw.from.az, tw.to.az, e);
    this.el = lerp(tw.from.el, tw.to.el, e);
    if (t >= 1) this.tween = null;
    return true;
  };

  function attachControls(el, cam, opts) {
    opts = opts || {};
    var pointers = {}, last = null, pinch = 0, vel = { az: 0, el: 0 };
    var onInteract = opts.onInteract || function () {};
    var touchMode = false;
    function dist2(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
    el.addEventListener('pointerdown', function (e) {
      if (e.target.closest && e.target.closest('button')) return;
      el.setPointerCapture(e.pointerId);
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      touchMode = e.pointerType === 'touch';
      last = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pointers);
      if (ids.length === 2) pinch = dist2(pointers[ids[0]], pointers[ids[1]]);
      cam.tween = null;
      onInteract();
    });
    el.addEventListener('pointermove', function (e) {
      if (!pointers[e.pointerId]) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pointers);
      if (ids.length === 2) {
        var d = dist2(pointers[ids[0]], pointers[ids[1]]);
        if (pinch > 0) { cam.dist *= pinch / d; cam.clamp(); }
        pinch = d;
        return;
      }
      var dx = e.clientX - last.x, dy = e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      vel.az = -dx * 0.0065;
      vel.el = touchMode ? 0 : dy * 0.005;
      cam.az += vel.az;
      cam.el += vel.el;
      cam.clamp();
    });
    function up(e) {
      delete pointers[e.pointerId];
      if (Object.keys(pointers).length < 2) pinch = 0;
    }
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', function (e) {
      if (opts.wheelNeedsFocus && document.activeElement !== el && !e.ctrlKey) return;
      e.preventDefault();
      cam.tween = null;
      cam.dist *= Math.exp(e.deltaY * 0.0012);
      cam.clamp();
      onInteract();
    }, { passive: false });
    el.addEventListener('keydown', function (e) {
      var used = true;
      if (e.key === 'ArrowLeft') cam.az -= 0.12;
      else if (e.key === 'ArrowRight') cam.az += 0.12;
      else if (e.key === 'ArrowUp') cam.el += 0.08;
      else if (e.key === 'ArrowDown') cam.el -= 0.08;
      else if (e.key === '+' || e.key === '=') cam.dist *= 0.85;
      else if (e.key === '-') cam.dist *= 1.18;
      else used = false;
      if (used) { e.preventDefault(); cam.tween = null; cam.clamp(); onInteract(); }
    });
    return {
      step: function () {
        if (Object.keys(pointers).length) return false;
        if (Math.abs(vel.az) < 1e-4 && Math.abs(vel.el) < 1e-4) return false;
        vel.az *= 0.92; vel.el *= 0.92;
        cam.az += vel.az; cam.el += vel.el; cam.clamp();
        return true;
      },
      dragging: function () { return Object.keys(pointers).length > 0; }
    };
  }

  /* ───────────── перекрытие: луч против треугольников ───────────── */
  function occluded(tris, from, to) {
    var dx = to[0] - from[0], dy = to[1] - from[1], dz = to[2] - from[2];
    var L = Math.sqrt(dx * dx + dy * dy + dz * dz);
    dx /= L; dy /= L; dz /= L;
    var maxT = L - 1.6;
    for (var i = 0; i < tris.length; i += 9) {
      var ax = tris[i], ay = tris[i + 1], az = tris[i + 2];
      var e1x = tris[i + 3] - ax, e1y = tris[i + 4] - ay, e1z = tris[i + 5] - az;
      var e2x = tris[i + 6] - ax, e2y = tris[i + 7] - ay, e2z = tris[i + 8] - az;
      var px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x;
      var det = e1x * px + e1y * py + e1z * pz;
      if (det > -1e-7 && det < 1e-7) continue;
      var inv = 1 / det;
      var sx = from[0] - ax, sy = from[1] - ay, sz = from[2] - az;
      var uu = (sx * px + sy * py + sz * pz) * inv;
      if (uu < 0 || uu > 1) continue;
      var qx = sy * e1z - sz * e1y, qy = sz * e1x - sx * e1z, qz = sx * e1y - sy * e1x;
      var vv = (dx * qx + dy * qy + dz * qz) * inv;
      if (vv < 0 || uu + vv > 1) continue;
      var t = (e2x * qx + e2y * qy + e2z * qz) * inv;
      if (t > 0.5 && t < maxT) return true;
    }
    return false;
  }

  function supported() {
    try {
      var c = document.createElement('canvas');
      var gl = window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'));
      if (!gl) return false;
      var lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
      return true;
    } catch (e) { return false; }
  }

  window.FT3D = {
    M: M, Geo: Geo, box: box, frustum: frustum, cylinder: cylinder, sphere: sphere, beam: beam, loft: loft,
    Renderer: Renderer, Camera: Camera, attachControls: attachControls, occluded: occluded, supported: supported,
    v: { sub: sub, add: add, mul: mul, dot: dot, cross: cross, len: len, norm: norm, lerp: lerp, lerp3: lerp3 }
  };
})();
