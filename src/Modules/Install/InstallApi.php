<?php
 
namespace App\Modules\Install;
 
use App\Core\Controller;
use App\Core\DB;
use App\Core\File;
use App\Core\Response;
use App\Modules\User\Services\SaveUser;

/**
 * Classe controller responsável por implementar métodos
 * que lidam com as requisições vindas do front
 */
class InstallApi
{
    use Controller;

    private $queries = "
        CREATE TABLE `menu` (
            `id` int(11) NOT NULL,
            `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
            `slug` varchar(60) COLLATE utf8_unicode_ci NOT NULL
            ) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

        CREATE TABLE `menu_items` (
            `id` int(11) NOT NULL,
            `parent_id` int(11) NOT NULL,
            `menu_id` int(11) NOT NULL,
            `title` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
            `type` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
            `permission` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
            `link` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
            `external` tinyint(4) NOT NULL DEFAULT '0',
            `sort_order` int(11) NOT NULL
            ) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

        CREATE TABLE `user` (
            `user_id` int(11) NOT NULL,
            `status` varchar(50) NOT NULL DEFAULT 'ativado',
            `user_group_id` int(11) NOT NULL DEFAULT '1',
            `username` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            `password` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            `nickname` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
            `firstname` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
            `lastname` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
            `email` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
            `code` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            `profile_image` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

        CREATE TABLE `user_group` (
            `user_group_id` int(11) NOT NULL,
            `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            `roles` text COLLATE utf8_unicode_ci NOT NULL
            ) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
    
        CREATE TABLE `user_invite` (
            `user_invite_id` int(11) NOT NULL,
            `status` varchar(30) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'pending',
            `email` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
            `user_group_id` int(11) NOT NULL,
            `token` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
            `expire_at` datetime NOT NULL
            ) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
        
            ALTER TABLE `menu`
            ADD PRIMARY KEY (`id`);

            --
            -- Índices de tabela `menu_items`
            --
            ALTER TABLE `menu_items`
            ADD PRIMARY KEY (`id`);

            --
            -- Índices de tabela `user`
            --
            ALTER TABLE `user`
            ADD PRIMARY KEY (`user_id`);

            --
            -- Índices de tabela `user_group`
            --
            ALTER TABLE `user_group`
            ADD PRIMARY KEY (`user_group_id`);

            --
            -- Índices de tabela `user_invite`
            --
            ALTER TABLE `user_invite`
            ADD PRIMARY KEY (`user_invite_id`);

            --
            -- AUTO_INCREMENT para tabelas despejadas
            --

            --
            -- AUTO_INCREMENT de tabela `menu`
            --
            ALTER TABLE `menu`
            MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

            --
            -- AUTO_INCREMENT de tabela `menu_items`
            --
            ALTER TABLE `menu_items`
            MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

            --
            -- AUTO_INCREMENT de tabela `user`
            --
            ALTER TABLE `user`
            MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

            --
            -- AUTO_INCREMENT de tabela `user_group`
            --
            ALTER TABLE `user_group`
            MODIFY `user_group_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

            --
            -- AUTO_INCREMENT de tabela `user_invite`
            --
            ALTER TABLE `user_invite`
            MODIFY `user_invite_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;
            COMMIT;
    ";
 
    public function run($request, $response)
    {
        $data = $request->all();

        try {

            // Cria .env
            file_put_contents(DIR_CONFIG . '/.env', $this->buildEnvContent($data));

            // Cria tabela
            DB::query($this->queries);

            $name = $data['name'] ?? "";
            $name_parts = explode(" ", $name);
            $firstname = $name_parts[0];
            $lastname = array_slice($name_parts, 1);
            $lastname = join(" ", $lastname);

            // Salva usuário admin
            $saveUser = SaveUser::handle([
                'no_email' => true,
                'firstname' => $firstname,
                'lastname' => $lastname,
                'username' => $data['username'],
                'password' => $data['password']
            ]);

            File::deleteAll(DIR_MODULES . '/Install');

            return $response->json($saveUser);

        } catch (\Throwable $th) {
           return $response->json(Response::error($th->getMessage()));
        }
    }

    protected function buildEnvContent($data)
    {
        $content = [
            '# APP',
            'ENV=DEV',
            'APP_URL='.$data['url'] ?? '',
            '',
            '# DB',
            'DB_PASSWORD='.$data['db_password'] ?? '',
            'DB_NAME='.$data['db_name'] ?? '',
            'DB_USERNAME='.$data['db_username'] ?? '',
            'DB_HOST='.$data['db_host'] ?? ''
        ];

        return join("\r", $content);
    }
}