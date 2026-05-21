document.addEventListener('DOMContentLoaded', () => {
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
