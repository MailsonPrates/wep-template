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
        'table' => 'user',
    ],
    'middlewares' => [
        
    ],
    'constants' => [],
    'title' => 'Usuários',
    'routes' => [
        'path' => '/user',
        'methods' => [],
        'use_middlewares' => ['isLogged', 'checkPermission'],
        'groups' => [

        ]
    ]
];