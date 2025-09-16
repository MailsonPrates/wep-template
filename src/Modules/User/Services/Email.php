<?php

namespace App\Modules\User\Services;

use App\Modules\User\User;
use Exception;

class Email 
{
    public static function check($email="", $user_id=null)
    {
        /**
         * Valida conteudo
         */
        if ( !$email ) throw new Exception('E-mail inválido');

        /**
         * @todo Valida formatação
         */


        /**
         * Busca dados
         */
        $props = [
            'where' => [
                ['email', '=', $email]
            ]
        ];

        if ( $user_id ){
            $props['where'][] = ['user_id', '!=', $user_id];
        }

        $get_user = User::get($props);

        if ( $get_user->error ) throw new Exception($get_user->message);

        $result = $get_user->data ?? [];

        /**
         * Valida duplicidade
         */
        if ( count($result) > 0 ) throw new Exception("E-mail já cadastrado");

        return true;
    }
}