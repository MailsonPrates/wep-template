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
    ],

    // Etapa da instalação desta aplicação (`php app install`): cria o grupo e o usuário admin
    'installer' => \App\Common\Installer::class,

    // Sessão (todas opcionais). Padrões: cookie HttpOnly, SameSite=Lax, Secure em HTTPS
    'session' => [
        'idle_timeout' => 7200,     // encerra após 2h sem atividade (0 desliga)
    ],

    // Segurança HTTP (todas opcionais)
    'security' => [
        'csrf' => true,
        'trusted_origins' => [],    // outras origens que podem fazer POST/PUT/DELETE
        'trusted_proxies' => [],    // IPs/CIDRs de proxies (Cloudflare, load balancer)
        'hsts' => false,            // ligue só com HTTPS em todo o domínio

        /**
         * Content-Security-Policy: o navegador só executa scripts do próprio site e os inline com o
         * nonce da requisição (o Html adiciona sozinho). Desligada por padrão: antes de ligar, liste
         * aqui os scripts/estilos externos que o app usa. Dica: teste com 'report_only' => true.
         */
        'csp' => false,
        // 'csp' => [
        //     'style-src' => ['https://fonts.googleapis.com'],
        //     'font-src' => ['https://fonts.gstatic.com'],
        //     'report_only' => true,
        // ],
    ],
];