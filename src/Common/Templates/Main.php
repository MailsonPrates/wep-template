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
        $view_assets = include_once(DIR_STORAGE . "/builds/view-assets.build.php");

        $html = $template->html([
            "title" => $route->view->title ?? "",
            "head" => [
                ["link", ["rel" => "icon", "href" => App::assets("images/favicon.png?v=3")]],
                ["link", ["rel" => "stylesheet", "href" => "https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;700;900&display=swap"]],
                ["link", ["rel" => "stylesheet", "href" => App::assets("css/vendor/bootstrap.css")]],
                ["link", ["rel" => "stylesheet", "href" => App::assets("css/main.css")]],
                ["script", ["src" => App::assets("js/vendor/jquery.js")]],
                ...$view_assets
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