document.addEventListener('DOMContentLoaded', function() {
  // Mobile nav toggle (hamburger)
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');

  function openNav() {
    if (!mainNav || !navToggle) return;
    mainNav.classList.add('open');
    navToggle.classList.add('active');
    navToggle.setAttribute('aria-expanded', 'true');
  }

  function closeNav() {
    if (!mainNav || !navToggle) return;
    mainNav.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      if (mainNav.classList.contains('open')) {
        closeNav();
      } else {
        openNav();
      }
    });

    // Close when clicking outside the menu (ignore the toggle button itself)
    document.addEventListener('click', function(e) {
      if (!mainNav.classList.contains('open')) return;
      if (mainNav.contains(e.target) || navToggle.contains(e.target)) return;
      closeNav();
    });

    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeNav();
    });

    // Reset when switching to desktop layout
    window.addEventListener('resize', function() {
      if (window.innerWidth >= 1024) closeNav();
    });

    // Close nav when clicking a link
    mainNav.querySelectorAll('.nav-link').forEach(function(link) {
      link.addEventListener('click', closeNav);
    });
  }

  // Flash message close
  document.querySelectorAll('.flash-close').forEach(function(btn) {
    btn.addEventListener('click', function() {
      this.closest('.flash').remove();
    });
  });

  // Auto-dismiss flash messages
  document.querySelectorAll('.flash').forEach(function(flash) {
    setTimeout(function() {
      flash.style.opacity = '0';
      flash.style.transform = 'translateY(-10px)';
      setTimeout(function() { flash.remove(); }, 300);
    }, 5000);
  });
});
