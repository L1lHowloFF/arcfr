/* Frozen Trail — полевой гайд. Вся логика страницы. Данные лежат в js/data/*.js */
(function () {
  'use strict';

  var FT = window.FT || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* приватный режим и т.п. */ } }
  };
  var reduceMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var fmt = function (n) { return Number(n).toLocaleString('ru-RU'); };

  var RARITY = { common: 'Обычное', uncommon: 'Необычное', rare: 'Редкое', epic: 'Эпическое', legendary: 'Легендарное' };
  var RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  var AMMO = {
    light: 'Лёгкие патроны', medium: 'Средние патроны', heavy: 'Тяжёлые патроны',
    shotgun: 'Дробь', launcher: 'Launcher Ammo', energy: 'Energy Clip'
  };
  var TYPES = {
    weapon: 'Оружие', mod: 'Обвес', gadget: 'Гаджет', grenade: 'Граната', mine: 'Мина',
    augment: 'Аугмент', med: 'Медицина', mat: 'Материал', gear: 'Снаряжение'
  };
  var SRC = FT.sources || {};
  var UI = FT.ui = FT.ui || { selectListeners: [], viewListeners: [] };

  function srcLinks(ids) {
    return (ids || []).filter(function (id) { return SRC[id]; }).map(function (id) {
      return '<a href="' + esc(SRC[id].u) + '" target="_blank" rel="noopener">' + esc(SRC[id].t) + '</a>';
    }).join(', ');
  }
  // подписи колонок для таблиц, которые на телефоне складываются в карточки
  function labelTable(table) {
    if (!table) return;
    var heads = $$('thead th', table).map(function (th) { return th.textContent.trim(); });
    $$('tbody tr', table).forEach(function (tr) {
      Array.prototype.forEach.call(tr.children, function (cell, i) {
        if (i > 0 && heads[i] && !cell.hasAttribute('data-label')) cell.setAttribute('data-label', heads[i]);
      });
    });
  }
  function rarityChip(r) {
    if (!r) return '';
    return '<span class="rar rar--' + r + '">' + RARITY[r] + '</span>';
  }

  /* ───────────── Тема ───────────── */
  var root = document.documentElement;
  var themeBtn = $('#themeToggle');
  function effectiveTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }
  function syncThemeLabel() {
    if (!themeBtn) return;
    themeBtn.setAttribute('aria-label', effectiveTheme() === 'dark' ? 'Светлая тема' : 'Тёмная тема');
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('ft-theme', next); } catch (e) { /* ничего */ }
      syncThemeLabel();
    });
    syncThemeLabel();
  }

  /* ───────────── Строки «Источники» ───────────── */
  $$('.src[data-src]').forEach(function (el) {
    var html = srcLinks(el.getAttribute('data-src').split(','));
    if (html) el.innerHTML = 'Источники: ' + html + '.';
  });

  /* ───────────── Подсветка раздела в навигации ───────────── */
  (function () {
    var links = $$('.rail a');
    var rail = $('.rail');
    var sections = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
    var current = null;
    function update() {
      var line = window.innerHeight * 0.3;
      var active = null;
      sections.forEach(function (s) { if (s.getBoundingClientRect().top <= line) active = s; });
      if (active === current) return;
      current = active;
      links.forEach(function (a) {
        var on = active && a.getAttribute('href') === '#' + active.id;
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        if (on && rail && rail.scrollWidth > rail.clientWidth + 4) {
          rail.scrollTo({ left: a.offsetLeft - 16, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      });
    }
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; update(); });
    }, { passive: true });
    update();
  })();

  /* ───────────── Фрегат: схема ───────────── */
  (function () {
    if (!FT.frigate) return;
    var stage = $('#skStage');
    var markersEl = $('#skMarkers');
    var detail = $('#skDetail');
    var raidList = $('#raidList');
    if (!stage || !markersEl || !detail) return;

    var VB = { w: 1200, h: 660 };
    var all = FT.frigate.hotspots.slice();
    var order = { route: 0, target: 1, loot: 2, danger: 3 };
    all.sort(function (a, b) { return (order[a.type] - order[b.type]) || ((a.step || 0) - (b.step || 0)); });
    var route = all.filter(function (h) { return h.type === 'route'; });
    var byId = {};
    all.forEach(function (h) { byId[h.id] = h; });

    var ICON = {
      target: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 1.5 26.5 14 14 26.5 1.5 14Z" fill="var(--hazard)" stroke="#1C1400" stroke-width="1.5"/><circle cx="14" cy="14" r="4.2" fill="none" stroke="#1C1400" stroke-width="2"/><path d="M14 6.5v3.2M14 18.3v3.2M6.5 14h3.2M18.3 14h3.2" stroke="#1C1400" stroke-width="2" stroke-linecap="round"/></svg>',
      loot: '<svg viewBox="0 0 28 28" aria-hidden="true"><rect x="2.5" y="5" width="23" height="18.5" rx="3" fill="var(--glacier)" stroke="rgba(0,0,0,.35)"/><path d="M2.5 11.5h23M11 11.5v4h6v-4" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>',
      danger: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 2.5 26.5 25H1.5Z" fill="var(--ink)" stroke="var(--bg)" stroke-width="1.5" stroke-linejoin="round"/><path d="M14 10v7" stroke="var(--bg)" stroke-width="2.6" stroke-linecap="round"/><circle cx="14" cy="20.6" r="1.6" fill="var(--bg)"/></svg>'
    };
    var KIND_LABEL = { target: 'Что уничтожить', loot: 'Лут', danger: 'Опасность' };

    var fmap = $('#frigateMap');
    var view = '3d';
    var done = {};
    store.get('ft-frigate-done', []).forEach(function (id) { done[id] = true; });
    var selected = null;
    var buttons = {};

    all.forEach(function (h) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'hs hs--' + h.type + (h.kind ? ' k-' + h.kind : '');
      b.style.left = (h.x / VB.w * 100) + '%';
      b.style.top = (h.y / VB.h * 100) + '%';
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('data-id', h.id);
      b.setAttribute('aria-label', h.type === 'route' ? 'Шаг ' + h.step + ': ' + h.title : KIND_LABEL[h.type] + ': ' + h.title);
      b.innerHTML = h.type === 'route' ? '<span class="blaze">' + h.step + '</span>' : ICON[h.type];
      b.addEventListener('click', function () { select(h.id, false); });
      markersEl.appendChild(b);
      buttons[h.id] = b;
    });

    function ensureVisible(id) {
      var sc = $('.sk-scroll');
      var b = buttons[id];
      if (!sc || !b || sc.scrollWidth <= sc.clientWidth + 2) return;
      sc.scrollTo({ left: b.offsetLeft - sc.clientWidth / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    function select(id, fromOutside) {
      var h = byId[id];
      if (!h) return;
      selected = id;
      $$('.hs[data-id]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-id') === id ? 'true' : 'false'); });
      // если слой скрыт, показываем его
      var layerBtn = $('.layer[data-layer="' + h.type + '"]');
      if (layerBtn && layerBtn.getAttribute('aria-pressed') === 'false') layerBtn.click();
      renderDetail(h);
      renderRaid();
      if (fromOutside && view === '2d') ensureVisible(id);
      UI.selectListeners.forEach(function (fn) { fn(id, fromOutside); });
    }

    function renderDetail(h) {
      var isRoute = h.type === 'route';
      var icon = isRoute ? '<span class="blaze">' + h.step + '</span>' : ICON[h.type];
      var kind = isRoute ? 'Шаг ' + h.step + ' из ' + route.length : KIND_LABEL[h.type];
      var html = '<div class="d-head"><span class="d-icon">' + icon + '</span><div><p class="d-kind">' + kind + '</p><h3 class="d-title">' + esc(h.title) + '</h3></div></div>';
      html += '<p class="d-body">' + h.body + '</p>';
      html += '<div class="d-shots" hidden></div>';
      if (h.list && h.list.length) html += '<ul class="d-list">' + h.list.map(function (li) { return '<li>' + li + '</li>'; }).join('') + '</ul>';
      if (h.objective) html += '<p class="d-objective">' + h.objective + '</p>';
      if (h.warn) html += '<p class="d-warn">' + h.warn + '</p>';
      if (isRoute) {
        var i = route.indexOf(h);
        html += '<div class="d-nav">' +
          '<button type="button" class="btn-quiet" data-go="' + (i > 0 ? route[i - 1].id : '') + '"' + (i > 0 ? '' : ' disabled') + '>Предыдущий шаг</button>' +
          '<button type="button" class="btn-quiet" data-go="' + (i < route.length - 1 ? route[i + 1].id : '') + '"' + (i < route.length - 1 ? '' : ' disabled') + '>Следующий шаг</button>' +
          '<button type="button" class="btn" data-done="' + h.id + '">' + (done[h.id] ? 'Снять отметку' : 'Отметить шаг') + '</button>' +
          '</div>';
      }
      var s = srcLinks(h.src);
      if (s) html += '<p class="d-src">Источники: ' + s + '.</p>';
      detail.innerHTML = html;
      $$('[data-go]', detail).forEach(function (b) {
        b.addEventListener('click', function () { if (b.getAttribute('data-go')) select(b.getAttribute('data-go'), true); });
      });
      var doneBtn = $('[data-done]', detail);
      if (doneBtn) doneBtn.addEventListener('click', function () { toggleDone(h.id); renderDetail(h); });
      loadShots(h.id).then(function (urls) {
        var box = $('.d-shots', detail);
        if (selected !== h.id || !box || !urls.length) return;
        box.innerHTML = urls.map(function (u, i) {
          return '<a class="d-shot" href="' + esc(u) + '" target="_blank" rel="noopener"><img src="' + esc(u) + '" alt="Скриншот из игры: ' +
            esc(h.title) + (urls.length > 1 ? ', ' + (i + 1) : '') + '" decoding="async"></a>';
        }).join('') + '<p class="d-shots-cap">Так это выглядит в игре. Нажми, чтобы открыть в полном размере.</p>';
        box.classList.toggle('d-shots--many', urls.length > 1);
        box.hidden = false;
      });
    }

    // свои скриншоты: assets/frigate/<id>.jpg (или .png, .webp), дополнительные — <id>-2, <id>-3
    var SHOT_EXT = ['jpg', 'png', 'webp'];
    var shotCache = {};
    function probeImage(url) {
      return new Promise(function (resolve) {
        var im = new Image();
        im.onload = function () { resolve(url); };
        im.onerror = function () { resolve(null); };
        im.src = url;
      });
    }
    function findShot(base) {
      var i = 0;
      return new Promise(function (resolve) {
        (function next() {
          if (i >= SHOT_EXT.length) { resolve(null); return; }
          probeImage(base + '.' + SHOT_EXT[i++]).then(function (u) { if (u) resolve(u); else next(); });
        })();
      });
    }
    function loadShots(id) {
      if (!window.Promise) return { then: function () {} };
      if (!shotCache[id]) {
        shotCache[id] = new Promise(function (resolve) {
          var out = [];
          (function next(n) {
            findShot('assets/frigate/' + id + (n > 1 ? '-' + n : '')).then(function (u) {
              if (u) out.push(u);
              if (u && n < 3) next(n + 1); else resolve(out);
            });
          })(1);
        });
      }
      return shotCache[id];
    }

    function toggleDone(id) {
      if (done[id]) delete done[id]; else done[id] = true;
      store.set('ft-frigate-done', Object.keys(done));
      renderRaid();
    }

    function renderRaid() {
      if (!raidList) return;
      raidList.innerHTML = route.map(function (h) {
        var cls = (done[h.id] ? 'is-done ' : '') + (selected === h.id ? 'is-current' : '');
        return '<li class="' + cls + '"><input type="checkbox" data-id="' + h.id + '"' + (done[h.id] ? ' checked' : '') +
          ' aria-label="Шаг ' + h.step + ' выполнен"><button type="button" data-id="' + h.id + '"><span class="n">' + h.step + '.</span>' + esc(h.short) + '</button></li>';
      }).join('');
      $$('input', raidList).forEach(function (cb) {
        cb.addEventListener('change', function () {
          toggleDone(cb.getAttribute('data-id'));
          if (selected === cb.getAttribute('data-id')) renderDetail(byId[selected]);
          var again = $('input[data-id="' + cb.getAttribute('data-id') + '"]', raidList);
          if (again) again.focus();
        });
      });
      $$('button', raidList).forEach(function (b) {
        b.addEventListener('click', function () { select(b.getAttribute('data-id'), true); });
      });
      var n = route.filter(function (h) { return done[h.id]; }).length;
      var cnt = $('#raidCount');
      var bar = $('#raidBar');
      if (cnt) cnt.textContent = n + ' из ' + route.length;
      if (bar) bar.style.width = (n / route.length * 100) + '%';
      route.forEach(function (h) {
        $$('.hs[data-id="' + h.id + '"]').forEach(function (b) { b.classList.toggle('is-done', !!done[h.id]); });
      });
    }

    var reset = $('#raidReset');
    if (reset) reset.addEventListener('click', function () {
      done = {};
      store.set('ft-frigate-done', []);
      renderRaid();
      if (selected) renderDetail(byId[selected]);
    });

    // слои
    $$('#skLayers .layer').forEach(function (b) {
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (fmap) fmap.classList.toggle('hide-' + b.getAttribute('data-layer'), !on);
      });
    });

    // маршрут прорисовывается один раз, когда схема попадает в кадр
    if (!reduceMotion && 'IntersectionObserver' in window) {
      stage.classList.add('will-draw');
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            requestAnimationFrame(function () {
              stage.classList.add('draw');
              stage.classList.remove('will-draw');
            });
            io.disconnect();
          }
        });
      }, { threshold: 0.35 });
      io.observe(stage);
    }

    // прокрутка схемы на телефоне: сразу показываем середину корабля
    var sc = $('.sk-scroll');
    var wrap2d = $('.sk-wrap');
    var centered = false;
    function checkScroll() {
      var scrollable = sc && sc.scrollWidth > sc.clientWidth + 2;
      if (wrap2d) wrap2d.classList.toggle('is-scrollable', !!scrollable);
      if (scrollable && !centered) { sc.scrollLeft = (sc.scrollWidth - sc.clientWidth) / 2; centered = true; }
    }
    window.addEventListener('resize', checkScroll);

    // вкладки «3D-модель» / «Схема» / «Видео из игры»
    var tabs = $$('#frigateMap [role="tab"]');
    function setView(v, save) {
      view = v;
      tabs.forEach(function (tb) {
        var on = tb.id === 'tab' + v;
        tb.setAttribute('aria-selected', on ? 'true' : 'false');
        tb.setAttribute('tabindex', on ? '0' : '-1');
        var panel = document.getElementById(tb.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (fmap) fmap.setAttribute('data-view', v);
      if (save) store.set('ft-frigate-view', v);
      if (v === '2d') checkScroll();
      UI.viewListeners.forEach(function (fn) { fn(v); });
    }
    tabs.forEach(function (tb, i) {
      tb.addEventListener('click', function () { setView(tb.id.replace('tab', ''), true); });
      tb.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        next.focus();
        next.click();
      });
    });

    // ссылки вида «смотри на вкладке …» под картой
    $$('[data-goto-view]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var v = btn.getAttribute('data-goto-view');
        setView(v, true);
        var tb = document.getElementById('tab' + v);
        if (tb) tb.focus({ preventScroll: true });
        var r = fmap ? fmap.getBoundingClientRect() : null;
        if (r && r.top < 70) window.scrollTo({ top: window.pageYOffset + r.top - 140, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });

    UI.selectFrigate = select;
    UI.frigateSelected = function () { return selected; };
    UI.frigateHotspots = all;
    UI.frigateIcons = ICON;
    UI.frigateKind = KIND_LABEL;
    UI.isDone = function (id) { return !!done[id]; };
    UI.frigateView = function () { return view; };
    UI.setFrigateView = setView;
    UI.disable3d = function () {
      var t3 = $('#tab3d');
      if (t3) t3.hidden = true;
      setView('2d', false);
    };

    setView(store.get('ft-frigate-view', '3d') === '2d' ? '2d' : '3d', false);
    select('r1', false);
  })();

  /* ───────────── Видео из игры ───────────── */
  (function () {
    var V = FT.videos;
    var roots = $$('.vids[data-group]');
    if (!roots.length) return;
    // с диска (file://) YouTube не даёт встроить плеер, поэтому ролик открывается на сайте YouTube
    var embeddable = /^https?:$/.test(location.protocol);
    var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6L19.2 12z"/></svg>';
    var blocks = [];

    function watchUrl(id) { return 'https://www.youtube.com/watch?v=' + encodeURIComponent(id); }
    function thumbUrl(id, q) { return 'https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/' + q + '.jpg'; }
    function by(v) { return v.author ? esc(v.author) : 'YouTube'; }

    function poster(b) {
      var v = b.list[b.cur];
      var yt = $('.yt', b.root);
      yt.classList.remove('yt--noimg');
      yt.innerHTML = '<a class="yt-poster" href="' + watchUrl(v.id) + '" target="_blank" rel="noopener" aria-label="Смотреть видео: ' + esc(v.note) + ' (' + by(v) + ')' + (embeddable ? '' : ', откроется на YouTube') + '">' +
        '<img alt="" decoding="async">' +
        '<span class="yt-play">' + PLAY + '</span>' +
        '<span class="yt-cap"><span class="yt-note">' + esc(v.note) + '</span><span class="yt-by">' + by(v) + '</span></span></a>';
      var img = $('img', yt);
      // сначала пробуем превью в высоком качестве; если его нет, YouTube отдаёт заглушку 120×90
      img.onload = function () {
        if (img.naturalWidth <= 120 && img.src.indexOf('maxresdefault') > -1) img.src = thumbUrl(v.id, 'hqdefault');
      };
      img.onerror = function () {
        if (img.src.indexOf('maxresdefault') > -1) img.src = thumbUrl(v.id, 'hqdefault');
        else { img.remove(); yt.classList.add('yt--noimg'); }
      };
      img.src = thumbUrl(v.id, 'maxresdefault');
      $('.yt-poster', yt).addEventListener('click', function (e) {
        if (!embeddable || e.ctrlKey || e.metaKey || e.shiftKey || e.button > 0) return;
        e.preventDefault();
        play(b);
      });
      b.playing = false;
    }

    function play(b) {
      blocks.forEach(function (o) { if (o !== b && o.playing) poster(o); });
      var v = b.list[b.cur];
      var yt = $('.yt', b.root);
      yt.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.id) + '?autoplay=1&rel=0&playsinline=1" title="' + esc(v.title) + '"' +
        ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen' +
        ' referrerpolicy="strict-origin-when-cross-origin"></iframe>';
      b.playing = true;
      var fr = $('iframe', yt);
      if (fr) fr.focus();
    }

    function meta(b) {
      var v = b.list[b.cur];
      $('.vid-meta', b.root).innerHTML =
        '<span class="vid-orig">«' + esc(v.title) + '»' + (v.author ? ', ' + esc(v.author) : '') + '</span>' +
        '<a href="' + watchUrl(v.id) + '" target="_blank" rel="noopener">Открыть на YouTube</a>' +
        (embeddable ? '' : '<span class="vid-file">Сайт открыт как файл с диска, поэтому видео откроется на YouTube. На GitHub Pages оно играет прямо здесь.</span>');
    }

    // на телефоне список стоит под плеером: если плеер ушёл за край экрана, возвращаем его
    function reveal(b) {
      var r = $('.yt', b.root).getBoundingClientRect();
      var top = 130;
      if (r.top < top || r.top > window.innerHeight * 0.6) {
        window.scrollTo({ top: window.pageYOffset + r.top - top, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    }

    function show(b, i, autoplay) {
      b.cur = i;
      $$('.vid-item', b.root).forEach(function (it) { it.setAttribute('aria-pressed', +it.getAttribute('data-i') === i ? 'true' : 'false'); });
      meta(b);
      if (autoplay && embeddable) play(b); else poster(b);
    }

    roots.forEach(function (root) {
      var list = V && V[root.getAttribute('data-group')];
      if (!list || !list.length) {
        var head = root.previousElementSibling;
        if (head && head.classList.contains('sub')) head.hidden = true;
        root.hidden = true;
        return;
      }
      var single = list.length === 1;
      root.classList.toggle('vids--single', single);
      var html = '<div class="vid-main"><div class="yt"></div><p class="vid-meta"></p></div>';
      if (!single) {
        html += '<div class="vid-side"><ol class="vid-list" aria-label="Список видео">' + list.map(function (v, i) {
          return '<li><button type="button" class="vid-item" data-i="' + i + '" aria-pressed="false">' +
            '<span class="vid-thumb"><img src="' + thumbUrl(v.id, 'mqdefault') + '" alt="" loading="lazy" decoding="async"></span>' +
            '<span class="vid-text"><span class="t">' + esc(v.note) + '</span><span class="a">' + by(v) + '</span></span></button></li>';
        }).join('') + '</ol></div>';
      }
      root.innerHTML = html;
      $$('.vid-thumb img', root).forEach(function (im) { im.addEventListener('error', function () { im.remove(); }); });
      var b = { root: root, list: list, cur: 0, playing: false };
      blocks.push(b);
      $$('.vid-item', root).forEach(function (it) {
        it.addEventListener('click', function () {
          var i = +it.getAttribute('data-i');
          if (i === b.cur) { if (!b.playing && embeddable) play(b); }
          else show(b, i, b.playing);
          reveal(b);
        });
      });
      show(b, 0, false);
    });

    // ушли с вкладки «Видео из игры» — останавливаем ролик
    UI.viewListeners.push(function (v) {
      if (v === 'vid') return;
      blocks.forEach(function (b) { if (b.playing && b.root.closest('#viewvid')) poster(b); });
    });
  })();

  /* ───────────── Амплификация ───────────── */
  (function () {
    var A = FT.amplified;
    if (!A) return;
    var list = $('#ampList');
    var detailEl = $('#ampDetail');
    var mkGrid = $('#mkGrid');
    var perkBody = $('#perkTable tbody');
    var byId = {};
    A.weapons.forEach(function (w) { byId[w.id] = w; });
    var mkFor = {};
    A.modules.forEach(function (m) { mkFor[m.rarity] = m.mk; });
    var current = null;

    function researchFor(id) {
      return A.research.filter(function (r) { return r.usedBy.indexOf(id) !== -1; });
    }
    function matsHTML(mats) {
      return mats.map(function (m) { return esc(m[0]) + ' <span class="qty">×' + m[1] + '</span>'; }).join(', ');
    }

    // Марки модулей
    if (mkGrid) {
      mkGrid.innerHTML = A.modules.map(function (m) {
        var ws = A.weapons.filter(function (w) { return w.rarity === m.rarity; });
        return '<div class="mk" style="--rc: var(--r-' + m.rarity + ')"><p class="mk-name">' + m.mk + '</p><p class="mk-rar">' + RARITY[m.rarity] + ' оружие</p>' +
          '<ul class="mk-weapons">' + ws.map(function (w) { return '<li><button type="button" data-weapon="' + w.id + '">' + esc(w.name) + '</button></li>'; }).join('') + '</ul></div>';
      }).join('');
      $$('[data-weapon]', mkGrid).forEach(function (b) {
        b.addEventListener('click', function () {
          pick(b.getAttribute('data-weapon'));
          var ex = $('#ampExplorer');
          if (ex) ex.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        });
      });
    }

    // Список пушек
    if (list) {
      var html = '';
      RARITY_ORDER.forEach(function (r) {
        var ws = A.weapons.filter(function (w) { return w.rarity === r; });
        if (!ws.length) return;
        html += '<p class="amp-group" style="--rc: var(--r-' + r + ')">' + RARITY[r] + ', ' + mkFor[r] + '</p>';
        ws.forEach(function (w) {
          html += '<button type="button" class="amp-btn" data-id="' + w.id + '" aria-pressed="false">' + esc(w.name) +
            '<span class="cnt">' + w.perks.length + '</span></button>';
        });
      });
      list.innerHTML = html;
      $$('.amp-btn', list).forEach(function (b) {
        b.addEventListener('click', function () { pick(b.getAttribute('data-id')); });
      });
    }

    function pick(id) {
      var w = byId[id];
      if (!w || !detailEl) return;
      current = id;
      $$('.amp-btn', list).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-id') === id ? 'true' : 'false'); });
      var html = '<h3 class="amp-title">' + esc(w.name) + '</h3>';
      html += '<p class="amp-meta">' + rarityChip(w.rarity) + '<span>' + esc(w.cls) + '</span><span>' + AMMO[w.ammo] + '</span></p>';
      html += '<p class="amp-module">Нужен модуль <b>Amplification Module ' + mkFor[w.rarity] + '</b> и пушка IV тира.</p>';
      if (w.note) html += '<p class="amp-note">' + esc(w.note) + '</p>';
      html += '<h4>Улучшения</h4><ul class="perks">' + w.perks.map(function (p) {
        var tags = '';
        if (p.path) tags += '<span class="perk-tag">ветка ' + p.path + '</span>';
        if (p.exclusive) tags += '<span class="perk-tag perk-tag--ex" title="Закрывает конкурирующие ветки">эксклюзивное</span>';
        return '<li><span class="perk-name">' + esc(p.name) + '</span>' + (tags ? '<span class="perk-tags">' + tags + '</span>' : '') +
          (p.fx ? '<p class="perk-fx">' + esc(p.fx) + '</p>' : '<p class="perk-fx perk-fx--unknown">Эффект пока не описан.</p>') + '</li>';
      }).join('') + '</ul>';
      var rs = researchFor(id);
      html += '<h4>Исследования на Research Station 4</h4>';
      if (rs.length) {
        html += '<ul class="amp-research">' + rs.map(function (r) {
          return '<li><span class="r-name">' + esc(r.name) + '</span>' + (r.note ? ' (' + esc(r.note) + ')' : '') +
            ': 5 000 очков, ' + matsHTML(r.mats) + '.<br><span class="r-task">Задание: ' + esc(r.task || 'уточняется') + '.</span></li>';
        }).join('') + '</ul>';
      } else {
        html += '<p class="perk-fx perk-fx--unknown">Для этой пушки исследования в базах пока не расписаны.</p>';
      }
      detailEl.innerHTML = html;
    }

    // Таблица исследований
    if (perkBody) {
      perkBody.innerHTML = A.research.map(function (r) {
        var users = r.usedBy.length
          ? r.usedBy.map(function (id) { return '<button type="button" class="link-btn" data-weapon="' + id + '">' + esc(byId[id] ? byId[id].name : id) + '</button>'; }).join(', ')
          : '<span class="tbd">уточняется</span>';
        return '<tr><th scope="row">' + esc(r.name) + (r.note ? '<span class="cell-sub">' + esc(r.note) + '</span>' : '') + '</th>' +
          '<td>' + matsHTML(r.mats) + (r.partial ? ' <span class="tbd">список неполный</span>' : '') + '</td>' +
          '<td>' + (r.task ? esc(r.task) : '<span class="tbd">уточняется</span>') + '</td>' +
          '<td>' + users + '</td></tr>';
      }).join('');
      $$('[data-weapon]', perkBody).forEach(function (b) {
        b.addEventListener('click', function () {
          pick(b.getAttribute('data-weapon'));
          var ex = $('#ampExplorer');
          if (ex) ex.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        });
      });
    }

    labelTable($('#perkTable'));
    pick('rattler');
  })();

  /* ───────────── Ресурсы ───────────── */
  (function () {
    var rows = FT.resources;
    var body = $('#resTable tbody');
    if (!rows || !body) return;
    var input = $('#resSearch');
    var empty = $('#resEmpty');
    var tag = 'all';

    function render() {
      var q = (input && input.value || '').trim().toLowerCase();
      var shown = rows.filter(function (r) {
        if (tag !== 'all' && r.tags.indexOf(tag) === -1) return false;
        if (!q) return true;
        return (r.name + ' ' + r.where + ' ' + r.why).toLowerCase().indexOf(q) !== -1;
      });
      body.innerHTML = shown.map(function (r) {
        var s = srcLinks(r.src);
        return '<tr><td><span class="item-name">' + esc(r.name) + '</span>' +
          (r.rarity || r.tbd ? '<span class="cell-sub">' + rarityChip(r.rarity) + (r.tbd ? ' <span class="tbd">уточняется</span>' : '') + '</span>' : '') + '</td>' +
          '<td>' + esc(r.where) + '</td>' +
          '<td>' + esc(r.why) + (s ? '<span class="cell-sub">' + s + '</span>' : '') + '</td></tr>';
      }).join('');
      if (empty) empty.hidden = shown.length > 0;
      labelTable($('#resTable'));
    }
    if (input) input.addEventListener('input', render);
    $$('#resFilters .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        tag = c.getAttribute('data-tag');
        $$('#resFilters .chip').forEach(function (o) { o.setAttribute('aria-pressed', o === c ? 'true' : 'false'); });
        render();
      });
    });
    render();
  })();

  /* ───────────── Research Station ───────────── */
  (function () {
    var R = FT.research;
    if (!R) return;
    var stBody = $('#stationTable tbody');
    if (stBody) {
      stBody.innerHTML = R.levels.map(function (l) {
        return '<tr><th scope="row">' + l.lvl + '</th><td>' + (l.cost ? esc(l.cost) : '<span class="tbd">уточняется</span>') +
          (l.req ? '<span class="cell-sub">Условие: ' + esc(l.req) + '</span>' : '') + '</td><td>' + esc(l.unlocks) +
          (l.note ? '<span class="cell-sub">' + esc(l.note) + '</span>' : '') + '</td></tr>';
      }).join('');
      labelTable($('#stationTable'));
    }
    var body = $('#rsTable tbody');
    if (!body) return;
    var input = $('#rsSearch');
    var empty = $('#rsEmpty');
    var lvl = 'all';
    function render() {
      var q = (input && input.value || '').trim().toLowerCase();
      var shown = R.items.filter(function (it) {
        if (lvl === 'new' && !it.new) return false;
        if (lvl !== 'all' && lvl !== 'new' && String(it.lvl) !== lvl) return false;
        if (!q) return true;
        var hay = (it.name + ' ' + TYPES[it.t] + ' ' + it.mats.map(function (m) { return m[0]; }).join(' ')).toLowerCase();
        return hay.indexOf(q) !== -1;
      });
      body.innerHTML = shown.map(function (it) {
        return '<tr><td><span class="item-name">' + esc(it.name) + '</span>' + (it.new ? '<span class="new-tag">новое</span>' : '') + '</td>' +
          '<td>' + TYPES[it.t] + '</td><td class="num">' + it.lvl + '</td><td class="num">' + fmt(it.rp) + '</td>' +
          '<td>' + it.mats.map(function (m) { return esc(m[0]) + ' <span class="qty">×' + m[1] + '</span>'; }).join(', ') + '</td></tr>';
      }).join('');
      if (empty) empty.hidden = shown.length > 0;
      labelTable($('#rsTable'));
    }
    if (input) input.addEventListener('input', render);
    $$('#rsFilters .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        lvl = c.getAttribute('data-lvl');
        $$('#rsFilters .chip').forEach(function (o) { o.setAttribute('aria-pressed', o === c ? 'true' : 'false'); });
        render();
      });
    });
    render();
  })();

  /* ───────────── Pendola Pass: места и районы ───────────── */
  (function () {
    var P = FT.pendola;
    if (!P) return;
    var places = $('#places');
    if (places) {
      places.innerHTML = P.places.map(function (p) {
        return '<div class="place"><div><h4 class="place-name">' + esc(p.name) + '</h4><p class="place-region">' + esc(p.region) + '</p>' +
          (p.loot ? '<p class="place-loot">Лут: ' + esc(p.loot) + '</p>' : '') + '</div><div><p class="place-text">' + esc(p.text) + '</p>' +
          (p.tags && p.tags.length ? '<ul class="place-tags">' + p.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
          '</div></div>';
      }).join('');
    }
    var regions = $('#regions');
    if (regions) {
      regions.innerHTML = P.regions.map(function (r) {
        return '<div class="region"><h4>' + esc(r.name) + '</h4><ul>' + r.places.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
      }).join('');
    }
  })();

  /* ───────────── Pendola Pass: интерактивная карта ───────────── */
  (function () {
    var P = FT.pendola;
    var wrap = $('#mapview');
    if (!P || !wrap) return;
    var stageEl = $('#mapStage');
    var canvas = $('#mapCanvas');
    var img = $('#mapImg');
    var markersEl = $('#mapMarkers');
    var emptyEl = $('#mapEmpty');
    var bar = $('.mapview-bar', wrap);
    var form = $('#mapForm');
    var info = $('#mapInfo');
    var exportBox = $('#mapExport');
    var exportText = $('#mapExportText');
    var editBox = $('#mapEdit');
    var typeSel = $('#mapType');

    var drafts = store.get('ft-pendola-draft', []);
    var nat = { w: 0, h: 0 };
    var view = { s: 1, x: 0, y: 0, fit: 1 };
    var pending = null; // координаты новой метки
    var selected = null;

    if (typeSel) {
      typeSel.innerHTML = Object.keys(P.markerTypes).map(function (k) {
        return '<option value="' + k + '">' + esc(P.markerTypes[k].label) + '</option>';
      }).join('');
    }

    function showEmpty() {
      if (emptyEl) emptyEl.hidden = false;
      if (stageEl) stageEl.hidden = true;
      if (bar) bar.hidden = true;
    }

    function tryLoad(i) {
      if (i >= P.mapImages.length) { showEmpty(); return; }
      var probe = new Image();
      probe.onload = function () { start(P.mapImages[i], probe.naturalWidth, probe.naturalHeight); };
      probe.onerror = function () { tryLoad(i + 1); };
      probe.src = P.mapImages[i];
    }

    function start(src, w, h) {
      nat.w = w; nat.h = h;
      img.src = src;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      if (emptyEl) emptyEl.hidden = true;
      stageEl.hidden = false;
      if (bar) bar.hidden = false;
      fit();
      renderMarkers();
      window.addEventListener('resize', function () { clampPan(); apply(); });
    }

    function fit() {
      var r = stageEl.getBoundingClientRect();
      view.fit = Math.min(r.width / nat.w, r.height / nat.h);
      view.s = view.fit;
      view.x = (r.width - nat.w * view.s) / 2;
      view.y = (r.height - nat.h * view.s) / 2;
      apply();
    }
    function clampPan() {
      var r = stageEl.getBoundingClientRect();
      var w = nat.w * view.s, h = nat.h * view.s;
      if (w <= r.width) view.x = (r.width - w) / 2; else view.x = Math.min(0, Math.max(r.width - w, view.x));
      if (h <= r.height) view.y = (r.height - h) / 2; else view.y = Math.min(0, Math.max(r.height - h, view.y));
    }
    function apply() {
      canvas.style.transform = 'translate(' + view.x + 'px,' + view.y + 'px) scale(' + view.s + ')';
      canvas.style.setProperty('--inv', String(1 / view.s));
    }
    function zoomAt(factor, mx, my) {
      var ns = Math.max(view.fit * 0.9, Math.min(view.fit * 8, view.s * factor));
      view.x = mx - (mx - view.x) * (ns / view.s);
      view.y = my - (my - view.y) * (ns / view.s);
      view.s = ns;
      clampPan();
      apply();
    }

    function allMarkers() {
      return P.markers.map(function (m) { return { m: m, draft: false }; })
        .concat(drafts.map(function (m, i) { return { m: m, draft: true, i: i }; }));
    }
    function renderMarkers() {
      markersEl.innerHTML = '';
      allMarkers().forEach(function (o, idx) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'mk-pin' + (o.draft ? ' is-draft' : '');
        b.setAttribute('data-type', o.m.type);
        b.style.left = o.m.x + '%';
        b.style.top = o.m.y + '%';
        b.setAttribute('aria-label', o.m.name);
        b.setAttribute('aria-pressed', selected === idx ? 'true' : 'false');
        b.innerHTML = '<span></span>';
        b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
        b.addEventListener('click', function (e) { e.stopPropagation(); showInfo(idx, o); });
        markersEl.appendChild(b);
      });
    }
    function showInfo(idx, o) {
      selected = idx;
      renderMarkers();
      var t = P.markerTypes[o.m.type] ? P.markerTypes[o.m.type].label : o.m.type;
      info.innerHTML = '<h4>' + esc(o.m.name) + '</h4><p>' + esc(t) + (o.m.note ? '. ' + esc(o.m.note) : '') + '</p>' +
        (o.draft ? '<p class="caption">Черновая метка, хранится только в этом браузере.</p><div class="mapview-form-actions"><button type="button" class="btn-quiet" data-del="' + o.i + '">Удалить метку</button></div>' : '');
      info.hidden = false;
      var del = $('[data-del]', info);
      if (del) del.addEventListener('click', function () {
        drafts.splice(Number(del.getAttribute('data-del')), 1);
        store.set('ft-pendola-draft', drafts);
        selected = null;
        info.hidden = true;
        renderMarkers();
      });
    }

    // перетаскивание, щипок, клик
    var pointers = {};
    var drag = null;
    function stagePoint(e) {
      var r = stageEl.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    stageEl.addEventListener('pointerdown', function (e) {
      stageEl.setPointerCapture(e.pointerId);
      pointers[e.pointerId] = stagePoint(e);
      var ids = Object.keys(pointers);
      if (ids.length === 1) {
        drag = { sx: pointers[ids[0]].x, sy: pointers[ids[0]].y, vx: view.x, vy: view.y, moved: false };
      } else if (ids.length === 2) {
        var a = pointers[ids[0]], b = pointers[ids[1]];
        drag = { pinch: true, dist: Math.hypot(a.x - b.x, a.y - b.y), moved: true };
      }
    });
    stageEl.addEventListener('pointermove', function (e) {
      if (!pointers[e.pointerId] || !drag) return;
      pointers[e.pointerId] = stagePoint(e);
      var ids = Object.keys(pointers);
      if (drag.pinch && ids.length === 2) {
        var a = pointers[ids[0]], b = pointers[ids[1]];
        var d = Math.hypot(a.x - b.x, a.y - b.y);
        if (drag.dist > 0) zoomAt(d / drag.dist, (a.x + b.x) / 2, (a.y + b.y) / 2);
        drag.dist = d;
        return;
      }
      var p = pointers[e.pointerId];
      var dx = p.x - drag.sx, dy = p.y - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) > 4) { drag.moved = true; stageEl.classList.add('is-dragging'); }
      if (drag.moved) { view.x = drag.vx + dx; view.y = drag.vy + dy; clampPan(); apply(); }
    });
    function endPointer(e) {
      var wasClick = drag && !drag.moved && !drag.pinch && Object.keys(pointers).length === 1;
      var p = pointers[e.pointerId];
      delete pointers[e.pointerId];
      stageEl.classList.remove('is-dragging');
      if (wasClick && p && editBox && editBox.checked) {
        var cx = (p.x - view.x) / view.s, cy = (p.y - view.y) / view.s;
        if (cx >= 0 && cy >= 0 && cx <= nat.w && cy <= nat.h) openForm(cx / nat.w * 100, cy / nat.h * 100);
      }
      if (!Object.keys(pointers).length) drag = null;
    }
    stageEl.addEventListener('pointerup', endPointer);
    stageEl.addEventListener('pointercancel', endPointer);
    stageEl.addEventListener('wheel', function (e) {
      e.preventDefault();
      var p = stagePoint(e);
      zoomAt(Math.exp(-e.deltaY * 0.0015), p.x, p.y);
    }, { passive: false });
    stageEl.setAttribute('tabindex', '0');
    stageEl.setAttribute('aria-label', 'Карта Pendola Pass: стрелки двигают, плюс и минус меняют масштаб');
    stageEl.addEventListener('keydown', function (e) {
      var r = stageEl.getBoundingClientRect();
      var step = 60;
      if (e.key === 'ArrowLeft') view.x += step;
      else if (e.key === 'ArrowRight') view.x -= step;
      else if (e.key === 'ArrowUp') view.y += step;
      else if (e.key === 'ArrowDown') view.y -= step;
      else if (e.key === '+' || e.key === '=') { zoomAt(1.25, r.width / 2, r.height / 2); e.preventDefault(); return; }
      else if (e.key === '-') { zoomAt(0.8, r.width / 2, r.height / 2); e.preventDefault(); return; }
      else return;
      e.preventDefault();
      clampPan();
      apply();
    });

    if (editBox) editBox.addEventListener('change', function () {
      stageEl.classList.toggle('is-editing', editBox.checked);
      if (!editBox.checked && form) form.hidden = true;
    });

    function openForm(x, y) {
      pending = { x: x, y: y };
      form.hidden = false;
      var name = form.elements.name;
      name.value = '';
      form.elements.note.value = '';
      name.focus();
    }
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!pending) return;
        drafts.push({
          x: Math.round(pending.x * 100) / 100,
          y: Math.round(pending.y * 100) / 100,
          type: form.elements.type.value,
          name: form.elements.name.value.trim(),
          note: form.elements.note.value.trim()
        });
        store.set('ft-pendola-draft', drafts);
        pending = null;
        form.hidden = true;
        renderMarkers();
      });
      $('[data-act="cancel"]', form).addEventListener('click', function () { pending = null; form.hidden = true; });
    }

    $$('.mapview-bar [data-act]', wrap).forEach(function (b) {
      b.addEventListener('click', function () {
        var act = b.getAttribute('data-act');
        var r = stageEl.getBoundingClientRect();
        if (act === 'in') zoomAt(1.3, r.width / 2, r.height / 2);
        else if (act === 'out') zoomAt(1 / 1.3, r.width / 2, r.height / 2);
        else if (act === 'reset') fit();
        else if (act === 'export') {
          var rows = P.markers.concat(drafts).map(function (m) {
            return '  ' + JSON.stringify({ x: m.x, y: m.y, type: m.type, name: m.name, note: m.note || '' });
          });
          exportText.value = rows.length ? '[\n' + rows.join(',\n') + '\n]' : '[]';
          exportBox.hidden = !exportBox.hidden;
        }
      });
    });
    if (exportBox) {
      var copyBtn = $('[data-act="copy"]', exportBox);
      var clearBtn = $('[data-act="clear"]', exportBox);
      copyBtn.addEventListener('click', function () {
        var done = function () { copyBtn.textContent = 'Скопировано'; setTimeout(function () { copyBtn.textContent = 'Скопировать'; }, 1600); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(exportText.value).then(done, function () { exportText.select(); document.execCommand('copy'); done(); });
        } else { exportText.select(); document.execCommand('copy'); done(); }
      });
      var armed = false;
      clearBtn.addEventListener('click', function () {
        if (!armed) {
          armed = true;
          clearBtn.textContent = 'Точно удалить черновые метки?';
          setTimeout(function () { armed = false; clearBtn.textContent = 'Удалить мои черновые метки'; }, 3500);
          return;
        }
        drafts = [];
        store.set('ft-pendola-draft', drafts);
        armed = false;
        clearBtn.textContent = 'Удалить мои черновые метки';
        info.hidden = true;
        renderMarkers();
        exportText.value = '[]';
      });
    }

    tryLoad(0);
  })();

  $$('table.table--stack').forEach(labelTable);

  /* ───────────── Список источников ───────────── */
  (function () {
    var el = $('#sourcesList');
    if (!el) return;
    var groups = [['official', 'Официальное'], ['db', 'Базы данных и карты'], ['guide', 'Гайды и разборы']];
    el.innerHTML = groups.map(function (g) {
      var items = Object.keys(SRC).filter(function (k) { return SRC[k].k === g[0]; });
      return '<div><h3>' + g[1] + '</h3><ul>' + items.map(function (k) {
        return '<li><a href="' + esc(SRC[k].u) + '" target="_blank" rel="noopener">' + esc(SRC[k].t) + '</a></li>';
      }).join('') + '</ul></div>';
    }).join('');
  })();
})();
