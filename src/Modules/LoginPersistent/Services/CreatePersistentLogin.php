<?php

namespace App\Modules\LoginPersistent\Services;

use App\Modules\LoginPersistent\LoginPersistent;
use Wep\Response;
use Wep\Router\Http\RouterHttpRequest;

/**
 * "Lembrar-me": cookie remember_me = "<selector>:<token>". No banco ficam o selector e o
 * hash do token (quem lê o banco não consegue montar um cookie válido).
 */
class CreatePersistentLogin
{
    public const COOKIE = 'remember_me';

    public const TTL = 86400 * 30; // 30 dias

    public static function handle($props=[])
    {
        $token = bin2hex(random_bytes(32));
        $selector = bin2hex(random_bytes(16));

        // limpa os registros vencidos (antes acumulavam para sempre)
        LoginPersistent::delete([
            'where' => [['expires_at', '<', date('Y-m-d H:i:s')]]
        ]);

        $save = LoginPersistent::create([
            'fields' => [
                'selector' => $selector,
                'token_hash' => hash('sha256', $token),
                'user_id' => $props['user_id'],
                'expires_at' => date('Y-m-d H:i:s', time() + self::TTL)
            ]
        ]);

        if ( $save->error ) return $save;

        self::setCookie($selector . ':' . $token, time() + self::TTL);

        return Response::success();
    }

    /**
     * Cookie do domínio atual (host-only), HttpOnly, SameSite=Lax e Secure em HTTPS.
     * Antes o domínio vinha de um str_replace no APP_URL ("http://..." ou com caminho quebrava).
     */
    public static function setCookie(string $value, int $expires): void
    {
        if ( headers_sent() ) return;

        setcookie(self::COOKIE, $value, [
            'expires' => $expires,
            'path' => '/',
            'domain' => '',
            'secure' => RouterHttpRequest::isHttps(),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }

    public static function forgetCookie(): void
    {
        self::setCookie('', time() - 3600);
        unset($_COOKIE[self::COOKIE]);
    }

    /**
     * Lê o cookie e valida o formato.
     *
     * @return array{0: string, 1: string}|null [selector, token]
     */
    public static function readCookie(): ?array
    {
        $value = $_COOKIE[self::COOKIE] ?? '';

        if ( !is_string($value) || !preg_match('/^([a-f0-9]{32}):([a-f0-9]{64})$/', $value, $m) ) return null;

        return [$m[1], $m[2]];
    }
}
