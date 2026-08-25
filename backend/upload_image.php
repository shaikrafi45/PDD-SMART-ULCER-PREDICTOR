<?php
require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
    exit();
}

// Check parameters
$userId = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
if ($userId <= 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Valid user_id is required."]);
    exit();
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "No image uploaded or upload error occurred."]);
    exit();
}

// Define upload directory
$uploadDir = 'uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Generate unique name for the file
$fileTmpPath = $_FILES['image']['tmp_name'];
$fileName = $_FILES['image']['name'];
$fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
$newFileName = md5(time() . $fileName) . '.' . $fileExtension;
$destPath = $uploadDir . $newFileName;

// Restrict file extensions
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
if (!in_array($fileExtension, $allowedExtensions)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Upload failed. Allowed formats: " . implode(', ', $allowedExtensions)]);
    exit();
}

if (move_uploaded_file($fileTmpPath, $destPath)) {
    // Check if prediction result and confidence were passed by the client
    $result = isset($_POST['result']) ? trim($_POST['result']) : '';
    $confidence = isset($_POST['confidence']) ? floatval($_POST['confidence']) : 0.0;

    if (empty($result)) {
        // --- INTEGRATION PLACEHOLDER FOR MACHINE LEARNING MODEL ---
        // If you have a Python model file, you can call it here, for example:
        // $output = shell_exec("python predict.py " . escapeshellarg($destPath));
        // $prediction = json_decode($output, true);
        
        // Simulating prediction response for testing:
        $results = [
            "Granulation tissue (red, healing)",
            "Slough (yellow, needs cleaning)",
            "Necrotic tissue (black, dead)",
            "Epithelialisation (pink, new skin)"
        ];
        
        // Pick a random result & confidence
        $result = $results[array_rand($results)];
        $confidence = round(rand(7000, 9900) / 100, 2); // 70.00% to 99.00%
    }
    
    // Full URL path to the saved image (accessible online)
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
    $host = $_SERVER['HTTP_HOST'];
    $path = dirname($_SERVER['PHP_SELF']);
    // Clean backslashes on windows
    $path = str_replace('\\', '/', $path);
    $imageUrl = $protocol . $host . $path . '/' . $destPath;

    try {
        // Save to Database History
        $query = "INSERT INTO history (user_id, result, confidence, image_path) VALUES (:user_id, :result, :confidence, :image_path)";
        $stmt = $conn->prepare($query);
        $stmt->execute([
            ':user_id' => $userId,
            ':result' => $result,
            ':confidence' => $confidence,
            ':image_path' => $imageUrl
        ]);

        $historyId = $conn->lastInsertId();

        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Image uploaded and analyzed successfully.",
            "data" => [
                "id" => $historyId,
                "result" => $result,
                "confidence" => $confidence,
                "image_url" => $imageUrl,
                "created_at" => date('c') // ISO 8601 format
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to save record to database: " . $e->getMessage()]);
    }

} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "There was an error moving the uploaded file."]);
}
?>
