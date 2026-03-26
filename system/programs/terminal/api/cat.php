<?php
header('Content-Type: application/json');

$file = $_GET['file'] ?? '';

if (empty($file)) {
    echo json_encode(['error' => 'Archivo no especificado']);
    exit;
}

$userDir = dirname(dirname(dirname(dirname(__DIR__)))) . '/users/' . ($_SESSION['username'] ?? 'test');
$filePath = $userDir . '/' . basename($file);

if (!file_exists($filePath)) {
    echo json_encode(['error' => 'Archivo no encontrado']);
    exit;
}

if (is_dir($filePath)) {
    echo json_encode(['error' => 'Es un directorio']);
    exit;
}

$content = file_get_contents($filePath);
echo json_encode(['content' => $content]);
