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
    // opções do Model (find, updateById, deleteById...). Sem 'methods' nas rotas não há CRUD
    // automático: o front só chama as rotas declaradas abaixo.
    'api' => [
        'primary_key' => 'user_invite_id',
        'order_by' => ['user_invite_id', 'DESC'],
    ],
    'middlewares' => [],
    'constants' => [],
    'title' => "Convite de usuários",
    'routes' => [
        'path' => '/admin/user/invite',
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
                'path' => '/get',
                'method' => 'get',
                'label' => 'listar'
            ],
            [
                'path' => '/create',
                'method' => 'create',
                'label' => 'criar'
            ],
            [
                'path' => '/update',
                'method' => 'update',
                'label' => 'cancelar'
            ],
            [
                'path' => '/delete',
                'method' => 'delete',
                'label' => 'deletar'
            ],
            [
                'path' => '/resend',
                'method' => 'resend',
                'label' => 'reenviar convite'
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