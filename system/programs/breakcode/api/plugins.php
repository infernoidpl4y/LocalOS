<?php
header('Content-Type: application/json');

$pluginsDir = dirname(__DIR__, 2) . '/plugins';

$plugins = [];

// Check if plugins directory exists
if (is_dir($pluginsDir)) {
    $items = scandir($pluginsDir);
    
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        
        $pluginPath = $pluginsDir . '/' . $item;
        
        if (!is_dir($pluginPath)) continue;
        
        $infoFile = $pluginPath . '/info.json';
        
        if (file_exists($infoFile)) {
            $info = json_decode(file_get_contents($infoFile), true);
            $info['path'] = 'plugins/' . $item;
            
            // Add JS and CSS paths if they exist
            if (file_exists($pluginPath . '/main.js')) {
                $info['js'] = 'plugins/' . $item . '/main.js';
            }
            if (file_exists($pluginPath . '/style.css')) {
                $info['css'] = 'plugins/' . $item . '/style.css';
            }
            
            $plugins[] = $info;
        }
    }
}

echo json_encode(['plugins' => $plugins]);