<?php
 
/**
 * -----------------------------------------------
 *  ATENÇÃO: sempre que atualizar esse arquivo,
 *  execute o comando abaixo no terminal:
 *  >>> php app update
 * -----------------------------------------------
 */
 
return [
    'middlewares' => [
        'logout' => 'Logout',
        'IsAlreadyLogged' => 'IsAlreadyLogged'
    ],
    'constants' => [],
    'title' => 'Login',
    'routes' => [
        'path' => '/login',
        'groups' => [
            [
                'path' => '/',
                'view' => 'index.js',
                'use_middlewares' => ['IsAlreadyLogged']
            ],
            [
                'path' => '/logout',
                'use_middlewares' => ['logout'],
                'view' => 'logout.js',
                'label' => 'Logout'
            ],
            [
                'path' => '/recovery',
                'view' => '/recovery/index.js',
                'label' => 'Recuperação'
            ],
            [
                "path" => "/recovery",
                "method" => "recovery",
                'label' => 'faz recuperação'
            ],
            [
                'path' => '/recovery/update/{code}',
                'view' => '/recovery/RecoveryUpdate',
                'label' => 'Cria nova senha'
            ],
            [
                'path' => '/recovery/validate',
                'method' => 'validateRecoveryCode',
                'label' => 'valida código'
            ],
            [
                'path' => '/recovery/update',
                'method' => 'handleUpdatePassword',
                'label' => 'atualiza senha'
            ],
            [
                "path" => "/login",
                "method" => "login",
                'label' => 'faz login'
            ]
        ]
    ]
];