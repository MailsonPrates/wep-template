<?php

namespace App\Modules\LoginPersistent\Services;

use App\App;
use App\Core\Response;
use App\Modules\LoginPersistent\LoginPersistent;

class CreatePersistentLogin
{

    public static function handle($props=[])
    {
        $token = bin2hex(random_bytes(32));
        $selector = bin2hex(random_bytes(16));
        $token_hash = hash('sha256', $token);
        $expires = date('Y-m-d H:i:s', strtotime('+30 days'));

        $save = LoginPersistent::create([
            'selector' => $selector,
            'token_hash' => $token_hash,
            'user_id' => $props['user_id'],
            'expires_at' => $expires
        ]);

        if ( $save->error ) return $save;

        self::setCookie($selector, $token);

        return Response::success();
    }

    public static function setCookie($selector, $token)
    {
        $cookie_value = $selector . ':' . $token;

        setcookie(
            'remember_me',
            $cookie_value,
            time() + (86400 * 30), // 30 dias
            '/',
            str_replace("https://", "", App::config("env", "APP_URL")), // Domínio
            true, // Somente HTTPS
            true  // Apenas HTTP (não acessível por JavaScript)
        );
    }

}