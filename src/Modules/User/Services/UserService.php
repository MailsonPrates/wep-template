<?php

namespace App\Modules\User\Services;

use App\Core\Image;
use App\Modules\User\User as Model;
use App\Core\Response;
use App\Modules\Login\Services\RecoveryEmail;

class UserService
{
    public static function get($props=[])
    {
        $query = [
            'fields' => [
                'user.*', 
                'user_group.name AS user_group_name'
            ],
            'leftJoin' => ['user_group', 'user_group_id', 'user.user_group_id'],
            'orderBy' => ["user_id", "DESC"]
        ];

        if ( isset($props['user_id']) ) {
            $query['where'] = [
                ['user_id', '=', $props['user_id']]
            ];
        }

        $getUsers = Model::get($query);

        if ( $getUsers->error ) return $getUsers;

        foreach($getUsers->data as $key => $item){

            unset($getUsers->data[$key]['password']);
            
            if ( $item['profile_image'] ){

                $getUsers->data[$key]['profile_images'] = [
                    'small' => Image::get($item['profile_image'], 36, 36),
                    'medium' => Image::get($item['profile_image'], 200, 200)
                ];

            } else {
                $getUsers->data[$key]['profile_images'] = false;
            }

            unset($getUsers->data[$key]['profile_image']);
        }

        return $getUsers;
    }

    public static function save($data=[])
    {
        try {

            $user_id = $data['user_id'] ?? "";
            $is_no_email_flux = $data['no_email'] ?? false;
            $password = $data['password'] ?? "";
            $status = 'ativado';
            $nickname = $data['nickname'] ?? "";

            // Quando é fluxo de create sem e-mail
            if ( $is_no_email_flux && !$user_id ){
                $password = 'mudar123';
                $status  = 'mudar_senha';
            }
            
            $save = SaveUser::handle([
                'no_email' => $is_no_email_flux,
                'user_id' => $user_id,
                'username' => $data['username'] ?? "",
                'email' => $data['email'] ?? "",
                'firstname' => $data['firstname'] ?? "",
                'lastname' => $data['lastname'] ?? "",
                'password' => $password,
                'nickname' => $nickname,
                'status' => $status,
                'user_group_id' => $data['user_group_id'] 
            ]);
            
            return $save;

        } catch (\Throwable $th) {
            return Response::error($th->getMessage());
        }
    }

    public static function resetPassword($data=[])
    {
        $user_id = $data['user_id'] ?? null;

        if ( !$user_id ) return Response::error("Usuário inválido");

        $getUser = Model::get([
            'where' => [
                ['user_id', '=', $user_id]
            ]
        ]);

        if ( $getUser->error ) return $getUser;

        $userData = $getUser->data[0] ?? [];

        if ( count($userData) === 0 ) return Response::error("Usuário inválido");

        try {
            
            $email = $userData['email'] ?? "";

            if ( $email ){

                /**
                 * Gera code
                 */
                $token = random_bytes(20);
                $token = bin2hex($token);

                /**
                 * Salva code no usuário
                 */
                $updateUser = Model::update([
                    'fields' => [
                        'code' => $token
                    ],
                    'where' => [
                        ['user_id', '=', $user_id]
                    ]
                ]);

                if ( $updateUser->error ) return Response::error("Houve um erro, tente novamente");

                /**
                 * Envia e-mail de redefinição
                 */
                $send = RecoveryEmail::send([
                    'email' => $email,
                    'token' => $token,
                    'name' => ''
                ]);

                if ( $send->error ) return $send;

                return Response::success([], [
                    "message" => "E-mail de redefinição de senha enviado"
                ]);
            }
            
            $save = SaveUser::handle([
                'no_email' => true,
                'user_id' => $user_id,
                'username' => $userData['username'] ?? "",
                'email' => $userData['email'] ?? "",
                'firstname' => $userData['firstname'] ?? "",
                'lastname' => $userData['lastname'] ?? "",
                'user_group_id' => $userData['user_group_id'] ?? "",
                'password' => 'mudar123',
                'status' => 'mudar_senha'
            ]);

            if ( $save->error ) return $save;
            
            return Response::success([], ["message" => "Senha temporária:<br><b>mudar123</b>"]);

        } catch (\Throwable $th) {
            Response::error($th->getMessage());
        }
    }

    public static function delete($data=[])
    {
        return Model::delete($data);
    }
}