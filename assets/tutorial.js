/* 教程页：按模块渲染说明与动画演示，目录随滚动高亮 */
(function () {
  'use strict';

  var O = window.Orbit;
  var content = document.getElementById('tutContent');
  var toc = document.getElementById('toc');
  var tocObserver = null;

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
    var shortcut = m.key ? '<kbd class="k">' + esc(Array.isArray(m.key) ? O.pick(m.key) : m.key) + '</kbd>' : '<span>' + esc(O.t('noShortcut')) + '</span>';
    var meta = '<span>' + esc(O.t('shortcutLabel')) + shortcut + '</span>';
    if (m.alt) {
      meta += '<span>' + esc(O.t('replaces')) + (O.lang() === 'en' ? ': ' : '：') + esc(m.alt) + '</span>';
    }
    return '<section class="mod" id="m-' + m.id + '">' +
      '<header><h2>' + esc(O.pick(m.name)) + '</h2><p class="tagline">' + esc(O.pick(m.tagline)) + '</p><div class="meta">' + meta + '</div></header>' +
      '<div class="mod-body">' +
        '<div class="demo-frame">' + window.OrbitDemos.html(m.id) +
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
      html += '<h3 class="part-title">' + esc(name) + '</h3>';
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
