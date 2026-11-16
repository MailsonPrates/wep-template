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
    // opções do Model (find, updateById, deleteById...). Sem 'methods' nas rotas não há CRUD
    // automático: o front só chama as rotas declaradas abaixo.
    'api' => [
        'primary_key' => 'user_id',
    ],
    'middlewares' => [
        
    ],
    'constants' => [],
    'title' => 'Usuários',
    'routes' => [
        'path' => '/user',
        'use_middlewares' => ['isLogged', 'checkPermission'],
        'groups' => [

        ]
    ]
];