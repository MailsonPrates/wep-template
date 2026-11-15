<?php
    
namespace App\Modules\Admin\UserGroup\Middlewares;
    
use Wep\Http\iMiddleware;
use Wep\Response;
use App\Modules\User\User;

class CheckPermission implements iMiddleware
{
    /**
    * @param Request $request
    * @param \Closure $next
    */
    public function handle($request, $next)
    {
        $route = $request->routeMapData();
        $route_method = $route->method;

        if ( !$route_method ){
            $next();
            return true;
        }

        $route_role = $route->custom['role'] ?? "";
        $user_permissions = User::getData('permissions');

        // sem grupo/permissões (null) → sem acesso, em vez de TypeError
        $has_permission = $route_role !== '' && in_array($route_role, (array) $user_permissions, true);

        if ( !$has_permission ){
            // 403 de verdade (antes 200 com http_code só no corpo)
            http_response_code(403);
            header('Content-Type: application/json');

            echo Response::json([
                'error' => true,
                'http_code' => 403,
                'message' => "Você não tem acesso a esse recurso"
            ]);
            exit();
        }

        $next();
        return true;
    }
}