<?php

namespace App\Modules\Config\Visual;

use Wep\Controller;
use Wep\Response;
use App\Modules\Config\Visual\Services\Logo;
use App\Modules\Config\Visual\Services\Theme;

/**
 * Config > Visual: cores dos botões e da nav, e o logo.
 */
class VisualApi
{
    use Controller;

    public function settings($request, $response)
    {
        return $response->json(Response::success(self::state()));
    }

    public function saveColors($request, $response)
    {
        $colors = $request->colors ?? [];

        if ( !is_array($colors) ) return $response->json(Response::error('Envie as cores'));

        if ( $error = Theme::save($colors) ) return $response->json(Response::error($error));

        return $response->json(Response::success(self::state(), ['message' => 'Cores salvas']));
    }

    public function uploadLogo($request, $response)
    {
        if ( $error = Logo::upload($_FILES['file'] ?? null) ) return $response->json(Response::error($error));

        return $response->json(Response::success(self::state(), ['message' => 'Logo alterado']));
    }

    public function removeLogo($request, $response)
    {
        if ( $error = Logo::restore() ) return $response->json(Response::error($error));

        return $response->json(Response::success(self::state(), ['message' => 'Logo padrão restaurado']));
    }

    private static function state(): array
    {
        return [
            'colors' => Theme::colors(),
            'defaults' => Theme::DEFAULTS,
            'theme_version' => Theme::version(),
            'logo' => Logo::url(),
            'logo_default' => Logo::DEFAULT,
            'logo_custom' => Logo::isCustom(),
        ];
    }
}
