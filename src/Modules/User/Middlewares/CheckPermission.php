<?php
    
namespace App\Modules\User\Middlewares;
    
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
                'message' => "Você não tem acesso a esse recurso",
                'debug' => [
                    'route' => $route,
                    'role' => $route_role,
                    'user' => $user_permissions
                ]
            ]);
            exit();
        }

        $next();
        return true;
    }
}