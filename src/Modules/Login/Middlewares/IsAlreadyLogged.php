<?php
    
namespace App\Modules\Login\Middlewares;
    
use App\Core\Http\iMiddleware;
use App\Core\Session;

class IsAlreadyLogged implements iMiddleware
{
    /**
    * @param Request $request
    * @param \Closure $next
    */
    public function handle($request, $next)
    {
        Session::start();
        
        if ( Session::get("user_id") ){
            header('Location: ' . Session::get("uri", "/"));
            die();
        }

        $next();
        return true;
    }
}