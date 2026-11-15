<?php

namespace App\Modules\Login\Middlewares;

use App\Modules\Login\Services\Auth;
use App\Modules\LoginPersistent\Services\ValidatePersistentLogin;
use App\Modules\User\User;
use Wep\Http\Middleware;
use Wep\Response;
use Wep\Session;

class IsLogged implements Middleware
{
    public function handle($request, $next)
    {
        Session::start();

        $route_map = $request->routeMapData();
        $is_api = $route_map->method ?? false;

        // página que o usuário tentou abrir, para voltar a ela depois do login
        if ( !$is_api && Auth::isSafePath($_SERVER['REQUEST_URI'] ?? '') ){
            Session::set("uri", $_SERVER['REQUEST_URI']);
        }

        if ( !Session::get("user_id") && !self::restorePersistentLogin() ){

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

    /**
     * "Lembrar-me": restaura a sessão (com ID novo) e segue com a requisição.
     * Antes, numa chamada de API, a requisição terminava aqui com resposta vazia.
     */
    private static function restorePersistentLogin(): bool
    {
        $user_id = ValidatePersistentLogin::handle();

        if ( !$user_id ) return false;

        $user = User::find($user_id)->data ?? null;

        // conta desativada (ou com senha temporária) depois do "lembrar-me" não é restaurada
        if ( !$user || ($user['status'] ?? '') !== 'ativado' ) return false;

        Auth::login($user);

        return true;
    }
}
