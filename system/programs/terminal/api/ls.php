<?php
header('Content-Type: application/json');

$userDir = dirname(dirname(dirname(dirname(__DIR__)))) . '/users/' . ($_SESSION['username'] ?? 'test');

if (!is_dir($userDir)) {
    echo json_encode(['files' => []]);
    exit;
}

$files = [];
$items = scandir($userDir);

foreach ($items as $item) {
    if ($item === '.' || $item === '..') continue;
    
    $path = $userDir . '/' . $item;
    $files[] = [
        'name' => $item,
        'isDir' => is_dir($path)
    ];
}

echo json_encode(['files' => $files]);
