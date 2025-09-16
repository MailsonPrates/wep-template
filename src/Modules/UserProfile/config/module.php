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
    'title' => 'Perfil do usuário',
    'routes' => [
        'path' => '/user/profile',
        'methods' => [],
        'use_middlewares' => ['isLogged', 'checkPermission'],
        'groups' => [
            [
                'path' => '/',
                'view' => 'index.js'
            ],
            [
                'path' => '/salvar',
                'method' => 'salvar',
                'label' => 'salvar'
            ],
        ]
    ]
];