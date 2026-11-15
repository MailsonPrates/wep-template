<?php

namespace App\Modules\LoginPersistent\Services;

use App\Modules\LoginPersistent\LoginPersistent;
use DateTime;

class ValidatePersistentLogin
{
    /**
     * Valida o cookie "lembrar-me" e troca o token (rotação a cada uso).
     *
     * @return int|string|false user_id ou false
     */
    public static function handle()
    {
        $cookie = CreatePersistentLogin::readCookie();

        if ( !$cookie ){
            // cookie malformado (antes gerava warning no explode)
            if ( isset($_COOKIE[CreatePersistentLogin::COOKIE]) ) CreatePersistentLogin::forgetCookie();

            return false;
        }

        [$selector, $token] = $cookie;

        $getSession = LoginPersistent::get([
            'where' => [
                ['selector', '=', $selector]
            ],
            'limit' => 1
        ]);

        $session = $getSession->data[0] ?? null;

        if ( $getSession->error || !$session ) return self::reject();

        $is_on_time = new DateTime() < new DateTime($session['expires_at']);
        $is_valid_token = hash_equals($session['token_hash'], hash('sha256', $token));

        if ( !$is_on_time || !$is_valid_token ){

            // selector certo com token errado: o cookie pode ter sido copiado; invalida o registro
            LoginPersistent::delete([
                'where' => [['id', '=', $session['id']]]
            ]);

            return self::reject();
        }

        /**
         * Rotação: novo selector e token a cada uso
         */
        $token = bin2hex(random_bytes(32));
        $selector = bin2hex(random_bytes(16));

        $update = LoginPersistent::update([
          'fields' => [
            'selector' => $selector,
            'token_hash' => hash('sha256', $token)
          ],
          'where' => [
            ['id', '=', $session['id']]
          ]
        ]);

        if ( $update->error ) return false;

        CreatePersistentLogin::setCookie($selector . ':' . $token, (new DateTime($session['expires_at']))->getTimestamp());

        return $session['user_id'];
    }

    private static function reject(): bool
    {
        CreatePersistentLogin::forgetCookie();
        return false;
    }
}
