<?php
header('Content-Type: application/json');
session_start();

$data = json_decode(file_get_contents('php://input'), true);
$path = $data['path'] ?? '';
$folderName = $data['name'] ?? '';

if (empty($folderName)) {
    echo json_encode(['error' => 'Folder name not specified']);
    exit;
}

$username = $_SESSION['username'] ?? 'test';
$baseDir = dirname(dirname(dirname(dirname(__DIR__)))) . '/users/' . $username;

if (!empty($path) && $path !== '/') {
    $fullPath = $baseDir . '/' . basename($path) . '/' . basename($folderName);
} else {
    $fullPath = $baseDir . '/' . basename($folderName);
}

if (mkdir($fullPath, 0755, true)) {
    echo json_encode(['success' => true, 'path' => $fullPath]);
} else {
    echo json_encode(['error' => 'Could not create directory: ' . $fullPath]);
}
