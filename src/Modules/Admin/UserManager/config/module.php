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
        'table' => '',
    ],
    'middlewares' => [],
    'constants' => [],
    'title' => 'Usuários',
    'routes' => [
        'path' => '/admin/user',
        'methods' => ['get', 'delete'],
        'use_middlewares' => ['isLogged', 'checkPermission'],
        'groups' => [
            [
                'path' => '/',
                'label' => 'Usuários',
                'view' => 'index'
            ],
            [
                'path' => '/create',
                'view' => 'UserCreate',
                'label' => 'Cria usuários'
            ],
            [
                'path' => '/{id}/edit',
                'view' => 'UserUpdate',
                'label' => 'Atualizar usuários'
            ],
            [
                'path' => '/save',
                'method' => 'save',
                'label' => 'salvar'
            ],
            [
                'path' => '/reset',
                'method' => 'resetPassword',
                'label' => 'resetar senha'
            ]
        ]
    ]
];