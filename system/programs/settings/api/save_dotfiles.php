<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$userDir = dirname(dirname(dirname(dirname(__DIR__)))) . '/users/' . ($_SESSION['username'] ?? 'test');

if (!is_dir($userDir)) {
    mkdir($userDir, 0755, true);
}

$dotfiles = [
    '.bashrc' => $data['bashrc'] ?? '',
    '.vimrc' => $data['vimrc'] ?? '',
    '.gitconfig' => $data['gitconfig'] ?? ''
];

$success = true;
foreach ($dotfiles as $name => $content) {
    $path = $userDir . '/' . $name;
    if (file_put_contents($path, $content) === false) {
        $success = false;
    }
}

if ($success) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['error' => 'Could not save some dotfiles']);
}
