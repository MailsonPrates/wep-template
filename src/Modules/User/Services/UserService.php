<?php

namespace App\Modules\User\Services;

use App\Core\Image;
use App\Modules\User\User as Model;
use App\Core\Response;
use Wep\Security\Token;
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

            // "code" é o token de recuperação de senha: não vai para o front
            unset($getUsers->data[$key]['code']);
            
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

    /** Validade da senha temporária (primeiro acesso). */
    public const TEMP_PASSWORD_TTL = 72 * 3600;

    /** Validade do link de recuperação de senha. */
    public const RECOVERY_TTL = 3600;

    /**
     * Cria ou atualiza um usuário pelo admin.
     *
     * Sem e-mail (criação): gera uma senha temporária aleatória, válida por 72h, que precisa ser
     * trocada no primeiro acesso. Ela é devolvida uma única vez na resposta, para o admin repassar.
     * (Antes era sempre "mudar123".)
     */
    public static function save($data=[])
    {
        try {

            $user_id = $data['user_id'] ?? "";
            $is_no_email_flux = $data['no_email'] ?? false;
            $password = $data['password'] ?? "";
            $status = 'ativado';
            $nickname = $data['nickname'] ?? "";
            $code = null;

            // Quando é fluxo de create sem e-mail
            if ( $is_no_email_flux && !$user_id ){
                $password = Token::password();
                $status  = 'mudar_senha';
                $code = Token::seal(Token::generate(), self::TEMP_PASSWORD_TTL);
            }

            $fields = [
                'no_email' => $is_no_email_flux,
                'user_id' => $user_id,
                'username' => $data['username'] ?? "",
                'email' => $data['email'] ?? "",
                'firstname' => $data['firstname'] ?? "",
                'lastname' => $data['lastname'] ?? "",
                'password' => $password,
                'nickname' => $nickname,
                'status' => $status,
                'user_group_id' => $data['user_group_id'] ?? ""
            ];

            if ( $code ) $fields['code'] = $code;

            $save = SaveUser::handle($fields);

            if ( $save->error || !$code ) return $save;

            return Response::success([], [
                "message" => "Senha temporária (válida por 72h, mostrada só agora): " . $password
            ]);

        } catch (\Throwable $th) {
            return Response::error($th->getMessage());
        }
    }

    /**
     * Reset de senha pelo admin: com e-mail, envia o link de recuperação (válido por 1h);
     * sem e-mail, gera uma nova senha temporária aleatória (válida por 72h).
     */
    public static function resetPassword($data=[])
    {
        $user_id = $data['user_id'] ?? null;

        if ( !$user_id ) return Response::error("Usuário inválido");

        $getUser = Model::find($user_id);

        if ( $getUser->error ) return $getUser;

        $userData = $getUser->data;

        if ( !$userData ) return Response::error("Usuário inválido");

        try {

            $email = $userData['email'] ?? "";

            if ( $email ){

                $token = Token::generate();

                $updateUser = Model::updateById($user_id, [
                    'code' => Token::seal($token, self::RECOVERY_TTL)
                ]);

                if ( $updateUser->error ) return Response::error("Houve um erro, tente novamente");

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

            $password = Token::password();

            $save = SaveUser::handle([
                'no_email' => true,
                'user_id' => $user_id,
                'username' => $userData['username'] ?? "",
                'email' => $userData['email'] ?? "",
                'firstname' => $userData['firstname'] ?? "",
                'lastname' => $userData['lastname'] ?? "",
                'user_group_id' => $userData['user_group_id'] ?? "",
                'password' => $password,
                'status' => 'mudar_senha',
                'code' => Token::seal(Token::generate(), self::TEMP_PASSWORD_TTL)
            ]);

            if ( $save->error ) return $save;

            return Response::success([], [
                "message" => "Senha temporária (válida por 72h, mostrada só agora): " . $password
            ]);

        } catch (\Throwable $th) {
            return Response::error($th->getMessage());
        }
    }

    /**
     * @param string|int $userId
     */
    public static function delete($userId)
    {
        return Model::deleteById($userId);
    }
}