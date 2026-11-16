<?php

namespace App\Common;

use App\Modules\Admin\UserGroup\Services\Roles;
use App\Modules\Admin\UserGroup\UserGroup;
use App\Modules\Config\Menu\Menu;
use App\Modules\Config\Menu\Services\MenuIcons;
use App\Modules\Config\Menu\Services\MenuService;
use App\Modules\User\Services\SaveUser;
use App\Modules\User\Services\Username;
use Wep\DB;
use Wep\Engine\Installer as InstallerContract;
use Wep\Response;
use Wep\Router\RouteMap;

/**
 * Etapa da instalação do template (`php app install`): cria o grupo "Administrador", com todas as
 * permissões das rotas, o primeiro usuário admin e o menu "Principal" padrão.
 */
class Installer implements InstallerContract
{
    public function questions(): array
    {
        return [
            'admin_name' => ['label' => 'Nome do administrador'],
            'admin_username' => ['label' => 'Usuário do administrador', 'default' => 'admin'],
            'admin_password' => ['label' => 'Senha do administrador (mínimo 8 caracteres)', 'secret' => true],
        ];
    }

    public function handle(array $answers)
    {
        $password = $answers['admin_password'] ?? '';

        if ( strlen($password) < SaveUser::MIN_PASSWORD_LENGTH ){
            return Response::error('A senha do administrador precisa ter pelo menos ' . SaveUser::MIN_PASSWORD_LENGTH . ' caracteres');
        }

        // valida o username antes de criar o grupo (uma falha depois deixaria um grupo órfão)
        try {
            Username::check($answers['admin_username'] ?? 'admin');
        } catch (\Throwable $e) {
            return Response::error($e->getMessage());
        }

        $group = UserGroup::create([
            'fields' => [
                'name' => 'Administrador',
                'roles' => implode(',', self::allRoles())
            ]
        ]);

        if ( $group->error ) return $group;

        $name = trim($answers['admin_name'] ?? '');
        $parts = preg_split('/\s+/', $name, 2);

        try {
            $admin = SaveUser::handle([
                'no_email' => true,
                'username' => $answers['admin_username'] ?? 'admin',
                'firstname' => $parts[0] ?? '',
                'lastname' => $parts[1] ?? '',
                'password' => $password,
                'user_group_id' => $group->last_id,
                'status' => 'ativado'
            ]);
        } catch (\Throwable $e) {
            return Response::error($e->getMessage());
        }

        if ( $admin->error ) return $admin;

        $menu = self::createDefaultMenu((int) $group->last_id);

        if ( $menu->error ) return $menu;

        self::buildFront();

        return $admin;
    }

    /**
     * Dependências e build do front (npm run prod: roda `npm ci` só se o node_modules estiver
     * faltando ou desatualizado). Uma falha aqui não desfaz a instalação: só avisa.
     * WEP_SKIP_FRONT_BUILD=1 pula a etapa (ex.: sandbox de testes, que compila à parte).
     */
    private static function buildFront(): void
    {
        if ( getenv('WEP_SKIP_FRONT_BUILD') ) return;

        if ( !is_file(DIR_ROOT . '/package.json') ) return;

        echo PHP_EOL . 'Front: npm run prod (instala as dependências se precisar e compila)...' . PHP_EOL;

        $process = proc_open('npm run prod', [STDIN, STDOUT, STDERR], $pipes, DIR_ROOT);
        $code = is_resource($process) ? proc_close($process) : 1;

        if ( $code !== 0 ){
            echo 'Aviso: o build do front falhou. Rode "npm ci" e "npm run prod" na pasta do projeto.' . PHP_EOL;
        }
    }

    /**
     * Menu "Principal" padrão. Itens de rota apontam para a permissão da página; os grupos ficam
     * visíveis para o Administrador.
     */
    private const DEFAULT_MENU = [
        ['title' => 'Home', 'type' => 'route', 'permission' => 'page.home', 'icon' => 'HiOutlineHome'],
        ['title' => 'Admin', 'type' => 'group', 'icon' => 'HiOutlineUser', 'child' => [
            ['title' => 'Usuários', 'type' => 'route', 'permission' => 'page.admin.user'],
            ['title' => 'Grupo de usuários', 'type' => 'route', 'permission' => 'page.admin.user.group'],
            ['title' => 'Convite de usuários', 'type' => 'route', 'permission' => 'page.admin.user.invite'],
        ]],
        ['title' => 'Configurações', 'type' => 'group', 'icon' => 'HiOutlineCog6Tooth', 'child' => [
            ['title' => 'Menu', 'type' => 'route', 'permission' => 'page.config.menu'],
            ['title' => 'Visual', 'type' => 'route', 'permission' => 'page.config.visual'],
        ]],
    ];

    private static function createDefaultMenu(int $adminGroupId)
    {
        $menu = Menu::create(['fields' => ['name' => 'Principal', 'slug' => 'principal']]);

        if ( $menu->error ) return $menu;

        $pages = Roles::getList();

        $insert = function (array $items, int $parentId) use (&$insert, $menu, $adminGroupId, $pages) {
            foreach( $items as $order => $item ){
                // página removida do template: o item não é criado (em vez de um link quebrado)
                if ( $item['type'] === 'route' && !isset($pages[$item['permission']]) ) continue;

                $create = DB::table(TABLE_MENU_ITEMS)->create(['fields' => [
                    'menu_id' => (int) $menu->last_id,
                    'parent_id' => $parentId,
                    'title' => $item['title'],
                    'type' => $item['type'],
                    'permission' => $item['permission'] ?? '',
                    'user_groups' => $item['type'] === 'route' ? '' : (string) $adminGroupId,
                    'icon' => MenuIcons::encode($item['icon'] ?? '') ?? '{}',
                    'sort_order' => $order,
                ]]);

                if ( $create->error ) return $create;

                if ( !empty($item['child']) ){
                    $result = $insert($item['child'], (int) $create->last_id);
                    if ( $result !== null ) return $result;
                }
            }

            return null;
        };

        $error = $insert(self::DEFAULT_MENU, 0);

        if ( $error ) return $error;

        MenuService::buildMenusCache();
        Roles::buildRolesByUserGroupCache();

        return Response::success();
    }

    /**
     * Todas as roles das rotas (definidas pelo hook AddRoleToRoutes no build).
     *
     * @return string[]
     */
    private static function allRoles(): array
    {
        $roles = [];

        foreach ( RouteMap::getRaw() as $methods ){
            foreach ( $methods as $route ){
                $role = $route['custom']['role'] ?? null;

                if ( $role ) $roles[$role] = true;
            }
        }

        return array_keys($roles);
    }
}
