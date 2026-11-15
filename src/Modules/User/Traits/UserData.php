<?php

namespace App\Modules\User\Traits;

use App\Common\Tools\Image;
use Wep\Session;
use App\Modules\Admin\UserGroup\Services\Roles;
use App\Modules\Config\Menu\Services\MenuService;

/**
 * Dados do usuário logado (window.App.user e User::getData()).
 *
 * A sessão guarda só a identidade (nome, e-mail, foto, grupo). Permissões, menu, nome do grupo e
 * página inicial são lidos do cache a cada requisição: quando o admin muda as permissões ou o menu
 * de um grupo, vale na hora para todos. (Antes tudo ficava na sessão e uma permissão removida
 * continuava valendo até o usuário sair e entrar de novo.)
 */
trait UserData
{
    /** Páginas públicas (usuário não logado). */
    private static array $publicPermissions = [
        'page.login',
        'page.login.logout',
        'page.login.recovery',
        'page.login.recovery.update',
        'page.admin.user.invite.signup',
    ];

    public static function isLogged()
    {
        return Session::get("user_id") ? true : false;
    }

    /**
     * @param string|null $key um campo (ex.: "permissions") ou null para todos
     */
    public static function getData($key=null)
    {
        if ( !self::isLogged() ){
            $data = ['is_logged' => false, 'permissions' => self::$publicPermissions];
            return $key === null ? $data : ($data[$key] ?? null);
        }

        $identity = Session::get("user_data") ?: [];

        if ( empty($identity['user_group_id']) ){
            $identity = self::identity();
            Session::set('user_data', $identity);
        }

        $data = $identity + self::groupData((int) ($identity['user_group_id'] ?? 0));

        // antes: getData('chave inexistente') devolvia o array inteiro
        return $key === null ? $data : ($data[$key] ?? null);
    }

    /**
     * @deprecated os dados do grupo já são lidos a cada requisição; continua atualizando a
     *             identidade guardada na sessão (nome, foto...).
     */
    public static function handleGetData()
    {
        return self::identity() + self::groupData((int) (self::identity()['user_group_id'] ?? 0));
    }

    /** Atualiza nome, foto etc. guardados na sessão (ex.: depois de editar o perfil). */
    public static function updateSession()
    {
        if ( !self::isLogged() ) return [];

        $identity = self::identity();
        Session::set('user_data', $identity);

        return $identity + self::groupData((int) ($identity['user_group_id'] ?? 0));
    }

    private static function identity(): array
    {
        $getUser = self::get([
            'where' => [
                ['user_id', '=', Session::get("user_id")]
            ]
        ]);

        $user = $getUser->data[0] ?? [];

        if ( !$user ) return [];

        return [
            'user_id' => (int) $user['user_id'],
            'user_group_id' => (int) $user['user_group_id'],
            'firstname' => $user['firstname'],
            'lastname' => $user['lastname'],
            'username' => $user['username'],
            'email' => $user['email'],
            'nickname' => $user['nickname'],
            'created_at' => date("d/m/Y", strtotime($user['created_at'])),
            'profile_images' => [
                'small' => Image::get($user['profile_image'], 36, 36),
                'medium' => Image::get($user['profile_image'], 200, 200)
            ],
            'is_logged' => true,
        ];
    }

    /**
     * Dados do grupo vindos do cache: permissões, nome, página inicial e menu.
     */
    private static function groupData(int $userGroupId): array
    {
        $group = $userGroupId ? Roles::getRolesByUserGroup($userGroupId) : [];
        $roles = array_values(array_filter(explode(",", (string) ($group['roles'] ?? ""))));

        return [
            'permissions' => $roles,
            'user_group_name' => $group['name'] ?? "",
            'home_path' => Roles::homePath($group['home_role'] ?? ''),
            'menu' => $userGroupId ? MenuService::getByUserPermission($userGroupId) : [],
        ];
    }
}
