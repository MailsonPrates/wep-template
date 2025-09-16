<?php
 
namespace App\Modules\Admin\UserInvite;
 
use App\Core\Controller;
use App\Core\Response;
use App\Modules\Admin\UserGroup\UserGroup;
use App\Modules\User\Services\SaveUser;
use App\Modules\User\Services\Username;
use App\Modules\Admin\UserInvite\Services\UserInviteService;

/**
 * Classe controller responsável por implementar métodos
 * que lidam com as requisições vindas do front
 */
class UserInviteApi
{
    use Controller;

    public function get($request, $response)
    {
        $data = $request->data();

        $getUserInvite = UserInvite::get($data);

        if ( !$getUserInvite->error ){

            foreach($getUserInvite->data as $index => $item){

                $getUserGroup = UserGroup::get([
                    'fields' => ['name'],
                    'where' => [
                        ['user_group_id', "=", $item['user_group_id']]
                    ]
                ]);

                $getUserInvite->data[$index]['user_group_name'] = $getUserGroup->data[0]['name'] ?? "";
            }
        }
       
        return $response->json($getUserInvite);
    }
 
    public function validate($request, $response, $userInvite)
    {
        $token = $request->token ?? null;

        if ( !$token ) return $response->json(Response::error("Convite inválido"));

        try {
            
            /**
             * Busca convite
             */
            $getInvite = $userInvite::get([
                'where' => [
                    ['token', '=', $token]
                ]
            ]);

            if ( $getInvite->error ) return $response->json($getInvite);

            $invite = $getInvite->data ?? [];

            if ( count($invite) === 0 ) return $response->json(Response::error("Convite não encontrado"));

            $invite = $invite[0];

            /**
             * Verifica status
             */
            $status = $invite['status'];
           
            if ( $status != "pending" ){

                $status_message = [
                    'cancelled' => 'Convite cancelado',
                    'used' => 'Convite já foi utilizado',
                    'expired' => 'Convite expirado!'
                ];

                $message = $status_message[$status];

                return $response->json(Response::error($message));
            }

            /**
             * Verifica expiração
             */
            $expire_at = new \DateTime($invite['expire_at']);
            $now = new \DateTime("now");
            $is_expired = $expire_at < $now;

            if ( $is_expired ) return $response->json(Response::error('Convite expirou!'));


            return $response->json(Response::success());


        } catch (\Throwable $th) {
            return $response->json(Response::error($th->getMessage()));
        }
    }

    public function registerUser($request, $response, $userInvite)
    {
        $data = $request->data();
        $token = $request->token;

        try {

            /**
             * Busca convite
             */
            $getInvite = $userInvite::get([
                'where' => [
                    ['token', '=', $token]
                ]
            ]);

            if ( $getInvite->error ) return $response->json($getInvite);

            $invite = $getInvite->data ?? [];

            if ( count($invite) === 0 ) return $response->json(Response::error("Convite não encontrado"));

            $invite = $invite[0];
            
            $registerUser = SaveUser::handle([
                'username' => $data['username'] ?? "",
                'email' => $invite['email'] ?? "",
                'user_group_id' => $invite['user_group_id'] ?? "",
                'firstname' => $data['firstname'] ?? "",
                'lastname' => $data['lastname'] ?? "",
                'password' => $data['password'] ?? "",
                'active' => 1
            ]);

            if ( !$registerUser->error ){

                /**
                 * Altera status do convite
                 */
                $userInvite::update([
                    'fields' => [
                        'status' => 'used'
                    ],
                    'where' => [
                        ['token', '=', $token]
                    ]
                ]);
            }
            
            return $response->json($registerUser);

        } catch (\Throwable $th) {
            return $response->json(Response::error($th->getMessage()));
        }
    }

    public function validateUsername($request, $response)
    {
        $username = $request->username ?? "";

        try {
            Username::check($username);

            return $response->json(Response::success());

        } catch (\Throwable $th) {
            return $response->json(Response::error($th->getMessage()));
       }
    }

    public function create($request, $response)
    {
        $data = $request->data();
        $fields = $data['fields'];
        return $response->json(UserInviteService::create($fields));
    }

    public function resend($request, $response)
    {
        $data = $request->data();
        return $response->json(UserInviteService::resend($data));
    }

}