/* 示意动画的 HTML。样式与时间线在 demos.css；文字通过 data-i18n 取自 data.js 的 d.* 条目。 */
(function () {
  'use strict';

  function tb(title) {
    return '<div class="tb"><i></i><i></i><i></i>' + (title ? '<span data-i18n="' + title + '"></span>' : '') + '</div>';
  }
  function lines() {
    return '<div class="ln" style="width:64%"></div><div class="ln"></div><div class="ln" style="width:82%"></div>';
  }
  function menubar(app, extra) {
    return '<div class="mb"><b>' + app + '</b><span class="sp"></span>' + (extra || '<i class="ic"></i><i class="ic c2"></i>') + '<i class="ic orb"></i></div>';
  }
  function sk(keys) {
    var out = '';
    for (var i = 0; i < keys.length; i++) {
      out += '<span class="sk">' + keys[i] + '</span>';
    }
    return out;
  }
  function timer() {
    return '<span class="timer"><div><span>0:00</span><span>0:01</span><span>0:02</span><span>0:03</span><span>0:04</span><span>0:05</span></div></span>';
  }
  function bars(n) {
    var out = '';
    for (var i = 0; i < n; i++) {
      out += '<i></i>';
    }
    return out;
  }

  var DEMOS = {};

  DEMOS.launcher =
    menubar('Safari') +
    '<div class="desk">' +
    '<div class="win" style="left:6%;top:8%;width:46%;height:60%">' + tb() + lines() + '</div>' +
    '<div class="keys">' + sk(['⌥', 'Space']) + '</div>' +
    '<div class="lp glass">' +
      '<div class="lbar"><span class="mag"></span><span class="typed" data-type data-i18n="d.launcher.type"></span><i class="caret"></i><span class="ph" data-i18n="d.launcher.ph"></span></div>' +
      '<ul class="lres">' +
        '<li class="sel"><i class="ai"></i><span data-i18n="d.launcher.r1"></span><small data-i18n="d.launcher.app"></small></li>' +
        '<li><i class="ai b"></i><span data-i18n="d.launcher.r2"></span><small data-i18n="d.launcher.app"></small></li>' +
        '<li><i class="ai w"></i><span data-i18n="d.launcher.r3"></span></li>' +
      '</ul>' +
    '</div>' +
    '<div class="win lopen">' + tb() + '<div class="ctr" data-i18n="d.launcher.r1"></div></div>' +
    '</div>';

  DEMOS.window =
    menubar('Figma') +
    '<div class="desk">' +
    '<div class="win wm-other">' + tb('d.window.other') + lines() + '</div>' +
    '<div class="win wm-main">' + tb('d.window.title') + '<div class="body"><div class="blk"></div></div></div>' +
    '<div class="hk h-ctr"><div class="glass">' + sk(['⌃', '⌥', 'C']) + '<em data-i18n="d.window.center"></em></div></div>' +
    '<div class="hk h-l"><div class="glass">' + sk(['⌃', '⌥', '←']) + '<em data-i18n="d.window.left"></em></div></div>' +
    '<div class="hk h-r"><div class="glass">' + sk(['⌃', '⌥', '→']) + '<em data-i18n="d.window.right"></em></div></div>' +
    '<div class="hk h-max"><div class="glass">' + sk(['⌃', '⌥', '↩']) + '<em data-i18n="d.window.max"></em></div></div>' +
    '</div>';

  DEMOS.clipboard =
    menubar('Notes') +
    '<div class="desk">' +
    '<div class="win cb-doc">' + tb('d.clipboard.doc') + '<div class="ln" style="width:58%"></div><div class="ln"></div><div class="ln pasted" data-i18n="d.clipboard.c2"></div></div>' +
    '<div class="abs cb-panel glass">' +
      '<div class="cb-search" data-i18n="d.clipboard.search"></div>' +
      '<div class="cards">' +
        '<div class="card"><small data-i18n="d.clipboard.k1"></small><span data-i18n="d.clipboard.c1"></span></div>' +
        '<div class="card"><small data-i18n="d.clipboard.k2"></small><span style="color:var(--acc)" data-i18n="d.clipboard.c2"></span></div>' +
        '<div class="card"><small data-i18n="d.clipboard.k3"></small><div class="sw"></div><span data-i18n="d.clipboard.c3"></span></div>' +
        '<div class="card"><small data-i18n="d.clipboard.k4"></small><div class="im"></div></div>' +
        '<div class="cb-sel"></div>' +
      '</div>' +
    '</div>' +
    '</div>';

  DEMOS.menubar =
    '<div class="mbd">' +
    '<div class="mb"><b>Notes</b><span class="sp"></span>' +
      '<span class="hid"><i class="ic c1"></i><i class="ic c3"></i><i class="ic c4"></i></span>' +
      '<span class="chev">‹</span><i class="ic"></i><i class="ic c2"></i><span>9:41</span><i class="ic orb"></i></div>' +
    '<div class="desk">' +
      '<div class="win stub">' + tb() + lines() + '</div>' +
      '<div class="cap c-hide" data-i18n="d.menubar.hide"></div>' +
      '<div class="cap c-show" data-i18n="d.menubar.show"></div>' +
    '</div>' +
    '<div class="abs mb-panel glass"><i class="ic c1"></i><i class="ic c3"></i><i class="ic c4"></i></div>' +
    '</div>';

  DEMOS.monitor =
    menubar('Xcode', '<span class="eq">' + bars(5) + '</span><span>34%</span><i class="ic"></i>') +
    '<div class="desk">' +
    '<div class="win" style="left:6%;top:12%;width:44%;height:56%">' + tb() + lines() + '</div>' +
    '<div class="abs mo-panel glass s1">' +
      '<h5 data-i18n="d.monitor.cpu"></h5>' +
      '<svg viewBox="0 0 100 30"><path class="ar" d="M0 30 L0 22 L10 18 L20 24 L30 12 L40 16 L50 8 L60 14 L70 6 L80 15 L90 10 L100 13 L100 30Z"/>' +
      '<path class="tr" pathLength="1" d="M0 22 L10 18 L20 24 L30 12 L40 16 L50 8 L60 14 L70 6 L80 15 L90 10 L100 13"/></svg>' +
      '<h5 style="margin-top:.7em" data-i18n="d.monitor.top"></h5>' +
      '<div class="proc"><span>Xcode</span><span class="bar"><i style="--w:82%"></i></span><span>82%</span></div>' +
      '<div class="proc"><span>Safari</span><span class="bar"><i style="--w:41%;--d:.3s"></i></span><span>41%</span></div>' +
      '<div class="proc"><span>Docker</span><span class="bar"><i style="--w:23%;--d:.6s"></i></span><span>23%</span></div>' +
    '</div>' +
    '</div>';

  DEMOS.screenshot =
    menubar('Numbers') +
    '<div class="desk">' +
    '<div class="win ss-bg">' + tb() +
      '<div class="chart"><i style="height:42%"></i><i style="height:60%"></i><i style="height:36%"></i><i style="height:88%"></i><i style="height:54%"></i></div>' +
      '<div class="note" data-i18n="d.screenshot.text"></div></div>' +
    '<div class="sel">' +
      '<span class="size s2" data-i18n="d.screenshot.size"></span>' +
      '<svg viewBox="0 0 160 94" preserveAspectRatio="none"><path class="arrow" pathLength="1" d="M26 78 L84 40 M84 40 L72 41 M84 40 L80 51"/><rect class="box" pathLength="1" x="92" y="12" width="28" height="48" rx="3"/></svg>' +
      '<div class="tools glass s3"><span>↗</span><span class="on">▭</span><span>✎</span><span>T</span><span>▦</span></div>' +
    '</div>' +
    '<div class="abs toast glass s5" data-i18n="d.screenshot.done"></div>' +
    '</div>';

  DEMOS.gif =
    menubar('Safari') +
    '<div class="desk">' +
    '<div class="win" style="left:6%;top:6%;width:88%;height:88%">' + tb() + '</div>' +
    '<div class="abs reg"><div class="inner"><div class="ball"></div></div>' +
      '<div class="recchip"><i class="rd"></i><span data-i18n="d.gif.rec"></span>' + timer() + '</div></div>' +
    '<div class="abs gif-saved glass s5" data-i18n="d.gif.saved"></div>' +
    '</div>';

  DEMOS.recorder =
    menubar('Keynote') +
    '<div class="desk">' +
    '<div class="win rc-win">' + tb() + lines() + '<div class="ln" style="width:48%"></div></div>' +
    '<i class="cur"></i><i class="ring r1"></i><i class="ring r2"></i>' +
    '<div class="abs pill glass"><i class="rd"></i>' + timer() +
      '<span class="meter"><span data-i18n="d.recorder.sys"></span><span class="mt">' + bars(4) + '</span></span>' +
      '<span class="meter m2"><span data-i18n="d.recorder.mic"></span><span class="mt">' + bars(4) + '</span></span>' +
      '<span class="stop" data-i18n="d.recorder.stop"></span></div>' +
    '</div>';

  DEMOS.finder =
    menubar('Finder') +
    '<div class="desk">' +
    '<div class="win fd-win">' + tb() +
      '<div class="fd-row"><i class="fi"></i><span data-i18n="d.finder.f1"></span></div>' +
      '<div class="fd-row"><i class="fi"></i><span data-i18n="d.finder.f2"></span></div>' +
      '<div class="fd-row"><i class="fi d"></i><span data-i18n="d.finder.f3"></span></div></div>' +
    '<div class="abs ctx glass">' +
      '<div class="hl"><span data-i18n="d.finder.terminal"></span></div>' +
      '<div><span data-i18n="d.finder.editor"></span></div>' +
      '<div><span data-i18n="d.finder.copy"></span></div><hr>' +
      '<div><span data-i18n="d.finder.new"></span><span class="muted">›</span></div>' +
      '<div><span data-i18n="d.finder.cut"></span></div></div>' +
    '<div class="win term">' + tb() + '<p><b>~/Projects/design</b> %<i class="caret"></i></p></div>' +
    '</div>';

  DEMOS.filesearch =
    menubar('Orbit') +
    '<div class="desk">' +
    '<div class="win fs-win">' + tb() +
      '<div class="fs-top"><div class="fs-input"><span class="typed" data-type data-i18n="d.search.type"></span><i class="caret"></i></div></div>' +
      '<div class="fs-chips"><span class="chip" data-i18n="d.search.chip1"></span><span class="chip" data-i18n="d.search.chip2"></span></div>' +
      '<div class="prog"><i></i></div>' +
      '<div class="fs-res">' +
        '<div class="it s2" style="--d:0s"><i class="fi"></i><span data-i18n="d.search.r1"></span></div>' +
        '<div class="it s2" style="--d:.5s"><i class="fi"></i><span data-i18n="d.search.r2"></span></div>' +
        '<div class="it s2" style="--d:1s"><i class="fi"></i><span data-i18n="d.search.r3"></span></div>' +
        '<div class="it s2" style="--d:1.5s"><i class="fi"></i><span data-i18n="d.search.r4"></span></div>' +
      '</div></div>' +
    '</div>';

  DEMOS.disk =
    menubar('Orbit') +
    '<div class="desk">' +
    '<div class="win dk-win">' + tb() + '<div class="crumb">Macintosh HD › Users</div>' +
      '<div class="tm">' +
        '<div class="b b3 s1" data-i18n="d.disk.b4"></div><div class="b b4 s1">Music</div><div class="b b5 s1">Photos</div>' +
        '<div class="b b1 s2" data-i18n="d.disk.b2"></div><div class="b b2 s2" data-i18n="d.disk.b3"></div>' +
        '<div class="b b0 s3" data-i18n="d.disk.big"></div>' +
      '</div></div>' +
    '</div>';

  DEMOS.login =
    menubar('Orbit') +
    '<div class="desk">' +
    '<div class="win lg-win">' + tb() +
      '<div class="lg-top"><span class="chip s4" data-i18n="d.login.count"></span></div>' +
      '<div class="lg-row"><i class="ai" style="background:#0a84ff"></i><span class="nm">Dropbox</span><i class="tg"></i></div>' +
      '<div class="lg-row fade" style="--d:0s"><i class="ai" style="background:#1b2838"></i><span class="nm">Steam</span><i class="tg off flip" style="--d:0s"></i></div>' +
      '<div class="lg-row fade" style="--d:1.8s"><i class="ai" style="background:#ff3b30"></i><span class="nm">Adobe Creative Cloud</span><i class="tg off flip" style="--d:1.8s"></i></div>' +
      '<div class="lg-row"><i class="ai" style="background:#5e5ce6"></i><span class="nm">Orbit</span><i class="tg"></i></div>' +
    '</div>' +
    '</div>';

  function unRow(label, size, i, off) {
    return '<div class="un-row s2" style="--d:' + (i * 0.35) + 's"><div class="un-row-in" style="--o:' + (i * 0.12) + 's">' +
      '<i class="cbx' + (off ? ' no' : '') + '"></i><span data-i18n="' + label + '"></span><small>' + size + '</small></div></div>';
  }
  DEMOS.uninstaller =
    menubar('Orbit') +
    '<div class="desk">' +
    '<div class="win un-win">' + tb() +
      '<div class="un-head"><i class="app-ic"></i><div class="un-drop" data-i18n="d.uninstaller.drop"></div></div>' +
      unRow('d.uninstaller.l1', '320 MB', 0) + unRow('d.uninstaller.l2', '412 MB', 1) + unRow('d.uninstaller.l3', '2 MB', 2) +
      unRow('d.uninstaller.l4', '560 MB', 3) + unRow('d.uninstaller.l5', '—', 4, true) +
      '<div class="un-foot s3"><span data-i18n="d.uninstaller.total"></span><span class="un-btn" data-i18n="d.uninstaller.btn"></span></div>' +
      '<div class="un-fin fin s5" data-i18n="d.uninstaller.done"></div>' +
    '</div>' +
    '<i class="un-drag"></i>' +
    '</div>';

  function clRow(name, tagKey, mid, w, size, i) {
    return '<div class="cl-row"><span>' + '<span data-i18n="' + name + '"></span><span class="tag' + (mid ? ' mid' : '') + '" data-i18n="' + tagKey + '"></span></span>' +
      '<span class="bar"><i style="--w:' + w + '%;--d:' + (i * 0.4) + 's"></i></span><span class="sz">' + size + '</span></div>';
  }
  DEMOS.cleaner =
    menubar('Orbit') +
    '<div class="desk">' +
    '<div class="win cl-win">' + tb() +
      '<div class="cl-head"><span class="sc" data-i18n="d.cleaner.scan"></span></div>' +
      clRow('d.cleaner.c1', 'd.cleaner.low', false, 100, '6.1 GB', 0) +
      clRow('d.cleaner.c2', 'd.cleaner.low', false, 79, '4.8 GB', 1) +
      clRow('d.cleaner.c3', 'd.cleaner.low', false, 20, '1.2 GB', 2) +
      clRow('d.cleaner.c4', 'd.cleaner.mid', true, 33, '2.0 GB', 3) +
      '<div class="cl-total s4"><span data-i18n="d.cleaner.total"></span><span class="go" data-i18n="d.cleaner.go"></span></div>' +
    '</div>' +
    '</div>';

  function pvIt(label, d, o) {
    return '<div class="pv-it' + (o !== undefined ? ' pv-clear' : '') + '"' + (o !== undefined ? ' style="--o:' + o + 's"' : '') + '><i class="cbx" style="--d:' + d + 's"></i><span data-i18n="' + label + '"></span></div>';
  }
  DEMOS.privacy =
    menubar('Orbit') +
    '<div class="desk">' +
    '<div class="win pv-win">' + tb() +
      '<div class="pv-cols">' +
        '<div>' + pvIt('d.privacy.b1', 0) + pvIt('d.privacy.b2', 0.5) + pvIt('d.privacy.b3', 1) + '</div>' +
        '<div>' + pvIt('d.privacy.i1', 1.6, 0) + pvIt('d.privacy.i2', 2.1, 0.15) + pvIt('d.privacy.i3', 2.6, 0.3) + '</div>' +
      '</div>' +
      '<div class="pv-btn" data-i18n="d.privacy.btn"></div>' +
      '<div class="pv-fin fin s5" data-i18n="d.privacy.done"></div>' +
    '</div>' +
    '</div>';

  function mtRow(key, d) {
    return '<div class="mt-row"><span class="st" style="--d:' + d + 's"><i class="sp"></i><i class="ok"></i></span><span class="nm" data-i18n="' + key + '"></span><span class="res" style="--d:' + d + 's" data-i18n="d.maint.done"></span></div>';
  }
  DEMOS.maintenance =
    menubar('Orbit') +
    '<div class="desk">' +
    '<div class="win mt-win">' + tb() + mtRow('d.maint.t1', 0) + mtRow('d.maint.t2', 1.2) + mtRow('d.maint.t3', 2.4) + mtRow('d.maint.t4', 3.6) + '</div>' +
    '</div>';

  DEMOS.tweaks =
    menubar('Orbit') +
    '<div class="desk">' +
    '<div class="win tw-win">' + tb() +
      '<div class="tw-row"><span class="nm" data-i18n="d.tweaks.t1"></span><i class="tg flip"></i></div>' +
      '<div class="tw-row"><span class="nm" data-i18n="d.tweaks.t2"></span><i class="tg off"></i></div>' +
      '<div class="tw-ok s4">✓ <span data-i18n="d.tweaks.ok"></span></div>' +
    '</div>' +
    '<div class="dock glass"><i></i><i></i><i></i><i></i><i></i></div>' +
    '</div>';

  // 把一个演示渲染进容器，并接上“进入视口才播放”和“重播”
  var observer = null;
  function getObserver() {
    if (observer || !window.IntersectionObserver) {
      return observer;
    }
    observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        entries[i].target.classList.toggle('run', entries[i].isIntersecting);
      }
    }, { threshold: 0.25 });
    return observer;
  }

  function stageHTML(id) {
    return '<div class="stage" data-demo="' + id + '"><div class="scn">' + DEMOS[id] + '</div></div>';
  }

  function mount(root) {
    var stages = root.querySelectorAll('.stage');
    var io = getObserver();
    for (var i = 0; i < stages.length; i++) {
      if (io) {
        io.observe(stages[i]);
      } else {
        stages[i].classList.add('run');
      }
    }
    var buttons = root.querySelectorAll('.replay');
    for (var j = 0; j < buttons.length; j++) {
      buttons[j].addEventListener('click', function () {
        var stage = this.closest('.demo-frame').querySelector('.stage');
        stage.classList.add('reset');
        void stage.offsetWidth;
        stage.classList.remove('reset');
      });
    }
  }

  window.OrbitDemos = { html: stageHTML, mount: mount, ids: Object.keys(DEMOS) };
})();
