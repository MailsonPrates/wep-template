<?php

namespace App\Modules\Admin\UserGroup;

use Wep\Controller;
use Wep\Response;
use Wep\Router\Http\RouterHttpRequest;
use App\Modules\Admin\UserGroup\Services\Roles;
use App\Modules\Config\Menu\Services\MenuService;

/**
 * Grupos de usuários. O front envia o payload livre ({id, name, roles, home_role}) e aqui só os
 * campos conhecidos são lidos e validados.
 */
class UserGroupApi
{
    use Controller;

    private const FIELDS = ['user_group_id', 'name', 'roles', 'home_role'];

    /**
     * get(): lista; get({id}): um grupo.
     */
    public function get(RouterHttpRequest $request, Response $response)
    {
        $id = (int) ($request->id ?? 0);

        if ( $id ){
            $group = UserGroup::find($id);

            if ( $group->error ) return $response->json($group);

            if ( empty($group->data) ) return $response->json(Response::error('Grupo não encontrado'));

            return $response->json(Response::success(self::only($group->data)));
        }

        $groups = UserGroup::get([
            'fields' => self::FIELDS,
            'orderBy' => ['user_group_id', 'DESC'],
        ]);

        return $response->json($groups);
    }

    public function create(RouterHttpRequest $request, Response $response)
    {
        $fields = [
            'name' => trim((string) ($request->name ?? '')),
            'roles' => self::normalizeRoles($request->roles ?? ''),
            'home_role' => trim((string) ($request->home_role ?? '')) ?: Roles::DEFAULT_HOME_ROLE,
        ];

        if ( $fields['name'] === '' ) return $response->json(Response::error('Informe o nome do grupo'));

        $error = self::invalidHome($fields['home_role'], $fields['roles']);

        if ( $error ) return $response->json($error);

        $create = UserGroup::create(['fields' => $fields]);

        if ( !$create->error ) self::refreshCaches();

        return $response->json($create);
    }

    public function update(RouterHttpRequest $request, Response $response)
    {
        $id = (int) ($request->id ?? 0);
        $current = $id ? UserGroup::find($id) : null;

        if ( !$current || $current->error || empty($current->data) ){
            return $response->json(Response::error('Grupo não encontrado'));
        }

        $data = $request->data();
        $fields = [];

        if ( array_key_exists('name', $data) ){
            $fields['name'] = trim((string) $data['name']);

            if ( $fields['name'] === '' ) return $response->json(Response::error('Informe o nome do grupo'));
        }

        if ( array_key_exists('roles', $data) ) $fields['roles'] = self::normalizeRoles($data['roles']);

        // a rota inicial é validada contra as permissões que o grupo terá depois da alteração
        $roles = $fields['roles'] ?? $current->data['roles'];
        $home = array_key_exists('home_role', $data)
            ? (trim((string) $data['home_role']) ?: Roles::DEFAULT_HOME_ROLE)
            : ($current->data['home_role'] ?? Roles::DEFAULT_HOME_ROLE);

        $error = self::invalidHome($home, $roles);

        if ( $error ) return $response->json($error);

        $fields['home_role'] = $home;

        $update = UserGroup::updateById($id, $fields);

        if ( !$update->error ) self::refreshCaches();

        return $response->json($update);
    }

    public function delete(RouterHttpRequest $request, Response $response)
    {
        $id = (int) ($request->id ?? 0);

        if ( !$id ) return $response->json(Response::error('Grupo não encontrado'));

        $delete = UserGroup::deleteById($id);

        if ( !$delete->error ) self::refreshCaches();

        return $response->json($delete);
    }

    public function getRoles(RouterHttpRequest $request, Response $response)
    {
        return $response->json(Response::success(Roles::get()));
    }

    /** Menus e permissões por grupo: lidos a cada requisição pelos usuários (UserData). */
    private static function refreshCaches(): void
    {
        MenuService::buildMenusCache();
        Roles::buildRolesByUserGroupCache();
    }

    private static function only(array $group): array
    {
        return array_intersect_key($group, array_flip(self::FIELDS));
    }

    private static function normalizeRoles($roles): string
    {
        $list = is_array($roles) ? $roles : explode(',', (string) $roles);
        $list = array_filter(
            array_map('trim', $list),
            fn ($role) => preg_match('/^(page|api)(\.[A-Za-z0-9_-]+)*$/', $role)
        );

        return implode(',', array_values(array_unique($list)));
    }

    private static function invalidHome(string $home, string $roles): ?object
    {
        $groupRoles = array_filter(explode(',', $roles));

        if ( Roles::isValidHomeRole($home, $groupRoles) ) return null;

        return Response::error('A rota inicial precisa ser uma página marcada nas permissões do grupo');
    }
}
