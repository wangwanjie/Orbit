/* 首屏互动演示：一个能真的按快捷键的模拟桌面（启动器、窗口管理、剪贴板）。
   只用 transform / opacity / 少量布局过渡，窗口不在视口里时不处理键盘事件。 */
(function () {
  'use strict';

  var O = window.Orbit;
  var stage = document.getElementById('playStage');
  if (!stage) {
    return;
  }

  var P = O.data.play;
  var $ = function (id) { return document.getElementById(id); };
  var win = $('pWin'), launch = $('pLaunch'), input = $('pInput'), res = $('pRes');
  var clip = $('pClip'), cards = $('pCards'), toast = $('pToast'), pasteEl = $('pPaste'), keysBar = $('pKeys');

  var BOX = {
    center: [20, 12, 60, 70],
    left: [0, 0, 50, 100],
    right: [50, 0, 50, 100],
    max: [0, 0, 100, 100]
  };
  var snap = 'center';
  var items = [];       // 当前结果列表
  var sel = 0;          // 结果高亮
  var clipSel = 1;      // 剪贴板高亮
  var visible = false;
  var toastTimer = 0;
  var touched = false;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function fmt(key, arg) {
    return O.t(key).replace('{0}', arg);
  }

  // ---------- 提示 ----------
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('on'); }, 1600);
  }
  function markTouched() {
    if (!touched) {
      touched = true;
      keysBar.classList.remove('nudge');
    }
  }

  // ---------- 窗口管理 ----------
  function setSnap(name) {
    snap = name;
    var b = BOX[name];
    win.style.left = b[0] + '%';
    win.style.top = b[1] + '%';
    win.style.width = b[2] + '%';
    win.style.height = b[3] + '%';
    win.classList.toggle('full', name === 'max');
    var btns = keysBar.querySelectorAll('button[data-snap]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('on', btns[i].getAttribute('data-snap') === name);
    }
  }

  // ---------- 启动器 ----------
  function calc(q) {
    if (!/^[\d\s+\-*/().%^]+$/.test(q) || !/\d/.test(q) || !/[+\-*/%^]/.test(q.replace(/^\s*-/, ''))) {
      return null;
    }
    try {
      var v = Function('"use strict";return (' + q.replace(/\^/g, '**') + ')')();
      if (typeof v === 'number' && isFinite(v)) {
        return String(Math.round(v * 1e8) / 1e8);
      }
    } catch (e) {}
    return null;
  }

  function search(q) {
    var out = [];
    var lower = q.trim().toLowerCase();
    if (!lower) {
      // 没输入时显示最近使用的几个
      for (var i = 0; i < 4; i++) {
        out.push({ type: 'app', app: P.apps[i] });
      }
      return out;
    }
    var value = calc(q);
    if (value !== null) {
      out.push({ type: 'calc', text: q.trim() + ' = ' + value, value: value });
    }
    var scored = [];
    for (var j = 0; j < P.apps.length; j++) {
      var a = P.apps[j];
      var hay = (a.keys + ' ' + a.name[0].toLowerCase() + ' ' + a.name[1].toLowerCase() + ' ' + a.name[2].toLowerCase()).split(' ');
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
        scored.push({ score: best, app: a });
      }
    }
    scored.sort(function (x, y) { return x.score - y.score; });
    for (var m = 0; m < scored.length && m < 4; m++) {
      out.push({ type: 'app', app: scored[m].app });
    }
    out.push({ type: 'web', q: q.trim() });
    return out;
  }

  function renderResults() {
    items = search(input.value);
    if (sel >= items.length) {
      sel = 0;
    }
    var html = '';
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var cls = i === sel ? ' class="on"' : '';
      if (it.type === 'app') {
        html += '<li' + cls + ' data-i="' + i + '"><i class="ai" style="background:linear-gradient(135deg,' + it.app.c[0] + ',' + it.app.c[1] + ')"></i><span>' + esc(O.pick(it.app.name)) + '</span><small>' + esc(O.t('play.app')) + '</small></li>';
      } else if (it.type === 'calc') {
        html += '<li' + cls + ' data-i="' + i + '"><i class="ai calc">=</i><span>' + esc(it.text) + '</span></li>';
      } else {
        html += '<li' + cls + ' data-i="' + i + '"><i class="ai web">↗</i><span>' + esc(fmt('play.search', it.q)) + '</span></li>';
      }
    }
    res.innerHTML = html;
  }

  function setLaunch(open) {
    if (open) {
      setClip(false);
      input.value = '';
      sel = 0;
      renderResults();
    }
    launch.classList.toggle('open', open);
    if (open) {
      // preventScroll：别因为聚焦输入框把页面滚走
      input.focus({ preventScroll: true });
    } else {
      input.blur();
    }
  }

  function activate(i) {
    var it = items[i];
    if (!it) {
      return;
    }
    if (it.type === 'app') {
      showToast(fmt('play.opened', O.pick(it.app.name)));
      win.classList.remove('flash');
      void win.offsetWidth;
      win.classList.add('flash');
    } else if (it.type === 'calc') {
      showToast(fmt('play.copied', it.value));
    } else {
      showToast(fmt('play.opened', 'Google'));
    }
    setLaunch(false);
  }

  // ---------- 剪贴板 ----------
  function renderClips() {
    var html = '';
    for (var i = 0; i < P.clips.length; i++) {
      html += '<button type="button" class="pcard' + (i === clipSel ? ' on' : '') + '" data-i="' + i + '">' + esc(O.pick(P.clips[i])) + '</button>';
    }
    cards.innerHTML = html;
  }
  function setClip(open) {
    if (open) {
      setLaunch(false);
      renderClips();
    }
    clip.classList.toggle('open', open);
  }
  function pasteClip(i) {
    pasteEl.textContent = O.pick(P.clips[i]);
    pasteEl.classList.remove('in');
    void pasteEl.offsetWidth;
    pasteEl.classList.add('in');
    showToast(O.t('play.pasted'));
    setClip(false);
  }

  // ---------- 事件 ----------
  function act(name) {
    markTouched();
    if (name === 'launcher') {
      setLaunch(!launch.classList.contains('open'));
    } else if (name === 'clip') {
      setClip(!clip.classList.contains('open'));
    } else {
      setSnap(name);
    }
  }

  keysBar.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) {
      act(b.getAttribute('data-act'));
    }
  });
  res.addEventListener('click', function (e) {
    var li = e.target.closest('li');
    if (li) {
      activate(+li.getAttribute('data-i'));
    }
  });
  cards.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) {
      pasteClip(+b.getAttribute('data-i'));
    }
  });
  input.addEventListener('input', function () {
    sel = 0;
    renderResults();
  });

  document.addEventListener('keydown', function (e) {
    var inInput = e.target === input;
    // 只在演示区进入视口、且焦点不在页面其他输入控件时接管快捷键
    if (!visible || (!inInput && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))) {
      return;
    }
    if (launch.classList.contains('open')) {
      if (e.key === 'Escape') {
        setLaunch(false);
        e.preventDefault();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        sel = (sel + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
        renderResults();
        e.preventDefault();
        return;
      }
      if (e.key === 'Enter') {
        activate(sel);
        e.preventDefault();
        return;
      }
    }
    if (clip.classList.contains('open')) {
      if (e.key === 'Escape') {
        setClip(false);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        clipSel = (clipSel + (e.key === 'ArrowRight' ? 1 : P.clips.length - 1)) % P.clips.length;
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
      act('launcher');
    } else if (e.ctrlKey && e.altKey && !e.metaKey && !e.shiftKey) {
      var map = { ArrowLeft: 'left', ArrowRight: 'right', Enter: 'max', KeyC: 'center' };
      if (!map[e.code]) {
        return;
      }
      act(map[e.code]);
    } else if (e.metaKey && e.shiftKey && !e.altKey && e.code === 'KeyV') {
      act('clip');
    } else {
      return;
    }
    e.preventDefault();
  });

  // 点击桌面空白处收起面板
  stage.addEventListener('pointerdown', function (e) {
    if (!e.target.closest('.pl, .pc')) {
      setLaunch(false);
      setClip(false);
    }
  });

  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      stage.classList.toggle('run', visible);
    }, { threshold: 0.35 }).observe(stage);
  } else {
    visible = true;
  }

  setSnap('center');
  renderClips();
  O.onLang(function () {
    renderResults();
    renderClips();
  });
})();
