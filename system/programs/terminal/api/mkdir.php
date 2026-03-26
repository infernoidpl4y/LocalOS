<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$dir = $data['dir'] ?? '';

if (empty($dir)) {
    echo json_encode(['error' => 'Directorio no especificado']);
    exit;
}

$userDir = dirname(dirname(dirname(dirname(__DIR__)))) . '/users/' . ($_SESSION['username'] ?? 'test');
$dirPath = $userDir . '/' . basename($dir);

if (mkdir($dirPath)) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['error' => 'No se pudo crear el directorio']);
}
