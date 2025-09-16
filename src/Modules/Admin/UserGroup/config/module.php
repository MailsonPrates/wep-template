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