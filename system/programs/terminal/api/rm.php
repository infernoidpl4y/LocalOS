<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$target = $data['target'] ?? '';

if (empty($target)) {
    echo json_encode(['error' => 'Objetivo no especificado']);
    exit;
}

$userDir = dirname(dirname(dirname(dirname(__DIR__)))) . '/users/' . ($_SESSION['username'] ?? 'test');
$targetPath = $userDir . '/' . basename($target);

if (!file_exists($targetPath)) {
    echo json_encode(['error' => 'No encontrado']);
    exit;
}

if (is_dir($targetPath)) {
    if (rmdir($targetPath)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'No se pudo eliminar el directorio']);
    }
} else {
    if (unlink($targetPath)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'No se pudo eliminar el archivo']);
    }
}
