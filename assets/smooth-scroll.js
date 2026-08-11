/**
 * FILE: assets/smooth-scroll.js
 *
 * PURPOSE:
 *   Adds inertial ("momentum") scrolling to the site, so the page glides to a
 *   stop instead of snapping frame-to-frame with the wheel. This is the single
 *   biggest reason reference sites like nexans.com feel smoother than a stock
 *   page — the scroll carries weight.
 *
 * WHY A LIBRARY:
 *   Scroll is load-bearing; a hand-rolled version breaks in the places that are
 *   hard to test (trackpad momentum, keyboard paging, nested scrollers, iOS).
 *   Lenis (assets/lenis.min.js, v1.3.26, vendored — no CDN) handles those.
 *
 * HOW IT BEHAVES:
 *   - Desktop/wheel only. Touch scrolling is left native: mobile browsers
 *     already have momentum, and overriding it feels laggy and breaks
 *     pull-to-refresh.
 *   - Disabled entirely under `prefers-reduced-motion: reduce`, where the page
 *     falls back to normal browser scrolling.
 *   - `html { scroll-behavior: smooth }` MUST be off while Lenis runs — the two
 *     fight over the same scroll position and produce a stutter. We swap the
 *     CSS rule for Lenis's own `scrollTo` on anchor links (see below), so
 *     in-page links keep their smooth animation either way.
 *   - Anything that scrolls inside an overlay (mobile menu, video modal) is
 *     marked `data-lenis-prevent` so Lenis ignores it and the browser scrolls
 *     that container natively.
 *
 * NOTE: loaded with `defer`, after lenis.min.js.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || typeof window.Lenis !== 'function') return;

  /* Lenis drives scrollTop itself; the CSS smooth-scroll rule would fight it. */
  document.documentElement.style.scrollBehavior = 'auto';

  var lenis = new Lenis({
    duration: 1.05,               // glide length, seconds — the "weight"
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
    syncTouch: false,             // leave touch scrolling native
    touchMultiplier: 1.6,
    wheelMultiplier: 1
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  /* Overlays scroll natively — Lenis must not capture wheel events inside them. */
  ['.mobile-menu', '.video-modal', '.video-modal-container'].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      el.setAttribute('data-lenis-prevent', '');
    });
  });

  /* While an overlay is open the page behind it must not scroll. */
  window.siechemLenis = lenis;

  /* In-page anchors: hand them to Lenis so they use the same easing.
     Skips bare "#" and any link that opts out with data-no-smooth. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-no-smooth')) return;
    var id = a.getAttribute('href');
    if (!id || id === '#') return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -80, duration: 1.1 });
  });
})();
