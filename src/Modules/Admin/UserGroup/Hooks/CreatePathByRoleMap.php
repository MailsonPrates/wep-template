<?php

namespace App\Modules\Admin\UserGroup\Hooks;

use App\Core\File;
use App\Modules\Admin\UserGroup\Services\Roles;

class CreatePathByRoleMap
{
    public function handle()
    {
        $modules_config = include(ROUTE_MAPS_FILENAME) ?? [];
        $map = [];

        foreach($modules_config as $path => $methods){

            foreach($methods as $method => $route){

                $role = $route['custom']['role'] ?? "";

                if ( !$role || $route['vendor'] || !$route['view'] ) continue;

                $map[$role] = ['title' => $route['module_title'], 'path' => $path];
            }
        }

        $file = new File(DIR_BUILDS . '/route-maps.build.json');

        $file->write($map, true);

        Roles::buildRoles();
    }
}