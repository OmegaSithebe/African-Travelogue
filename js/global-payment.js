// Global Payment Modal System with USD Support
(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        INFO_EMAIL: 'info@africantravelogue.co.za',
        ADMIN_EMAIL: 'admin@africantravelogue.co.za',
        PAYPAL_CLIENT_ID: 'Ac5iEGcRiTcBA4wV2EhlEA_bhkqZq6Ki80EPjgonnQWDKoJzpk525BM057vIYI_8zOlPHx-qd9rSUGBm',
        EXCHANGE_RATE: 18.50 // ZAR to USD
    };
    
    // Modal HTML template
    const MODAL_HTML = `
        <div id="global-payment-modal" class="payment-modal-overlay" style="display: none;">
            <div class="payment-modal-content">
                <div class="payment-modal-header">
                    <div class="header-content">
                        <div class="header-icon">
                            <i class="fas fa-globe-africa"></i>
                        </div>
                        <div class="header-text">
                            <h3 id="modal-title">Secure Payment</h3>
                            <p id="modal-subtitle">Complete your booking</p>
                        </div>
                    </div>
                    <button class="payment-modal-close" id="modal-close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="payment-modal-body">
                    <div id="payment-form">
                        <div class="form-section">
                            <h4 class="form-section-title">
                                <i class="fas fa-user-circle"></i> Booking Details
                            </h4>
                            
                            <div class="form-group">
                                <label>
                                    <i class="fas fa-map-marker-alt"></i> Destination
                                </label>
                                <input type="text" id="modal-destination" class="form-control" readonly>
                            </div>
                            
                            <div class="form-group">
                                <label>
                                    <i class="fas fa-list-alt"></i> Program
                                </label>
                                <input type="text" id="modal-program" class="form-control" readonly>
                            </div>
                            
                            <div class="currency-conversion-card">
                                <div class="conversion-header">
                                    <i class="fas fa-exchange-alt"></i>
                                    <h5>Currency Conversion</h5>
                                </div>
                                <div class="conversion-body">
                                    <div class="conversion-row">
                                        <span class="conversion-label">ZAR Amount:</span>
                                        <span class="conversion-value zar-amount" id="conversion-zar">R 0.00</span>
                                    </div>
                                    <div class="conversion-rate">
                                        <i class="fas fa-arrow-right"></i>
                                        <span>1 USD = R ${CONFIG.EXCHANGE_RATE.toFixed(2)}</span>
                                        <i class="fas fa-arrow-left"></i>
                                    </div>
                                    <div class="conversion-row">
                                        <span class="conversion-label">USD Amount:</span>
                                        <span class="conversion-value usd-amount" id="conversion-usd">$0.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h4 class="form-section-title">
                                <i class="fas fa-user-circle"></i> Your Information
                            </h4>
                            
                            <div class="form-group">
                                <label>
                                    <i class="fas fa-user"></i> Full Name *
                                </label>
                                <input type="text" id="customer-name" class="form-control" placeholder="Enter your full name" required>
                                <div class="form-error" id="name-error"></div>
                            </div>
                            
                            <div class="form-group">
                                <label>
                                    <i class="fas fa-envelope"></i> Email Address *
                                </label>
                                <input type="email" id="customer-email" class="form-control" placeholder="your.email@example.com" required>
                                <div class="form-error" id="email-error"></div>
                            </div>
                            
                            <div class="form-group">
                                <label>
                                    <i class="fas fa-phone"></i> Phone Number *
                                </label>
                                <input type="tel" id="customer-phone" class="form-control" placeholder="+27123456789" required>
                                <small class="help-text">International format: +[country code][number]</small>
                                <div class="form-error" id="phone-error"></div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h4 class="form-section-title">
                                <i class="fas fa-credit-card"></i> Payment Method
                            </h4>
                            
                            <div class="payment-options">
                                <div class="payment-option paypal-option selected" id="paypal-option">
                                    <div class="option-icon">
                                        <i class="fab fa-paypal"></i>
                                    </div>
                                    <div class="option-content">
                                        <h5>PayPal</h5>
                                        <p>Fast & secure payment in USD</p>
                                    </div>
                                    <div class="option-select">
                                        <div class="custom-radio selected"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div id="paypal-button-container" style="margin-top: 20px;"></div>
                        </div>
                        
                        <div class="form-footer">
                            <div class="security-badge">
                                <i class="fas fa-shield-alt"></i>
                                <span>256-bit SSL Encryption</span>
                            </div>
                            
                            <p class="support-info">
                                <i class="fas fa-question-circle"></i>
                                Need help? Email us at <a href="mailto:${CONFIG.INFO_EMAIL}">${CONFIG.INFO_EMAIL}</a>
                            </p>
                        </div>
                    </div>
                    
                    <div id="payment-loading" style="display: none; text-align: center; padding: 40px;">
                        <div class="spinner"></div>
                        <h4>Processing Payment</h4>
                        <p>Please wait while we secure your booking...</p>
                    </div>
                    
                    <div id="payment-success" style="display: none; text-align: center; padding: 40px;">
                        <div style="font-size: 60px; color: #27ae60; margin-bottom: 20px;">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h4>Payment Successful! 🎉</h4>
                        <p id="success-message">Your booking has been confirmed.</p>
                        <button id="success-close-btn" class="btn-close-modal" style="margin-top: 20px;">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                    
                    <div id="payment-error" style="display: none; text-align: center; padding: 40px;">
                        <div style="font-size: 60px; color: #e74c3c; margin-bottom: 20px;">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h4>Payment Failed</h4>
                        <p id="error-message">An error occurred during payment.</p>
                        <button id="error-retry-btn" class="btn-retry" style="margin-top: 20px;">
                            <i class="fas fa-redo"></i> Try Again
                        </button>
                    </div>
                </div>
                
                <div class="payment-modal-footer">
                    <p class="copyright">
                        © ${new Date().getFullYear()} African Travelogue
                    </p>
                </div>
            </div>
        </div>
    `;
    
    // Global variables
    let paymentModal = null;
    let currentBookingData = {};
    
    // Initialize the modal
    function initModal() {
        if (document.getElementById('global-payment-modal')) {
            return;
        }
        
        // Add modal HTML to body
        document.body.insertAdjacentHTML('beforeend', MODAL_HTML);
        paymentModal = document.getElementById('global-payment-modal');
        
        // Initialize events
        initEvents();
        
        // Load PayPal SDK with USD currency
        loadPayPalSDK();
        
        console.log('Global Payment Modal initialized successfully');
    }
    
    // Initialize event listeners
    function initEvents() {
        // Close buttons
        document.getElementById('modal-close-btn').addEventListener('click', closeModal);
        document.getElementById('success-close-btn')?.addEventListener('click', closeModal);
        document.getElementById('error-retry-btn')?.addEventListener('click', showForm);
        
        // Close on overlay click
        paymentModal.addEventListener('click', function(e) {
            if (e.target === paymentModal) {
                closeModal();
            }
        });
        
        // Escape key to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && paymentModal.style.display === 'flex') {
                closeModal();
            }
        });
    }
    
    // Load PayPal SDK with USD currency
    function loadPayPalSDK() {
        if (typeof paypal !== 'undefined') {
            renderPayPalButtons();
            return;
        }
        
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${CONFIG.PAYPAL_CLIENT_ID}&currency=USD`;
        script.async = true;
        script.onload = renderPayPalButtons;
        script.onerror = function() {
            console.error('Failed to load PayPal SDK');
            showError('Payment system unavailable. Please contact us directly.');
        };
        document.head.appendChild(script);
    }
    
    // Convert ZAR to USD
    function convertZARtoUSD(zarAmount) {
        return (parseFloat(zarAmount) / CONFIG.EXCHANGE_RATE).toFixed(2);
    }
    
    // Update currency conversion display
    function updateConversion(zarAmount) {
        const zarAmountEl = document.getElementById('conversion-zar');
        const usdAmountEl = document.getElementById('conversion-usd');
        
        if (zarAmountEl && usdAmountEl) {
            zarAmountEl.textContent = `R ${parseFloat(zarAmount).toFixed(2)}`;
            usdAmountEl.textContent = `$${convertZARtoUSD(zarAmount)}`;
        }
    }
    
    // Render PayPal buttons
    function renderPayPalButtons() {
        const container = document.getElementById('paypal-button-container');
        if (!container || typeof paypal === 'undefined') return;
        
        container.innerHTML = '';
        
        paypal.Buttons({
            style: {
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'paypal',
                height: 48
            },
            createOrder: function(data, actions) {
                if (!validateForm()) {
                    throw new Error('Please fill in all required fields');
                }
                
                const zarAmount = currentBookingData.amount || '0';
                const usdAmount = convertZARtoUSD(zarAmount);
                
                return actions.order.create({
                    purchase_units: [{
                        description: `Booking for ${currentBookingData.destination} - ${currentBookingData.program}`,
                        amount: {
                            value: usdAmount,
                            currency_code: 'USD'
                        }
                    }],
                    application_context: {
                        shipping_preference: 'NO_SHIPPING'
                    }
                });
            },
            onApprove: async function(data, actions) {
                try {
                    showLoading();
                    
                    const orderData = await actions.order.capture();
                    const usdAmount = orderData.purchase_units[0].payments.captures[0].amount.value;
                    const zarAmount = currentBookingData.amount;
                    
                    // Prepare booking data
                    const bookingData = {
                        full_name: document.getElementById('customer-name').value,
                        email: document.getElementById('customer-email').value,
                        cellphone: document.getElementById('customer-phone').value,
                        amount: zarAmount,
                        currency: 'USD',
                        destination: currentBookingData.destination,
                        program: currentBookingData.program,
                        payment_method: 'paypal',
                        transaction_id: orderData.id,
                        status: 'completed'
                    };
                    
                    // Send to backend
                    const response = await fetch('backend/process-payment.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(bookingData)
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        showSuccess(`
                            Thank you for booking ${currentBookingData.destination}!<br>
                            Booking Reference: <strong>#${result.booking_id}</strong><br>
                            Amount Paid: $${usdAmount} USD (R ${zarAmount} ZAR)<br>
                            Transaction ID: ${orderData.id}<br>
                            We've sent a confirmation email to ${document.getElementById('customer-email').value}
                        `);
                    } else {
                        throw new Error(result.message || 'Payment processing failed');
                    }
                } catch (error) {
                    console.error('Payment error:', error);
                    showError('Payment failed: ' + error.message);
                }
            },
            onError: function(err) {
                console.error('PayPal error:', err);
                showError('Payment failed. Please try again or contact support.');
            },
            onCancel: function() {
                showError('Payment was cancelled. You can try again anytime.');
            }
        }).render('#paypal-button-container');
    }
    
    // Form validation
    function validateForm() {
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('.form-error').forEach(el => {
            el.textContent = '';
        });
        
        // Validate name
        const name = document.getElementById('customer-name').value.trim();
        if (!name) {
            document.getElementById('name-error').textContent = 'Please enter your full name';
            isValid = false;
        }
        
        // Validate email
        const email = document.getElementById('customer-email').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            document.getElementById('email-error').textContent = 'Please enter your email address';
            isValid = false;
        } else if (!emailRegex.test(email)) {
            document.getElementById('email-error').textContent = 'Please enter a valid email address';
            isValid = false;
        }
        
        // Validate phone
        const phone = document.getElementById('customer-phone').value.trim();
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phone) {
            document.getElementById('phone-error').textContent = 'Please enter your phone number';
            isValid = false;
        } else if (!phoneRegex.test(phone)) {
            document.getElementById('phone-error').textContent = 'Please enter a valid international phone number';
            isValid = false;
        }
        
        return isValid;
    }
    
    // Show loading state
    function showLoading() {
        document.getElementById('payment-form').style.display = 'none';
        document.getElementById('payment-success').style.display = 'none';
        document.getElementById('payment-error').style.display = 'none';
        document.getElementById('payment-loading').style.display = 'block';
    }
    
    // Show form state
    function showForm() {
        document.getElementById('payment-loading').style.display = 'none';
        document.getElementById('payment-success').style.display = 'none';
        document.getElementById('payment-error').style.display = 'none';
        document.getElementById('payment-form').style.display = 'block';
    }
    
    // Show success state
    function showSuccess(message) {
        document.getElementById('payment-loading').style.display = 'none';
        document.getElementById('payment-form').style.display = 'none';
        document.getElementById('payment-error').style.display = 'none';
        
        const successEl = document.getElementById('payment-success');
        document.getElementById('success-message').innerHTML = message;
        successEl.style.display = 'block';
    }
    
    // Show error state
    function showError(message) {
        document.getElementById('payment-loading').style.display = 'none';
        document.getElementById('payment-form').style.display = 'none';
        document.getElementById('payment-success').style.display = 'none';
        
        const errorEl = document.getElementById('payment-error');
        document.getElementById('error-message').textContent = message;
        errorEl.style.display = 'block';
    }
    
    // Open modal function
    function openModal(destination, program, amount) {
        console.log('Opening modal for:', destination, program, amount);
        
        // Initialize modal if not already done
        if (!paymentModal) {
            initModal();
        }
        
        // Store booking data
        currentBookingData = {
            destination: destination,
            program: program,
            amount: amount
        };
        
        // Update modal content
        document.getElementById('modal-title').textContent = `Book ${destination}`;
        document.getElementById('modal-subtitle').textContent = program;
        document.getElementById('modal-destination').value = destination;
        document.getElementById('modal-program').value = program;
        
        // Update currency conversion
        updateConversion(amount);
        
        // Reset form
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-email').value = '';
        document.getElementById('customer-phone').value = '';
        
        // Show form
        showForm();
        
        // Show modal
        paymentModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Re-render PayPal buttons
        setTimeout(renderPayPalButtons, 300);
    }
    
    // Close modal function
    function closeModal() {
        if (paymentModal) {
            paymentModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize modal
        initModal();
        
        // Make openModal function globally accessible
        window.openGlobalPaymentModal = openModal;
        
        console.log('Global Payment Modal system ready');
    });
    
})();