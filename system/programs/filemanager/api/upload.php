<?php
header('Content-Type: application/json');

$path = $_POST['path'] ?? '/home/user';
$baseDir = dirname(dirname(dirname(dirname(__DIR__)))) . '/users/' . ($_SESSION['username'] ?? 'test');
$fullPath = $baseDir . str_replace('/home/user', '', $path);

if (!is_dir($fullPath)) {
    mkdir($fullPath, 0755, true);
}

if (isset($_FILES['file'])) {
    $file = $_FILES['file'];
    $target = $fullPath . '/' . basename($file['name']);
    
    if (move_uploaded_file($file['tmp_name'], $target)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'Upload failed']);
    }
} else {
    echo json_encode(['error' => 'No file uploaded']);
}
