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
    // tabelas usadas com DB::table()
    'constants' => [
        'TABLE_SETTING' => 'setting',
    ],
    'title' => 'Visual',
    'routes' => [
        'use_middlewares' => ['isLogged', 'checkPermission'],
        'path' => '/config/visual',
        'groups' => [
            [
                'path' => '/',
                'view' => 'index.js'
            ],
            [
                'path' => '/settings',
                'method' => 'settings',
                'label' => 'ver configurações'
            ],
            [
                'path' => '/colors',
                'method' => 'saveColors',
                'label' => 'salvar cores e fontes'
            ],
            [
                'path' => '/logo',
                'method' => 'uploadLogo',
                'label' => 'alterar logos e favicon'
            ],
            [
                'path' => '/logo/remove',
                'method' => 'removeLogo',
                'label' => 'restaurar logo/favicon padrão'
            ],
        ]
    ],
    'hooks' => [
        // regera public/assets/css/theme.css (ex.: depois de um deploy que apagou o arquivo)
        'after_build' => ['BuildTheme']
    ]
];
