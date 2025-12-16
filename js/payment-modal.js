// Global Payment Modal System
const INFO_EMAIL = 'info@africantravelogue.co.za';

class PaymentModal {
    constructor() {
        this.modal = null;
        this.exchangeRate = 18.50;
        this.currentDestination = '';
        this.currentProgram = '';
        this.isInitialized = false;
        this.paypalButtons = null;
    }

    initialize() {
        if (this.isInitialized) return;
        
        console.log('Initializing Payment Modal...');
        
        // Create modal HTML
        this.createModalHTML();
        
        // Initialize events
        this.initializeEvents();
        
        // Initialize PayPal
        this.initializePayPal();
        
        this.isInitialized = true;
        console.log('Payment Modal initialized successfully');
    }

    createModalHTML() {
        const modalHTML = `
            <div id="payment-modal" class="payment-modal-overlay" style="display: none;">
                <div class="payment-modal-content">
                    <div class="payment-modal-header">
                        <div class="header-content">
                            <div class="header-icon">
                                <i class="fas fa-globe-africa"></i>
                            </div>
                            <div class="header-text">
                                <h3><span id="modal-destination">Secure Payment</span></h3>
                                <p id="modal-subtitle">Complete your booking securely</p>
                            </div>
                        </div>
                        <button class="payment-modal-close" aria-label="Close modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="payment-modal-body">
                        <!-- Loading State -->
                        <div id="payment-loading" class="payment-loading" style="display: none;">
                            <div class="loading-spinner">
                                <div class="spinner"></div>
                            </div>
                            <h4>Processing Your Payment</h4>
                            <p>Please wait while we secure your booking...</p>
                            <div class="loading-progress">
                                <div class="progress-bar"></div>
                            </div>
                        </div>
                        
                        <!-- Form State -->
                        <div id="payment-form-container">
                            <form id="global-payment-form" novalidate>
                                <input type="hidden" id="payment-destination" name="destination">
                                <input type="hidden" id="payment-program" name="program">
                                
                                <div class="form-section">
                                    <h4 class="form-section-title">
                                        <i class="fas fa-user-circle"></i> Personal Details
                                    </h4>
                                    
                                    <div class="form-group">
                                        <label for="payment-full-name">
                                            <i class="fas fa-user"></i> Full Name *
                                        </label>
                                        <input type="text" id="payment-full-name" name="full_name" 
                                               placeholder="Enter your full name" required>
                                        <div class="form-error" id="name-error"></div>
                                    </div>
                                    
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="payment-email">
                                                <i class="fas fa-envelope"></i> Email Address *
                                            </label>
                                            <input type="email" id="payment-email" name="email" 
                                                   placeholder="your.email@example.com" required>
                                            <div class="form-error" id="email-error"></div>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="payment-cellphone">
                                                <i class="fas fa-phone"></i> Phone Number *
                                            </label>
                                            <input type="tel" id="payment-cellphone" name="cellphone" 
                                                   placeholder="+27123456789" required>
                                            <small class="help-text">International format: +[country code][number]</small>
                                            <div class="form-error" id="phone-error"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-section">
                                    <h4 class="form-section-title">
                                        <i class="fas fa-money-bill-wave"></i> Payment Details
                                    </h4>
                                    
                                    <div class="form-group">
                                        <label for="payment-amount">
                                            <i class="fas fa-tag"></i> Amount *
                                        </label>
                                        <div class="amount-input-group">
                                            <span class="currency-symbol">R</span>
                                            <input type="number" id="payment-amount" name="amount" 
                                                   step="0.01" min="50" placeholder="0.00" required>
                                        </div>
                                        <div class="form-error" id="amount-error"></div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="payment-currency">
                                            <i class="fas fa-globe"></i> Currency
                                        </label>
                                        <select id="payment-currency" name="currency" class="currency-select">
                                            <option value="ZAR">🇿🇦 South African Rand (ZAR)</option>
                                            <option value="USD">🇺🇸 US Dollar (USD)</option>
                                            <option value="EUR">🇪🇺 Euro (EUR)</option>
                                            <option value="GBP">🇬🇧 British Pound (GBP)</option>
                                        </select>
                                    </div>
                                    
                                    <div class="currency-conversion-card">
                                        <div class="conversion-header">
                                            <i class="fas fa-exchange-alt"></i>
                                            <h5>Currency Conversion</h5>
                                        </div>
                                        <div class="conversion-body">
                                            <div class="conversion-row">
                                                <span class="conversion-label">You Pay:</span>
                                                <span class="conversion-value zar-amount" id="conversion-zar">R 0.00</span>
                                            </div>
                                            <div class="conversion-rate">
                                                <i class="fas fa-arrow-right"></i>
                                                <span>1 USD = <span id="exchange-rate-display">${this.exchangeRate.toFixed(2)}</span> ZAR</span>
                                                <i class="fas fa-arrow-left"></i>
                                            </div>
                                            <div class="conversion-row">
                                                <span class="conversion-label">Converted to:</span>
                                                <span class="conversion-value usd-amount" id="conversion-usd">$0.00</span>
                                            </div>
                                        </div>
                                        <div class="conversion-footer">
                                            <i class="fas fa-info-circle"></i>
                                            <small>Rates may vary slightly at checkout</small>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-section">
                                    <h4 class="form-section-title">
                                        <i class="fas fa-credit-card"></i> Payment Method
                                    </h4>
                                    
                                    <div class="payment-options">
                                        <div class="payment-option paypal-option selected" data-method="paypal">
                                            <div class="option-icon">
                                                <i class="fab fa-paypal"></i>
                                            </div>
                                            <div class="option-content">
                                                <h5>PayPal</h5>
                                                <p>Fast & secure payment</p>
                                            </div>
                                            <div class="option-select">
                                                <div class="custom-radio selected"></div>
                                            </div>
                                        </div>
                                        
                                        <div class="payment-option card-option" data-method="card">
                                            <div class="option-icon">
                                                <i class="fas fa-credit-card"></i>
                                            </div>
                                            <div class="option-content">
                                                <h5>Credit/Debit Card</h5>
                                                <p>Visa, Mastercard, Amex</p>
                                            </div>
                                            <div class="option-select">
                                                <div class="custom-radio"></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <input type="hidden" id="selected-payment-method" name="payment_method" value="paypal">
                                    
                                    <!-- PayPal Button Container -->
                                    <div id="paypal-button-container" style="margin-top: 20px; display: none;"></div>
                                </div>
                                
                                <div class="form-footer">
                                    <div class="security-badge">
                                        <i class="fas fa-shield-alt"></i>
                                        <span>256-bit SSL Encryption</span>
                                    </div>
                                    
                                    <button type="button" id="process-payment-btn" class="btn-process-payment">
                                        <i class="fas fa-lock"></i>
                                        <span>Continue to Payment</span>
                                    </button>
                                    
                                    <p class="support-info">
                                        <i class="fas fa-question-circle"></i>
                                        Need help? Email us at <a href="mailto:${INFO_EMAIL}">${INFO_EMAIL}</a>
                                    </p>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Success State -->
                        <div id="payment-success" class="payment-success" style="display: none;">
                            <div class="success-animation">
                                <div class="success-icon">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <div class="success-confetti"></div>
                            </div>
                            <h4>Payment Successful! 🎉</h4>
                            <p id="success-message" class="success-text">Your booking has been confirmed.</p>
                            
                            <div class="success-details">
                                <div class="detail-item">
                                    <i class="fas fa-envelope"></i>
                                    <span>Confirmation sent to your email</span>
                                </div>
                                <div class="detail-item">
                                    <i class="fas fa-calendar-check"></i>
                                    <span>We'll contact you within 24 hours</span>
                                </div>
                            </div>
                            
                            <div class="success-actions">
                                <button class="btn-print-receipt">
                                    <i class="fas fa-print"></i> Print Receipt
                                </button>
                                <button class="btn-close-modal">
                                    <i class="fas fa-times"></i> Close
                                </button>
                            </div>
                        </div>
                        
                        <!-- Error State -->
                        <div id="payment-error" class="payment-error" style="display: none;">
                            <div class="error-icon">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <h4>Payment Failed</h4>
                            <p id="error-message" class="error-text">An error occurred during payment.</p>
                            
                            <div class="error-suggestions">
                                <p><strong>Try these solutions:</strong></p>
                                <ul>
                                    <li>Check your payment details</li>
                                    <li>Ensure sufficient funds</li>
                                    <li>Try a different payment method</li>
                                </ul>
                            </div>
                            
                            <div class="error-actions">
                                <button class="btn-retry">
                                    <i class="fas fa-redo"></i> Try Again
                                </button>
                                <button class="btn-contact-support">
                                    <i class="fas fa-headset"></i> Contact Support
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="payment-modal-footer">
                        <div class="trust-badges">
                            <div class="trust-badge">
                                <i class="fas fa-lock"></i>
                                <span>Secure</span>
                            </div>
                            <div class="trust-badge">
                                <i class="fas fa-shield-alt"></i>
                                <span>Protected</span>
                            </div>
                            <div class="trust-badge">
                                <i class="fas fa-award"></i>
                                <span>Trusted</span>
                            </div>
                        </div>
                        <p class="copyright">
                            © ${new Date().getFullYear()} African Travelogue
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('payment-modal');
    }

    initializeEvents() {
        // Close modal events
        document.querySelector('.payment-modal-close').addEventListener('click', () => this.close());
        document.querySelector('.btn-close-modal')?.addEventListener('click', () => this.close());
        document.querySelector('.btn-retry')?.addEventListener('click', () => this.showForm());
        document.querySelector('.btn-contact-support')?.addEventListener('click', () => {
            window.location.href = `mailto:${INFO_EMAIL}?subject=Payment%20Support%20Request`;
        });
        document.querySelector('.btn-print-receipt')?.addEventListener('click', () => window.print());
        
        // Currency conversion
        document.getElementById('payment-amount').addEventListener('input', () => this.updateConversion());
        document.getElementById('payment-currency').addEventListener('change', () => this.updateConversion());
        
        // Payment method selection
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.payment-option').forEach(opt => {
                    opt.classList.remove('selected');
                    opt.querySelector('.custom-radio').classList.remove('selected');
                });
                option.classList.add('selected');
                option.querySelector('.custom-radio').classList.add('selected');
                document.getElementById('selected-payment-method').value = option.dataset.method;
                
                // Show/hide PayPal button container
                const paypalContainer = document.getElementById('paypal-button-container');
                if (option.dataset.method === 'paypal') {
                    paypalContainer.style.display = 'block';
                    this.renderPayPalButtons();
                } else {
                    paypalContainer.style.display = 'none';
                    if (this.paypalButtons) {
                        this.paypalButtons.close();
                    }
                }
            });
        });
        
        // Process payment button
        document.getElementById('process-payment-btn').addEventListener('click', () => {
            const method = document.getElementById('selected-payment-method').value;
            if (method === 'paypal') {
                // PayPal button handles the payment
                return;
            } else {
                this.processCardPayment();
            }
        });
        
        // Form validation
        document.getElementById('global-payment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processPayment();
        });
        
        // Close on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                this.close();
            }
        });
    }

    initializePayPal() {
        if (typeof paypal === 'undefined') {
            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=Ac5iEGcRiTcBA4wV2EhlEA_bhkqZq6Ki80EPjgonnQWDKoJzpk525BM057vIYI_8zOlPHx-qd9rSUGBm&currency=ZAR`;
            script.async = true;
            script.onload = () => {
                console.log('PayPal SDK loaded');
                this.renderPayPalButtons();
            };
            document.head.appendChild(script);
        } else {
            this.renderPayPalButtons();
        }
    }

    renderPayPalButtons() {
        const container = document.getElementById('paypal-button-container');
        if (!container || typeof paypal === 'undefined') return;
        
        // Clear previous buttons
        container.innerHTML = '';
        
        // Render PayPal buttons
        paypal.Buttons({
            style: {
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'paypal',
                height: 55
            },
            createOrder: (data, actions) => {
                if (!this.validateForm()) {
                    throw new Error('Please fill in all required fields correctly.');
                }
                
                const amount = document.getElementById('payment-amount').value;
                const currency = document.getElementById('payment-currency').value;
                
                return actions.order.create({
                    purchase_units: [{
                        description: `Booking for ${this.currentDestination} - ${this.currentProgram}`,
                        amount: {
                            value: amount,
                            currency_code: currency
                        }
                    }],
                    application_context: {
                        shipping_preference: 'NO_SHIPPING'
                    }
                });
            },
            onApprove: async (data, actions) => {
                try {
                    this.showLoading();
                    const orderData = await actions.order.capture();
                    
                    // Save booking
                    await this.saveBooking('paypal', orderData.id);
                    
                    this.showSuccess(
                        `Thank you for booking ${this.currentDestination}!<br>` +
                        `Transaction ID: ${orderData.id}<br>` +
                        `Amount: ${orderData.purchase_units[0].payments.captures[0].amount.value} ${orderData.purchase_units[0].payments.captures[0].amount.currency_code}<br>` +
                        `We've sent a confirmation email with all the details.`
                    );
                } catch (error) {
                    console.error('PayPal error:', error);
                    this.showError('Payment failed: ' + error.message);
                }
            },
            onError: (err) => {
                console.error('PayPal error:', err);
                this.showError('PayPal payment failed. Please try another method.');
            },
            onCancel: () => {
                this.showError('Payment was cancelled. You can try again anytime.');
            }
        }).render('#paypal-button-container');
    }

    validateForm() {
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-group input, .form-group select').forEach(el => {
            el.classList.remove('error');
        });
        
        // Validate name
        const name = document.getElementById('payment-full-name').value.trim();
        if (!name) {
            document.getElementById('name-error').textContent = 'Please enter your full name';
            document.getElementById('payment-full-name').classList.add('error');
            isValid = false;
        }
        
        // Validate email
        const email = document.getElementById('payment-email').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            document.getElementById('email-error').textContent = 'Please enter your email address';
            document.getElementById('payment-email').classList.add('error');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            document.getElementById('email-error').textContent = 'Please enter a valid email address';
            document.getElementById('payment-email').classList.add('error');
            isValid = false;
        }
        
        // Validate phone
        const phone = document.getElementById('payment-cellphone').value.trim();
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phone) {
            document.getElementById('phone-error').textContent = 'Please enter your phone number';
            document.getElementById('payment-cellphone').classList.add('error');
            isValid = false;
        } else if (!phoneRegex.test(phone)) {
            document.getElementById('phone-error').textContent = 'Please enter a valid international phone number (e.g., +27123456789)';
            document.getElementById('payment-cellphone').classList.add('error');
            isValid = false;
        }
        
        // Validate amount
        const amount = parseFloat(document.getElementById('payment-amount').value);
        if (!amount || amount < 50) {
            document.getElementById('amount-error').textContent = 'Minimum amount is R 50';
            document.getElementById('payment-amount').classList.add('error');
            isValid = false;
        }
        
        return isValid;
    }

    async processCardPayment() {
        this.showLoading();
        
        try {
            // For demo purposes - in production, integrate with a payment gateway like Stripe
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Generate a mock transaction ID
            const transactionId = 'CARD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Save booking with card payment
            await this.saveBooking('card', transactionId);
            
            this.showSuccess(
                `Thank you for booking ${this.currentDestination}!<br>` +
                `Transaction ID: ${transactionId}<br>` +
                `Your card payment was successful. We've sent a confirmation email.`
            );
        } catch (error) {
            this.showError('Card payment failed. Please try another method.');
        }
    }

    async saveBooking(paymentMethod, transactionId) {
        try {
            const formData = this.getFormData();
            const bookingData = {
                ...formData,
                payment_method: paymentMethod,
                transaction_id: transactionId,
                status: 'completed',
                destination: this.currentDestination,
                program: this.currentProgram
            };

            console.log('Sending booking data:', bookingData);

            // Send to backend
            const response = await fetch('backend/process-payment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });

            const result = await response.json();
            console.log('Backend response:', result);

            if (!result.success) {
                throw new Error(result.message || 'Payment processing failed');
            }
            
            return result;
        } catch (error) {
            console.error('Error saving booking:', error);
            throw error;
        }
    }

    getFormData() {
        return {
            full_name: document.getElementById('payment-full-name').value,
            email: document.getElementById('payment-email').value,
            cellphone: document.getElementById('payment-cellphone').value,
            amount: document.getElementById('payment-amount').value,
            currency: document.getElementById('payment-currency').value
        };
    }

    updateConversion() {
        const amount = parseFloat(document.getElementById('payment-amount').value) || 0;
        const currency = document.getElementById('payment-currency').value;
        
        let zarAmount = amount;
        let usdAmount = amount / this.exchangeRate;
        
        if (currency !== 'ZAR') {
            // Convert to ZAR first
            zarAmount = amount * this.exchangeRate;
            usdAmount = amount;
        }
        
        document.getElementById('conversion-zar').textContent = `R ${zarAmount.toFixed(2)}`;
        document.getElementById('conversion-usd').textContent = `$${usdAmount.toFixed(2)}`;
        document.getElementById('exchange-rate-display').textContent = this.exchangeRate.toFixed(2);
    }

    showLoading() {
        document.getElementById('payment-form-container').style.display = 'none';
        document.getElementById('payment-success').style.display = 'none';
        document.getElementById('payment-error').style.display = 'none';
        document.getElementById('payment-loading').style.display = 'block';
    }

    showForm() {
        document.getElementById('payment-loading').style.display = 'none';
        document.getElementById('payment-success').style.display = 'none';
        document.getElementById('payment-error').style.display = 'none';
        document.getElementById('payment-form-container').style.display = 'block';
    }

    showSuccess(message) {
        document.getElementById('payment-loading').style.display = 'none';
        document.getElementById('payment-form-container').style.display = 'none';
        document.getElementById('payment-error').style.display = 'none';
        
        const successEl = document.getElementById('payment-success');
        document.getElementById('success-message').innerHTML = message;
        successEl.style.display = 'block';
    }

    showError(message) {
        document.getElementById('payment-loading').style.display = 'none';
        document.getElementById('payment-form-container').style.display = 'none';
        document.getElementById('payment-success').style.display = 'none';
        
        const errorEl = document.getElementById('payment-error');
        document.getElementById('error-message').textContent = message;
        errorEl.style.display = 'block';
    }

    open(destination, program = '', amount = '') {
        console.log('Opening payment modal for:', destination, program, amount);
        
        // Initialize if not already done
        if (!this.isInitialized) {
            this.initialize();
        }
        
        this.currentDestination = destination;
        this.currentProgram = program;
        
        // Update modal title
        document.getElementById('modal-destination').textContent = `Book ${destination}`;
        document.getElementById('modal-subtitle').textContent = program || 'Complete your booking';
        
        // Set form values
        document.getElementById('payment-destination').value = destination;
        document.getElementById('payment-program').value = program;
        
        if (amount) {
            document.getElementById('payment-amount').value = amount;
        }
        
        // Update conversion
        this.updateConversion();
        
        // Reset form and show
        this.showForm();
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Render PayPal buttons if needed
        if (document.getElementById('selected-payment-method').value === 'paypal') {
            this.renderPayPalButtons();
        }
        
        // Focus on first input
        setTimeout(() => {
            document.getElementById('payment-full-name').focus();
        }, 300);
    }

    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Reset form after closing
            setTimeout(() => {
                document.getElementById('global-payment-form').reset();
                this.showForm();
            }, 300);
        }
    }
}

// Create global instance
let paymentModalInstance = null;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    paymentModalInstance = new PaymentModal();
    
    // Initialize Font Awesome if not present
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(faLink);
    }
});

// Global function to open payment modal
window.openPaymentModal = function(destination, program = '', amount = '') {
    if (!paymentModalInstance) {
        paymentModalInstance = new PaymentModal();
    }
    
    if (paymentModalInstance) {
        paymentModalInstance.open(destination, program, amount);
    } else {
        console.error('Payment modal not initialized');
        alert('Payment system is not ready. Please refresh the page and try again.');
    }
};