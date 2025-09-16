<?php

namespace App\Modules\User\Services;

use App\Modules\User\User;

class SaveUser
{

    public static function handle($data=[])
    {
        $data['user_id'] = $data['user_id'] ?? '';
        $is_update = isset($data['user_id']) && $data['user_id'] ? $data['user_id'] : false;
        $is_no_email_flux = false;

        if ( isset($data['no_email']) ){
            $is_no_email_flux = $data['no_email'];
            unset($data['no_email']);
        }

        // Faz checks
        Username::check($data['username'], $data['user_id']);

        if ( !$is_no_email_flux ){
            Email::check($data['email'], $data['user_id']);
        }
       

        // Update
        if ( $is_update ) {

            if ( empty($data['password']) ){
                unset($data['password']);
            } else {
                $data['password'] = password_hash(html_entity_decode($data['password'], ENT_QUOTES, 'UTF-8'), PASSWORD_DEFAULT);
            }

            return User::update([
                'fields' => $data,
                'where' => ['user_id', "=", $data['user_id']]
            ]);
        }

        // Create
        $data['password'] = password_hash(html_entity_decode($data['password'], ENT_QUOTES, 'UTF-8'), PASSWORD_DEFAULT);

        return User::create([
            'fields' => $data
        ]);
    }
}