<?php

namespace App\Modules\Admin\UserGroup;

use Wep\Controller;
use Wep\Response;
use Wep\Api\InvalidPayloadException;
use App\Modules\Admin\UserGroup\Services\Roles;
use App\Modules\Config\Menu\Services\MenuService;

/**
 * Classe controller responsável por implementar métodos
 * que lidam com as requisições vindas do front
 */
class UserGroupApi
{
    use Controller;

    public function getRoles($request, $response)
    {
        return $response->json(Response::success(Roles::get()));
    }

    public function create($request, $response)
    {
        try {
            $fields = UserGroup::clientPayload('create')['fields'];
        } catch (InvalidPayloadException $e) {
            return $response->json(Response::error($e->getMessage()));
        }

        $fields['roles'] = self::normalizeRoles($fields['roles'] ?? '');
        $fields['home_role'] = trim((string) ($fields['home_role'] ?? '')) ?: Roles::DEFAULT_HOME_ROLE;

        if ( $error = self::invalidHome($fields['home_role'], $fields['roles']) ) return $response->json($error);

        $create = UserGroup::create(['fields' => $fields]);

        if ( !$create->error ) self::refreshCaches();

        return $response->json($create);
    }

    public function update($request, $response)
    {
        try {
            $payload = UserGroup::clientPayload('update');
        } catch (InvalidPayloadException $e) {
            return $response->json(Response::error($e->getMessage()));
        }

        $current = UserGroup::find($payload['id']);

        if ( $current->error || empty($current->data) ) return $response->json(Response::error('Grupo não encontrado'));

        $fields = $payload['fields'];

        if ( array_key_exists('roles', $fields) ) $fields['roles'] = self::normalizeRoles($fields['roles']);

        // a rota inicial é validada contra as permissões que o grupo terá depois da alteração
        $roles = $fields['roles'] ?? $current->data['roles'];
        $home = array_key_exists('home_role', $fields)
            ? (trim((string) $fields['home_role']) ?: Roles::DEFAULT_HOME_ROLE)
            : ($current->data['home_role'] ?? Roles::DEFAULT_HOME_ROLE);

        if ( $error = self::invalidHome($home, $roles) ) return $response->json($error);

        $fields['home_role'] = $home;

        $update = UserGroup::updateById($payload['id'], $fields);

        if ( !$update->error ) self::refreshCaches();

        return $response->json($update);
    }

    public function delete($request, $response)
    {
        $delete = UserGroup::fromClient('delete');

        if ( !$delete->error ) self::refreshCaches();

        return $response->json($delete);
    }

    /** Menus por grupo e permissões por grupo: lidos a cada requisição pelos usuários (UserData). */
    private static function refreshCaches(): void
    {
        MenuService::buildMenusCache();
        Roles::buildRolesByUserGroupCache();
    }

    private static function normalizeRoles($roles): string
    {
        $list = is_array($roles) ? $roles : explode(',', (string) $roles);
        $list = array_filter(array_map('trim', $list), fn ($role) => preg_match('/^(page|api)(\.[A-Za-z0-9_-]+)*$/', $role));

        return implode(',', array_values(array_unique($list)));
    }

    private static function invalidHome(string $home, string $roles): ?object
    {
        $groupRoles = array_filter(explode(',', $roles));

        if ( Roles::isValidHomeRole($home, $groupRoles) ) return null;

        return Response::error('A rota inicial precisa ser uma página marcada nas permissões do grupo');
    }
}
