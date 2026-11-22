/* 教程页：按模块渲染说明与动画演示，目录随滚动高亮 */
(function () {
  'use strict';

  var O = window.Orbit;
  var content = document.getElementById('tutContent');
  var toc = document.getElementById('toc');
  var keyStrip = document.getElementById('keyStrip');
  var tocObserver = null;

  // 分组标记：Orbit 图标的 2×2 磁贴，点亮这一组对应的那一格（与首页模块索引一致）
  var CAT_TILE = [0, 2, 1, 3];
  var TILE_COLORS = ['#3B82F6', '#F59E0B', '#EC4899', '#22C55E'];
  function glyph(tile) {
    var cells = [
      '<rect x="1.5" y="1.5" width="6.5" height="6.5" rx="1.9"',
      '<circle cx="13.25" cy="4.75" r="3.05"',
      '<rect x="1.5" y="10" width="6.5" height="6.5" rx="1.9"',
      '<rect x="10" y="10" width="6.5" height="6.5" rx="1.9"'
    ];
    var svg = '<svg class="glyph" viewBox="0 0 18 18" aria-hidden="true">';
    for (var i = 0; i < 4; i++) {
      svg += cells[i] + (i === tile ? ' style="fill:' + TILE_COLORS[tile] + '"' : '') + '/>';
    }
    return svg + '</svg>';
  }

  function keyOf(m) {
    return m.key ? (Array.isArray(m.key) ? O.pick(m.key) : m.key) : '';
  }

  // 页首的默认快捷键速查：只列有默认快捷键的模块，点一下跳到那一节
  function renderKeyStrip() {
    var html = '';
    var mods = O.data.modules;
    for (var i = 0; i < mods.length; i++) {
      var key = keyOf(mods[i]);
      if (key) {
        html += '<a href="#m-' + mods[i].id + '"><kbd>' + esc(key) + '</kbd><span>' + esc(O.pick(mods[i].name)) + '</span></a>';
      }
    }
    keyStrip.innerHTML = html;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderStart() {
    var html = '<section class="block" id="start"><h2 class="sect-h">' + esc(O.t('startTitle')) + '</h2><p class="sect-lead">' + esc(O.t('startLead')) + '</p><div class="start-steps">';
    for (var i = 1; i <= 4; i++) {
      html += '<div><h3><span>' + i + '</span>' + esc(O.t('s' + i + 't')) + '</h3><p>' + esc(O.t('s' + i + 'd')) + '</p></div>';
    }
    return html + '</div></section>';
  }

  function renderModule(m) {
    var steps = '';
    for (var i = 0; i < m.steps.length; i++) {
      steps += '<li>' + esc(O.pick(m.steps[i])) + '</li>';
    }
    var shortcut = m.key ? '<kbd class="k">' + esc(keyOf(m)) + '</kbd>' : '<span>' + esc(O.t('noShortcut')) + '</span>';
    var meta = '<span>' + esc(O.t('shortcutLabel')) + shortcut + '</span>';
    if (m.alt) {
      meta += '<span>' + esc(O.t('replaces')) + (O.lang() === 'en' ? ': ' : '：') + esc(m.alt) + '</span>';
    }
    return '<section class="mod" id="m-' + m.id + '">' +
      '<header><h3>' + esc(O.pick(m.name)) + '</h3><p class="tagline">' + esc(O.pick(m.tagline)) + '</p><div class="meta">' + meta + '</div></header>' +
      '<div class="mod-body">' +
        // 示意动画固定用深色桌面（和首页那台 Mac 一致），不随页面外观切换
        '<div class="demo-frame"><div class="stage-dark" data-theme="dark">' + window.OrbitDemos.html(m.id) + '</div>' +
          '<div class="demo-cap"><span>' + esc(O.t('tutDemoCap')) + '</span><button type="button" class="replay">' + esc(O.t('replay')) + '</button></div></div>' +
        '<div class="how"><h3>' + esc(O.t('howTitle')) + '</h3><ol>' + steps + '</ol></div>' +
      '</div>' +
      '<div class="gain"><h3>' + esc(O.t('gainTitle')) + '</h3><div class="ba">' +
        '<div class="before"><span>' + esc(O.t('gainBefore')) + '</span><p>' + esc(O.pick(m.before)) + '</p></div>' +
        '<div class="after"><span>' + esc(O.t('gainAfter')) + '</span><p>' + esc(O.pick(m.after)) + '</p></div>' +
      '</div></div>' +
      (m.tip ? '<p class="tip"><b>' + esc(O.t('tipLabel')) + '</b>' + esc(O.pick(m.tip)) + '</p>' : '') +
      '</section>';
  }

  function renderTips() {
    var html = '<section class="block" id="tips"><h2 class="sect-h">' + esc(O.t('tipsTitle')) + '</h2><div class="tip-grid">';
    for (var i = 1; i <= 4; i++) {
      html += '<div><h3>' + esc(O.t('t' + i + 't')) + '</h3><p>' + esc(O.t('t' + i + 'd')) + '</p></div>';
    }
    return html + '</div></section>';
  }

  function render() {
    var data = O.data;
    var html = renderStart();
    var tocHtml = '<h4>' + esc(O.t('tutH1')) + '</h4><a href="#start">' + esc(O.t('tocStart')) + '</a>';
    for (var c = 0; c < data.categories.length; c++) {
      var name = O.pick(data.categories[c].name);
      var count = 0;
      for (var n = 0; n < data.modules.length; n++) {
        if (data.modules[n].cat === c) {
          count += 1;
        }
      }
      html += '<div class="part-title">' + glyph(CAT_TILE[c]) + '<h2>' + esc(name) + '</h2><span>' + count + '</span></div>';
      tocHtml += '<h4>' + esc(name) + '</h4>';
      for (var i = 0; i < data.modules.length; i++) {
        var m = data.modules[i];
        if (m.cat === c) {
          html += renderModule(m);
          tocHtml += '<a href="#m-' + m.id + '">' + esc(O.pick(m.name)) + '</a>';
        }
      }
    }
    html += renderTips();
    tocHtml += '<h4>&nbsp;</h4><a href="#tips">' + esc(O.t('tocTips')) + '</a>';
    content.innerHTML = html;
    toc.innerHTML = tocHtml;
    renderKeyStrip();
    O.apply(content);
    window.OrbitDemos.mount(content);
    watchSections();
  }

  // 目录高亮：取最靠近视口上方的那一节
  function watchSections() {
    if (tocObserver) {
      tocObserver.disconnect();
    }
    if (!window.IntersectionObserver) {
      return;
    }
    tocObserver = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          var id = entries[i].target.id;
          var links = toc.querySelectorAll('a');
          for (var j = 0; j < links.length; j++) {
            links[j].classList.toggle('on', links[j].getAttribute('href') === '#' + id);
          }
        }
      }
    }, { rootMargin: '-80px 0px -65% 0px' });
    var sections = content.querySelectorAll('section[id]');
    for (var k = 0; k < sections.length; k++) {
      tocObserver.observe(sections[k]);
    }
  }

  O.onLang(function () {
    render();
    // 首次渲染后，若地址带锚点，滚动到对应模块
    if (location.hash && !render.done) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) {
        target.scrollIntoView();
      }
    }
    render.done = true;
  });
})();
