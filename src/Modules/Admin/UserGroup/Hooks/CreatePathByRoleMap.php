<?php

namespace App\Modules\Admin\UserGroup\Hooks;

use Wep\File;
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

                $map[$role] = [
                    'title' => $route['module_title'],
                    'path' => $path,
                    // a página passa pelo CheckPermission? (o front usa para mostrar "Acesso negado")
                    'check' => in_array('checkPermission', (array) ($route['middlewares'] ?? []), true),
                ];
            }
        }

        $file = new File(DIR_BUILDS . '/route-maps.build.json');

        $file->write($map, true);

        // o mapa em memória (Roles::getList) passa a refletir o arquivo novo
        Roles::flushList();
        Roles::buildRoles();
    }
}