<?php
session_start();

// Database configuration
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'africdcy_developers');
define('DB_PASSWORD', 'dev@AFRI2024!!'); 
define('DB_NAME', 'africdcy_database');

// Email configuration
define('ADMIN_EMAIL', 'admin@africantravelogue.co.za');
define('INFO_EMAIL', 'info@africantravelogue.co.za');
define('NOREPLY_EMAIL', 'noreply@africantravelogue.co.za');

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        echo json_encode(['success' => false, 'message' => 'No input data']);
        exit;
    }
    
    // Validate required fields
    $required = ['full_name', 'email', 'cellphone', 'amount', 'destination'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            exit;
        }
    }
    
    // Validate email
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email address']);
        exit;
    }
    
    // Validate phone number (international format)
    if (!preg_match('/^\+[1-9]\d{1,14}$/', $input['cellphone'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid phone number format']);
        exit;
    }
    
    // Create database connection
    $conn = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . mysqli_connect_error()]);
        exit;
    }
    
    // Escape input
    $full_name = mysqli_real_escape_string($conn, $input['full_name']);
    $email = mysqli_real_escape_string($conn, $input['email']);
    $cellphone = mysqli_real_escape_string($conn, $input['cellphone']);
    $amount = floatval($input['amount']);
    $currency = mysqli_real_escape_string($conn, $input['currency'] ?? 'ZAR');
    $destination = mysqli_real_escape_string($conn, $input['destination']);
    $program = mysqli_real_escape_string($conn, $input['program'] ?? '');
    $payment_method = mysqli_real_escape_string($conn, $input['payment_method'] ?? '');
    $transaction_id = mysqli_real_escape_string($conn, $input['transaction_id'] ?? '');
    $status = mysqli_real_escape_string($conn, $input['status'] ?? 'pending');
    
    // Create bookings table if not exists
    $createTableSQL = "
    CREATE TABLE IF NOT EXISTS bookings (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        cellphone VARCHAR(50) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        program VARCHAR(255),
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'ZAR',
        payment_method VARCHAR(50),
        transaction_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_destination (destination),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    
    if (!mysqli_query($conn, $createTableSQL)) {
        echo json_encode(['success' => false, 'message' => 'Failed to create table: ' . mysqli_error($conn)]);
        mysqli_close($conn);
        exit;
    }
    
    // Insert booking record
    $sql = "INSERT INTO bookings (customer_name, email, cellphone, destination, program, amount, currency, 
            payment_method, transaction_id, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = mysqli_prepare($conn, $sql);
    
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($conn)]);
        mysqli_close($conn);
        exit;
    }
    
    mysqli_stmt_bind_param($stmt, "sssssdssss", $full_name, $email, $cellphone, $destination, $program, 
                          $amount, $currency, $payment_method, $transaction_id, $status);
    
    if (mysqli_stmt_execute($stmt)) {
        $bookingId = mysqli_insert_id($conn);
        
        // Send confirmation emails
        sendConfirmationEmails($bookingId, $full_name, $email, $cellphone, $destination, 
                             $program, $amount, $currency, $payment_method, $transaction_id);
        
        echo json_encode([
            'success' => true,
            'message' => 'Payment processed successfully',
            'booking_id' => $bookingId
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to save booking: ' . mysqli_error($conn)]);
    }
    
    mysqli_stmt_close($stmt);
    mysqli_close($conn);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

function sendConfirmationEmails($bookingId, $name, $email, $phone, $destination, $program, 
                               $amount, $currency, $paymentMethod, $transactionId) {
    
    // Send to customer
    $customerSubject = "Booking Confirmation #$bookingId - African Travelogue";
    
    $customerMessage = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6f61, #e65c50); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 30px; background: #f9f9f9; }
            .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .detail { margin: 15px 0; padding: 15px; background: white; border-left: 4px solid #3498db; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .highlight { color: #e74c3c; font-weight: bold; }
            .contact-info { background: #e8f4fc; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .logo { text-align: center; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='logo'>
                <h1>African Travelogue</h1>
            </div>
            <div class='header'>
                <h2>Thank You for Your Booking!</h2>
                <p>Your Adventure Awaits</p>
            </div>
            <div class='content'>
                <h3>Hello $name,</h3>
                <p>Your booking has been confirmed. Here are your booking details:</p>
                
                <div class='detail'>
                    <strong>Booking Reference:</strong> <span class='highlight'>#$bookingId</span><br>
                    <strong>Destination:</strong> $destination<br>
                    <strong>Program:</strong> " . ($program ?: 'Not specified') . "<br>
                    <strong>Amount Paid:</strong> $currency " . number_format($amount, 2) . "<br>
                    <strong>Payment Method:</strong> $paymentMethod<br>
                    " . ($transactionId ? "<strong>Transaction ID:</strong> $transactionId<br>" : "") . "
                    <strong>Date:</strong> " . date('F j, Y \a\t g:i A') . "
                </div>
                
                <div class='contact-info'>
                    <h4>Need Assistance?</h4>
                    <p><strong>Email:</strong> " . INFO_EMAIL . "<br>
                    <strong>Phone:</strong> +27 72 069 0340<br>
                    <strong>Website:</strong> africantravelogue.co.za</p>
                </div>
                
                <p>We will contact you within 24 hours to finalize your tour details and provide you with all necessary information for your journey.</p>
                
                <p>Get ready for an unforgettable African adventure!</p>
            </div>
            <div class='footer'>
                <p>© " . date('Y') . " African Travelogue. All Rights Reserved.</p>
                <p>Creating Memorable African Experiences</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $customerHeaders = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: African Travelogue <' . INFO_EMAIL . '>',
        'Reply-To: ' . ADMIN_EMAIL,
        'X-Mailer: PHP/' . phpversion(),
        'X-Priority: 1',
        'Importance: High'
    ];
    
    mail($email, $customerSubject, $customerMessage, implode("\r\n", $customerHeaders));
    
    // Send to admin
    $adminSubject = "🔥 New Booking #$bookingId - $destination";
    
    $adminMessage = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 25px; background: #f9f9f9; }
            .detail { margin: 12px 0; padding: 15px; background: white; border-left: 4px solid #27ae60; border-radius: 5px; }
            .urgent { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; border-radius: 5px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>📋 New Booking Received!</h2>
                <p>African Travelogue - Immediate Action Required</p>
            </div>
            <div class='content'>
                <div class='urgent'>
                    <strong>⚠️ Action Required:</strong> Please contact customer within 24 hours to confirm booking details.
                </div>
                
                <h3>Booking Details:</h3>
                
                <div class='detail'>
                    <strong>Booking ID:</strong> #$bookingId<br>
                    <strong>Customer:</strong> $name<br>
                    <strong>Email:</strong> $email<br>
                    <strong>Phone:</strong> $phone<br>
                    <strong>Destination:</strong> $destination<br>
                    <strong>Program:</strong> " . ($program ?: 'Not specified') . "<br>
                    <strong>Amount:</strong> $currency " . number_format($amount, 2) . "<br>
                    <strong>Payment Method:</strong> $paymentMethod<br>
                    " . ($transactionId ? "<strong>Transaction ID:</strong> $transactionId<br>" : "") . "
                    <strong>Date:</strong> " . date('Y-m-d H:i:s') . "
                </div>
                
                <p><strong>Next Steps:</strong></p>
                <ol>
                    <li>Contact customer to confirm booking details</li>
                    <li>Send itinerary and tour information</li>
                    <li>Update booking status in system</li>
                </ol>
                
                <p><strong>Quick Links:</strong><br>
                Reply to customer: <a href='mailto:$email'>$email</a><br>
                Call customer: <a href='tel:$phone'>$phone</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $adminHeaders = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: African Travelogue Bookings <' . NOREPLY_EMAIL . '>',
        'Reply-To: ' . $email,
        'X-Mailer: PHP/' . phpversion(),
        'X-Priority: 1',
        'Importance: High'
    ];
    
    mail(ADMIN_EMAIL, $adminSubject, $adminMessage, implode("\r\n", $adminHeaders));
}
?>