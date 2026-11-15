/* Orbit 官网公共脚本：语言、外观、版本号。文案数据在 data.js（由 Scripts/build_site_data.py 生成）。 */
(function () {
  'use strict';

  var DATA = window.ORBIT_DATA;
  var LANGS = ['zh-Hans', 'en', 'zh-Hant'];
  var doc = document.documentElement;
  var listeners = [];
  var state = { lang: 'zh-Hans' };

  // ---------- 语言 ----------
  function detectLang() {
    var saved = null;
    try { saved = localStorage.getItem('orbit.lang'); } catch (e) {}
    var query = null;
    try { query = new URLSearchParams(location.search).get('lang'); } catch (e) {}
    var pick = query || saved;
    if (LANGS.indexOf(pick) >= 0) {
      return pick;
    }
    var nav = (navigator.language || 'zh-CN').toLowerCase();
    if (nav.indexOf('zh') === 0) {
      return /tw|hk|mo|hant/.test(nav) ? 'zh-Hant' : 'zh-Hans';
    }
    return 'en';
  }

  function index() {
    return LANGS.indexOf(state.lang) === 0 ? 0 : (state.lang === 'en' ? 1 : 2);
  }

  // 取一条 [简体, 英文, 繁体] 文案
  function pick(triple) {
    return triple ? triple[index()] : '';
  }

  function t(key) {
    var entry = DATA.ui[key];
    return entry ? pick(entry) : key;
  }

  function applyText(root) {
    var nodes = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var text = t(el.getAttribute('data-i18n'));
      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
      // 打字动画需要字符数：中文按两个字符宽度计
      if (el.hasAttribute('data-type')) {
        var width = 0;
        for (var c = 0; c < text.length; c++) {
          width += text.charCodeAt(c) > 255 ? 2 : 1;
        }
        el.style.setProperty('--n', width);
      }
    }
    var attrs = root.querySelectorAll('[data-i18n-attr]');
    for (var j = 0; j < attrs.length; j++) {
      var pairs = attrs[j].getAttribute('data-i18n-attr').split(';');
      for (var k = 0; k < pairs.length; k++) {
        var kv = pairs[k].split(':');
        attrs[j].setAttribute(kv[0], t(kv[1]));
      }
    }
  }

  function setLang(lang, persist) {
    state.lang = lang;
    doc.setAttribute('lang', lang);
    if (persist) {
      try { localStorage.setItem('orbit.lang', lang); } catch (e) {}
    }
    var buttons = document.querySelectorAll('#langSeg button');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', buttons[i].getAttribute('data-lang') === lang ? 'true' : 'false');
    }
    var titleKey = document.body.getAttribute('data-title-key');
    var descKey = document.body.getAttribute('data-desc-key');
    if (titleKey) {
      document.title = t(titleKey);
    }
    var meta = document.querySelector('meta[name="description"]');
    if (meta && descKey) {
      meta.setAttribute('content', t(descKey));
    }
    applyText(document);
    for (var n = 0; n < listeners.length; n++) {
      listeners[n](lang);
    }
  }

  // ---------- 外观 ----------
  function setTheme(pref, persist) {
    var dark = pref === 'dark' || (pref === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    doc.setAttribute('data-theme', dark ? 'dark' : 'light');
    doc.setAttribute('data-theme-pref', pref);
    if (persist) {
      try { localStorage.setItem('orbit.theme', pref); } catch (e) {}
    }
    var buttons = document.querySelectorAll('#themeSeg button');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', buttons[i].getAttribute('data-theme-btn') === pref ? 'true' : 'false');
    }
  }

  function bindControls() {
    var langButtons = document.querySelectorAll('#langSeg button');
    for (var i = 0; i < langButtons.length; i++) {
      langButtons[i].addEventListener('click', function () {
        setLang(this.getAttribute('data-lang'), true);
      });
    }
    var themeButtons = document.querySelectorAll('#themeSeg button');
    for (var j = 0; j < themeButtons.length; j++) {
      themeButtons[j].addEventListener('click', function () {
        setTheme(this.getAttribute('data-theme-btn'), true);
      });
    }
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      if (doc.getAttribute('data-theme-pref') === 'system') {
        setTheme('system', false);
      }
    });
  }

  // ---------- 版本号：读取同目录的 releases.json ----------
  function loadVersion() {
    var targets = document.querySelectorAll('.ver-num');
    if (!targets.length || !window.fetch) {
      return;
    }
    fetch('releases.json', { cache: 'no-cache' }).then(function (r) {
      return r.json();
    }).then(function (list) {
      if (!list || !list[0] || !list[0].version) {
        return;
      }
      for (var i = 0; i < targets.length; i++) {
        targets[i].textContent = list[0].version;
      }
    }).catch(function () {});
  }

  // ---------- 入场 ----------
  // 页面 <head> 里的内联脚本已经按“URL 参数 > 本地记录 > 跟随系统”定好了偏好，这里沿用它
  var initialPref = doc.getAttribute('data-theme-pref');
  setTheme(initialPref === 'light' || initialPref === 'dark' ? initialPref : 'system', false);

  window.Orbit = {
    data: DATA,
    t: t,
    pick: pick,
    lang: function () { return state.lang; },
    apply: applyText,
    onLang: function (fn) { listeners.push(fn); }
  };

  document.addEventListener('DOMContentLoaded', function () {
    bindControls();
    loadVersion();
    // 页面脚本（home.js / tutorial.js）先注册渲染，再统一设置语言
    setTimeout(function () {
      setLang(detectLang(), false);
    }, 0);
  });
})();
