<?php

namespace App\Modules\Config\Menu\Services;

use App\Core\Cache;
use App\Core\DB;
use App\Modules\Admin\UserGroup\Services\Roles;
use App\Modules\Config\Menu\Menu;
use App\Modules\User\User;

class MenuService
{
    private static $childTable = null;
    private static $route_by_roles = [];

    public static function get()
    {
        $cache = Cache::get('menu');

        if ( $cache ) return $cache;

        $menus = self::buildMenusCache();
        
        return $menus;
    }

    public static function create($data)
    {
        $create = Menu::create($data);

        if ( !$create->error ){
            self::buildMenusCache();
            User::updateSession();
        }

        return $create;
    }

    public static function update($data)
    {
        $update = Menu::update($data);

        if ( !$update->error ){
            self::buildMenusCache();
            User::updateSession();
        }

        return $update;
    }

    public static function delete($props)
    {
        // Deleta menu items
        $childTable = DB::table('menu_items');

        $deleteItems = $childTable->delete([
            'where' => [
                ['menu_id', '=', $props['where'][0][2]]
            ]
        ]);

        if ( $deleteItems->error ) return $deleteItems;

        $deleteMenu = Menu::delete($props);

        if ( $deleteMenu->error ) return $deleteMenu;

        self::buildMenusCache();
        User::updateSession();

        return $deleteMenu;
    }

    private static function getChild($id)
    {
        if ( !self::$childTable ){
            self::$childTable = DB::table('menu_items');
        }

        $table = self::$childTable;

        $getItems = $table->get([
            'where' => [
                ['menu_id', '=', $id],
                ['parent_id', '=', 0]
            ],
            'orderBy' => ['sort_order', 'ASC']
        ]);

        $menu_items = $getItems->data ?? [];

        foreach($menu_items as $i => $item){

            if ( $item['type'] === "route" ){
                $permission = $item['permission'] ?? null;
                $role = self::$route_by_roles[$permission] ?? [];
                $path = $role['path'] ?? "";
                
                $menu_items[$i]['link'] = $path;
            }

            $menu_items[$i]['child'] = self::getParent($item['id']);
        }

        return $menu_items;
    }

    private static function getParent($item_id)
    {   
        if ( !self::$childTable ){
            self::$childTable = DB::table('menu_items');
        }

        $table = self::$childTable;

        $getItems = $table->get([
            'where' => [
                ['parent_id', '=', $item_id]
            ],
            'orderBy' => ['sort_order', 'ASC']
        ]);

        $parent_items = $getItems->data;

        foreach($parent_items as $i => $item){

             if ( $item['type'] === "route" ){
                $permission = $item['permission'] ?? null;
                $role = self::$route_by_roles[$permission] ?? [];
                $path = $role['path'] ?? "";

                $parent_items[$i]['link'] = $path;
            }

            $parent_items[$i]['child'] = self::getParent($item['id']);
        }

        return $parent_items;
    }

    public static function sort($items)
    {
        $childTable = DB::table('menu_items');

        foreach($items as $item){
            $id = $item['id'];
            $sort_order = intval($item['sort_order']);

            $childTable->update([
                'fields' => [
                    'sort_order' => $sort_order
                ],
                'where' => [
                    ['id', '=', $id]
                ]
            ]);
        }

        self::buildMenusCache();
        User::updateSession();

        return self::get();
    }

    public static function buildMenusCache()
    {
        self::$route_by_roles = Roles::getList();

        $getMenus = Menu::get();

        if ( $getMenus->error ) return $getMenus;

        $menus = $getMenus->data;

        foreach($menus as $i => $menu){
            $menus[$i]['child'] = self::getChild($menu['id']) ?? [];
        }

        $menus_by_user_groups = self::buildUserGroupMenus($menus);

        foreach($menus_by_user_groups as $group_id => $group_menus){
            Cache::set('menu_user_group.'.$group_id, $group_menus, false);
        }

        Cache::set("menu", $menus, false);
        
        return $menus;
    }

    public static function buildUserGroupMenus($menus = [])
    {
        // resultado cru da consulta
        $getUserGroup = DB::table("user_group")->get();
        $user_groups = $getUserGroup->data ?? [];

        $menus_by_user_group = [];

        // função recursiva para validar permissões nos childs
        $checkChilds = function (&$childs, $group_roles, $group_id) use (&$checkChilds) {
            foreach ($childs as $index => &$child) {
                
                $permission = $child['permission'];
                $item_user_groups = $child['user_groups'] ?? "";

                // se não tem permissão, remove
                $route_has_not_permission = !in_array($permission, $group_roles);

               //if ( $child['type'] !== "route" ){
                    //echo 'title: '.$child['title'] . ' | ' . 'group_id: ' . $group_id .'<br>';
                    //echo 'type: '.$child['type'] . '<br>';
                    //echo 'item_user_groups: ' . $item_user_groups . '<br>';
                    //echo 'permission: ' . $child['permission'] . '<br>';
                    //echo 'has: ' . str_contains($item_user_groups, $group_id) . '<br>';
                    //echo '---' . '<br>';
               //}

                if ( $child['type'] !== "route" ){
                   
                    if ( !str_contains($item_user_groups, $group_id) ){
                        unset($childs[$index]);
                    }
                } else

                if ( $route_has_not_permission ) {
                   unset($childs[$index]);
                   continue;
                }

                // se tiver filhos, verifica eles também
                if (!empty($child['child'])) {
                    $checkChilds($child['child'], $group_roles, $group_id);
                }
            }

            // reindexa para evitar buracos (garante que será array e não objeto)
            $childs = array_values($childs);
        };

        foreach ($user_groups as $user_group) {
            $group_id = $user_group['user_group_id'] ?? null;
            $group_roles = $user_group['roles'] ?? "";
            $group_roles = array_filter(explode(",", $group_roles));

            $group_menus = [];

            foreach ($menus as $menu) {
                $menuCopy = $menu;

                if (!empty($menuCopy['child'])) {
                    $checkChilds($menuCopy['child'], $group_roles, $group_id);
                }

                $group_menus[] = $menuCopy;
            }

            $menus_by_user_group[$group_id] = $group_menus;
        }

        //echo '<script>console.log('.json_encode($menus_by_user_group).')</script>';
        //exit();

        return $menus_by_user_group;
    }


    public static function getByUserPermission($user_group_id)
    {
        $user_group_menus = Cache::get('menu_user_group.' . $user_group_id) ?: [];

        if ( empty($user_group_menus) ){
            self::get();
            $user_group_menus = Cache::get('menu_user_group.' . $user_group_id) ?: [];
        }

        return $user_group_menus;
    }
}