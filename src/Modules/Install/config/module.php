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
    'routes' => [
        'path' => '/install',
        'methods' => ['get', 'create', 'update', 'delete'],
        'groups' => [
            [
                'path' => '/',
                'view' => 'index.js'
            ],
            [
                'path' => '/run',
                'method' => 'run'
            ]
        ]
    ]
];