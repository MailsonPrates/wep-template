<?php

namespace App\Modules\Login;

use App\Modules\Login\Services\Auth;
use App\Modules\Login\Services\RecoveryEmail;
use App\Modules\LoginPersistent\Services\CreatePersistentLogin;
use App\Modules\User\Services\SaveUser;
use App\Modules\User\Services\UserService;
use App\Modules\User\User;
use Wep\Controller;
use Wep\Router\Http\RouterHttpRequest;
use Wep\Response;
use Wep\Security\RateLimiter;
use Wep\Security\Token;

/**
 * Login, recuperação de senha e troca da senha temporária.
 *
 * - limite de tentativas: 5 por usuário+IP e 30 por IP, a cada 15 minutos;
 * - o ID da sessão é trocado no login (session fixation);
 * - usuário com senha temporária (status "mudar_senha") não entra: é levado para criar a senha;
 * - tokens de recuperação ficam no banco só como hash, com validade (Wep\Security\Token).
 */
class LoginApi
{
    use Controller;

    private const MAX_ATTEMPTS_USER = 5;
    private const MAX_ATTEMPTS_IP = 30;
    private const DECAY = 900;

    public function login(RouterHttpRequest $request, Response $response)
    {
        $username = trim((string) ($request->username ?? ''));
        $password = (string) ($request->password ?? '');
        $keep = filter_var($request->keep ?? false, FILTER_VALIDATE_BOOLEAN);

        $limiter = RateLimiter::make();
        $userKey = 'login:' . mb_strtolower($username) . '|' . $request->ip();
        $ipKey = 'login-ip:' . $request->ip();

        $blocked = $limiter->tooManyAttempts($userKey, self::MAX_ATTEMPTS_USER)
            || $limiter->tooManyAttempts($ipKey, self::MAX_ATTEMPTS_IP);

        if ( $blocked ){
            $wait = max($limiter->availableIn($userKey), $limiter->availableIn($ipKey));
            $minutes = (int) ceil($wait / 60);

            return $response->json(Response::error(
                "Muitas tentativas. Tente novamente em $minutes minuto(s).",
                ['http_code' => 429]
            ));
        }

        $user = Auth::findActiveByUsername($username);

        // compara mesmo quando o usuário não existe: o tempo de resposta não revela usuários válidos
        $password_match = password_verify($password, $user['password'] ?? Auth::DUMMY_HASH);

        if ( !$user || !$password_match ){
            $limiter->hit($userKey, self::DECAY);
            $limiter->hit($ipKey, self::DECAY);

            return $response->json(Response::error("Usuário ou senha incorretos"));
        }

        $limiter->clear($userKey);

        /**
         * Senha temporária: não abre sessão; o usuário cria a própria senha primeiro.
         * (Antes a sessão já ficava logada e, no 2º login, a conta era ativada sem trocar a senha.)
         */
        if ( $user['status'] == 'mudar_senha' ){

            if ( Token::isExpired($user['code'] ?? '') ){
                return $response->json(Response::error("A senha temporária expirou. Peça ao administrador para gerar uma nova."));
            }

            $token = Token::generate();

            User::updateById($user['user_id'], [
                'code' => Token::seal($token, UserService::RECOVERY_TTL)
            ]);

            return $response->json(Response::success([], [
                'redirect' => '/login/recovery/update/' . $token
            ]));
        }

        Auth::login($user);

        if ( $keep ){

            $createSession = CreatePersistentLogin::handle([
                'user_id' => $user['user_id']
            ]);

            if ( $createSession->error ) return $response->json($createSession);
        }

        return $response->json(Response::success([], [
            'redirect' => Auth::intendedUrl()
        ]));
    }

    public function recovery(RouterHttpRequest $request, Response $response)
    {
        $email = trim((string) ($request->email ?? ""));

        $limiter = RateLimiter::make();
        $key = 'recovery:' . $request->ip();

        // a resposta é sempre a mesma (não revela se o e-mail existe)
        if ( $limiter->tooManyAttempts($key, self::MAX_ATTEMPTS_USER) ) return $response->json(Response::success());

        $limiter->hit($key, self::DECAY);

        if ( !$email ) return $response->json(Response::success());

        try {

            $getUser = User::get([
                'where' => [
                    ['email', '=', $email]
                ],
                'limit' => 1
            ]);

            $user = $getUser->data[0] ?? null;

            if ( $getUser->error || !$user ) return $response->json(Response::success());

            $token = Token::generate();

            $updateUser = User::updateById($user['user_id'], [
                'code' => Token::seal($token, UserService::RECOVERY_TTL)
            ]);

            if ( $updateUser->error ) return $response->json(Response::error("Houve um erro, tente novamente"));

            RecoveryEmail::send([
                'token' => $token,
                'email' => $user['email'],
                'name' => $user['firstname']
            ]);

            return $response->json(Response::success());

        } catch (\Throwable $th) {
            return $response->json(Response::success());
        }
    }

    public function handleUpdatePassword(RouterHttpRequest $request, Response $response)
    {
        $password = (string) ($request->password ?? "");
        $code = (string) ($request->code ?? "");

        if ( !$password || !$code ) return $response->json(Response::error("Dados inválidos"));

        $user = Auth::findByToken($code);

        if ( !$user ) return $response->json(Response::error("Expirado! Solicite a recuperação da senha novamente"));

        try {

            $save = SaveUser::handle([
                'no_email' => !$user['email'],
                'user_id' => $user['user_id'],
                'username' => $user['username'],
                'email' => $user['email'] ?? '',
                'user_group_id' => $user['user_group_id'],
                'firstname' => $user['firstname'],
                'lastname' => $user['lastname'],
                'password' => $password,
                'code' => '',
                'status' => 'ativado'
            ]);

            return $response->json($save);

        } catch (\Throwable $th) {
            return $response->json(Response::error($th->getMessage()));
        }
    }

    public function validateRecoveryCode(RouterHttpRequest $request, Response $response)
    {
        $code = (string) ($request->code ?? "");

        if ( !$code ) return $response->json(Response::error("Dados inválidos"));

        if ( !Auth::findByToken($code) ) return $response->json(Response::error("Token expirado ou não existe!"));

        return $response->json(Response::success());
    }
}
