/* Orbit 官网首页脚本：sticky 桌面的六幕演示、首屏键盘互动、模块索引、截图切换与启停开关。
   文案全部来自 data.js（window.Orbit.t / pick），语言切换时重画。 */
(function () {
  'use strict';


  var O = window.Orbit;
  var t = O.t;
  var $ = function (id) {
    return document.getElementById(id);
  };
  // 带一个参数的文案：把 {0} 换成实际内容
  function fmt(key, arg) {
    return t(key).replace('{0}', arg);
  }
  // 当前语言下的模块数据
  function mod(id) {
    var list = O.data.modules;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        return list[i];
      }
    }
    return null;
  }
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------
  // 壁纸：用确定的正弦叠加画三层山脊，再撒一些星点（每次打开都一样）
  // ---------------------------------------------------------------
  (function drawWall() {
    var svg = $('wallSvg');
    var ns = 'http://www.w3.org/2000/svg';
    var seed = 7;
    function rnd() {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    }
    var stars = '';
    for (var i = 0; i < 46; i++) {
      var x = rnd() * 1000;
      var y = rnd() * 300;
      var r = rnd() < 0.15 ? 1.6 : 0.9;
      stars += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r + '" fill="#fff" opacity="' + (0.25 + rnd() * 0.55).toFixed(2) + '"/>';
    }
    var layers = [
      { base: 470, amp: [38, 22, 9], freq: [0.004, 0.011, 0.031], phase: [0.6, 2.1, 1.3], fill: '#4A3A92', op: 0.7 },
      { base: 525, amp: [30, 18, 7], freq: [0.005, 0.013, 0.037], phase: [2.4, 0.4, 2.8], fill: '#2C2468', op: 0.92 },
      { base: 590, amp: [24, 12, 6], freq: [0.006, 0.017, 0.045], phase: [1.1, 3.0, 0.2], fill: '#17123F', op: 1 }
    ];
    var paths = '';
    for (var l = 0; l < layers.length; l++) {
      var L = layers[l];
      var d = 'M0 660 L0 ';
      for (var px = 0; px <= 1000; px += 10) {
        var py = L.base;
        for (var k = 0; k < 3; k++) {
          py -= L.amp[k] * Math.sin(px * L.freq[k] + L.phase[k]);
        }
        d += (px === 0 ? '' : ' L' + px + ' ') + py.toFixed(1);
      }
      d += ' L1000 660 Z';
      paths += '<path d="' + d + '" fill="' + L.fill + '" opacity="' + L.op + '"/>';
    }
    svg.innerHTML = stars + paths;
    void ns;
  })();

  // ---------------------------------------------------------------
  // 桌面元素与基本状态
  // ---------------------------------------------------------------
  var mac = $('mac');
  var desk = $('desk');
  var W = { design: $('wDesign'), chat: $('wChat'), clean: $('wClean') };
  var launcher = $('launcher');
  var lInput = $('lInput');
  var lRes = $('lRes');
  var clip = $('clip');
  var cards = $('cards');
  var shot = $('shot');
  var selbox = $('selbox');
  var tools = $('tools');
  var lens = $('lens');
  var keycast = $('keycast');
  var hud = $('hud');
  var hint = $('hint');
  var mbApp = $('mbApp');

  // 窗口位置：桌面区域的百分比 [left, top, width, height]
  var BOX = {
    center: [15, 7, 64, 82],
    chat: [21, 5, 58, 84],
    left: [0, 0, 50, 100],
    right: [50, 0, 50, 100],
    max: [0, 0, 100, 100],
    clean: [8, 3, 84, 92]
  };

  // 启动器条目与剪贴板卡片：数据在 data.js 的 home 里，显示文字在语言切换时重新取
  var APPS = O.data.home.apps;
  var CLIPS = O.data.home.clips;
  function appName(a) {
    return O.pick(a.name);
  }
  function appKind(a) {
    return a.kind === 'app' ? t('d.launcher.app') : t('h.m.command');
  }

  var timers = [];
  var scene = null;
  var items = [];
  var sel = 0;
  var clipSel = 0;
  var heroIntroDone = false;
  var heroSnap = 'center';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function later(ms, fn) {
    timers.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    for (var i = 0; i < timers.length; i++) {
      clearTimeout(timers[i]);
    }
    timers = [];
  }

  function place(win, box) {
    var b = BOX[box];
    win.style.left = b[0] + '%';
    win.style.top = b[1] + '%';
    win.style.width = b[2] + '%';
    win.style.height = b[3] + '%';
    win.classList.toggle('snapped', box === 'left' || box === 'right' || box === 'max');
  }
  function front(name, app) {
    for (var k in W) {
      if (Object.prototype.hasOwnProperty.call(W, k)) {
        W[k].classList.toggle('front', k === name);
      }
    }
    if (app) {
      mbApp.textContent = app;
    }
  }
  function show(win, on) {
    win.classList.toggle('hide', !on);
  }

  // 按键回显 + 同步按下章节标题里的键帽
  var castTimer = 0;
  function cast(keys, chapter) {
    var html = '';
    for (var i = 0; i < keys.length; i++) {
      html += '<b>' + esc(keys[i]) + '</b>';
    }
    keycast.innerHTML = html;
    keycast.classList.add('in');
    clearTimeout(castTimer);
    castTimer = setTimeout(function () {
      keycast.classList.remove('in');
    }, 1300);
    var caps = chapter ? document.querySelectorAll('.chap[data-scene="' + chapter + '"] .kc') : [];
    for (var j = 0; j < caps.length; j++) {
      caps[j].classList.add('down');
    }
    setTimeout(function () {
      for (var m = 0; m < caps.length; m++) {
        caps[m].classList.remove('down');
      }
    }, 260);
  }
  var hudTimer = 0;
  function showHud(text) {
    hud.textContent = text;
    hud.classList.add('in');
    clearTimeout(hudTimer);
    hudTimer = setTimeout(function () {
      hud.classList.remove('in');
    }, 1400);
  }

  // ---------------------------------------------------------------
  // 启动器
  // ---------------------------------------------------------------
  function calc(q) {
    if (!/^[\d\s+\-*/().%^]+$/.test(q) || !/\d/.test(q) || !/[+\-*/%^]/.test(q.replace(/^\s*-/, ''))) {
      return null;
    }
    try {
      var v = Function('"use strict";return (' + q.replace(/\^/g, '**') + ')')();
      if (typeof v === 'number' && isFinite(v)) {
        return String(Math.round(v * 1e8) / 1e8);
      }
    } catch (e) {
      return null;
    }
    return null;
  }
  function search(q) {
    var out = [];
    var lower = q.trim().toLowerCase();
    if (!lower) {
      return out;
    }
    var value = calc(q);
    if (value !== null) {
      out.push({ type: 'calc', text: q.trim() + ' = ' + value, value: value });
    }
    var scored = [];
    for (var j = 0; j < APPS.length; j++) {
      var a = APPS[j];
      var hay = (a.keys + ' ' + appName(a).toLowerCase()).split(' ');
      var best = -1;
      for (var k = 0; k < hay.length; k++) {
        var at = hay[k].indexOf(lower);
        if (at === 0) {
          best = 0;
          break;
        }
        if (at > 0 && (best < 0 || at < best)) {
          best = at + 1;
        }
      }
      if (best >= 0) {
        scored.push({ score: best, i: j, app: a });
      }
    }
    scored.sort(function (x, y) {
      return x.score - y.score || x.i - y.i;
    });
    for (var m = 0; m < scored.length && m < 3; m++) {
      out.push({ type: 'app', app: scored[m].app });
    }
    out.push({ type: 'web', q: q.trim() });
    return out;
  }
  var SPARK = '<svg viewBox="0 0 24 24"><path d="M10 2.5 11.6 8 17 9.6 11.6 11.2 10 16.6 8.4 11.2 3 9.6 8.4 8zM18 13l.9 2.6 2.6.9-2.6.9L18 20l-.9-2.6-2.6-.9 2.6-.9z"/></svg>';
  function renderResults() {
    items = search(lInput.value);
    if (sel >= items.length) {
      sel = 0;
    }
    if (!items.length) {
      lRes.innerHTML = '<li class="lempty">' + esc(t('h.m.tryHint')) + '</li>';
      return;
    }
    var html = '';
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var cls = i === sel ? ' class="on"' : '';
      if (it.type === 'app') {
        html += '<li' + cls + ' data-i="' + i + '"><i class="ai" style="background:linear-gradient(135deg,' + it.app.c[0] + ',' + it.app.c[1] + ')">' + (it.app.spark ? SPARK : '') + '</i><span>' + esc(appName(it.app)) + '</span><small>' + esc(appKind(it.app)) + '</small></li>';
      } else if (it.type === 'calc') {
        html += '<li' + cls + ' data-i="' + i + '"><i class="ai" style="background:#FF9F0A">=</i><span>' + esc(it.text) + '</span><small>' + esc(t('h.m.copyHint')) + '</small></li>';
      } else {
        html += '<li' + cls + ' data-i="' + i + '"><i class="ai" style="background:#6E6E76">G</i>' + '<span>' + esc(fmt('h.m.web', it.q)) + '</span></li>';
      }
    }
    lRes.innerHTML = html;
  }
  function setLauncher(open, focus) {
    if (open) {
      setClip(false);
      sel = 0;
      renderResults();
    }
    launcher.classList.toggle('open', open);
    if (open && focus) {
      // preventScroll：别因为聚焦输入框把页面滚走
      lInput.focus({ preventScroll: true });
    }
    if (!open && document.activeElement === lInput) {
      lInput.blur();
    }
  }
  function typeInto(text, start, step) {
    for (var i = 0; i < text.length; i++) {
      (function (n) {
        later(start + n * step, function () {
          lInput.value = text.slice(0, n + 1);
          sel = 0;
          renderResults();
        });
      })(i);
    }
  }

  // ---------------------------------------------------------------
  // 剪贴板
  // ---------------------------------------------------------------
  function renderClips() {
    var html = '';
    for (var i = 0; i < CLIPS.length; i++) {
      var c = CLIPS[i];
      var text = O.pick(c.body);
      var body = c.swatch ? '<div class="sw"></div>' + esc(text) : (c.image ? '<div class="im"></div>' : esc(text));
      html += '<button type="button" class="card' + (i === clipSel ? ' on' : '') + '" data-i="' + i + '" tabindex="-1">' +
        '<span class="ch2" style="background:' + c.c + '"><s></s>' + esc(t(c.type)) + '</span><span class="cb">' + body + '</span></button>';
    }
    cards.innerHTML = html;
  }
  function setClip(open) {
    if (open) {
      launcher.classList.remove('open');
      renderClips();
    }
    clip.classList.toggle('open', open);
  }

  // ---------------------------------------------------------------
  // 微信输入框与消息
  // ---------------------------------------------------------------
  function setChatText(text) {
    $('chatText').textContent = text;
  }
  function addSent(text, animate) {
    var b = document.createElement('div');
    b.className = 'bub out' + (animate ? ' new' : '');
    b.textContent = text;
    b.setAttribute('data-sent', '1');
    $('msgs').appendChild(b);
    if (animate) {
      void b.offsetWidth;
      b.classList.add('in-view');
    }
  }
  function clearSent() {
    var olds = $('msgs').querySelectorAll('[data-sent]');
    for (var i = 0; i < olds.length; i++) {
      olds[i].remove();
    }
  }

  // ---------------------------------------------------------------
  // 截图：选区落在设计稿的图表上
  // ---------------------------------------------------------------
  function chartRect() {
    var d = desk.getBoundingClientRect();
    var c = $('chart').getBoundingClientRect();
    var pad = d.width * 0.012;
    // .shot 比桌面区域多出菜单栏高度，所以 top 要加回菜单栏
    var mbH = d.top - mac.getBoundingClientRect().top;
    return { x: c.left - d.left - pad, y: c.top - d.top + mbH - pad * 1.5, w: c.width + pad * 2, h: c.height + pad * 2.5 };
  }
  function setSel(r) {
    selbox.style.left = r.x + 'px';
    selbox.style.top = r.y + 'px';
    selbox.style.width = r.w + 'px';
    selbox.style.height = r.h + 'px';
  }
  function placeTools(r) {
    tools.style.left = Math.max(4, r.x + r.w - tools.offsetWidth) + 'px';
    tools.style.top = (r.y + r.h + 8) + 'px';
  }
  function drawAnnotation(r) {
    var svg = $('ann');
    svg.setAttribute('viewBox', '0 0 ' + r.w.toFixed(0) + ' ' + r.h.toFixed(0));
    // 从左上的文字指向高出一截的那根柱子（第 5 根）
    var x0 = r.w * 0.4;
    var y0 = r.h * 0.2;
    var x1 = r.w * 0.575;
    var y1 = r.h * 0.2;
    var ang = Math.atan2(y1 - y0, x1 - x0);
    var hl = r.w * 0.045;
    var a1 = (x1 - hl * Math.cos(ang - 0.5)).toFixed(1) + ' ' + (y1 - hl * Math.sin(ang - 0.5)).toFixed(1);
    var a2 = (x1 - hl * Math.cos(ang + 0.5)).toFixed(1) + ' ' + (y1 - hl * Math.sin(ang + 0.5)).toFixed(1);
    $('annPath').setAttribute('d', 'M' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' Q' + (x0 + (x1 - x0) * 0.6).toFixed(1) + ' ' + (y0 - r.h * 0.12).toFixed(1) + ' ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' M' + a1 + ' L' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' L' + a2);
  }
  function shotOff() {
    shot.classList.remove('on', 'sel', 'pinned');
    tools.classList.remove('in');
    $('ann').classList.remove('draw');
    $('annText').textContent = '';
    var spans = tools.querySelectorAll('span');
    for (var i = 0; i < spans.length; i++) {
      spans[i].classList.remove('on');
    }
  }

  // ---------------------------------------------------------------
  // 菜单栏收起
  // ---------------------------------------------------------------
  var lC = $('lC');
  var lmbg = $('lmbg');
  var lchev = $('lchev');
  var lCursor = $('lCursor');
  function lensReset(collapsed) {
    // C 图标放回分隔线右边，或者（收起之后）放进被收起的分组
    lC.classList.remove('lift');
    lC.style.transform = '';
    if (collapsed) {
      lmbg.appendChild(lC);
    } else {
      lchev.parentNode.insertBefore(lC, lchev.nextSibling);
    }
    $('lmbr').classList.toggle('collapsed', collapsed);
    $('lensState').textContent = collapsed ? t('d.menubar.hide') : '';
    lCursor.classList.remove('in');
  }
  function realMenubar(collapsed) {
    var mbr = $('mbr');
    var g = $('mbg');
    var c = $('mbC');
    if (collapsed) {
      g.appendChild(c);
    } else {
      mbr.insertBefore(c, mbr.querySelector('.chev').nextSibling);
    }
    mbr.classList.toggle('collapsed', collapsed);
  }
  function cursorTo(el, dx, dy) {
    var s = $('lensStrip').getBoundingClientRect();
    var r = el.getBoundingClientRect();
    lCursor.style.left = (r.left - s.left + r.width * (dx || 0.5)) + 'px';
    lCursor.style.top = (r.top - s.top + r.height * (dy || 0.5)) + 'px';
  }

  // ---------------------------------------------------------------
  // 清理窗口
  // ---------------------------------------------------------------
  function cleanReset(done) {
    var rows = $('scanArea').querySelectorAll('.res');
    for (var i = 0; i < rows.length; i++) {
      rows[i].classList.toggle('in', !!done);
    }
    $('scanEmpty').style.opacity = done ? 0 : 1;
    $('scanning').style.opacity = 0;
    $('scanning').style.display = done ? 'none' : '';
    $('scanBar').style.width = done ? '100%' : '0';
    $('footWait').hidden = !!done;
    $('footWait').textContent = t('h.m.notScanned');
    $('footTot').hidden = !done;
    $('footDemo').hidden = !done;
    $('cleanBtn').classList.toggle('gray', !done);
    $('scanBtn').textContent = done ? t('h.m.rescan') : t('h.m.scan');
  }

  // ---------------------------------------------------------------
  // 场景：每一幕先瞬间摆好「上一幕的结局」，再按时间线表演
  // ---------------------------------------------------------------
  function closePanels() {
    setLauncher(false);
    lInput.value = '';
    setClip(false);
    shotOff();
    lens.classList.remove('in');
    keycast.classList.remove('in');
    hud.classList.remove('in');
  }
  function base(n) {
    closePanels();
    hint.classList.add('off');
    clearSent();
    setChatText('');
    cleanReset(false);
    lensReset(n > 5);
    realMenubar(n > 5);
    show(W.clean, false);
    place(W.clean, 'clean');
    if (n <= 1) {
      place(W.design, n === 0 ? heroSnap : 'center');
      place(W.chat, 'chat');
      show(W.chat, false);
      front('design', t('h.m.preview'));
      if (n === 0) {
        hint.classList.toggle('off', heroIntroDone);
      }
      return;
    }
    show(W.chat, true);
    if (n === 2) {
      place(W.chat, 'chat');
      place(W.design, 'center');
      front('chat', t('h.m.chat'));
      return;
    }
    place(W.chat, 'left');
    place(W.design, 'right');
    front('design', t('h.m.preview'));
    if (n >= 4) {
      addSent(O.pick(CLIPS[0].body), false);
    }
  }

  var SCENES = {
    // 首屏：第一次进来时自己演一下启动器，之后交给键盘
    0: function () {
      if (heroIntroDone) {
        return [];
      }
      var typed = t('h.c1.type');
      return [
        // 先让人看清静止的桌面和提示，再开始自己演
        [1600, function () {
          cast(['⌥', 'Space']);
          setLauncher(true, false);
          hint.classList.add('off');
        }],
        [2200, function () {
          lInput.value = typed.slice(0, 1);
          renderResults();
        }],
        [2450, function () {
          lInput.value = typed;
          renderResults();
          heroIntroDone = true;
        }]
      ];
    },
    1: function () {
      var steps = [
        [400, function () {
          cast(['⌥', 'Space'], 1);
          setLauncher(true, false);
        }]
      ];
      typeSteps(steps, t('h.c1.type'), 1000, 220);
      return steps.concat([
        [2300, function () {
          cast(['↩']);
          var li = lRes.querySelector('li.on');
          if (li) {
            li.classList.add('press');
          }
        }],
        [2500, function () {
          setLauncher(false);
          show(W.chat, true);
          front('chat', t('h.m.chat'));
        }]
      ]);
    },
    2: function () {
      return [
        [500, function () {
          cast(['⌃', '⌥', '←'], 2);
          place(W.chat, 'left');
        }],
        [1500, function () {
          front('design', t('h.m.preview'));
        }],
        [1800, function () {
          cast(['⌃', '⌥', '→'], 2);
          place(W.design, 'right');
        }]
      ];
    },
    3: function () {
      return [
        [300, function () {
          front('chat', t('h.m.chat'));
        }],
        [900, function () {
          cast(['⇧', '⌘', 'V'], 3);
          clipSel = 0;
          setClip(true);
        }],
        [1700, function () {
          clipSel = 1;
          renderClips();
        }],
        [2200, function () {
          clipSel = 0;
          renderClips();
        }],
        [2800, function () {
          cast(['↩']);
          setClip(false);
          setChatText(O.pick(CLIPS[0].body));
          showHud(t('h.m.pasted'));
        }],
        [3700, function () {
          cast(['↩']);
          setChatText('');
          addSent(O.pick(CLIPS[0].body), true);
        }]
      ];
    },
    4: function () {
      var r;
      return [
        [200, function () {
          front('design', t('h.m.preview'));
        }],
        [700, function () {
          cast(['⌃', '⇧', 'A'], 4);
          shot.classList.add('on');
          r = chartRect();
          // 选区从左上角的一个点拉开
          setSel({ x: r.x, y: r.y, w: 2, h: 2 });
        }],
        [1100, function () {
          shot.classList.add('sel');
          setSel(r);
        }],
        [1900, function () {
          placeTools(r);
          tools.classList.add('in');
          drawAnnotation(r);
        }],
        [2300, function () {
          $('toolArrow').classList.add('on');
        }],
        [2500, function () {
          $('ann').classList.add('draw');
        }],
        [3200, function () {
          $('toolArrow').classList.remove('on');
          $('toolText').classList.add('on');
          $('annText').textContent = t('d.screenshot.text');
        }],
        [4200, function () {
          $('toolText').classList.remove('on');
          $('toolPin').classList.add('on');
        }],
        [4500, function () {
          // 点「贴图」：截图固定在桌面上当参考
          shot.classList.add('pinned');
          showHud(t('h.m.pinned'));
        }]
      ];
    },
    5: function () {
      return [
        [300, function () {
          lens.classList.add('in');
          $('lensState').textContent = '';
        }],
        [900, function () {
          lCursor.classList.add('in');
          cursorTo(lC, 0.6, 0.6);
        }],
        [1700, function () {
          cast(['⌘', t('h.m.drag')], 5);
          lC.classList.add('lift');
          // 拖过分隔线，落到左边的分组里
          var dx = lchev.getBoundingClientRect().left - lC.getBoundingClientRect().right - lC.getBoundingClientRect().width * 0.4;
          lC.style.transform = 'translateX(' + dx + 'px) translateY(-.15em) scale(1.25)';
          var cur = parseFloat(lCursor.style.left) || 0;
          lCursor.style.left = (cur + dx) + 'px';
        }],
        [2600, function () {
          lC.classList.remove('lift');
          lC.style.transform = '';
          lmbg.appendChild(lC);
          $('lensState').textContent = t('h.m.lensLeft');
        }],
        [3100, function () {
          cursorTo(lchev, 0.6, 0.6);
        }],
        [3900, function () {
          $('lmbr').classList.add('collapsed');
          realMenubar(true);
          $('lensState').textContent = t('d.menubar.hide');
        }],
        [4500, function () {
          lCursor.classList.remove('in');
        }]
      ];
    },
    6: function () {
      var steps = [
        [400, function () {
          cast(['⌥', 'Space'], 6);
          setLauncher(true, false);
        }]
      ];
      typeSteps(steps, t('h.c6.type'), 900, 200);
      return steps.concat([
        [2400, function () {
          cast(['↩']);
          var li = lRes.querySelector('li.on');
          if (li) {
            li.classList.add('press');
          }
        }],
        [2600, function () {
          setLauncher(false);
          show(W.clean, true);
          front('clean', 'Orbit');
        }],
        [3300, function () {
          $('scanBtn').classList.add('gray');
          $('scanEmpty').style.opacity = 0;
          $('scanning').style.opacity = 1;
          $('footWait').textContent = t('d.cleaner.scan');
          $('scanBar').style.width = '100%';
        }],
        [3700, function () {
          $('scanArea').querySelectorAll('.res')[0].classList.add('in');
        }],
        [4200, function () {
          $('scanArea').querySelectorAll('.res')[1].classList.add('in');
        }],
        [4700, function () {
          $('scanArea').querySelectorAll('.res')[2].classList.add('in');
        }],
        [5200, function () {
          $('scanArea').querySelectorAll('.res')[3].classList.add('in');
        }],
        [5600, function () {
          $('scanBtn').classList.remove('gray');
          $('scanning').style.opacity = 0;
          cleanReset(true);
        }]
      ]);
    }
  };

  // 把逐字输入展开成时间线上的若干步
  function typeSteps(steps, text, start, step) {
    for (var i = 0; i < text.length; i++) {
      (function (n) {
        steps.push([start + n * step, function () {
          lInput.value = text.slice(0, n + 1);
          renderResults();
        }]);
      })(i);
    }
  }

  function play(n) {
    clearTimers();
    scene = n;
    mac.classList.add('instant');
    base(n);
    void mac.offsetWidth;
    mac.classList.remove('instant');
    var steps = SCENES[n]();
    if (reduced) {
      // 减少动态效果：直接停在这一幕的结局
      mac.classList.add('instant');
      for (var i = 0; i < steps.length; i++) {
        steps[i][1]();
      }
      void mac.offsetWidth;
      mac.classList.remove('instant');
      keycast.classList.remove('in');
      return;
    }
    // 首屏的自动演示等页面（含字体）加载完再开始计时，免得在字体替换时开演
    if (n === 0 && document.readyState !== 'complete') {
      window.addEventListener('load', function () {
        if (scene === 0) {
          for (var k = 0; k < steps.length; k++) {
            later(steps[k][0], steps[k][1]);
          }
        }
      }, { once: true });
      return;
    }
    for (var j = 0; j < steps.length; j++) {
      later(steps[j][0], steps[j][1]);
    }
  }

  // ---------------------------------------------------------------
  // 滚动驱动：哪一章越过判定线，桌面就演哪一幕
  // ---------------------------------------------------------------
  var chaps = document.querySelectorAll('.chap');
  var stagecol = $('stagecol');
  function currentScene() {
    var vh = window.innerHeight;
    var line = vh * 0.55;
    if (window.matchMedia('(max-width: 900px)').matches) {
      var sb = stagecol.getBoundingClientRect().bottom;
      line = Math.max(sb, 0) + (vh - Math.max(sb, 0)) * 0.35;
    }
    var n = 0;
    for (var i = 0; i < chaps.length; i++) {
      if (chaps[i].getBoundingClientRect().top <= line) {
        n = i + 1;
      }
    }
    return n;
  }
  var ticking = false;
  function onScroll() {
    if (ticking) {
      return;
    }
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var n = currentScene();
      if (n !== scene) {
        play(n);
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  var replays = document.querySelectorAll('[data-replay]');
  for (var r = 0; r < replays.length; r++) {
    replays[r].addEventListener('click', function () {
      play(+this.getAttribute('data-replay'));
    });
  }

  // ---------------------------------------------------------------
  // 首屏互动：真实键盘快捷键 + 按钮
  // ---------------------------------------------------------------
  function heroOnly() {
    if (scene !== 0) {
      return false;
    }
    if (!heroIntroDone) {
      // 用户抢在自动演示之前动手，就停掉演示
      clearTimers();
      heroIntroDone = true;
    }
    hint.classList.add('off');
    return true;
  }
  function act(name, fromKey) {
    if (scene !== 0) {
      return;
    }
    heroOnly();
    if (name === 'launcher') {
      cast(['⌥', 'Space']);
      if (launcher.classList.contains('open')) {
        setLauncher(false);
      } else {
        lInput.value = '';
        setLauncher(true, true);
      }
    } else if (name === 'clip') {
      cast(['⇧', '⌘', 'V']);
      setClip(!clip.classList.contains('open'));
    } else {
      var keyMap = { left: '←', right: '→', max: '↩', center: 'C' };
      cast(['⌃', '⌥', keyMap[name]]);
      setLauncher(false);
      setClip(false);
      heroSnap = name;
      front('design', t('h.m.preview'));
      place(W.design, name);
    }
    var btn = document.querySelector('#tryKeys [data-act="' + name + '"]');
    if (btn && fromKey) {
      btn.classList.add('hit');
      setTimeout(function () {
        btn.classList.remove('hit');
      }, 160);
    }
  }
  function activate(i) {
    var it = items[i];
    if (!it) {
      return;
    }
    if (it.type === 'app') {
      showHud(fmt('h.m.opened', appName(it.app)));
      if (it.app.kind === 'app') {
        mbApp.textContent = appName(it.app);
      }
    } else if (it.type === 'calc') {
      showHud(fmt('h.m.copied', it.value));
    } else {
      showHud(fmt('h.m.opened', 'Google'));
    }
    setLauncher(false);
    lInput.value = '';
  }
  function pasteClip(i) {
    var c = CLIPS[i];
    setClip(false);
    showHud(c.image ? t('h.m.pastedImage') : fmt('h.m.pastedItem', O.pick(c.body)));
  }

  $('tryKeys').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) {
      act(b.getAttribute('data-act'), false);
    }
  });
  lRes.addEventListener('click', function (e) {
    var li = e.target.closest('li[data-i]');
    if (li && scene === 0) {
      activate(+li.getAttribute('data-i'));
    }
  });
  cards.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b && scene === 0) {
      pasteClip(+b.getAttribute('data-i'));
    }
  });
  lInput.addEventListener('input', function () {
    sel = 0;
    renderResults();
  });
  desk.addEventListener('pointerdown', function (e) {
    if (scene === 0 && !e.target.closest('.launcher, .clip')) {
      setLauncher(false);
      setClip(false);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (scene !== 0) {
      return;
    }
    var inInput = e.target === lInput;
    if (!inInput && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) {
      return;
    }
    if (launcher.classList.contains('open')) {
      if (e.key === 'Escape') {
        setLauncher(false);
        e.preventDefault();
        return;
      }
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && items.length) {
        sel = (sel + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
        renderResults();
        e.preventDefault();
        return;
      }
      if (e.key === 'Enter' && !e.ctrlKey && !e.altKey) {
        activate(sel);
        e.preventDefault();
        return;
      }
      // 启动器开着但输入框没焦点（比如自动演示之后）：把焦点给它，这个键就会落进输入框
      if (!inInput && e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
        heroOnly();
        lInput.focus({ preventScroll: true });
        return;
      }
    }
    if (clip.classList.contains('open')) {
      if (e.key === 'Escape') {
        setClip(false);
        e.preventDefault();
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        clipSel = (clipSel + (e.key === 'ArrowRight' ? 1 : CLIPS.length - 1)) % CLIPS.length;
        renderClips();
        e.preventDefault();
        return;
      }
      if (e.key === 'Enter') {
        pasteClip(clipSel);
        e.preventDefault();
        return;
      }
    }
    if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === 'Space') {
      act('launcher', true);
    } else if (e.ctrlKey && e.altKey && !e.metaKey && !e.shiftKey) {
      var map = { ArrowLeft: 'left', ArrowRight: 'right', Enter: 'max', KeyC: 'center' };
      if (!map[e.code]) {
        return;
      }
      act(map[e.code], true);
    } else if (e.metaKey && e.shiftKey && !e.altKey && e.code === 'KeyV') {
      act('clip', true);
    } else {
      return;
    }
    e.preventDefault();
  });

  // ---------------------------------------------------------------
  // 17 个模块索引
  // ---------------------------------------------------------------
  // 组标题旁的小图形：Orbit 图标的 2×2 磁贴，点亮这一组对应的那一格（取图标四色）
  var TILE_COLORS = ['#3B82F6', '#F59E0B', '#EC4899', '#22C55E'];
  function glyph(tile) {
    var cells = [
      '<rect x="1.5" y="1.5" width="6.5" height="6.5" rx="1.9"',
      '<circle cx="13.25" cy="4.75" r="3.05"',
      '<rect x="1.5" y="10" width="6.5" height="6.5" rx="1.9"',
      '<rect x="10" y="10" width="6.5" height="6.5" rx="1.9"'
    ];
    var s = '<svg class="glyph" viewBox="0 0 18 18" aria-hidden="true">';
    for (var i = 0; i < 4; i++) {
      s += cells[i] + (i === tile ? ' style="fill:' + TILE_COLORS[tile] + '"' : '') + '/>';
    }
    return s + '</svg>';
  }
  // 分组与图标四格的对应：效率=蓝、截图与录制=粉、文件=橙、系统=绿
  var CAT_TILE = [0, 2, 1, 3];
  function renderGroups() {
    var cats = O.data.categories;
    var mods = O.data.modules;
    var html = '';
    for (var g = 0; g < cats.length; g++) {
      // 截图与录制（3 个）和文件（3 个）合成中间一列，和效率（5 个）、系统（6 个）高度接近
      if (g === 1) {
        html += '<div class="stack">';
      }
      var rows = '';
      var count = 0;
      for (var m = 0; m < mods.length; m++) {
        var M = mods[m];
        if (M.cat !== g) {
          continue;
        }
        count += 1;
        var key = M.key ? (Array.isArray(M.key) ? O.pick(M.key) : M.key) : '';
        rows += '<div class="mod"><div class="top"><h4><a href="tutorial.html#m-' + M.id + '">' + esc(O.pick(M.name)) + '</a></h4>' +
          (key ? '<kbd>' + esc(key) + '</kbd>' : '') + '</div><p>' + esc(O.pick(M.what)) + '</p>' +
          (M.alt ? '<div class="alt">' + esc(t('h.similar')) + ' ' + esc(M.alt) + '</div>' : '') + '</div>';
      }
      html += '<div class="grp"><div class="grp-h">' + glyph(CAT_TILE[g]) + '<h3>' + esc(O.pick(cats[g].name)) + '</h3><span>' +
        esc(fmt('h.count', count)) + '</span></div>' + rows + '</div>';
      if (g === 2) {
        html += '</div>';
      }
    }
    $('groups').innerHTML = html;
  }

  // 页面里引用模块名、说明与同类软件的地方
  function renderModuleRefs() {
    var names = document.querySelectorAll('[data-mod]');
    for (var i = 0; i < names.length; i++) {
      var m = mod(names[i].getAttribute('data-mod'));
      names[i].textContent = m ? O.pick(m.name) : '';
    }
    var whats = document.querySelectorAll('[data-mod-what]');
    for (var j = 0; j < whats.length; j++) {
      var w = mod(whats[j].getAttribute('data-mod-what'));
      whats[j].textContent = w ? O.pick(w.what) : '';
    }
    var sims = document.querySelectorAll('[data-sim]');
    for (var k = 0; k < sims.length; k++) {
      var s = mod(sims[k].getAttribute('data-sim'));
      sims[k].textContent = s && s.alt ? t('h.similar') + ' ' + s.alt : '';
    }
  }

  // 清理窗口的侧边栏：系统组的 6 个模块 + 设置组
  var SIDE_COLORS = { login: '#7D7AF0', uninstaller: '#B98A5E', cleaner: '#3CC4D6', privacy: '#3C8CF0', maintenance: '#F59A3B', tweaks: '#46C26A' };
  function renderCleanSide() {
    var mods = O.data.modules;
    var html = '<div class="grp">' + esc(O.pick(O.data.categories[3].name)) + '</div>';
    for (var i = 0; i < mods.length; i++) {
      if (mods[i].cat === 3) {
        html += '<div class="it' + (mods[i].id === 'cleaner' ? ' on' : '') + '"><s style="background:' + (SIDE_COLORS[mods[i].id] || '#888') + '"></s>' + esc(O.pick(mods[i].name)) + '</div>';
      }
    }
    html += '<div class="grp">' + esc(t('h.m.settings')) + '</div>' +
      '<div class="it"><s style="background:#6E6AE8"></s>' + esc(t('h.m.shortcuts')) + '</div>' +
      '<div class="it"><s style="background:#3C8CF0"></s>' + esc(t('h.m.perms')) + '</div>' +
      '<div class="it"><s style="background:#F59A3B"></s>' + esc(t('h.m.history')) + '</div>';
    $('cleanSide').innerHTML = html;
  }

  // 第 6 章的键帽：当前语言下在启动器里输入的字母
  function renderC6Caps() {
    var letters = t('h.c6.type').toUpperCase().split('');
    var html = '';
    for (var i = 0; i < letters.length; i++) {
      html += '<span class="kc letter">' + esc(letters[i]) + '</span>';
    }
    $('c6caps').innerHTML = html;
  }

  // ---------------------------------------------------------------
  // 截图切换
  // ---------------------------------------------------------------
  var tabs = document.querySelectorAll('.tab');
  var imgs = document.querySelectorAll('.shot-frame img');
  for (var ti = 0; ti < tabs.length; ti++) {
    tabs[ti].addEventListener('click', function () {
      var k = +this.getAttribute('data-shot');
      for (var i = 0; i < tabs.length; i++) {
        tabs[i].setAttribute('aria-selected', i === k ? 'true' : 'false');
        imgs[i].classList.toggle('on', i === k);
      }
      // 窄屏下的说明跟着页签换；同时改 data-i18n，语言切换时按新的键重新取
      $('shotCap').setAttribute('data-i18n', 'v' + (k + 1) + 'd');
      $('shotCap').textContent = t('v' + (k + 1) + 'd');
    });
  }

  // ---------------------------------------------------------------
  // 约定：启停开关
  // ---------------------------------------------------------------
  var sw = $('modSwitch');
  function renderSwitch() {
    var on = sw.getAttribute('aria-checked') === 'true';
    $('modState').innerHTML = on ? t('h.sw.on') : t('h.sw.off');
  }
  sw.addEventListener('click', function () {
    sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
    renderSwitch();
  });

  // ---------------------------------------------------------------
  // 语言就绪或切换时：重画依赖文案的部分，桌面重演当前这一幕
  // ---------------------------------------------------------------
  var started = false;
  O.onLang(function () {
    renderGroups();
    renderModuleRefs();
    renderCleanSide();
    renderC6Caps();
    renderSwitch();
    renderClips();
    if (!started) {
      started = true;
      play(currentScene());
    } else {
      // 首屏已经被用户接管时不再自动演示，只按新语言摆好当前状态
      play(scene);
    }
  });
})();
