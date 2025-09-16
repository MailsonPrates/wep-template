<?php

namespace App\Modules\User\Services;

use App\Modules\User\User;
use Exception;

class Username 
{
    public static function check($username="", $user_id=null)
    {
        /**
         * Valida conteudo
         */
        if ( !$username ) throw new Exception('Nome de usuário inválido');

        /**
         * Busca dados
         */
        $props = [
            'where' => [
                ['username', '=', $username]
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
        if ( count($result) > 0 ) throw new Exception("Nome de usuário já existe");

        /**
         * @todo Valida formatação
         */

        return true;
    }
}