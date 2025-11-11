document.addEventListener('DOMContentLoaded', function () {
  // Input elements
  const purchasePriceInput = document.getElementById('purchasePrice');
  const purchasePriceRange = document.getElementById('purchasePriceRange');
  const downPaymentInput = document.getElementById('downPayment');
  const downPaymentRange = document.getElementById('downPaymentRange');
  const periodRadios = document.querySelectorAll('input[name="period"]');
  const zipInput = document.getElementById('zip');

  // Output elements in the result card
  const paymentDisplay = document.querySelector('.payment span');
  const rateDisplay = document.querySelector('.info div:nth-child(1) span:last-child');
  const aprDisplay = document.querySelector('.info div:nth-child(2) span:last-child');
  const pointsDisplay = document.querySelector('.info div:nth-child(3) span:last-child');
  const hintDisplay = document.querySelector('.hint');

  // Format currency helper
  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(value);
  }

  // Update range fill
  function updateRangeFill(range) {
    const val = ((range.value - range.min) / (range.max - range.min)) * 100;
    range.style.setProperty('--range-progress', val + '%');
  }

  // Sync number and range
  function syncInputs(numberInput, rangeInput) {
    numberInput.addEventListener('input', () => {
      const val = Math.min(Math.max(numberInput.value, rangeInput.min), rangeInput.max);
      rangeInput.value = val;
      updateRangeFill(rangeInput);
      calculateResults();
    });

    rangeInput.addEventListener('input', () => {
      numberInput.value = rangeInput.value;
      updateRangeFill(rangeInput);
      calculateResults();
    });
  }

  // Update down payment hint
  function updateHint() {
    const purchasePrice = parseFloat(purchasePriceInput.value) || 0;
    const downPayment = parseFloat(downPaymentInput.value) || 0;
    if (purchasePrice === 0) {
      hintDisplay.textContent = 'Enter a valid purchase price';
      return;
    }
    const percent = ((downPayment / purchasePrice) * 100).toFixed(1);
    hintDisplay.textContent = `${percent}% of purchase price`;
  }

  // Calculate results
  function calculateResults() {
    const purchasePrice = parseFloat(purchasePriceInput.value) || 0;
    const downPayment = parseFloat(downPaymentInput.value) || 0;
    const principal = purchasePrice - downPayment;

    // Determine selected loan term
    let termYears = 30;
    periodRadios.forEach((r) => {
      if (r.checked && r.nextSibling.textContent.includes('15')) termYears = 15;
      if (r.checked && r.nextSibling.textContent.includes('5/1')) termYears = 5; // treat 5/1 as 5 years
    });

    // Example fixed rates (could be made dynamic later)
    const rate = termYears === 15 ? 0.045 : 0.0525;
    const apr = rate - 0.008;
    const points = 0.325;

    // Compute monthly payment
    const monthlyRate = rate / 12;
    const totalPayments = termYears * 12;

    let monthlyPayment = 0;
    if (principal > 0) {
      monthlyPayment =
        principal *
        (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
    }

    // Update UI
    paymentDisplay.textContent = formatCurrency(Math.round(monthlyPayment));
    rateDisplay.textContent = (rate * 100).toFixed(3) + '%';
    aprDisplay.textContent = (apr * 100).toFixed(3) + '%';
    pointsDisplay.textContent = points.toFixed(3);
    updateHint();
  }

  // Initialize
  updateRangeFill(purchasePriceRange);
  updateRangeFill(downPaymentRange);
  syncInputs(purchasePriceInput, purchasePriceRange);
  syncInputs(downPaymentInput, downPaymentRange);

  // Add listeners for period and zip
  periodRadios.forEach((r) => r.addEventListener('change', calculateResults));
  zipInput.addEventListener('input', () => {
    // Could trigger rate adjustments based on zip later
    console.log('ZIP updated:', zipInput.value);
  });

  // Initial calculation
  calculateResults();
});
