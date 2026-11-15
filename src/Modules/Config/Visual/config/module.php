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
    'title' => 'Visual',
    'routes' => [
        'use_middlewares' => ['isLogged', 'checkPermission'],
        'path' => '/config/visual',
        'methods' => [],
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
                'label' => 'salvar cores'
            ],
            [
                'path' => '/logo',
                'method' => 'uploadLogo',
                'label' => 'alterar logo'
            ],
            [
                'path' => '/logo/remove',
                'method' => 'removeLogo',
                'label' => 'restaurar logo padrão'
            ],
        ]
    ],
    'hooks' => [
        // regera public/assets/css/theme.css (ex.: depois de um deploy que apagou o arquivo)
        'after_build' => ['BuildTheme']
    ]
];
