<?php
require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$email = isset($data['email']) ? trim($data['email']) : (isset($_POST['email']) ? trim($_POST['email']) : '');
$code = isset($data['reset_code']) ? trim($data['reset_code']) : (isset($_POST['reset_code']) ? trim($_POST['reset_code']) : '');
$newPassword = isset($data['new_password']) ? trim($data['new_password']) : (isset($_POST['new_password']) ? trim($_POST['new_password']) : '');

if (empty($email) || empty($code) || empty($newPassword)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Email, reset code, and new password are required fields."]);
    exit();
}

if (strlen($newPassword) < 6) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Password must be at least 6 characters long."]);
    exit();
}

try {
    // Check if code matches the email
    $query = "SELECT id FROM users WHERE email = :email AND reset_code = :code LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->execute([
        ':email' => $email,
        ':code' => $code
    ]);

    if ($stmt->rowCount() > 0) {
        // Hash the new password
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

        // Update password and clear reset code
        $updateQuery = "UPDATE users SET password = :password, reset_code = NULL WHERE email = :email";
        $updateStmt = $conn->prepare($updateQuery);
        $updateStmt->execute([
            ':password' => $hashedPassword,
            ':email' => $email
        ]);

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Password has been reset successfully."]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid verification code or email."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
