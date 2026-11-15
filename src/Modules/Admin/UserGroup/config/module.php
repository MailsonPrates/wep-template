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
        'table' => 'user_group',
    ],
    // CRUD automático: o front só envia id e campos (contrato em Wep\Api\ClientPayload)
    'api' => [
        'primary_key' => 'user_group_id',
        'order_by' => ['user_group_id', 'DESC'],
        // home_role: página inicial do grupo (validada no UserGroupApi)
        'fillable' => ['name', 'roles', 'home_role'],
    ],
    'middlewares' => [],
    'constants' => [],
    'title' => 'Grupo de usuários',
    'routes' => [
        'path' => '/admin/user/group',
        'methods' => ['get', 'update', 'delete', 'create'],
        'use_middlewares' => ['isLogged', 'checkPermission'],
        'groups' => [
            [
                'path' => '/',
                'view' => 'index.js'
            ],
            [
                'path' => '/create',
                'view' => 'UserGroupCreate',
            ],
            [
                'path' => '/{id}/edit',
                'view' => 'UserGroupUpdate',
            ],
            [
                'path' => '/roles',
                'method' => 'getRoles',
                'label' => 'busca atribuições'
            ],
        ]
    ],
    'hooks' => [
        'before_build' => [],
        'each_route' => ['AddRoleToRoutes'],
        'after_build' => ['CreatePathByRoleMap']
    ]
];