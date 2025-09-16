<?php
 
namespace App\Modules\Admin\UserGroup;
 
use App\Core\Controller;
use App\Core\Response;
use App\Modules\Admin\UserGroup\Services\Roles;
use App\Modules\Config\Menu\Services\MenuService;
use App\Modules\User\User;

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
        $data = $request->data();
        $create = UserGroup::create($data);

        if ( !$create->error ){
            MenuService::buildMenusCache();
            Roles::buildRolesByUserGroupCache();
        }

        return $response->json($create);
    }

    public function update($request, $response)
    {
        $data = $request->data();
        $update = UserGroup::update($data);

        if ( !$update->error ){
            MenuService::buildMenusCache();
            Roles::buildRolesByUserGroupCache();
            User::updateSession();
        }

        return $response->json($update);
    }

    public function delete($request, $response)
    {
        $data = $request->data();
        $delete = UserGroup::delete($data);

        if ( !$delete->error ){
            MenuService::buildMenusCache();
            Roles::buildRolesByUserGroupCache();
            User::updateSession();
        }

        return $response->json($delete);
    }
}