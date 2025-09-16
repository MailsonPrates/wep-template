<?php

namespace App\Modules\Login\Services;

use App\Modules\Vendor\SendPulse\SendPulse;

class RecoveryEmail
{
    public static function send($props=[])
    {
        $mailer = SendPulse::resource('smtp');

        return $mailer->send([
            'fields' => [
                'email' => (object)[
                    'subject' => 'Redefina a sua senha',
                    'template' => [
                        'id' => 1677,
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