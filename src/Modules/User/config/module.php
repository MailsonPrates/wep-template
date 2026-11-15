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
    // CRUD automático: o front só envia id e campos (contrato em Wep\Api\ClientPayload)
    'api' => [
        'primary_key' => 'user_id',
        'hidden' => ['code'],
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