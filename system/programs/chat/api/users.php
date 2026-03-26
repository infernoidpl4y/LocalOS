<?php
header('Content-Type: application/json');

$usersDir = dirname(dirname(dirname(dirname(__DIR__)))) . '/users';

$users = [];

if (is_dir($usersDir)) {
    $items = scandir($usersDir);
    foreach ($items as $item) {
        if ($item === '.' || $item === '..' || !is_dir($usersDir . '/' . $item)) continue;
        
        $userFile = $usersDir . '/' . $item . '/userfile.json';
        if (file_exists($userFile)) {
            $data = json_decode(file_get_contents($userFile), true);
            $users[] = [
                'id' => $item,
                'name' => $data['name'] ?? ucfirst($item),
                'online' => false
            ];
        } else {
            $users[] = [
                'id' => $item,
                'name' => ucfirst($item),
                'online' => false
            ];
        }
    }
}

echo json_encode(['users' => $users]);
