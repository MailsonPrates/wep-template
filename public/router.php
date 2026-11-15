<?php

/**
 * Roteador do servidor embutido do PHP (só desenvolvimento):
 *
 *   cd public
 *   php -S localhost:8000 router.php
 *
 * Faz o papel do .htaccess, que o `php -S` não lê: arquivos que existem em public/ (assets) são
 * servidos direto; o resto vai para o index.php com ?route=<caminho>.
 * Fora do `php -S` não faz nada (no Apache/Nginx quem roteia é o servidor).
 */

if ( PHP_SAPI !== 'cli-server' ){
    http_response_code(404);
    exit;
}

$path = (string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$file = realpath(__DIR__ . $path);

// arquivo estático dentro de public/ (e não um .php): o servidor embutido entrega
if ( $file && is_file($file) && str_starts_with($file, __DIR__) && !str_ends_with($file, '.php') ){
    return false;
}

// o index.php carrega ../vendor e ../config a partir da pasta atual
chdir(__DIR__);

$_GET['route'] = $path;
$_SERVER['SCRIPT_NAME'] = '/index.php';

require __DIR__ . '/index.php';
