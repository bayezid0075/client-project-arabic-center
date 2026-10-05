document.addEventListener('DOMContentLoaded', function() {
  // --- Sidebar Drawer ---
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarClose = document.getElementById('sidebarClose');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  function openSidebar() {
    if (!sidebar || !sidebarOverlay) return;
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'true');
  }

  function closeSidebar() {
    if (!sidebar || !sidebarOverlay) return;
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
    if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'false');
  }

  if (sidebarToggle && sidebar) {
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
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });

  // Close sidebar when clicking a link (mobile)
  if (sidebar) {
    sidebar.querySelectorAll('.sidebar-link').forEach(function(link) {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 1024) {
          closeSidebar();
        }
      });
    });
  }

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

  // --- Invoice Calculator & Course Price Billing ---
  var invoiceForm = document.getElementById('invoiceForm');
  if (invoiceForm) {
    var amountInput = invoiceForm.querySelector('#amount');
    var discountInput = invoiceForm.querySelector('#discount');
    var taxRateInput = invoiceForm.querySelector('#tax_rate');
    var totalDisplay = invoiceForm.querySelector('#totalDisplay');
    var studentSelect = invoiceForm.querySelector('#studentSelect');
    var courseSelect = invoiceForm.querySelector('#course_id');
    var billingPanel = invoiceForm.querySelector('#billingPanel');
    var billingFee = invoiceForm.querySelector('#billingFee');
    var billingInvoiced = invoiceForm.querySelector('#billingInvoiced');
    var billingDue = invoiceForm.querySelector('#billingDue');
    var billingHint = invoiceForm.querySelector('#billingHint');
    var billingWarning = invoiceForm.querySelector('#billingWarning');
    var amountHint = invoiceForm.querySelector('#amountHint');

    var availableBalance = null;
    var studentChanged = false;

    function money(value) {
      return '\u09F3 ' + (Number(value) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function computeTotal() {
      var amount = parseFloat(amountInput ? amountInput.value : 0) || 0;
      var discount = parseFloat(discountInput ? discountInput.value : 0) || 0;
      var taxRate = parseFloat(taxRateInput ? taxRateInput.value : 0) || 0;
      var subtotal = amount - discount;
      return subtotal + subtotal * (taxRate / 100);
    }

    function calculateTotal() {
      var total = computeTotal();
      if (totalDisplay) totalDisplay.textContent = money(total);

      if (billingWarning) {
        if (availableBalance !== null && total > availableBalance + 0.009) {
          billingWarning.style.display = 'block';
          billingWarning.textContent = 'Total exceeds the remaining course price of ' + money(availableBalance) + '.';
        } else {
          billingWarning.style.display = 'none';
          billingWarning.textContent = '';
        }
      }
    }

    function refreshBilling() {
      if (!studentSelect || !billingPanel) return;

      var option = studentSelect.options[studentSelect.selectedIndex];
      if (!option || !option.value) {
        billingPanel.style.display = 'none';
        availableBalance = null;
        if (amountHint) amountHint.textContent = '';
        if (amountInput) amountInput.removeAttribute('max');
        calculateTotal();
        return;
      }

      var fee = parseFloat(option.getAttribute('data-fee')) || 0;
      var invoiced = parseFloat(option.getAttribute('data-invoiced')) || 0;
      var due = parseFloat(option.getAttribute('data-due')) || 0;
      var courseId = option.getAttribute('data-course-id') || '';

      billingPanel.style.display = '';
      if (billingFee) billingFee.textContent = money(fee);
      if (billingInvoiced) billingInvoiced.textContent = money(invoiced);
      if (billingDue) billingDue.textContent = money(due);

      if (fee > 0) {
        availableBalance = due;

        if (billingHint) {
          billingHint.textContent = due > 0
            ? 'Up to ' + money(due) + ' of the course price is still open to invoice.'
            : 'The course price is fully invoiced. No further invoice can be created for this student.';
        }
        if (amountHint) {
          amountHint.textContent = due > 0 ? 'Maximum invoice amount: ' + money(due) : 'No course price left to invoice.';
        }
        if (amountInput) {
          if (due > 0) amountInput.setAttribute('max', due.toFixed(2));
          else amountInput.removeAttribute('max');
        }

        if (studentChanged && courseSelect && courseId && courseSelect.querySelector('option[value="' + courseId + '"]')) {
          courseSelect.value = courseId;
        }
        if (studentChanged && amountInput) {
          amountInput.value = due > 0 ? due.toFixed(2) : '';
        }
      } else {
        availableBalance = null;
        if (billingHint) billingHint.textContent = 'No course fee set for this student, so the billing limit does not apply.';
        if (amountHint) amountHint.textContent = '';
        if (amountInput) amountInput.removeAttribute('max');
      }

      calculateTotal();
    }

    [amountInput, discountInput, taxRateInput].forEach(function(input) {
      if (input) input.addEventListener('input', calculateTotal);
    });

    if (studentSelect) {
      studentSelect.addEventListener('change', function() {
        studentChanged = true;
        refreshBilling();
      });
      refreshBilling();
    }

    invoiceForm.addEventListener('submit', function(e) {
      if (availableBalance !== null && computeTotal() > availableBalance + 0.009) {
        e.preventDefault();
        alert('Invoice total exceeds the remaining course price of ' + money(availableBalance) + '.');
      }
    });

    calculateTotal();
  }
});
