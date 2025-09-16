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
    'title' => 'Admin',
    'constants' => [],
    'routes' => [
        'use_middlewares' => ['isLogged', 'checkPermission'],
        'path' => '/admin',
        'methods' => [],
        'groups' => [
            [
                'path' => '/',
                'view' => 'index'
            ],
        ]
    ]
];