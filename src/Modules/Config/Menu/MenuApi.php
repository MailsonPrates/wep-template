<?php

namespace App\Modules\Config\Menu;

use Wep\Controller;
use Wep\Response;
use Wep\Router\Http\RouterHttpRequest;
use Wep\Str;
use App\Modules\Admin\UserGroup\Services\Roles;
use App\Modules\Admin\UserGroup\UserGroup;
use App\Modules\Config\Menu\Services\MenuItemService;
use App\Modules\Config\Menu\Services\MenuService;

/**
 * Menus e itens de menu. O front envia o payload livre; só os campos abaixo são lidos.
 */
class MenuApi
{
    use Controller;

    /** Campos de um item de menu que o painel pode gravar. */
    private const ITEM_FIELDS = [
        'title',
        'permission',
        'user_groups',
        'external',
        'type',
        'link',
        'menu_id',
        'parent_id',
        'sort_order',
        'icon',
    ];

    public function get(RouterHttpRequest $request, Response $response)
    {
        return $response->json(Response::success(MenuService::get()));
    }

    public function create(RouterHttpRequest $request, Response $response)
    {
        $name = trim((string) ($request->name ?? ''));

        if ( $name === '' ) return $response->json(Response::error('Informe o nome do menu'));

        return $response->json(MenuService::create([
            'name' => $name,
            'slug' => self::slug($name),
        ]));
    }

    public function update(RouterHttpRequest $request, Response $response)
    {
        $id = (int) ($request->id ?? 0);
        $name = trim((string) ($request->name ?? ''));

        if ( !$id ) return $response->json(Response::error('Menu não encontrado'));

        if ( $name === '' ) return $response->json(Response::error('Informe o nome do menu'));

        return $response->json(MenuService::update($id, ['name' => $name]));
    }

    public function delete(RouterHttpRequest $request, Response $response)
    {
        $id = (int) ($request->id ?? 0);

        if ( !$id ) return $response->json(Response::error('Menu não encontrado'));

        return $response->json(MenuService::delete($id));
    }

    public function sort(RouterHttpRequest $request, Response $response)
    {
        $items = $request->items ?? [];

        return $response->json(MenuService::sort(is_array($items) ? $items : []));
    }

    /**
     * MENU ITEMS
     */

    public function createItem(RouterHttpRequest $request, Response $response)
    {
        $fields = self::itemFields($request);
        $error = self::invalidItem($fields);

        if ( $error ) return $response->json($error);

        return $response->json(MenuItemService::create($fields));
    }

    public function updateItem(RouterHttpRequest $request, Response $response)
    {
        $id = (int) ($request->id ?? 0);

        if ( !$id ) return $response->json(Response::error('Item não encontrado'));

        $fields = self::itemFields($request);
        $error = self::invalidItem($fields);

        if ( $error ) return $response->json($error);

        return $response->json(MenuItemService::update($id, $fields));
    }

    public function deleteItem(RouterHttpRequest $request, Response $response)
    {
        $id = (int) ($request->id ?? 0);

        if ( !$id ) return $response->json(Response::error('Item não encontrado'));

        return $response->json(MenuItemService::delete($id));
    }

    public function getRolesData(RouterHttpRequest $request, Response $response)
    {
        $userGroups = UserGroup::get([
            'fields' => ['user_group_id', 'name'],
        ]);

        return $response->json(Response::success([
            'roles' => Roles::get(),
            'userGroups' => $userGroups->data
        ]));
    }

    /** Só os campos conhecidos que vieram no payload (update parcial). */
    private static function itemFields(RouterHttpRequest $request): array
    {
        $data = $request->data();

        return array_intersect_key($data, array_flip(self::ITEM_FIELDS));
    }

    private static function invalidItem(array $fields): ?object
    {
        if ( array_key_exists('title', $fields) && trim((string) $fields['title']) === '' ){
            return Response::error('Informe o título');
        }

        // o link vira href no menu de todos os usuários: só caminho interno ou http(s)
        // (bloqueia "javascript:", "data:" e afins)
        if ( isset($fields['link']) && !self::isSafeLink((string) $fields['link']) ){
            return Response::error("Link inválido: use um caminho interno (/pagina) ou um endereço http(s)://");
        }

        return null;
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

    /** "Menu Principal" → "menu_principal" */
    private static function slug(string $name): string
    {
        return str_replace(' ', '_', strtolower(Str::normalize($name)));
    }
}
