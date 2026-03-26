<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$path = $data['path'] ?? '';

if (empty($path)) {
    echo json_encode(['error' => 'Path not specified']);
    exit;
}

$baseDir = dirname(dirname(dirname(dirname(__DIR__)))) . '/users/' . ($_SESSION['username'] ?? 'test');
$fullPath = $baseDir . str_replace('/home/user', '', $path);

if (!file_exists($fullPath)) {
    echo json_encode(['error' => 'File not found']);
    exit;
}

if (is_dir($fullPath)) {
    if (rmdir($fullPath)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'Could not delete directory']);
    }
} else {
    if (unlink($fullPath)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'Could not delete file']);
    }
}
