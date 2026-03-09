<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_POST['action'] ?? 'list';
$path = $_POST['path'] ?? '.';

// Base directory - limit to project root
$baseDir = dirname(__DIR__, 3); // Go up from codeeditor/api/ to project root
$baseDir = realpath($baseDir);

// Security: prevent directory traversal
function securePath($baseDir, $path) {
    $realBase = realpath($baseDir);
    $fullPath = realpath($baseDir . '/' . $path);
    
    if ($fullPath === false) {
        return null;
    }
    
    // Ensure path is within base directory
    if (strpos($fullPath, $realBase) !== 0) {
        return null;
    }
    
    return $fullPath;
}

switch ($action) {
    case 'list':
        $fullPath = securePath($baseDir, $path);
        
        if (!$fullPath || !is_dir($fullPath)) {
            echo json_encode(['error' => 'Invalid directory']);
            exit;
        }
        
        $files = [];
        $items = scandir($fullPath);
        
        foreach ($items as $item) {
            if ($item === '.' || $item === '..' || $item === '.git') {
                continue;
            }
            
            $itemPath = $fullPath . '/' . $item;
            $relativePath = ($path === '.' ? '' : $path . '/') .            $files[] = [
                'name' => $item,
                ' $item;
            
path' => $relativePath,
                'isDir' => is_dir($itemPath),
                'size' => is_file($itemPath) ? filesize($itemPath) : 0,
                'modified' => filemtime($itemPath)
            ];
        }
        
        echo json_encode(['files' => $files]);
        break;
        
    case 'read':
        $fullPath = securePath($baseDir, $path);
        
        if (!$fullPath || !is_file($fullPath)) {
            echo json_encode(['error' => 'Invalid file']);
            exit;
        }
        
        $content = file_get_contents($fullPath);
        
        echo json_encode([
            'content' => $content,
            'path' => $path,
            'size' => strlen($content)
        ]);
        break;
        
    case 'write':
        $fullPath = securePath($baseDir, $path);
        
        if (!$fullPath) {
            echo json_encode(['error' => 'Invalid path']);
            exit;
        }
        
        $content = $_POST['content'] ?? '';
        $result = file_put_contents($fullPath, $content);
        
        if ($result === false) {
            echo json_encode(['error' => 'Failed to write file']);
        } else {
            echo json_encode(['success' => true, 'bytes' => $result]);
        }
        break;
        
    case 'create':
        $fullPath = securePath($baseDir, $path);
        
        if (!$fullPath) {
            echo json_encode(['error' => 'Invalid path']);
            exit;
        }
        
        $type = $_POST['type'] ?? 'file';
        
        if ($type === 'dir') {
            $result = mkdir($fullPath, 0755, true);
        } else {
            $result = touch($fullPath);
        }
        
        if ($result) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'Failed to create']);
        }
        break;
        
    case 'delete':
        $fullPath = securePath($baseDir, $path);
        
        if (!$fullPath) {
            echo json_encode(['error' => 'Invalid path']);
            exit;
        }
        
        if (is_dir($fullPath)) {
            $result = rmdir($fullPath);
        } else {
            $result = unlink($fullPath);
        }
        
        if ($result) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'Failed to delete']);
        }
        break;
        
    case 'rename':
        $oldPath = securePath($baseDir, $_POST['oldPath'] ?? '');
        $newName = $_POST['newPath'] ?? '';
        
        if (!$oldPath || !$newName) {
            echo json_encode(['error' => 'Invalid paths']);
            exit;
        }
        
        $newPath = dirname($oldPath) . '/' . $newName;
        $result = rename($oldPath, $newPath);
        
        if ($result) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'Failed to rename']);
        }
        break;
        
    default:
        echo json_encode(['error' => 'Unknown action']);
}