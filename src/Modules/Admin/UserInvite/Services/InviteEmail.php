<?php

namespace App\Modules\Admin\UserInvite\Services;

use App\Modules\Vendor\SendPulse\SendPulse;

class InviteEmail
{
    public static function send($props=[])
    {
        $mailer = SendPulse::resource('smtp');

        return $mailer->send([
            'fields' => [
                'email' => (object)[
                    'subject' => 'Você recebeu um convite',
                    'template' => [
                        'id' => 1679,
                        'variables' => [
                            'token' => $props['token']
                        ]
                    ],
                    'from' => [
                        'name' => 'Manager App',
                        'email' => 'admin@manager.epack.app'
                    ],
                    'to' => [
                        [
                            'email' => $props['email'],
                            'name' => $props['name']
                        ]
                    ]
                ]
            ]
        ]);
    }
}