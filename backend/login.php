<?php
require_once 'db_connect.php';

// Get request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
    exit();
}

// Fetch input data (support both raw JSON and normal POST parameters)
$data = json_decode(file_get_contents("php://input"), true);
$email = isset($data['email']) ? trim($data['email']) : (isset($_POST['email']) ? trim($_POST['email']) : '');
$password = isset($data['password']) ? trim($data['password']) : (isset($_POST['password']) ? trim($_POST['password']) : '');

// Validation
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Email and password are required fields."]);
    exit();
}

try {
    // Check if user exists
    $query = "SELECT id, name, email, password FROM users WHERE email = :email LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->execute([':email' => $email]);
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch();
        
        // Verify password
        if (password_verify($password, $user['password'])) {
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Login successful.",
                "user" => [
                    "id" => $user['id'],
                    "name" => $user['name'],
                    "email" => $user['email']
                ]
            ]);
        } else {
            http_response_code(401); // Unauthorized
            echo json_encode(["status" => "error", "message" => "Invalid email or password."]);
        }
    } else {
        http_response_code(401); // Unauthorized
        echo json_encode(["status" => "error", "message" => "Invalid email or password."]);
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
