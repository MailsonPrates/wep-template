<?php

namespace App\Modules\Config\Visual\Services;

use Wep\File;
use Wep\Upload;

/**
 * Logo do app (Config > Visual).
 *
 *  - o original enviado fica em public/assets/images/logo/ (validado pelo Wep\Upload: só imagens,
 *    tipo pelo conteúdo);
 *  - o front usa a versão do cache, public/assets/images/cache/logo/logo-<hash>.webp, redimensionada
 *    para no máximo MAX_HEIGHT px de altura. Sem suporte a WebP no GD, o cache guarda uma cópia no
 *    formato original;
 *  - sem logo personalizado (ou depois de "Restaurar padrão"), vale o logo do template:
 *    public/assets/images/logo.png.
 */
class Logo
{
    public const SETTING = 'visual.logo';
    public const DEFAULT = '/assets/images/logo.png';
    private const MAX_HEIGHT = 240; // 4x a altura exibida (60px): nítido em telas de alta densidade

    /** URL do logo usado no front. */
    public static function url(): string
    {
        $logo = Settings::get(self::SETTING);
        $cache = is_array($logo) ? (string) ($logo['cache'] ?? '') : '';

        if ( $cache !== '' && is_file(self::imagesDir() . $cache) ){
            return '/assets/images' . $cache . '?v=' . filemtime(self::imagesDir() . $cache);
        }

        return self::DEFAULT;
    }

    public static function isCustom(): bool
    {
        return self::url() !== self::DEFAULT;
    }

    /**
     * @param array|null $file item de $_FILES
     * @return string|null mensagem de erro
     */
    public static function upload(?array $file): ?string
    {
        try {
            $original = Upload::image([
                'file' => $file,
                'directory' => '/logo',
                'prefix' => 'logo',
                'max_size' => 2 * 1024 * 1024,
            ]);
        } catch (\Throwable $e) {
            return $e->getMessage();
        }

        $cache = self::buildCache($original);

        if ( $cache === null ){
            @unlink($original);
            return 'Não foi possível processar a imagem';
        }

        $previous = Settings::get(self::SETTING);

        if ( !Settings::set(self::SETTING, [
            'original' => Upload::relative($original),
            'cache' => Upload::relative($cache),
        ]) ){
            @unlink($original);
            @unlink($cache);
            return 'Não foi possível salvar o logo';
        }

        self::deleteFiles($previous);

        return null;
    }

    /** Volta para o logo padrão do template (apaga o original e o cache do personalizado). */
    public static function restore(): ?string
    {
        $previous = Settings::get(self::SETTING);

        if ( !Settings::forget(self::SETTING) ) return 'Não foi possível restaurar o logo';

        self::deleteFiles($previous);

        return null;
    }

    /**
     * Gera a versão do front: WebP redimensionado (ou cópia, sem GD/WebP).
     *
     * @return string|null caminho do arquivo gerado
     */
    private static function buildCache(string $original): ?string
    {
        $dir = self::imagesDir() . '/cache/logo';

        if ( !File::ensureDir($dir) ) return null;

        $hash = substr(sha1_file($original) ?: bin2hex(random_bytes(8)), 0, 16);
        $canWebp = function_exists('imagewebp') && function_exists('imagecreatefromstring');

        if ( !$canWebp ){
            $target = "$dir/logo-$hash." . pathinfo($original, PATHINFO_EXTENSION);
            return copy($original, $target) ? $target : null;
        }

        $source = @imagecreatefromstring((string) file_get_contents($original));

        if ( $source === false ) return null;

        $width = imagesx($source);
        $height = imagesy($source);
        $scale = $height > self::MAX_HEIGHT ? self::MAX_HEIGHT / $height : 1;
        $newWidth = max(1, (int) round($width * $scale));
        $newHeight = max(1, (int) round($height * $scale));

        // transparência preservada (PNG/WebP com fundo transparente)
        $image = imagecreatetruecolor($newWidth, $newHeight);
        imagealphablending($image, false);
        imagesavealpha($image, true);
        imagefill($image, 0, 0, imagecolorallocatealpha($image, 0, 0, 0, 127));
        imagecopyresampled($image, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        $target = "$dir/logo-$hash.webp";
        $ok = imagewebp($image, $target, 90);

        unset($image, $source);

        return $ok ? $target : null;
    }

    private static function deleteFiles($logo): void
    {
        if ( !is_array($logo) ) return;

        foreach( ['original', 'cache'] as $key ){
            $relative = (string) ($logo[$key] ?? '');

            // só arquivos dentro de assets/images (o valor vem do banco)
            if ( $relative === '' || str_contains($relative, '..') ) continue;

            $file = self::imagesDir() . $relative;

            if ( is_file($file) ) @unlink($file);
        }
    }

    private static function imagesDir(): string
    {
        return rtrim(DIR_ASSETS, '/\\') . '/images';
    }
}
