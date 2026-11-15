<?php

namespace App\Modules\Config\Menu\Services;

use Wep\DB;
use Wep\Response;

/**
 * Itens de menu (tabela menu_items). Toda alteração regera o cache dos menus.
 */
class MenuItemService
{
    /**
     * @param array $fields colunas do item (já filtradas pelo contrato do cliente); `icon` é o nome
     *                      do ícone escolhido no painel
     */
    public static function create(array $fields)
    {
        if ( ($fields = self::prepare($fields)) instanceof \stdClass ) return $fields;

        $create = DB::table('menu_items')->create(['fields' => $fields]);

        if ( !$create->error ) MenuService::buildMenusCache();

        return $create;
    }

    public static function update($id, array $fields)
    {
        if ( ($fields = self::prepare($fields)) instanceof \stdClass ) return $fields;

        $update = DB::table('menu_items')->where('id', '=', $id)->update($fields);

        if ( !$update->error ) MenuService::buildMenusCache();

        return $update;
    }

    /**
     * Remove o item e todos os descendentes. (Antes só os filhos diretos: os netos ficavam órfãos.)
     */
    public static function delete($id)
    {
        $ids = array_merge([(int) $id], self::descendants((int) $id));

        $delete = DB::table('menu_items')->where('id', $ids)->delete();

        if ( !$delete->error ) MenuService::buildMenusCache();

        return $delete;
    }

    /**
     * @return int[] ids de todos os descendentes do item
     */
    private static function descendants(int $id): array
    {
        $ids = [];
        $parents = [$id];

        // por nível: uma consulta por profundidade, não por item
        while ( $parents ){
            $children = DB::table('menu_items')->where('parent_id', $parents)->get('id');
            $parents = array_map('intval', array_column($children->data ?? [], 'id'));
            $parents = array_values(array_diff($parents, $ids));
            $ids = array_merge($ids, $parents);
        }

        return $ids;
    }

    /**
     * Normaliza os campos: valida o ícone contra o catálogo e o tipo do item.
     *
     * @return array|\stdClass campos prontos para gravar, ou a resposta de erro
     */
    private static function prepare(array $fields)
    {
        if ( array_key_exists('icon', $fields) ){
            $icon = MenuIcons::encode($fields['icon']);

            if ( $icon === null ) return Response::error('Ícone inválido: escolha um dos ícones da lista');

            $fields['icon'] = $icon;
        }

        if ( isset($fields['type']) && !in_array($fields['type'], MenuService::TYPES, true) ){
            return Response::error('Tipo de item inválido');
        }

        if ( isset($fields['external']) ){
            $fields['external'] = filter_var($fields['external'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        }

        // grupos permitidos: só ids numéricos ("1,3")
        if ( isset($fields['user_groups']) ){
            $groups = array_filter(array_map('intval', explode(',', (string) $fields['user_groups'])));
            $fields['user_groups'] = implode(',', array_unique($groups));
        }

        return $fields;
    }
}
