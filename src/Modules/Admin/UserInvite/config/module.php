<?php
 
/**
 * -----------------------------------------------
 *  ATENÇÃO: sempre que atualizar esse arquivo,
 *  execute o comando abaixo no terminal:
 *  >>> php app update
 * -----------------------------------------------
 */
 
return [
    'db' => [
        'table' => 'user_invite',
    ],
    // CRUD automático: o front só envia id e campos (contrato em Wep\Api\ClientPayload)
    'api' => [
        'primary_key' => 'user_invite_id',
        'order_by' => ['user_invite_id', 'DESC'],
    ],
    'middlewares' => [],
    'constants' => [],
    'title' => "Convite de usuários",
    'routes' => [
        'path' => '/admin/user/invite',
        'methods' => ['get', 'create', 'update', 'delete'],
        'use_middlewares' => ['isLogged', 'checkPermission'],
        'groups' => [
            [
                'path' => '/',
                'view' => 'index.js'
            ],
            [
                'path' => '/create',
                'view' => 'UserInviteCreate',
            ],
            /**
             * Cadastro do convidado: público (quem recebe o convite ainda não tem conta).
             * Antes exigia login, então o cadastro por convite não funcionava. A proteção é o
             * token do convite (validado em cada chamada) e o limite de tentativas por IP.
             */
            [
                'path' => '/signup/{token}',
                'view' => 'UserInviteSignup',
                'label' => 'Cadastro',
                'use_middlewares' => ['-isLogged', '-checkPermission']
            ],
            [
                'path' => '/validate',
                'method' => 'validate',
                'label' => 'validar',
                'use_middlewares' => ['-isLogged', '-checkPermission']
            ],
            [
                'path' => '/register',
                'method' => 'registerUser',
                'label' => 'registrar',
                'use_middlewares' => ['-isLogged', '-checkPermission']
            ],
            [
                'path' => '/validate/username',
                'method' => 'validateUsername',
                'label' => 'validar username',
                'use_middlewares' => ['-isLogged', '-checkPermission']
            ]
        ]
    ]
];