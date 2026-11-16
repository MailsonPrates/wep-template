<?php

namespace App\Common\Templates;

use App\App;
use App\Modules\Config\Visual\Services\Favicon;
use App\Modules\Config\Visual\Services\Fonts;
use App\Modules\Config\Visual\Services\Logo;
use App\Modules\Config\Visual\Services\Theme;
use App\Modules\User\User;
use Wep\Foundation\ErrorHandler;
use Wep\View\Template\Html;
use Wep\View\Template\iTemplate;

class Main implements iTemplate
{
    /**
     * @param object $route
     * @param Request $request
     * @param Template $template
     */
    public function build($route, $request, $template): string
    {
        $html = $template->html([
            // título com os parâmetros da rota (ex.: "Pedido #123 | App"); o Html escapa o <title>
            "title" => $route->document_title ?? App::config('name|title', ''),
            "head" => [
                // favicon e fonte de Config > Visual
                ...self::favicon(),
                ["link", ["rel" => "stylesheet", "href" => Fonts::url(self::visual('font'))]],
                // Bootstrap + estilos do app, compilados de src/app/styles/main.scss (npm run dev/prod);
                // o segundo parâmetro acrescenta ?v=<data do arquivo>: cache do navegador até o próximo build
                ["link", ["rel" => "stylesheet", "href" => App::assets("css/main.css", true)]],
                // cores de Config > Visual (gerado no servidor; carregado depois do main.css)
                ...self::themeAssets(),
                // Html::json: os dados do usuário não conseguem fechar o <script>
                ['script', ['html' => 'window.App = ' . Html::json([
                    'user' => User::getData(),
                    'visual' => [
                        'logo' => self::visual('logo'),
                        'logo_dark' => self::visual('logo_dark'),
                        // nav escura: o Nav usa o logo para fundo escuro
                        'nav_dark' => self::visual('nav_dark'),
                    ],
                    // página aberta sem permissão (CheckPermission): o front mostra "Acesso negado"
                    'forbidden' => (bool) ($route->forbidden ?? false),
                ])]],
                ...self::viewAssets()
            ]
        ]);

        $html->append("body", [
            $html->div([
                "id" => "notify-wrap"
            ]),
            $html->main([
                "id" => "app"
            ])
        ]);

        return $html->build();
    }

    private static function themeAssets(): array
    {
        if ( !is_file(Theme::file()) ) return [];

        return [["link", ["rel" => "stylesheet", "id" => "app-theme", "href" => App::assets("css/theme.css", true)]]];
    }

    /**
     * Valores de Config > Visual; com o banco indisponível, os padrões do template.
     *
     * @param string $key logo | logo_dark | nav_dark | font
     */
    private static function visual(string $key)
    {
        try {
            return match ($key) {
                'logo' => Logo::url(),
                'logo_dark' => Logo::url('logo_dark'),
                'nav_dark' => Theme::isDark(Theme::colors()['nav_bg']),
                'font' => Theme::text()['font'],
            };
        } catch (\Throwable $e) {
            return match ($key) {
                'logo', 'logo_dark' => Logo::DEFAULT,
                'nav_dark' => false,
                'font' => Fonts::DEFAULT,
            };
        }
    }

    /** Favicon enviado em Config > Visual (32px + 180px para celular) ou o padrão. */
    private static function favicon(): array
    {
        try {
            $custom = Favicon::urls();
        } catch (\Throwable $e) {
            $custom = null;
        }

        if ( $custom === null ) return [["link", ["rel" => "icon", "href" => App::assets("images/favicon.png?v=3")]]];

        $links = [["link", [
            "rel" => "icon",
            "type" => "image/png",
            "sizes" => "32x32",
            "href" => $custom['icon'],
        ]]];

        if ( $custom['apple'] ){
            $links[] = ["link", [
                "rel" => "apple-touch-icon",
                "sizes" => "180x180",
                "href" => $custom['apple'],
            ]];
        }

        return $links;
    }

    /**
     * Scripts e CSS gerados pelo webpack (storage/builds/view-assets.build.php).
     * Antes, sem o build, a página quebrava com fatal ("Only arrays can be unpacked").
     */
    private static function viewAssets(): array
    {
        $file = DIR_STORAGE . "/builds/view-assets.build.php";

        if ( !is_file($file) ){
            ErrorHandler::log('WARNING', 'Build do front não encontrado (storage/builds/view-assets.build.php): rode "npm run dev" ou "npm run prod"');
            return [];
        }

        $assets = include $file;

        return is_array($assets) ? $assets : [];
    }
}
