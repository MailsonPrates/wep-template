<?php

namespace App\Modules\Admin\UserGroup\Middlewares;

use Wep\Core;
use Wep\Http\Middleware;
use Wep\Response;
use Wep\View\Template\Template;
use App\Modules\Admin\UserGroup\Services\Roles;
use App\Modules\User\User;

/**
 * Permissão da rota (role em custom.role, definida no build pelo AddRoleToRoutes).
 *
 *  - API sem permissão: 403 em JSON;
 *  - página sem permissão: 403 com o layout do app mostrando "Acesso negado". A página NÃO é executada
 *    (antes era: o servidor só conferia APIs, então qualquer usuário logado abria qualquer página pela URL;
 *    num template que coloca dados no HTML, esses dados vazavam).
 *  - a Home é liberada para todo usuário logado (é a página inicial padrão dos grupos).
 */
class CheckPermission implements Middleware
{
    public function handle($request, $next)
    {
        $route = $request->routeMapData();
        $role = (string) ($route->custom['role'] ?? '');
        $isApi = (bool) ($route->method ?? false);

        if ( !$isApi && $role === Roles::DEFAULT_HOME_ROLE ){
            $next();
            return true;
        }

        $permissions = (array) User::getData('permissions');

        // sem grupo/permissões (null) → sem acesso, em vez de TypeError
        if ( $role !== '' && in_array($role, $permissions, true) ){
            $next();
            return true;
        }

        http_response_code(403);

        if ( $isApi ){
            header('Content-Type: application/json');

            echo Response::json([
                'error' => true,
                'http_code' => 403,
                'message' => "Você não tem acesso a esse recurso"
            ]);
            exit();
        }

        self::forbiddenPage($route, $request);
        exit();
    }

    /**
     * Layout padrão do app (src/Common/Templates/Main) com a tela de acesso negado. Usa sempre o
     * template padrão, nunca o da rota: um template próprio poderia montar os dados da página.
     */
    private static function forbiddenPage($route, $request): void
    {
        $route->forbidden = true;
        $route->document_title = 'Acesso negado | ' . Core::config('name|title', 'App');

        echo (new Template(APP_TEMPLATES_NAMESPACE . 'Main', $route, $request))->build();
    }
}
