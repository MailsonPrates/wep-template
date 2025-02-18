<?php

namespace App\Common\Templates;

use App\Core\View\Template\iTemplate;
use App\App;

class Main implements iTemplate
{
    /**
     * @param object $route
     * @param Request $request
     * @param Template $template
     */
    public function build($route, $request, $template): string
    {
        $use_cache_booster = ENV_DEV;

        $html = $template->html([
            "title" => $route->view->title ?? "",
            "head" => [
                ["link", ["rel" => "icon", "href" => App::assets("images/favicon.png")]],
                ["link", ["rel" => "stylesheet", "href" => "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap"]],
                ["link", ["rel" => "stylesheet", "href" => App::assets("css/vendor/bootstrap.css")]],
                ["script", ["src" => App::assets("js/vendor/jquery.js")]],

                // Entry point
                ["script", ['id' => 'main-script', "src" => App::assets("view/main.js", $use_cache_booster)]],
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
}