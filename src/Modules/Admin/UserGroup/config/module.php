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
    // opções do Model (find, updateById, deleteById...). Sem 'methods' nas rotas não há CRUD
    // automático: o front só chama as rotas declaradas abaixo.
    'api' => [
        'primary_key' => 'user_group_id',
        'order_by' => ['user_group_id', 'DESC'],
    ],
    'middlewares' => [],
    'constants' => [],
    'title' => 'Grupo de usuários',
    'routes' => [
        'path' => '/admin/user/group',
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
