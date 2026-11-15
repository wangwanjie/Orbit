/* 页面动效：滚动入场、卡片聚光、教程页阅读进度。
   原则：只改 transform / opacity；监听统一用 IntersectionObserver 或 rAF 节流；尊重“减少动态效果”。 */
(function () {
  'use strict';

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var doc = document.documentElement;

  // ---------- 滚动入场 ----------
  if (!reduce && window.IntersectionObserver) {
    doc.classList.add('fx');
    var reveal = function (el) {
      el.classList.add('in');
      io.unobserve(el);
      // 入场完成后撤掉标记，免得它的过渡时长影响之后的悬停动效
      setTimeout(function () { el.removeAttribute('data-rv'); }, 1200);
    };
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          reveal(entries[i].target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    var targets = document.querySelectorAll('[data-rv]');
    for (var t = 0; t < targets.length; t++) {
      // 同一组里的元素依次错开一点
      var sibs = targets[t].parentNode.querySelectorAll(':scope > [data-rv]');
      targets[t].style.setProperty('--i', Array.prototype.indexOf.call(sibs, targets[t]));
      io.observe(targets[t]);
    }
  }

  // ---------- 卡片聚光：鼠标位置写进 CSS 变量，一帧只写一次 ----------
  var SPOT = '.pad, .ba > div, .start-steps > div, .view-tabs button, .tip-grid > div, .rules li';
  if (!reduce && matchMedia('(hover: hover)').matches) {
    var pending = null;
    document.addEventListener('pointermove', function (e) {
      var el = e.target.closest ? e.target.closest(SPOT) : null;
      if (!el) {
        return;
      }
      if (!pending) {
        requestAnimationFrame(function () {
          var r = pending.el.getBoundingClientRect();
          pending.el.style.setProperty('--mx', (pending.x - r.left) + 'px');
          pending.el.style.setProperty('--my', (pending.y - r.top) + 'px');
          pending = null;
        });
      }
      pending = { el: el, x: e.clientX, y: e.clientY };
    }, { passive: true });
  }

  // ---------- 教程页阅读进度 ----------
  var bar = document.getElementById('readBar');
  if (bar) {
    var ticking = false;
    var update = function () {
      var max = doc.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0) + ')';
      ticking = false;
    };
    addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }
})();
