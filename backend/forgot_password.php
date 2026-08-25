<?php
require_once 'db_connect.php';
require_once 'mail_config.php';
require_once 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$email = isset($data['email']) ? trim($data['email']) : (isset($_POST['email']) ? trim($_POST['email']) : '');

if (empty($email)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Email is a required field."]);
    exit();
}

try {
    // Check if email exists
    $query = "SELECT id, name FROM users WHERE email = :email LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->execute([':email' => $email]);

    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch();
        $userName = $user['name'];

        // Generate a 6-digit random code
        $resetCode = (string)rand(100000, 999999);

        // Update the code in the DB
        $updateQuery = "UPDATE users SET reset_code = :code WHERE email = :email";
        $updateStmt = $conn->prepare($updateQuery);
        $updateStmt->execute([
            ':code' => $resetCode,
            ':email' => $email
        ]);

        // Send OTP email via Gmail SMTP
        $mail = new PHPMailer(true);

        try {
            // SMTP Configuration
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = GMAIL_USER;
            $mail->Password   = GMAIL_APP_PASSWORD;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            // Recipients
            $mail->setFrom(GMAIL_USER, MAIL_FROM_NAME);
            $mail->addAddress($email, $userName);

            // Email content
            $mail->isHTML(true);
            $mail->Subject = 'Password Reset Code - Smart Ulcer Predictor';
            $mail->Body = '
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: linear-gradient(135deg, #42A5F5, #7B1FA2); border-radius: 16px;">
                <div style="background: white; border-radius: 12px; padding: 30px; text-align: center;">
                    <h2 style="color: #1976D2; margin-bottom: 10px;">🔒 Password Reset</h2>
                    <p style="color: #555; font-size: 14px;">Hi <strong>' . htmlspecialchars($userName) . '</strong>,</p>
                    <p style="color: #555; font-size: 14px;">You requested a password reset for your Smart Ulcer Predictor account. Use the verification code below:</p>
                    <div style="background: #f5f5f5; border: 2px dashed #1976D2; border-radius: 8px; padding: 15px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1976D2;">' . $resetCode . '</span>
                    </div>
                    <p style="color: #999; font-size: 12px;">This code is valid for a single use. If you did not request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #bbb; font-size: 11px;">Smart Ulcer Predictor &copy; ' . date('Y') . '</p>
                </div>
            </div>';
            $mail->AltBody = "Hi $userName, your password reset code is: $resetCode";

            $mail->send();

            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "A verification code has been sent to your email."
            ]);

        } catch (Exception $e) {
            // Email failed to send, but code is saved in DB
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Could not send email. Please try again later. Error: " . $mail->ErrorInfo
            ]);
        }

    } else {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Email address not found."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
