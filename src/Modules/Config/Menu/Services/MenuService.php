<?php

namespace App\Modules\Config\Menu\Services;

use Wep\Cache;
use Wep\DB;
use App\Modules\Admin\UserGroup\Services\Roles;
use App\Modules\Admin\UserGroup\UserGroup;
use App\Modules\Config\Menu\Menu;

/**
 * Menus e a árvore de itens, com cache:
 *  - "menu": todos os menus com todos os itens (tela de administração);
 *  - "menu_user_group.<id>": só o que o grupo pode ver (vai para window.App.user.menu).
 *
 * Cada item chega pronto para o front: `link` (rota resolvida pela permissão), `icon_name` e
 * `icon_svg` (desenho do ícone, ver MenuIcons).
 */
class MenuService
{
    public const TYPES = ['route', 'group', 'external_link', 'text'];

    public static function get()
    {
        $cache = Cache::get('menu');

        return $cache !== false ? $cache : self::buildMenusCache();
    }

    /**
     * @param array $fields colunas do menu (já validadas)
     */
    public static function create(array $fields)
    {
        $create = Menu::create(['fields' => $fields]);

        if ( !$create->error ) self::buildMenusCache();

        return $create;
    }

    public static function update($id, array $fields)
    {
        $update = Menu::updateById($id, $fields);

        if ( !$update->error ) self::buildMenusCache();

        return $update;
    }

    public static function delete($id)
    {
        $deleteItems = DB::table(TABLE_MENU_ITEMS)->delete([
            'where' => [['menu_id', '=', $id]]
        ]);

        if ( $deleteItems->error ) return $deleteItems;

        $deleteMenu = Menu::deleteById($id);

        if ( !$deleteMenu->error ) self::buildMenusCache();

        return $deleteMenu;
    }

    /**
     * @param array $items [{id, sort_order}]
     */
    public static function sort($items)
    {
        $table = DB::table(TABLE_MENU_ITEMS);

        foreach( (array) $items as $item ){
            $id = (int) ($item['id'] ?? 0);

            if ( $id <= 0 ) continue;

            $table->where('id', '=', $id)->update(['sort_order' => (int) ($item['sort_order'] ?? 0)]);
        }

        self::buildMenusCache();

        return self::get();
    }

    public static function buildMenusCache()
    {
        $getMenus = Menu::get(['orderBy' => ['id', 'ASC']]);

        if ( $getMenus->error ) return [];

        $getItems = DB::table(TABLE_MENU_ITEMS)->orderBy('sort_order')->get();
        $paths = self::pathsByRole();

        // itens agrupados por menu e por pai (duas consultas no total; antes uma por item)
        $byParent = [];

        foreach( $getItems->data ?? [] as $item ){
            $byParent[(int) $item['menu_id']][(int) $item['parent_id']][] = self::prepareItem($item, $paths);
        }

        $menus = [];

        foreach( $getMenus->data ?? [] as $menu ){
            $menu['child'] = self::tree($byParent[(int) $menu['id']] ?? [], 0);
            $menus[] = $menu;
        }

        Cache::set('menu', $menus, false);

        foreach( self::buildUserGroupMenus($menus) as $groupId => $groupMenus ){
            Cache::set('menu_user_group.' . $groupId, $groupMenus, false);
        }

        return $menus;
    }

    /**
     * Menus de cada grupo: itens "route" só com a permissão da página; os demais tipos só para os
     * grupos marcados em "Usuários permitidos".
     *
     * @return array<int, array> id do grupo => menus
     */
    public static function buildUserGroupMenus($menus = [])
    {
        $groups = UserGroup::get(['fields' => ['user_group_id', 'roles']]);
        $result = [];

        foreach( $groups->data ?? [] as $group ){
            $groupId = (int) $group['user_group_id'];
            $roles = array_filter(explode(',', (string) $group['roles']));

            $result[$groupId] = array_map(function ($menu) use ($groupId, $roles) {
                $menu['child'] = self::filterForGroup($menu['child'] ?? [], $groupId, $roles);
                return $menu;
            }, $menus);
        }

        return $result;
    }

    public static function getByUserPermission($userGroupId)
    {
        $menus = Cache::get('menu_user_group.' . (int) $userGroupId);

        if ( $menus === false ){
            self::buildMenusCache();
            $menus = Cache::get('menu_user_group.' . (int) $userGroupId);
        }

        return $menus ?: [];
    }

    private static function filterForGroup(array $items, int $groupId, array $roles): array
    {
        $visible = [];

        foreach( $items as $item ){
            if ( $item['type'] === 'route' ){
                if ( !in_array($item['permission'], $roles, true) ) continue;
            } else {
                // comparação exata do id (antes str_contains: o grupo 1 via itens dos grupos 10, 12...)
                $allowed = array_map('intval', array_filter(explode(',', (string) ($item['user_groups'] ?? ''))));

                if ( !in_array($groupId, $allowed, true) ) continue;
            }

            $item['child'] = self::filterForGroup($item['child'] ?? [], $groupId, $roles);

            // grupo sem nenhum filho visível não aparece vazio no menu
            if ( $item['type'] === 'group' && !$item['child'] ) continue;

            $visible[] = $item;
        }

        return $visible;
    }

    private static function tree(array $byParent, int $parentId): array
    {
        $items = $byParent[$parentId] ?? [];

        foreach( $items as $index => $item ){
            $items[$index]['child'] = self::tree($byParent, (int) $item['id']);
        }

        return $items;
    }

    private static function prepareItem(array $item, array $paths): array
    {
        $item['id'] = (int) $item['id'];
        $item['parent_id'] = (int) $item['parent_id'];
        $item['menu_id'] = (int) $item['menu_id'];
        $item['sort_order'] = (int) $item['sort_order'];

        if ( $item['type'] === 'route' ){
            $item['link'] = $paths[$item['permission']] ?? '';
        }

        $item['icon_name'] = MenuIcons::name($item['icon'] ?? '');
        $item['icon_svg'] = MenuIcons::svg($item['icon'] ?? '');

        return $item;
    }

    /** @return array<string, string> permissão da página => caminho */
    private static function pathsByRole(): array
    {
        $paths = [];

        foreach( (array) Roles::getList() as $role => $route ){
            if ( isset($route['path']) ) $paths[$role] = $route['path'];
        }

        return $paths;
    }
}
