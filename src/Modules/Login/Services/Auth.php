<?php

namespace App\Modules\Login\Services;

use App\Modules\User\User;
use Wep\Security\Token;
use Wep\Session;

/**
 * Funções de autenticação compartilhadas por login, "lembrar-me" e middlewares.
 */
class Auth
{
    /**
     * Hash de uma senha qualquer: usado no password_verify quando o usuário não existe, para que
     * o tempo de resposta não revele quais usuários existem.
     */
    public const DUMMY_HASH = '$2y$10$QPcns29fAuIjQ6ngHB7gtetMI02DouSMefxYDyEtfwDDkhMEGsKrW';

    /**
     * Usuário ativo (ou com senha temporária) pelo username.
     */
    public static function findActiveByUsername(string $username): ?array
    {
        if ( $username === '' ) return null;

        $getUser = User::get([
            'where' => [
                ['username', '=', $username],
                ['status', 'in', ['ativado', 'mudar_senha']]
            ],
            'limit' => 2
        ]);

        $users = $getUser->data ?? [];

        // username é único: mais de um registro indica dado inconsistente, então não autentica
        return !$getUser->error && count($users) === 1 ? $users[0] : null;
    }

    /**
     * Usuário dono de um token de recuperação válido (não expirado).
     */
    public static function findByToken(string $token): ?array
    {
        if ( !preg_match('/^[a-f0-9]{64}$/', $token) ) return null;

        $getUser = User::get([
            'where' => [
                ['code', 'like', Token::lookup($token)]
            ],
            'limit' => 1
        ]);

        $user = $getUser->data[0] ?? null;

        return $user && Token::verify($user['code'], $token) ? $user : null;
    }

    /**
     * Abre a sessão do usuário, com um ID de sessão novo.
     */
    public static function login(array $user): void
    {
        Session::start();

        // troca o ID: um ID plantado antes do login (session fixation) deixa de valer
        Session::regenerate();

        Session::set('user_id', $user['user_id']);
        Session::set('user_group_id', $user['user_group_id'] ?? null);
        Session::forget('user_data');
    }

    /**
     * Para onde ir depois do login: a página que o usuário tentou acessar, se for um caminho
     * interno. "//site.com" e "https://..." não são aceitos (open redirect).
     */
    public static function intendedUrl(string $default = '/'): string
    {
        $uri = (string) Session::get('uri', '');

        return self::isSafePath($uri) ? $uri : $default;
    }

    public static function isSafePath(string $path): bool
    {
        return $path !== ''
            && $path[0] === '/'
            && !str_starts_with($path, '//')
            && !str_contains($path, '\\')
            && !preg_match('/[\x00-\x1F]/', $path);
    }
}
