<?php
    
namespace App\Modules\Login\Middlewares;
    
use App\Core\Http\iMiddleware;
use App\Core\Session;
use App\Modules\LoginPersistent\Services\DestroyPersistentLogin;

class Logout implements iMiddleware
{
    /**
    * @param Request $request
    * @param \Closure $next
    */
    public function handle($request, $next)
    {
        Session::start();
        Session::end();

        DestroyPersistentLogin::handle();

        header('Location: /login');
        die();
    }
}