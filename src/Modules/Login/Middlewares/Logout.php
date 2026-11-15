<?php
    
namespace App\Modules\Login\Middlewares;
    
use Wep\Http\iMiddleware;
use Wep\Session;
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