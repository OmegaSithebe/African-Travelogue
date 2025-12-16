function loadPaymentModal() {
    // Check if modal already exists
    if (document.getElementById('simple-payment-modal')) {
        return;
    }
    
    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/payment-modal.css';
    document.head.appendChild(link);
    
    // Load Font Awesome
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(faLink);
    }
    
    // Load modal HTML via fetch
    fetch('payment-modal.html')
        .then(response => response.text())
        .then(html => {
            document.body.insertAdjacentHTML('beforeend', html);
            initializeModal();
        })
        .catch(error => {
            console.error('Error loading modal:', error);
            // Create basic modal as fallback
            createBasicModal();
        });
}

function createBasicModal() {
    const modalHTML = `
        <div id="simple-payment-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 99999;">
            <div style="background: white; width: 500px; margin: 50px auto; padding: 20px; border-radius: 10px;">
                <h2>Payment Modal</h2>
                <p>This is a basic payment modal.</p>
                <button onclick="document.getElementById('simple-payment-modal').style.display='none'">
                    Close
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function initializeModal() {
    // Your modal initialization code here
}

// Global function
window.openPaymentModal = function(destination, program, amount) {
    loadPaymentModal();
    // Show modal logic here
};