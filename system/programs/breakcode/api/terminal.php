<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$command = $_POST['cmd'] ?? '';
$cwd = $_POST['cwd'] ?? getcwd();

// Security: whitelist allowed commands or sanitize
$allowedCommands = [
    'ls', 'dir', 'pwd', 'cd', 'cat', 'echo', 'mkdir', 'rmdir', 'rm', 'del',
    'cp', 'copy', 'mv', 'move', 'touch', 'grep', 'find', 'which', 'whoami',
    'date', 'time', 'cal', 'df', 'du', 'free', 'uname', 'hostname', 'ps',
    'kill', 'killall', 'top', 'htop', 'curl', 'wget', 'git', 'npm', 'node',
    'php', 'python', 'python3', 'ruby', 'perl', 'java', 'gcc', 'make',
    'zip', 'unzip', 'tar', 'gzip', 'gunzip', 'bzip2', 'bunzip2',
    'chmod', 'chown', 'chgrp', 'ln', 'less', 'more', 'head', 'tail',
    'wc', 'sort', 'uniq', 'cut', 'awk', 'sed', 'diff', 'patch',
    'env', 'export', 'set', 'unset', 'source', 'alias', 'history',
    'clear', 'exit', 'logout', 'help', 'man', 'info',
    // File viewing
    'cat', 'head', 'tail', 'less', 'more', 'nl', 'vim', 'nano', 'code'
];

// Get the main command (first word)
$mainCommand = trim(explode(' ', $command)[0]);

// Check if command is allowed or contains dangerous patterns
$isAllowed = false;
foreach ($allowedCommands as $allowed) {
    if (strpos($mainCommand, $allowed) === 0 || $mainCommand === $allowed) {
        $isAllowed = true;
        break;
    }
}

// Block dangerous commands
$blockedPatterns = [
    '/^rm\s+-rf\s+\//',
    '/^dd\s+/',
    '/^mkfs/',
    '/^fdisk/',
    '/>dev\/sda/',
    '/^ssh\s+root@/',
    '/^wget.*\|\s*sh/',
    '/curl.*\|\s*sh/',
    '/;.*rm\s+/',
    '/\|.*rm\s+/',
    '/&&\s*rm\s+/',
    '/\bexec\s+/',
    '/\bsystem\s+/',
    '/\bpassthru\s+/',
    '/\bshell_exec\s*\(/',
    '/`.*`/',
    '/\$\(.*\)/'
];

$isBlocked = false;
foreach ($blockedPatterns as $pattern) {
    if (preg_match($pattern, $command)) {
        $isBlocked = true;
        break;
    }
}

if ($isBlocked) {
    echo json_encode([
        'output' => '',
        'error' => 'Command blocked for security reasons',
        'cwd' => $cwd
    ]);
    exit;
}

// Change to working directory
if (strpos($command, 'cd ') === 0) {
    $newPath = trim(substr($command, 3));
    $newPath = str_replace(['~', '$HOME'], $_SERVER['DOCUMENT_ROOT'] ?? '/home', $newPath);
    
    if (file_exists($newPath) && is_dir($newPath)) {
        chdir($newPath);
        $cwd = getcwd();
        echo json_encode([
            'output' => '',
            'cwd' => $cwd
        ]);
    } else {
        echo json_encode([
            'output' => '',
            'error' => "cd: $newPath: No such directory",
            'cwd' => $cwd
        ]);
    }
    exit;
}

// Change directory for other commands too
$command = 'cd ' . escapeshellarg($cwd) . ' && ' . $command;

// Set timeout
set_time_limit(30);

// Execute command
$output = '';
$error = '';
$returnCode = 0;

try {
    // Use shell_exec for simple output
    $output = shell_exec($command . ' 2>&1');
    
    if ($output === null) {
        $output = '';
    }
} catch (Exception $e) {
    $error = $e->getMessage();
    $returnCode = 1;
}

// Clean output
$output = trim($output);

// If output is empty but there was no error, that's fine
// Some commands don't produce output

echo json_encode([
    'output' => $output,
    'error' => $error ?: null,
    'cwd' => $cwd,
    'returnCode' => $returnCode
]);