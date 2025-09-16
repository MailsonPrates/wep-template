<?php
    
namespace App\Modules\Login\Middlewares;
    
use App\Core\Http\iMiddleware;
use App\Core\Response;
use App\Core\Session;
use App\Modules\LoginPersistent\Services\ValidatePersistentLogin;

class IsLogged implements iMiddleware
{
    public function handle($request, $next)
    {
        Session::start();

        $route_map = $request->routeMapData();
        $is_api = $route_map->method;

        $is_logged = Session::get("user_id");

        if ( !$is_api ){
            Session::set("uri", $_SERVER['REQUEST_URI']);
        }
        
        if ( !$is_logged ){

            $user_code = Session::get("user_code") ?? null;

            if ( $user_code ){
                header('Location: /login/recovery/update/' . $user_code);
                die();
            }

            /**
             * Verifica login persistente
             */
            $persistent_user_id = ValidatePersistentLogin::handle();

            if ( $persistent_user_id ){
                Session::set("user_id", $persistent_user_id);

                if ( $is_api ) die();
            }


            if ( $is_api ){
                echo Response::json([
                    'error' => true,
                    'message' => 'Sessão expirada! Redirecionando para o login...',
                    'is_logged_out' => true
                ]);

                die();
            }

            header('Location: /login');
            die();
        }
    
        $next();
        return true;
    }
}