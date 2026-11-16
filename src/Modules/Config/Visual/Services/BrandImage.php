<?php

namespace App\Modules\Config\Visual\Services;

use Wep\ImageCache;
use Wep\Upload;

/**
 * Imagens enviadas em Config > Visual (logos e favicon).
 *
 * O original fica em public/assets/images/<pasta>/ (validado pelo Wep\Upload: só imagens, tipo
 * pelo conteúdo) e o setting guarda o caminho relativo: {"original": "/logo/logo-ab12.png"}.
 * As versões usadas no site saem do Wep\ImageCache (webp/png no tamanho certo).
 */
final class BrandImage
{
    private const MAX_SIZE = 2 * 1024 * 1024;

    /** Caminho do original (relativo a assets/images), ou null se não houver um personalizado. */
    public static function original(string $setting): ?string
    {
        $value = Settings::get($setting);
        $original = is_array($value) ? (string) ($value['original'] ?? '') : '';

        // o valor vem do banco: nada de sair de assets/images
        if ( $original === '' || str_contains($original, '..') ) return null;

        return $original;
    }

    /**
     * @param array|null $file item de $_FILES
     * @return string|null mensagem de erro
     */
    public static function save(string $setting, ?array $file, string $directory, string $prefix): ?string
    {
        try {
            $path = Upload::image([
                'file' => $file,
                'directory' => $directory,
                'prefix' => $prefix,
                'max_size' => self::MAX_SIZE,
            ]);
        } catch (\Throwable $e) {
            return $e->getMessage();
        }

        $relative = Upload::relative($path);

        // o GD precisa conseguir ler a imagem (gera a primeira versão do cache)
        if ( ImageCache::path($relative, 32, 32, ImageCache::COVER, 'png') === null ){
            @unlink($path);
            return 'Não foi possível processar a imagem';
        }

        $previous = Settings::get($setting);
        $saved = Settings::set($setting, ['original' => $relative]);

        if ( !$saved ){
            self::deleteFiles(['original' => $relative]);
            return 'Não foi possível salvar a imagem';
        }

        self::deleteFiles($previous);

        return null;
    }

    /** Volta para a imagem padrão (apaga o original e o cache do personalizado). */
    public static function restore(string $setting): ?string
    {
        $previous = Settings::get($setting);

        if ( !Settings::forget($setting) ) return 'Não foi possível restaurar a imagem padrão';

        self::deleteFiles($previous);

        return null;
    }

    /**
     * Apaga o original, as versões do ImageCache e o "cache" do formato antigo (2.0.x).
     */
    private static function deleteFiles($value): void
    {
        if ( !is_array($value) ) return;

        $base = rtrim(str_replace('\\', '/', DIR_ASSETS), '/') . '/images';

        foreach( ['original', 'cache'] as $key ){
            $relative = (string) ($value[$key] ?? '');

            if ( $relative === '' || str_contains($relative, '..') ) continue;

            if ( $key === 'original' ) ImageCache::forget($relative);

            $file = $base . '/' . ltrim($relative, '/');

            if ( is_file($file) ) @unlink($file);
        }
    }
}
