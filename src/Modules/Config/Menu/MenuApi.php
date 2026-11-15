<?php
 
namespace App\Modules\Config\Menu;

use Wep\Cache;
use Wep\Controller;
use Wep\Response;
use App\Modules\Config\Menu\Menu;
use Wep\Str;
use App\Modules\Admin\UserGroup\Services\Roles;
use App\Modules\Admin\UserGroup\UserGroup;
use App\Modules\Config\Menu\Services\MenuItemService;
use App\Modules\Config\Menu\Services\MenuService;
use Wep\Api\ClientPayload;
use Wep\Api\InvalidPayloadException;

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
        try {
            $fields = Menu::clientPayload('create')['fields'];
        } catch (InvalidPayloadException $e) {
            return $response->json(Response::error($e->getMessage()));
        }

        // slug gerado no servidor a partir do nome
        $slug = Str::normalize($fields['name'] ?? '');
        $slug = strtolower($slug);
        $fields['slug'] = str_replace(" ", "_", $slug);

        return $response->json(MenuService::create($fields));
    }

    public function update($request, $response)
    {
        try {
            $payload = Menu::clientPayload('update');
        } catch (InvalidPayloadException $e) {
            return $response->json(Response::error($e->getMessage()));
        }

        return $response->json(MenuService::update($payload['id'], $payload['fields']));
    }

    public function delete($request, $response)
    {
        try {
            $payload = Menu::clientPayload('delete');
        } catch (InvalidPayloadException $e) {
            return $response->json(Response::error($e->getMessage()));
        }

        return $response->json(MenuService::delete($payload['id']));
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
     * Os itens de menu são gravados com DB::table('menu_items') (sem Model), então o contrato do
     * cliente (id + campos) é validado aqui.
     */
    private function menuItem(string $operation, $request, $response)
    {
        try {
            $payload = ClientPayload::parse($request->data(), $operation, [
                'table' => 'menu_items',
                'fillable' => ['title', 'permission', 'user_groups', 'external', 'type', 'link', 'menu_id', 'parent_id', 'sort_order', 'icon'],
            ]);
        } catch (InvalidPayloadException $e) {
            return $response->json(Response::error($e->getMessage()));
        }

        // o link vira href no menu de todos os usuários: só caminho interno ou http(s)
        // (bloqueia "javascript:", "data:" e afins)
        if ( isset($payload['fields']['link']) && !self::isSafeLink((string) $payload['fields']['link']) ){
            return $response->json(Response::error("Link inválido: use um caminho interno (/pagina) ou um endereço http(s)://"));
        }

        return $response->json(match ($operation) {
            'create' => MenuItemService::create($payload['fields']),
            'update' => MenuItemService::update($payload['id'], $payload['fields']),
            'delete' => MenuItemService::delete($payload['id']),
        });
    }

    private static function isSafeLink(string $link): bool
    {
        $link = trim($link);

        if ( $link === '' ) return true;

        if ( preg_match('/[\x00-\x1F]/', $link) ) return false;

        // caminho interno: "/pagina" (não "//outro-site")
        if ( $link[0] === '/' ) return !str_starts_with($link, '//') && !str_contains($link, '\\');

        return (bool) preg_match('~^https?://[^\s/]+~i', $link) && filter_var($link, FILTER_VALIDATE_URL);
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