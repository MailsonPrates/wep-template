<?php
 
namespace App\Modules\Config\Menu;

use App\Core\Cache;
use App\Core\Controller;
use App\Core\Response;
use App\Modules\Config\Menu\Menu;
use App\Core\Str;
use App\Modules\Admin\UserGroup\Services\Roles;
use App\Modules\Admin\UserGroup\UserGroup;
use App\Modules\Config\Menu\Services\MenuItemService;
use App\Modules\Config\Menu\Services\MenuService;
use Wep\Api\ClientQuery;
use Wep\Api\ClientQueryException;

/**
 * Classe controller responsável por implementar métodos
 * que lidam com as requisições vindas do front
 */
class MenuApi
{
    use Controller;

    public function get($request, $response)
    {
        $data = $request->data();
        $menus = MenuService::get($data);
        return $response->json(Response::success($menus));
    }

    public function create($request, $response)
    {
        // o payload é alterado (slug) antes de gravar: saneia explicitamente
        try {
            $data = Menu::clientQuery($request->data(), 'create');
        } catch (ClientQueryException $e) {
            return $response->json(Response::error($e->getMessage()));
        }

        $name = $data['fields']['name'] ?? '';
        $slug = Str::normalize($name);
        $slug = strtolower($slug);
        $slug = str_replace(" ", "_", $slug);
        $data['fields']['slug'] = $slug ;

        $create = MenuService::create($data);

        return $response->json($create);
    }

    public function update($request, $response)
    {
        $data = $request->data();
        return $response->json(MenuService::update($data));
    }

    public function delete($request, $response)
    {
        $data = $request->data();
        return $response->json(MenuService::delete($data));
    }

    public function sort($request, $response)
    {
        $items = $request->items ?? [];
        return $response->json(MenuService::sort($items));
    }

    /**
     * MENU ITEMS
     */

    public function createItem($request, $response)
    {
        return $this->menuItem('create', $request, $response);
    }

    public function updateItem($request, $response)
    {
        return $this->menuItem('update', $request, $response);
    }

    public function deleteItem($request, $response)
    {
        return $this->menuItem('delete', $request, $response);
    }

    /**
     * Os itens de menu são gravados com DB::table('menu_items') (sem Model), então o payload
     * do cliente é saneado aqui: só colunas de menu_items, update/delete por igualdade.
     */
    private function menuItem(string $operation, $request, $response)
    {
        try {
            $data = ClientQuery::sanitize($request->data(), $operation, ['table' => 'menu_items']);
        } catch (ClientQueryException $e) {
            return $response->json(Response::error($e->getMessage()));
        }

        return $response->json(MenuItemService::{$operation}($data));
    }

    /**
     * ABSTRAÇÕES
     */

    public function getRolesData($request, $response)
    {
        $roles = Roles::get();
        $userGroups = UserGroup::get();

        return $response->json(Response::success([
            'roles' => $roles, 
            'userGroups' => $userGroups->data
        ]));
    }
}