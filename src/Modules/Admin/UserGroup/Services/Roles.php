<?php

namespace App\Modules\Admin\UserGroup\Services;

use App\Core\Cache;
use App\Core\Engine\Module;
use App\Core\File;
use App\Core\Str;
use App\Modules\Admin\UserGroup\UserGroup;

class Roles 
{
    public static function get()
    {
        $roles = Cache::get('roles') ?? [];

        if ( !empty($roles) ) return $roles;

        return self::buildRoles();
    }

    public static function getList()
    {
        $file = new File(DIR_BUILDS . '/route-maps.build.json');
        $routes = $file->read(true);

        return $routes;
    }

    public static function convertPathToRole($path)
    {
        $role = trim($path);

        // Remove / do inicio
        if ( mb_substr($role, 0, 1) == "/" ){
            $role = ltrim($role);
        }

        // Remove / do fim
        if ( mb_substr($role, -1) == "/" ){
            $role = rtrim($role);
        }
        
        // Remove {id}
        $role_parts = explode("/", $role);
        $role = [];
        
        foreach( $role_parts as $item ){
        	
        	if ( mb_substr($item, 0, 1) == "{" || !$item) continue;
        	
        	$role[] = $item;
        }

        // Troca outros "/" por "."
        $role = join(".", $role);

        return $role;
    }

    public static function buildRoles()
    {
        $modules = Module::getConfigs();

        $method_aliases = [
            'get' => 'listar',
            'create' => 'criar',
            'update' => 'atualizar',
            'delete' => 'deletar',
            'edit' => 'editar'
        ];

        foreach($modules as $module){

            if ( $module['is_vendor'] ) continue;

            $module_name = $module['module_name'];

            if ( !isset($roles[$module_name]) ){
                $roles[$module_name] = [
                    'module_title' => $module['title'] ?? "",
                    'pages' => [],
                    'module_name' => $module_name,
                    'methods' => []
                ];
            }

            $routes = $module['routes'] ?? [];

            $route_path = $routes['path'] ?? "";
            $route_db_methods = $routes['methods'] ?? [];
            $route_groups = $routes['groups'] ?? [];

            /**
             * Monta métodos defaults DB
             */
            foreach($route_db_methods as $method){
                $path = join("/", [$route_path, $method]);
                $role = self::convertPathToRole('api/' . $path);

                $roles[$module_name]['methods'][] = [
                    'path' => $path,
                    'title' => $method_aliases[$method],
                    'role' => $role
                ];
            }

            /**
             * Monta grupo das rotas
             */
            foreach($route_groups as $group){

                $is_page = $group['view'] ?? false;
                $group_path = $group['path'];
                $is_index = $group_path === "/";
                $group_path = $is_index ? "" : $group_path;
                $path = join("/", [$route_path, $group_path]);
                $path = str_replace("//", "/", $path);

                if ( $is_page ){

                    $title = $group['label'] ?? ($is_index ? "Inicial" :  "");
                    $role = self::convertPathToRole('page/' . $path);
                    $role = $role === "page" && $is_index && $route_path === "/"
                        ? ($role . '.' . str_replace("-", ".", Str::camelToKebabCase($module_name)))
                        : $role;

                    $last_segment = explode(".", $role);
                    $last_segment = end($last_segment);

                    if ( !$title ){
                        
                        $title = $method_aliases[$last_segment] ?? $title;
                        $title = ucfirst($title);
                    }

                    $roles[$module_name]['pages'][] = [
                        'path' => $path,
                        'title' => $title,
                        'role' => $role,
                        'route_path' => $route_path,
                        'group_path' => $group_path,
                        'methods' => [],
                        'lastSegmento' => $last_segment
                    ];
                    continue;
                }

                $role = self::convertPathToRole('api/' . $path);
                $roles[$module_name]['methods'][] = [
                    'path' => $path,
                    'title' => $group['label'] ?? "",
                    'role' => $role,
                    'route_path' => $route_path,
                    'group_path' => $group_path
                ];
            }
        }

        /**
         * Agrupa metodos nas pages
         */
        foreach($roles as $key => $item){

            $pages = $item['pages'] ?? [];
            $methods = $item['methods'] ?? [];
            $methods_per_page = [];

            for( $pageIndex=0; $pageIndex<count($pages); $pageIndex++ ){

                $page = $pages[$pageIndex];

                $page_path = str_replace("page.", "", $page['role']);

                for( $methodIndex = 0; $methodIndex < count($methods); $methodIndex++ ){
                    $method = $methods[$methodIndex];
                    $method_path = str_replace("api.", "", $method['role']);

                    if ( str_starts_with($method_path, $page_path) ){
                        $methods_per_page['method_' . $methodIndex] = 'page_' .$pageIndex;
                    }
                }
            }

            foreach($methods_per_page as $methodIndex => $pageIndex){
                $pageIndex = str_replace("page_", "", $pageIndex);
                $methodIndex = str_replace("method_", "", $methodIndex);

                $roles[$key]['pages'][$pageIndex]['methods'][] = $methods[$methodIndex]; 
            }
        }

        $roles = array_values($roles);

        Cache::set('roles', $roles, false);

        return $roles;
    }

    public static function buildRolesByUserGroupCache()
    {
        $cache_key = 'roles_by_usergroup';
        $roles_by_user_group = [];

        $getUserGroups = UserGroup::get();

        foreach($getUserGroups->data as $userGroup){
            $roles_by_user_group[$userGroup['user_group_id']] = $userGroup;
        }

        Cache::set($cache_key, $roles_by_user_group, false);

        return $roles_by_user_group;
    }

    public static function getRolesByUserGroup($user_group_id=[])
    {
        $roles = Cache::get('roles_by_usergroup') ?: [];

        if ( empty($roles) ){
            $roles = self::buildRolesByUserGroupCache();
        }

        return $roles[$user_group_id] ?? $roles ?? [];
    }
}