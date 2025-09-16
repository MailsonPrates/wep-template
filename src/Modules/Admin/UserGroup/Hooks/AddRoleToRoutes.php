<?php

namespace App\Modules\Admin\UserGroup\Hooks;

use App\Modules\Admin\UserGroup\Services\Roles;
use App\Core\Str;

class AddRoleToRoutes
{
    public function handle($route, $data)
    {
        $raw = (array)$data['raw'];
      
        $method = $raw['method'] ?? false;
        $raw_path = $raw['path'] ?? "";
        $module = (array)$data['module'];

        if ( !isset($module['groups']) || count($module['groups']) === 0 ) return;

        $main_path = $module['name'] ?? $module['path'] ?? "";
        $main_path = $main_path == "/" ? "" : $main_path;

        $path = $main_path . $raw_path;
        $path_role = Roles::convertPathToRole($path);
        $role = ($method ? "api." : "page.") . ($path_role ?: str_replace("-", ".", Str::camelToKebabCase($module['module_name'])));

        if ( in_array($role, ['api.get', 'api.create', 'api.update', 'api.delete']) ){
            $role = join(".", ["api", str_replace("-", ".", Str::camelToKebabCase($module['module_name'])), $path_role]);
        }

        //echo "main_path: " . $main_path . PHP_EOL;
        //echo "raw_path: " . $raw_path . PHP_EOL;
        //echo 'path :' . $path . PHP_EOL;
        //echo 'path to role: ' . $path_role . PHP_EOL;
        //echo "method: " . $method . PHP_EOL;
        //echo "role: " . $role . PHP_EOL;
        //echo json_encode($route) . PHP_EOL;
        //echo PHP_EOL;
        //echo "------" . PHP_EOL;

        $route['custom']['role'] = $role; 

        return $route;
    }
}