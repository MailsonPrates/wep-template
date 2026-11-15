<?php

namespace App\Modules\LoginPersistent\Services;

use App\Modules\LoginPersistent\LoginPersistent;

class DestroyPersistentLogin
{
    /**
     * Apaga o registro do "lembrar-me" e o cookie.
     * (Antes o cookie era "apagado" com o domínio example.com e continuava no navegador.)
     */
    public static function handle()
    {
        $cookie = CreatePersistentLogin::readCookie();

        if ( $cookie ){
            LoginPersistent::delete([
                'where' => [
                    ['selector', '=', $cookie[0]]
                ]
            ]);
        }

        if ( isset($_COOKIE[CreatePersistentLogin::COOKIE]) ){
            CreatePersistentLogin::forgetCookie();
        }
    }
}
