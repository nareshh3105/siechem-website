/**
 * FILE: animations.js
 *
 * PURPOSE:
 *   Provides three shared visual behaviours used across all static HTML pages:
 *   1. Scroll-reveal  — fades/slides elements into view as they enter the viewport.
 *   2. Stat counters  — animates numeric counters (e.g. "22M+ configurations") from
 *      0 up to their target value when they scroll into view.
 *   3. Nav blur       — adds a subtle shadow + backdrop-blur to the sticky nav bar
 *      once the user scrolls past the top 8px of the page.
 *
 * WHY THIS FILE EXISTS:
 *   All pages share these three behaviours. Rather than repeating ~70 lines of vanilla
 *   JS inside every HTML file's <script> block, this module is loaded once via
 *   `<script src="animations.js" defer>` and handles everything automatically by
 *   querying `.reveal`, `[data-count]`, and `.nav` from the DOM.
 *
 * HOW EACH PART WORKS:
 *
 *   Scroll-reveal (IntersectionObserver on .reveal):
 *     - Any element with class `reveal` starts invisible (opacity:0, translateY:20px
 *       defined in theme.css).
 *     - When 7% of the element enters the viewport + 32px bottom root margin, the
 *       observer adds class `visible` which triggers the CSS transition.
 *     - A MutationObserver watches for dynamically injected content (e.g. product
 *       cards rendered by JS) and re-registers new `.reveal` elements automatically.
 *     - Elements are unobserved after first reveal to save memory.
 *
 *   Stat counters ([data-count="N"] [data-suffix="K"]):
 *     - A second IntersectionObserver fires when 55% of the element is visible
 *       (ensures the number is clearly in view before counting starts).
 *     - Uses requestAnimationFrame with a cubic-ease-out curve over 1400ms so the
 *       count feels natural — fast at the start, easing into the final value.
 *
 *   Nav blur (.nav):
 *     - Listens on scroll (passive for perf). Toggles `.nav-scrolled` on the nav
 *       element when scrollY > 8px. The CSS rule for `.nav-scrolled` increases the
 *       box-shadow and can add backdrop-filter if desired.
 *     - Also fires once on load to handle pages that are already scrolled (e.g. the
 *       browser restoring scroll position on back-navigation).
 *
 * NOTE:
 *   This file is wrapped in an IIFE so none of its variables pollute the global scope.
 */
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
