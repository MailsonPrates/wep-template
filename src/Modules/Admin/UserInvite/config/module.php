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
            [
                'path' => '/signup/{token}',
                'view' => 'UserInviteSignup',
                'label' => 'Cadastro'
            ],
            [
                'path' => '/validate',
                'method' => 'validate',
                'label' => 'validar'
            ],
            [
                'path' => '/register',
                'method' => 'registerUser',
                'label' => 'registrar'
                /**
                 * @todo precisa verificar se está na página certa
                 * se o request veio da página certa, adicionar um token fisico local
                 */
            ],
            [
                'path' => '/validate/username',
                'method' => 'validateUsername',
                'label' => 'validar username'
                /**
                 * @todo precisa verificar se está na página certa
                 * se o request veio da página certa, adicionar um token fisico local
                 */
            ]
        ]
    ]
];