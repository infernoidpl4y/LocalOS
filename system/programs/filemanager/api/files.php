<?php
header('Content-Type: application/json');
session_start();

$path = $_GET['path'] ?? '';
$username = $_SESSION['username'] ?? 'test';

$baseDir = dirname(dirname(dirname(dirname(__DIR__)))) . '/users/' . $username;

if (empty($path) || $path === '/' || $path === 'home') {
    $fullPath = $baseDir;
} else {
    $fullPath = $baseDir . '/' . basename($path);
}

if (!is_dir($fullPath)) {
    $fullPath = $baseDir;
}

if (!is_dir($fullPath)) {
    mkdir($fullPath, 0755, true);
}

$files = [];
$items = @scandir($fullPath) ?: [];

foreach ($items as $item) {
    if ($item === '.') continue;
    
    $itemPath = $fullPath . '/' . $item;
    $isDir = is_dir($itemPath);
    
    $files[] = [
        'name' => $item,
        'isDir' => $isDir,
        'size' => $isDir ? 0 : @filesize($itemPath),
        'modified' => @filemtime($itemPath)
    ];
}

usort($files, function($a, $b) {
    if ($a['isDir'] !== $b['isDir']) return $a['isDir'] ? -1 : 1;
    return strcasecmp($a['name'], $b['name']);
});

echo json_encode([
    'files' => $files, 
    'path' => str_replace($baseDir, '', $fullPath) ?: '/',
    'basePath' => $baseDir
]);
