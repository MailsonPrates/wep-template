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
                'path' => '/get',
                'method' => 'get',
                'label' => 'listar'
            ],
            [
                'path' => '/delete',
                'method' => 'delete',
                'label' => 'deletar'
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