<?php

namespace App\Modules\Config\Visual\Services;

use Wep\ImageCache;

/**
 * Favicon (Config > Visual). Do original enviado saem dois PNG quadrados pelo Wep\ImageCache:
 * 32x32 (aba do navegador) e 180x180 (ícone na tela inicial do celular). Sem favicon
 * personalizado, vale o do template (public/assets/images/favicon.png).
 */
class Favicon
{
    public const SETTING = 'visual.favicon';
    public const DEFAULT = '/assets/images/favicon.png';

    /**
     * URLs do favicon personalizado, ou null para usar o padrão.
     *
     * @return array{icon: string, apple: string|null}|null
     */
    public static function urls(): ?array
    {
        $original = BrandImage::original(self::SETTING);

        if ( $original === null ) return null;

        $icon = ImageCache::url($original, 32, 32, ImageCache::COVER, 'png');

        if ( $icon === null ) return null;

        return [
            'icon' => $icon,
            'apple' => ImageCache::url($original, 180, 180, ImageCache::COVER, 'png'),
        ];
    }

    /** URL para a pré-visualização no painel. */
    public static function url(): string
    {
        $urls = self::urls();

        return $urls !== null ? $urls['icon'] : self::DEFAULT;
    }

    public static function isCustom(): bool
    {
        return BrandImage::original(self::SETTING) !== null;
    }

    public static function upload(?array $file): ?string
    {
        return BrandImage::save(self::SETTING, $file, '/favicon', 'favicon');
    }

    public static function restore(): ?string
    {
        return BrandImage::restore(self::SETTING);
    }
}
