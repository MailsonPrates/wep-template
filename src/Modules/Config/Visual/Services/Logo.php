<?php

namespace App\Modules\Config\Visual\Services;

use Wep\ImageCache;

/**
 * Logos do app (Config > Visual): o normal e a variação para fundo escuro.
 *
 *  - o original fica em public/assets/images/logo/ (BrandImage);
 *  - o site usa a versão .webp do Wep\ImageCache, com no máximo HEIGHT px de altura;
 *  - sem logo personalizado, vale o do template (public/assets/images/logo.png);
 *  - sem a variação escura, vale o logo normal.
 *
 *   Logo::url();             // logo normal
 *   Logo::url('logo_dark');  // para fundo escuro (ex.: nav escura)
 */
class Logo
{
    public const DEFAULT = '/assets/images/logo.png';

    /** variação => setting */
    public const VARIANTS = [
        'logo' => 'visual.logo',
        'logo_dark' => 'visual.logo_dark',
    ];

    private const HEIGHT = 240; // 4x a altura exibida (60px): nítido em telas de alta densidade

    public static function url(string $variant = 'logo'): string
    {
        $original = BrandImage::original(self::setting($variant));
        $url = $original !== null ? ImageCache::url($original, 0, self::HEIGHT) : null;

        if ( $url !== null ) return $url;

        return $variant === 'logo' ? self::DEFAULT : self::url('logo');
    }

    public static function isCustom(string $variant = 'logo'): bool
    {
        return BrandImage::original(self::setting($variant)) !== null;
    }

    /**
     * @param array|null $file item de $_FILES
     * @return string|null mensagem de erro
     */
    public static function upload(?array $file, string $variant = 'logo'): ?string
    {
        return BrandImage::save(self::setting($variant), $file, '/logo', $variant === 'logo' ? 'logo' : 'logo-dark');
    }

    public static function restore(string $variant = 'logo'): ?string
    {
        return BrandImage::restore(self::setting($variant));
    }

    private static function setting(string $variant): string
    {
        return self::VARIANTS[$variant] ?? self::VARIANTS['logo'];
    }
}
