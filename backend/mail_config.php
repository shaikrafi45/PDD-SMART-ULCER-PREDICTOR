<?php
/**
 * Gmail SMTP Configuration for sending OTP emails.
 *
 * INSTRUCTIONS:
 * 1. Go to https://myaccount.google.com/security
 * 2. Make sure "2-Step Verification" is turned ON
 * 3. Go to https://myaccount.google.com/apppasswords
 * 4. Create a new App Password (select "Mail" and your device)
 * 5. Copy the 16-character password and paste it below
 * 6. Replace the GMAIL_USER with your Gmail address
 */

define('GMAIL_USER', 'rafiii96322@gmail.com');       // Your Gmail address
define('GMAIL_APP_PASSWORD', 'uwxm vtim jhxq xknz'); // Your 16-char App Password
define('MAIL_FROM_NAME', 'Smart Ulcer Predictor');   // Display name in the email
?>
