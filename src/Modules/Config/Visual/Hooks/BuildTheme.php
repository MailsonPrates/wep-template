<?php

namespace App\Modules\Config\Visual\Hooks;

use Wep\File;
use App\Modules\Config\Visual\Services\Settings;
use App\Modules\Config\Visual\Services\Theme;

/**
 * php app update: regera public/assets/css/theme.css a partir das cores salvas no banco
 * (o arquivo não vai para o git e pode não existir depois de um deploy).
 */
class BuildTheme
{
    public function handle()
    {
        $colors = Theme::colors();

        // sem banco as cores viriam vazias: regravar apagaria o tema personalizado
        if ( Settings::unavailable() ) throw new \RuntimeException('banco indisponível, theme.css mantido como está');

        if ( !File::putAtomic(Theme::file(), Theme::css($colors)) ){
            throw new \RuntimeException('Não foi possível gravar public/assets/css/theme.css');
        }
    }
}
