<?php

namespace App\Modules\Admin\UserInvite\Services;

use App\Core\Response;
use App\Modules\User\User;
use App\Modules\Admin\UserInvite\UserInvite;

class UserInviteService
{
    public static function create($props=[])
    {
        $email = trim($props['email'] ?? '');
        $user_group_id = $props['user_group_id'] ?? null;

        if ( !$email || !$user_group_id ) return Response::error('Dados inválidos');

        /**
         * Verifica se e-mail já existe
         */
        $getUserByEmail = User::get([
            'where' => [
                ['email', '=', $email]
            ]
        ]);

        if ( $getUserByEmail->error ) return $getUserByEmail;

        $userData = $getUserByEmail->data ?? [];

        if ( count($userData) > 0 ) return Response::error("E-mail já cadastrado");
        
        /**
         * Gera token
         */
        $token = random_bytes(20);
        $token = bin2hex($token);

        /**
         * Gera data de expiração
         */
        $now = date("Y-m-d H:i:s");
        $expire_at = date('Y-m-d H:i:s', strtotime($now. ' + 24 hours'));

        /**
         * Cria convite
         */
        $createInvite = UserInvite::create([
            'email' => $email,
            'token' => $token,
            'user_group_id' => $user_group_id,
            'expire_at' => $expire_at
        ]);

        /**
         * Envia email com convite
         */
        InviteEmail::send([
            'email' => $email,
            'token' => $token,
            'name' => ''
        ]);

        return $createInvite;
    }

    public static function resend($props)
    {
        $invite_id = $props['user_invite_id'] ?? "";

        $getInvite = UserInvite::get([
            'where' => [
                ['user_invite_id', '=', $invite_id]
            ]
        ]);

        if ( $getInvite->error ) return $getInvite;

        $invite = $getInvite->data ?? [];

        if ( count($invite) === 0 ) return Response::error("Convite não encontrado");

        $invite = $invite[0];

        $email = $invite['email'];
        $token = $invite['token'];

        $resend = InviteEmail::send([
            'email' => $email,
            'token' => $token,
            'name' => ''
        ]);

        return $resend;
    }
    
}