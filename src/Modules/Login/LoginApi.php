<?php
 
namespace App\Modules\Login;
 
use App\Core\Controller;
use App\Core\Response;
use App\Core\Session;
use App\Modules\Login\Services\RecoveryEmail;
use App\Modules\User\Services\SaveUser;
use App\Modules\User\User;
use App\Modules\LoginPersistent\Services\CreatePersistentLogin;

/**
 * Classe controller responsável por implementar métodos
 * que lidam com as requisições vindas do front
 */
class LoginApi
{
    use Controller;
 
    public function login($request, $response)
    {
        $username = $request->username;
        $password = $request->password;
        $keep = $request->keep ?? false;

        /**
         * Busca dados do usuário
         */
        $getUser = User::get([
            'where' => [
                ['username', '=', $username],
                ['status', 'in', ['ativado', 'mudar_senha']]
            ]
        ]);

        if ( $getUser->error ) return $response->json($getUser);

        $user_data = $getUser->data ?? [];
        $user_counter = count($user_data);

        if ( $user_counter > 1 || $user_counter === 0 ) return $response->json(Response::error("Usuário ou senha incorretos"));

        $user = $user_data[0];

        /**
         * Valida senha
         */
        $password_match = password_verify($password, $user['password']);

        if ( !$password_match ) return $response->json(Response::error("Usuário ou senha incorretos"));

        /**
         * Remove code se houver
         */
        $user_code = $user['code'] ?? "";

        if ( $user_code ){
            User::update([
                'fields' => [
                    'code' => ""
                ],
                'where' => [
                    ['user_id', '=', $user['user_id']]
                ]
            ]);
        }

        
        /**
         * Adiciona dados do usuário na sessão
         */
        Session::start();
        Session::set('user_id', $user['user_id']);
        Session::set('user_group_id', $user['user_group_id']);

        $uri_to_redirect = Session::get("uri", "/");

        /**
         * Adiciona code quando o usuário 
         * foi cadastrado com senha temporária
         */

        if ( $user['status'] == 'mudar_senha' ){

            // Atualiza status do usuário
            // quando senha temporaria já foi atualizada
            if ( $user['code'] ){

                User::update([
                    'fields' => [
                        'status' => 'ativado'
                    ],
                    'where' => [
                        ['user_id', '=', $user['user_id']]
                    ]
                ]);

                Session::set('user_code', "");

                return $response->json(Response::success([], [
                    'redirect' => "/"
                ]));
            }

            // Incluir usuário ao fluxo de redefinir a senha

            $code = random_bytes(20);
            $code = bin2hex($code);

            User::update([
                'fields' => [
                    'code' => $code
                ],
                'where' => [
                    ['user_id', '=', $user['user_id']]
                ]
            ]);

            Session::set('user_code', $code);

            return $response->json(Response::success([], [
                'redirect' => '/login/recovery/update/'.$code
            ]));

        }

        /**
         * Lida com login persistente
         */
        if ( $keep ){

            $createSession = CreatePersistentLogin::handle([
                'user_id' => $user['user_id']
            ]);

            if ( $createSession->error ) return $response->json($createSession);
        }
        
        return $response->json(Response::success([], [
            'redirect' => $uri_to_redirect
        ]));
    }

    public function recovery($request, $response)
    {
        $email = $request->email ?? "";

        try {

            /**
             * Busca dados do usuário
             */
            $getUser = User::get([
                'where' => [
                    ['email', '=', $email]
                ]
            ]);

            if ( $getUser->error ) return $response->json(Response::error("Houve um erro, tente novamente"));

            $userData = $getUser->data ?? [];
            $user_not_exist = count($userData) === 0;
            
            if ( $user_not_exist ) return $response->json(Response::success());

            $user = $userData[0];
            
            /**
             * Gera code
             */
            $token = random_bytes(20);
            $token = bin2hex($token);

            /**
             * Salva code no usuário
             */
            $updateUser = User::update([
                'fields' => [
                    'code' => $token
                ],
                'where' => [
                    ['user_id', '=', $user['user_id']]
                ]
            ]);

            if ( $updateUser->error ) return $response->json(Response::error("Houve um erro, tente novamente"));

            /**
             * Envia e-mail de redefinição
             */
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

    public function handleUpdatePassword($request, $response)
    {
        $password = $request->password ?? "";
        $code = $request->code ?? "";

        if ( !$password || !$code ) return $response->json(Response::error("Dados inválidos"));
        
        /**
         * Busca dados do usuário
         */
        $getUser = User::get([
            'where' => [
                ['code', '=', $code]
            ]
        ]);

        $userData = $getUser->data ?? [];
        $code_not_found = count($userData) === 0;

        if ( $code_not_found ) return $response->json(Response::error("Expirado! Solicite a recuperação da senha novamente"));

        $user = $userData[0];

        /**
         * Atualiza senha
         */
        try {

            $is_no_email_flux = $user['email'] ? false : true;

            SaveUser::handle([
                'no_email' => $is_no_email_flux,
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

            return $response->json(Response::success());

        } catch (\Throwable $th) {
            return $response->json(Response::error($th->getMessage()));
        }

        return $response->json($getUser);
    }

    public function validateRecoveryCode($request, $response)
    {
        $code = $request->code ?? "";

        if ( !$code ) return $response->json(Response::error("Dados inválidos"));
        
        /**
         * Busca dados do usuário
         */
        $getUser = User::get([
            'where' => [
                ['code', '=', $code]
            ]
        ]);

        $userData = $getUser->data ?? [];
        $code_not_found = count($userData) === 0;

        if ( $code_not_found ) return $response->json(Response::error("Token expirado ou não existe!"));

        return $response->json(Response::success());
    }
}