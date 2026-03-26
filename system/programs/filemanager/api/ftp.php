<?php
header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? 'connect';

if ($action === 'connect') {
    $data = json_decode(file_get_contents('php://input'), true);
    $host = $data['host'] ?? '';
    $port = $data['port'] ?? 21;
    $user = $data['user'] ?? '';
    $pass = $data['pass'] ?? '';
    
    if (empty($host)) {
        echo json_encode(['error' => 'Host not specified']);
        exit;
    }
    
    $conn = @ftp_connect($host, $port, 10);
    if (!$conn) {
        echo json_encode(['error' => 'Could not connect to FTP server']);
        exit;
    }
    
    if (@ftp_login($conn, $user, $pass)) {
        ftp_close($conn);
        echo json_encode(['success' => true, 'host' => $host]);
    } else {
        ftp_close($conn);
        echo json_encode(['error' => 'Authentication failed']);
    }
    exit;
}

if ($action === 'list') {
    $host = $_GET['host'] ?? '';
    
    echo json_encode(['files' => []]);
    exit;
}

echo json_encode(['error' => 'Unknown action']);
