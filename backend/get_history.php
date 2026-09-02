<?php
require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
    exit();
}

$userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($userId <= 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Valid user_id is required."]);
    exit();
}

try {
    $query = "SELECT id, result, confidence, image_path, created_at FROM history WHERE user_id = :user_id ORDER BY created_at DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute([':user_id' => $userId]);

    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
    $host = $_SERVER['HTTP_HOST'];
    $path = dirname($_SERVER['PHP_SELF']);
    $path = str_replace('\\', '/', $path);
    $baseUrl = rtrim($protocol . $host . $path, '/') . '/';

    $historyItems = [];
    while ($row = $stmt->fetch()) {
        $rawDate = $row['created_at'];
        $formattedDate = !empty($rawDate) ? $rawDate : date('Y-m-d H:i:s');
        
        $rawImage = $row['image_path'];
        $imagePath = $rawImage;
        if (!empty($rawImage) && strpos($rawImage, 'uploads/') !== false) {
            $uploadRel = substr($rawImage, strpos($rawImage, 'uploads/'));
            $imagePath = $baseUrl . $uploadRel;
        }

        $historyItems[] = [
            "id" => (string)$row['id'],
            "result" => $row['result'],
            "confidence" => (float)$row['confidence'],
            "image_path" => $imagePath,
            "date" => $formattedDate,
            "created_at" => $formattedDate
        ];
    }

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "history" => $historyItems
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
