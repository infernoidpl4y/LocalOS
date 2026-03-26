<?php
header('Content-Type: application/json');
session_start();

$user = $_GET['user'] ?? '';
$currentUser = $_SESSION['username'] ?? 'test';

if (empty($user)) {
    echo json_encode(['messages' => []]);
    exit;
}

$chatDir = dirname(dirname(dirname(dirname(__DIR__)))) . '/users/' . $currentUser . '/chat';

if (!is_dir($chatDir)) {
    echo json_encode(['messages' => []]);
    exit;
}

$messageFile = $chatDir . '/messages.json';
$messages = [];

if (file_exists($messageFile)) {
    $allMessages = json_decode(file_get_contents($messageFile), true) ?: [];
    
    foreach ($allMessages as $msg) {
        if ($msg['from'] === $user || $msg['to'] === $user) {
            $messages[] = $msg;
        }
    }
}

echo json_encode(['messages' => $messages]);
