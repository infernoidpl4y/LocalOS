<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$file = $data['file'] ?? '';

if (empty($file)) {
    echo json_encode(['error' => 'Archivo no especificado']);
    exit;
}

$userDir = dirname(dirname(dirname(dirname(__DIR__)))) . '/users/' . ($_SESSION['username'] ?? 'test');
$filePath = $userDir . '/' . basename($file);

if (touch($filePath)) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['error' => 'No se pudo crear el archivo']);
}
