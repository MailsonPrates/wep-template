<?php
/**
 * -----------------------------------------------
 *  ATENÇÃO: sempre que atualizar esse arquivo,
 *  execute o comando abaixo no terminal:
 *  > php app update
 * -----------------------------------------------
 */

return [
    'name' => 'Minha aplicação',
    'dir' => [
        'root' => dirname(__DIR__)
    ],
    'constants' => [],
    'middlewares' => [
        'isLogged' => 'App\Modules\Login\Middlewares\IsLogged',
        'checkPermission' => 'App\Modules\Admin\UserGroup\Middlewares\CheckPermission'
    ],
    'hooks' => [
        'before_build' => [],
        'each_route' => [],
        'after_build' => []
    ]
];