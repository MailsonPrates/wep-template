<?php

namespace App\Common\Tools;

use Exception;
use App\Core\Str;

class Upload
{

    public static $types = [
        'jpg',
        'jpeg',
        'gif',
        'png',
        'webp'
    ];

    public static $mime_type = [
        'image/jpeg' => 'jpg',
        'image/pjpeg' => 'jpg',
        'image/png' => 'png',
        'image/x-png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp'
    ];

    public static $max_size = 5242880;

    /**
     * @param array $props
     * @param string $props directory
     * @param array $props file
     * @param string|int $props prefix
     * 
     */
    public static function handle($props=[])
    {

        /**
         * Handle Directory
         */
        $dir_image = DIR_ASSETS . '/images';

        $directory = isset($props['directory']) 
            ? rtrim($dir_image . $props['directory'], '/')
            : $dir_image;

		// Check directory and create
		if ( !is_dir($directory) && !mkdir($directory, 0777, true) ) {
            throw new Exception("Erro ao criar o diretório");
		}

        /**
         * Handle File
         */
        $file = $props['file'] ?? $_FILES['file'] ?? [];

        if ( empty($file) ) throw new Exception("Arquivo não enviado");

        $filename = $file['name'];

        // Check file extension types
        if ( !in_array( Str::substr(strrchr($filename, '.'), 1), self::$types) ) {
            throw new Exception("Tipo de arquivo não permitido");
        }

        $real_extension = self::$mime_type[$file['type']] ?? null;

        // Check file mime types
        if ( !$real_extension ) {
            throw new Exception("Tipo de arquivo inválido");
        }

        // Create new filename
        $file_id = uniqid($props['prefix'] ? $props['prefix'] . '-' : "") . uniqid();
        $filename_ext = $real_extension;
        $filename = $file_id . '.' . $filename_ext;


        // Check file size
        if ( $file['size'] > self::$max_size ) {
            throw new Exception("O tamanho do arquivo é muito grande");
        }

        // Return any upload error
        if ( $file['error'] != UPLOAD_ERR_OK ) {
            throw new Exception("Houve um erro ao fazer upload do arquivo: ". $file['error']);
        }

        move_uploaded_file($file['tmp_name'], $directory . '/' . $filename);

        $uploaded_file = $directory . '/' . $filename;
        $uploaded_file = explode("assets/images", $uploaded_file)[1];

        return $uploaded_file;
    }
}