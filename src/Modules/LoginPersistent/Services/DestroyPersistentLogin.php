<?php

namespace App\Modules\LoginPersistent\Services;

use App\Modules\LoginPersistent\LoginPersistent;
use DateTime;

class DestroyPersistentLogin
{
    public static function handle()
    {
        if ( !isset($_COOKIE['remember_me']) ) return;

        list($selector, $token) = explode(':', $_COOKIE['remember_me']);
        
        LoginPersistent::delete([
            'where' => [
                ['selector', '=', $selector]
            ]
        ]);

        setcookie('remember_me', '', time() - 3600, '/', 'example.com', true, true);
    }
}