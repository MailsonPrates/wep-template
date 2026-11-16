<?php

namespace App\Modules\Config\Visual;

use Wep\Controller;
use Wep\Router\Http\RouterHttpRequest;
use Wep\Response;
use App\Modules\Config\Visual\Services\Favicon;
use App\Modules\Config\Visual\Services\Fonts;
use App\Modules\Config\Visual\Services\Logo;
use App\Modules\Config\Visual\Services\Theme;

/**
 * Config > Visual: cores, fonte, título das páginas, logos e favicon.
 */
class VisualApi
{
    use Controller;

    /** Imagens enviadas pelo painel: "variant" do upload/remoção. */
    private const IMAGES = ['logo', 'logo_dark', 'favicon'];

    public function settings(RouterHttpRequest $request, Response $response)
    {
        return $response->json(Response::success(self::state()));
    }

    /** Cores, fonte e tamanho do título: {colors: {...}, text: {font, title_size}} */
    public function saveColors(RouterHttpRequest $request, Response $response)
    {
        $colors = $request->colors ?? [];
        $text = $request->text ?? [];

        if ( !is_array($colors) || !is_array($text) ) return $response->json(Response::error('Dados inválidos'));

        $error = Theme::save($colors, $text);

        if ( $error ) return $response->json(Response::error($error));

        return $response->json(Response::success(self::state(), ['message' => 'Tema salvo']));
    }

    /** Envia uma imagem: variant = logo | logo_dark | favicon (multipart, campo "file"). */
    public function uploadLogo(RouterHttpRequest $request, Response $response)
    {
        $variant = self::variant($request);

        if ( !$variant ) return $response->json(Response::error('Imagem inválida'));

        $file = $_FILES['file'] ?? null;
        $error = $variant === 'favicon' ? Favicon::upload($file) : Logo::upload($file, $variant);

        if ( $error ) return $response->json(Response::error($error));

        return $response->json(Response::success(self::state(), ['message' => 'Imagem alterada']));
    }

    /** Volta a imagem para a padrão do template. */
    public function removeLogo(RouterHttpRequest $request, Response $response)
    {
        $variant = self::variant($request);

        if ( !$variant ) return $response->json(Response::error('Imagem inválida'));

        $error = $variant === 'favicon' ? Favicon::restore() : Logo::restore($variant);

        if ( $error ) return $response->json(Response::error($error));

        return $response->json(Response::success(self::state(), ['message' => 'Imagem padrão restaurada']));
    }

    /** Sem "variant" vale o logo (compatível com o front da 2.0.x). */
    private static function variant(RouterHttpRequest $request): ?string
    {
        $variant = (string) ($request->variant ?? 'logo');

        return in_array($variant, self::IMAGES, true) ? $variant : null;
    }

    private static function state(): array
    {
        return [
            'colors' => Theme::colors(),
            'defaults' => Theme::DEFAULTS,
            'text' => Theme::text(),
            'text_defaults' => Theme::TEXT_DEFAULTS,
            'title_size' => [
                'min' => Theme::TITLE_SIZE_MIN,
                'max' => Theme::TITLE_SIZE_MAX,
            ],
            'fonts' => array_keys(Fonts::CATALOG),
            'theme_version' => Theme::version(),
            'images' => [
                'logo' => [
                    'url' => Logo::url(),
                    'custom' => Logo::isCustom(),
                ],
                'logo_dark' => [
                    'url' => Logo::url('logo_dark'),
                    'custom' => Logo::isCustom('logo_dark'),
                ],
                'favicon' => [
                    'url' => Favicon::url(),
                    'custom' => Favicon::isCustom(),
                ],
            ],
            // compatibilidade com o front da 2.0.x
            'logo' => Logo::url(),
            'logo_default' => Logo::DEFAULT,
            'logo_custom' => Logo::isCustom(),
        ];
    }
}
