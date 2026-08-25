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
$name = isset($data['name']) ? trim($data['name']) : (isset($_POST['name']) ? trim($_POST['name']) : '');
$email = isset($data['email']) ? trim($data['email']) : (isset($_POST['email']) ? trim($_POST['email']) : '');
$password = isset($data['password']) ? trim($data['password']) : (isset($_POST['password']) ? trim($_POST['password']) : '');

// Validation
if (empty($name) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing required fields: name, email, and password are required."]);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid email format."]);
    exit();
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Password must be at least 6 characters long."]);
    exit();
}

try {
    // Check if email already exists
    $checkQuery = "SELECT id FROM users WHERE email = :email LIMIT 1";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->execute([':email' => $email]);
    
    if ($checkStmt->rowCount() > 0) {
        http_response_code(409); // Conflict
        echo json_encode(["status" => "error", "message" => "Email is already registered."]);
        exit();
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert user
    $insertQuery = "INSERT INTO users (name, email, password) VALUES (:name, :email, :password)";
    $insertStmt = $conn->prepare($insertQuery);
    
    if ($insertStmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':password' => $hashedPassword
    ])) {
        $userId = $conn->lastInsertId();
        
        http_response_code(201); // Created
        echo json_encode([
            "status" => "success",
            "message" => "User registered successfully.",
            "user" => [
                "id" => $userId,
                "name" => $name,
                "email" => $email
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Unable to register user."]);
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
