document.addEventListener('DOMContentLoaded', function() {
  // --- Sidebar Drawer ---
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarClose = document.getElementById('sidebarClose');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      if (sidebar.classList.contains('open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (sidebarClose) {
    sidebarClose.addEventListener('click', closeSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });

  // Close sidebar when clicking a link (mobile)
  sidebar.querySelectorAll('.sidebar-link').forEach(function(link) {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 1024) {
        closeSidebar();
      }
    });
  });

  // --- Tabs ---
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var target = this.getAttribute('data-tab');
      var tabGroup = this.closest('.tabs').parentElement;

      tabGroup.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
      tabGroup.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });

      this.classList.add('active');
      var targetEl = document.getElementById(target);
      if (targetEl) targetEl.classList.add('active');
    });
  });

  // --- Flash Messages ---
  document.querySelectorAll('.flash-close').forEach(function(btn) {
    btn.addEventListener('click', function() {
      this.closest('.flash').remove();
    });
  });

  document.querySelectorAll('.flash').forEach(function(flash) {
    setTimeout(function() {
      flash.style.opacity = '0';
      flash.style.transform = 'translateY(-10px)';
      setTimeout(function() { flash.remove(); }, 300);
    }, 5000);
  });

  // --- Delete Confirmations ---
  document.querySelectorAll('form[data-confirm]').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      if (!confirm(this.getAttribute('data-confirm'))) {
        e.preventDefault();
      }
    });
  });

  // --- Invoice Calculator ---
  var invoiceForm = document.getElementById('invoiceForm');
  if (invoiceForm) {
    var amountInput = invoiceForm.querySelector('#amount');
    var discountInput = invoiceForm.querySelector('#discount');
    var taxRateInput = invoiceForm.querySelector('#tax_rate');
    var totalDisplay = invoiceForm.querySelector('#totalDisplay');

    function calculateTotal() {
      var amount = parseFloat(amountInput ? amountInput.value : 0) || 0;
      var discount = parseFloat(discountInput ? discountInput.value : 0) || 0;
      var taxRate = parseFloat(taxRateInput ? taxRateInput.value : 0) || 0;
      var subtotal = amount - discount;
      var tax = subtotal * (taxRate / 100);
      var total = subtotal + tax;
      if (totalDisplay) {
        totalDisplay.textContent = '\u09F3 ' + total.toLocaleString('en-US', { minimumFractionDigits: 2 });
      }
    }

    [amountInput, discountInput, taxRateInput].forEach(function(input) {
      if (input) input.addEventListener('input', calculateTotal);
    });
  }
});
