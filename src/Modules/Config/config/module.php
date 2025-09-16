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
        'table' => 'config',
    ],
    'middlewares' => [],
    'constants' => [],
    'title' => 'Configurações',
    'routes' => [
        'use_middlewares' => ['isLogged', 'checkPermission'],
        'path' => '/config',
        'methods' => [],
        'groups' => [
            [
                'path' => '/',
                'view' => 'index',
                'page' => 'index'
            ]
        ]
    ]
];