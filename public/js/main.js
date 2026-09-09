document.addEventListener('DOMContentLoaded', function() {
  // Mobile nav toggle
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function() {
      mainNav.classList.toggle('open');
    });

    // Close nav when clicking outside
    document.addEventListener('click', function(e) {
      if (mainNav.classList.contains('open') && !mainNav.contains(e.target) && e.target !== navToggle) {
        mainNav.classList.remove('open');
      }
    });

    // Close nav when clicking a link
    mainNav.querySelectorAll('.nav-link').forEach(function(link) {
      link.addEventListener('click', function() {
        mainNav.classList.remove('open');
      });
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
