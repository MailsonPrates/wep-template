<?php
 
/**
 * -----------------------------------------------
 *  ATENÇÃO: sempre que atualizar esse arquivo,
 *  execute o comando abaixo no terminal:
 *  >>> php app update
 * -----------------------------------------------
 */
 
return [
    'middlewares' => [],
    'constants' => [],
    'title' => 'Home',
    'routes' => [
        'use_middlewares' => ['isLogged', 'checkPermission'],
        'path' => '/',
        'methods' => [],
        'groups' => [
            [
                'path' => '/',
                'view' => 'index.js'
            ]
        ]
    ]
];