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
        'table' => 'menu',
    ],
    'middlewares' => [],
    // tabelas usadas com DB::table()
    'constants' => [
        'TABLE_MENU_ITEMS' => 'menu_items',
    ],
    'title' => 'Menu',
    'routes' => [
        'use_middlewares' => ['isLogged', 'checkPermission'],
        'path' => '/config/menu',
        'groups' => [
            [
                'path' => '/',
                'view' => 'index'
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
                'label' => 'atualizar'
            ],
            [
                'path' => '/delete',
                'method' => 'delete',
                'label' => 'deletar'
            ],
            [
                'path' => '/sort',
                'method' => 'sort',
                'label' => 'ordenar'
            ],
            [
                'path' => '/item/create',
                'method' => 'createItem',
                'label' => 'cria item'
            ],
            [
                'path' => '/item/update',
                'method' => 'updateItem',
                'label' => 'atualiza item'
            ],
            [
                'path' => '/item/delete',
                'method' => 'deleteItem',
                'label' => 'deleta item'
            ],
            [
                'path' => '/get-roles-data',
                'method' => 'getRolesData',
                'label' => 'busca permissões de acesso'
            ]
        ]
    ],
    'hooks' => [
        'after_build' => ['UpdateCache']
    ]
];
