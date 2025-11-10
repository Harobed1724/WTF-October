document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const loanAmountSlider = document.getElementById('loanAmount');
    const loanAmountDisplay = document.getElementById('loanAmountDisplay');
    const downPaymentInput = document.getElementById('downPayment');
    const monthlyPaymentDisplay = document.getElementById('monthlyPayment');
    const rateValueDisplay = document.getElementById('rateValue');
    const aprValueDisplay = document.getElementById('aprValue');
    const pointsValueDisplay = document.getElementById('pointsValue');
    const form = document.getElementById('loanForm');

    // Format currency function
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US').format(value);
    };
     document.querySelectorAll('input[type="range"]').forEach(range => {
    const numberInput = range.previousElementSibling.querySelector('input[type="number"]');

    // Function to update the progress bar visually
    function updateProgress() {
      const val = ((range.value - range.min) / (range.max - range.min)) * 100;
      range.style.setProperty('--range-progress', val + '%');
      numberInput.value = range.value;
    }

    // Function to update slider if user changes number
    function updateRange() {
      const value = Math.min(Math.max(numberInput.value, range.min), range.max);
      range.value = value;
      updateProgress();
    }

    // Event listeners
    range.addEventListener('input', updateProgress);
    numberInput.addEventListener('input', updateRange);

    // Initialize
    updateProgress();
  });

    // Update loan amount display when slider changes
    loanAmountSlider.addEventListener('input', function() {
        loanAmountDisplay.value = this.value;
        calculatePayment();
    });

    // Update slider when amount input changes
    loanAmountDisplay.addEventListener('input', function() {
        let value = parseInt(this.value) || 0;
        if (value < 50000) value = 50000;
        if (value > 2500000) value = 2500000;
        loanAmountSlider.value = value;
        this.value = value;
        calculatePayment();
    });

    // Update payment when down payment changes
    downPaymentInput.addEventListener('input', function() {
        calculatePayment();
        updateDownPaymentPercentage();
    });

    // Update when loan term changes
    document.querySelectorAll('input[name="loanTerm"]').forEach(radio => {
        radio.addEventListener('change', calculatePayment);
    });

    // Calculate and update down payment percentage
    function updateDownPaymentPercentage() {
        const loanAmount = parseInt(loanAmountSlider.value);
        const downPayment = parseInt(downPaymentInput.value) || 0;
        const percentage = ((downPayment / loanAmount) * 100).toFixed(1);
        document.querySelector('.hint').textContent = `${percentage}% of purchase price`;
    }

    // Calculate monthly payment
    function calculatePayment() {
        const loanAmount = parseInt(loanAmountSlider.value);
        const downPayment = parseInt(downPaymentInput.value) || 0;
        const principal = loanAmount - downPayment;
        
        // Ensure principal is not negative
        if (principal < 0) {
            monthlyPaymentDisplay.textContent = '0';
            return;
        }
        
        // Get selected term
        let termYears = 30; // default
        document.querySelectorAll('input[name="loanTerm"]').forEach(radio => {
            if (radio.checked) {
                if (radio.value === "5/1") {
                    termYears = 30;
                } else {
                    termYears = parseInt(radio.value);
                }
            }
        });

        // Fixed rates
        const rate = 0.0525;
        const apr = 0.04418;
        const points = 0.00325;

        // Calculate monthly payment
        const monthlyRate = rate / 12;
        const numberOfPayments = termYears * 12;
        
        const monthlyPayment = principal * 
            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        // Update displays
        monthlyPaymentDisplay.textContent = formatCurrency(Math.round(monthlyPayment));
        rateValueDisplay.textContent = (rate * 100).toFixed(3) + '%';
        aprValueDisplay.textContent = (apr * 100).toFixed(3) + '%';
        pointsValueDisplay.textContent = (points * 100).toFixed(3);
        
        updateDownPaymentPercentage();
    }

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Application submitted!');
    });

    // Initialize calculations
    calculatePayment();
});