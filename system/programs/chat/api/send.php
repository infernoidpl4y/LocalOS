<?php
header('Content-Type: application/json');
session_start();

$data = json_decode(file_get_contents('php://input'), true);
$to = $data['to'] ?? '';
$from = $data['from'] ?? $_SESSION['username'] ?? 'test';
$text = $data['text'] ?? '';

if (empty($to) || empty($text)) {
    echo json_encode(['error' => 'Missing data']);
    exit;
}

$currentUser = $_SESSION['username'] ?? 'test';

$chatDir = dirname(dirname(dirname(dirname(__DIR__)))) . '/users/' . $currentUser . '/chat';

if (!is_dir($chatDir)) {
    mkdir($chatDir, 0755, true);
}

$messageFile = $chatDir . '/messages.json';
$messages = [];

if (file_exists($messageFile)) {
    $messages = json_decode(file_get_contents($messageFile), true) ?: [];
}

$messages[] = [
    'from' => $from,
    'to' => $to,
    'text' => $text,
    'timestamp' => time() * 1000
];

file_put_contents($messageFile, json_encode($messages));

$toChatDir = dirname(dirname(dirname(dirname(__DIR__)))) . '/users/' . $to . '/chat';
if (!is_dir($toChatDir)) {
    mkdir($toChatDir, 0755, true);
}
$toMessageFile = $toChatDir . '/messages.json';
$toMessages = [];
if (file_exists($toMessageFile)) {
    $toMessages = json_decode(file_get_contents($toMessageFile), true) ?: [];
}
$toMessages[] = [
    'from' => $from,
    'to' => $to,
    'text' => $text,
    'timestamp' => time() * 1000
];
file_put_contents($toMessageFile, json_encode($toMessages));

echo json_encode(['success' => true]);
