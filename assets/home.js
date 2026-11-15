/* 首页：功能列表、启动器演示、截图切换、致谢链接 */
(function () {
  'use strict';

  var O = window.Orbit;
  var featList = document.getElementById('featList');
  var homeDemo = document.getElementById('homeDemo');
  var creditsEl = document.getElementById('credits');
  var demoBuilt = false;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderFeatures() {
    var data = O.data;
    var html = '';
    for (var c = 0; c < data.categories.length; c++) {
      var rows = '';
      for (var i = 0; i < data.modules.length; i++) {
        var m = data.modules[i];
        if (m.cat !== c) {
          continue;
        }
        rows += '<tr>' +
          '<td>' + esc(O.pick(m.name)) + '</td>' +
          '<td>' + esc(O.pick(m.what)) + '</td>' +
          '<td class="alt">' + esc(m.alt || '—') + '</td>' +
          '<td class="key">' + (m.key ? '<kbd class="k">' + esc(Array.isArray(m.key) ? O.pick(m.key) : m.key) + '</kbd>' : '<span class="fine">—</span>') + '</td>' +
          '<td class="go"><a href="tutorial.html#m-' + m.id + '">' + esc(O.t('seeHow')) + ' →</a></td>' +
          '</tr>';
      }
      html += '<div class="group"><h3>' + esc(O.pick(data.categories[c].name)) + '</h3>' +
        '<table class="ftable"><thead><tr><th>' + esc(O.t('colName')) + '</th><th>' + esc(O.t('colWhat')) +
        '</th><th class="alt">' + esc(O.t('colAlt')) + '</th><th class="key">' + esc(O.t('colKey')) + '</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    }
    featList.innerHTML = html;
  }

  function renderCredits() {
    var parts = [];
    for (var i = 0; i < O.data.credits.length; i++) {
      parts.push('<a href="' + O.data.credits[i][1] + '">' + O.data.credits[i][0] + '</a>');
    }
    creditsEl.innerHTML = parts.join('、');
  }

  function buildDemo() {
    if (demoBuilt) {
      return;
    }
    demoBuilt = true;
    homeDemo.innerHTML = window.OrbitDemos.html('launcher') +
      '<div class="demo-cap"><span data-i18n="tutDemoCap"></span><button type="button" class="replay" data-i18n="replay"></button></div>';
    window.OrbitDemos.mount(homeDemo);
  }

  // 截图切换
  function bindViews() {
    var tabs = document.querySelectorAll('#viewTabs button');
    var imgs = document.querySelectorAll('#winStack img');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function () {
        var idx = +this.getAttribute('data-view');
        for (var j = 0; j < tabs.length; j++) {
          tabs[j].setAttribute('aria-selected', j === idx ? 'true' : 'false');
          imgs[j].classList.toggle('is-on', j === idx);
        }
      });
    }
  }

  bindViews();
  O.onLang(function () {
    renderFeatures();
    renderCredits();
    buildDemo();
    O.apply(document);
  });
})();
