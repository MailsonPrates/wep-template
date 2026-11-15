<?php

namespace App\Modules\Login\Middlewares;

use App\Modules\Login\Services\Auth;
use Wep\Http\Middleware;
use Wep\Session;

class IsAlreadyLogged implements Middleware
{
    /**
    * @param Request $request
    * @param \Closure $next
    */
    public function handle($request, $next)
    {
        Session::start();

        if ( Session::get("user_id") ){
            // só caminhos internos (antes aceitaria "//site-externo")
            header('Location: ' . Auth::intendedUrl());
            die();
        }

        $next();
        return true;
    }
}
