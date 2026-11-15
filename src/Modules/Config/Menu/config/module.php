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
    // CRUD automático: o front só envia id e campos (contrato em Wep\Api\ClientPayload)
    'api' => [
        'primary_key' => 'id',
        'fillable' => ['name'],
    ],
    'middlewares' => [],
    'constants' => [],
    'title' => 'Menu',
    'routes' => [
        'use_middlewares' => ['isLogged', 'checkPermission'],
        'path' => '/config/menu',
        'methods' => ['get', 'create', 'delete', 'update'],
        'groups' => [
            [
                'path' => '/',
                'view' => 'index'
            ],
            [
                'path' => '/sort',
                'method' => 'sort',
                'label' => 'ordenar'
            ],
            [
                'path' => '/item/create',
                'method' => 'createItem',
                'label' => 'cria item',
                'custom' => [
                    'method' => 'create'
                ]
            ],
            [
                'path' => '/item/update',
                'method' => 'updateItem',
                'label' => 'atualiza item',
                'custom' => [
                    'method' => 'update'
                ]
            ],
            [
                'path' => '/item/delete',
                'method' => 'deleteItem',
                'label' => 'deleta item',
                'custom' => [
                    'method' => 'delete'
                ]
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