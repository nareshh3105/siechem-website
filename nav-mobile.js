/**
 * FILE: nav-mobile.js
 *
 * PURPOSE:
 *   Handles the hamburger menu for mobile navigation across every page on the site.
 *   Toggles the `.open` class on `#mobile-menu` and `.active` on `#nav-hamburger`
 *   when the user taps the three-line icon. Also locks body scroll while the
 *   menu is open (via `nav-open` on <html>) so the background page doesn't scroll
 *   underneath the overlay. Auto-closes the menu when any link inside it is tapped.
 *
 * WHY THIS FILE EXISTS:
 *   Every HTML page in the site is a standalone static file (no SPA router), so
 *   each page loads its own nav. Rather than duplicating the JS logic inline in 29
 *   different <script> blocks, this single file is loaded via `<script src="nav-mobile.js" defer>`
 *   in every page's <body>. `defer` ensures the DOM is ready before the script runs,
 *   which is why there's no need for an explicit DOMContentLoaded guard, but one is
 *   kept for safety against browsers that handle defer differently.
 *
 * HOW IT WORKS:
 *   1. Finds the hamburger button (#nav-hamburger) and the overlay (#mobile-menu).
 *   2. On click: toggles `.active` on the button (animates the 3 lines into an X)
 *      and `.open` on the menu (slides the overlay in via CSS transition).
 *   3. Adds/removes `nav-open` on <html> to freeze background scroll (overflow:hidden
 *      is set in theme.css for html.nav-open).
 *   4. Loops through all <a> tags inside the menu and attaches a click handler that
 *      resets all three states — so navigating to another page closes the overlay first.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Guard: several pages accidentally include this script more than once.
  // A second listener would toggle the menu open and immediately closed
  // again on every tap, making the hamburger appear dead — initialise once.
  if (window.__navMobileInit) return;
  window.__navMobileInit = true;

  const hamburger = document.getElementById('nav-hamburger');
  const menu = document.getElementById('mobile-menu');

  if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      menu.classList.toggle('open');
      
      // Toggle body scroll locking
      if (menu.classList.contains('open')) {
        document.documentElement.classList.add('nav-open');
      } else {
        document.documentElement.classList.remove('nav-open');
      }
    });

    // Auto-close menu when clicking on a link
    const menuLinks = menu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        menu.classList.remove('open');
        document.documentElement.classList.remove('nav-open');
      });
    });
  }
});
