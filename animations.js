/* Siechem — Shared scroll animations
   Scroll-reveal (.reveal → .visible), stat counters (data-count), nav blur */
(function () {
  'use strict';

  /* ── Scroll-reveal ───────────────────────────── */
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -32px 0px' });

  function observeAll() {
    document.querySelectorAll('.reveal:not(.visible)').forEach(function (el) {
      revealObs.observe(el);
    });
  }
  observeAll();

  /* Watch for dynamically added .reveal elements (product cards etc.) */
  var mutObs = new MutationObserver(function (mutations) {
    var found = false;
    mutations.forEach(function (m) {
      if (m.addedNodes.length) found = true;
    });
    if (found) observeAll();
  });
  mutObs.observe(document.body, { childList: true, subtree: true });

  /* ── Stat counters  data-count="N"  data-suffix="K" ─ */
  var countObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el     = e.target;
      var end    = parseFloat(el.dataset.count);
      var suffix = el.dataset.suffix || '';
      var dur    = 1400;
      var t0     = null;

      function tick(ts) {
        if (!t0) t0 = ts;
        var pct  = Math.min((ts - t0) / dur, 1);
        var ease = 1 - Math.pow(1 - pct, 3);
        var cur  = Math.floor(ease * end);
        el.textContent = cur + suffix;
        if (pct < 1) requestAnimationFrame(tick);
        else         el.textContent = end + suffix;
      }
      requestAnimationFrame(tick);
      countObs.unobserve(el);
    });
  }, { threshold: 0.55 });

  document.querySelectorAll('[data-count]').forEach(function (el) {
    countObs.observe(el);
  });

  /* ── Nav blur on scroll ──────────────────────── */
  var nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('nav-scrolled', window.scrollY > 8);
    }, { passive: true });
    /* Fire once on load in case page starts scrolled */
    if (window.scrollY > 8) nav.classList.add('nav-scrolled');
  }

})();
