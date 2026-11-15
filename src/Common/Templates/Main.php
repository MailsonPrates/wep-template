<?php

namespace App\Common\Templates;

use App\App;
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
                ["link", ["rel" => "icon", "href" => App::assets("images/favicon.png?v=3")]],
                ["link", ["rel" => "stylesheet", "href" => "https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;700;900&display=swap"]],
                ["link", ["rel" => "stylesheet", "href" => App::assets("css/vendor/bootstrap.css")]],
                ["link", ["rel" => "stylesheet", "href" => App::assets("css/main.css")]],
                // Html::json: os dados do usuário não conseguem fechar o <script>
                ['script', ['html' => 'window.App = {user: ' . Html::json(User::getData()) . '}']],
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
