<?php

namespace App\Modules\LoginPersistent\Services;

use App\Modules\LoginPersistent\LoginPersistent;
use DateTime;

class ValidatePersistentLogin
{
    public static function handle()
    {
        if ( !isset($_COOKIE['remember_me']) ) return false;

        list($selector, $token) = explode(':', $_COOKIE['remember_me']);
        
        $getSession = LoginPersistent::get([
            'where' => [
                ['selector', '=', $selector]
            ]
        ]);

        if ( $getSession->error ) return false;

        $session = $getSession->data[0] ?? [];

        if ( !isset($session['expires_at']) ) return false;

        /**
         * Verifica expiração
         */
        $is_on_time = new DateTime() < new DateTime($session['expires_at']);

        if ( !$is_on_time ) return false;

        /**
         * Valida tpken
         */
        $is_valid_token = hash_equals($session['token_hash'], hash('sha256', $token));

        if ( !$is_valid_token ) return;


        /**
         * Atualiza banco de dados e cookie
         */
        $token = bin2hex(random_bytes(32));
        $selector = bin2hex(random_bytes(16));
        $token_hash = hash('sha256', $token);

        $update = LoginPersistent::update([
          'fields' => [
            'selector' => $selector,
            'token_hash' => $token_hash
          ],
          'where' => [
            ['id', '=', $session['id']]
          ]
        ]);

        if ( $update->error ) return false;

        CreatePersistentLogin::setCookie($selector, $token);

        return $session['user_id'];
    }
}