<?php
    
namespace App\Modules\Admin\UserGroup\Middlewares;
    
use App\Core\Http\iMiddleware;
use App\Core\Response;
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

        $has_permission = in_array($route_role, $user_permissions);

        if ( !$has_permission ){
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