<?php

namespace App\Modules\Config\Menu\Services;

use App\Core\Cache;
use App\Core\DB;
use App\Core\File;

class MenuItemService
{
    
    /**
     * @param array $fields colunas do item (já validadas)
     */
    public static function create(array $fields)
    {
        $table = DB::table('menu_items');
        $create = $table->create(['fields' => $fields]);

        if ( $create->error ) return $create;

        $created_id = $create->last_id ?? DB::$pdo->lastInsertId();

        // Adiciona icone
        $icon = json_decode($fields['icon'] ?? '{}', true);
        $icons = Cache::get("menu_icons") ?: [];
        $icons[$created_id] = $icon;

        Cache::set('menu_icons', $icons, false);
        self::buildMenuIconsFrontFile($icons);

        MenuService::buildMenusCache();

        return $create;
    }

    public static function delete($id)
    {
        $table = DB::table('menu_items');

        // Remove childs (se houver)
        $deleteChilds = $table->where('parent_id', '=', $id)->delete();

        if ( $deleteChilds->error ) return $deleteChilds;

        $delete = $table->where('id', '=', $id)->delete();

        if ( $delete->error ) return $delete;

        // Remove icone
        $icons = Cache::get("menu_icons") ?: [];
        unset($icons[$id]);

        Cache::set('menu_icons', $icons, false);
        self::buildMenuIconsFrontFile($icons);

        MenuService::buildMenusCache();

        return $delete;
    }

    public static function update($id, array $fields)
    {
        $table = DB::table('menu_items');
        $update = $table->where('id', '=', $id)->update($fields);

        if ( $update->error ) return $update;

        // Atualiza icone (só quando enviado)
        if ( array_key_exists('icon', $fields) ){
            $icons = Cache::get("menu_icons") ?: [];
            $icons[$id] = json_decode($fields['icon'] ?? '{}', true);

            Cache::set('menu_icons', $icons, false);
            self::buildMenuIconsFrontFile($icons);
        }

        MenuService::buildMenusCache();

        return $update;
    }

    public static function buildMenuIconsFrontFile($icons=[])
    {
        if ( empty($icons) ){
            $icons = Cache::get("menu_icons") ?: [];
        }

        $file = new File(DIR_STORAGE . '/builds/menu-icons.build.js');
        $imports = [];
        $items = [];

        foreach($icons as $id => $icon){

            $name = trim($icon['import'] ?? "");
            $from = trim($icon['from'] ?? "");

            if ( !$name || !$from ) continue;

            $imports[] = "import {{$name}} from '$from';";
            $items[] = "\t$id: $name";
        }

        $content = [];
        $content[] = join("\n", $imports);
        $content[] = "\n";
        $content[] = 'const Icons = {';
        $content[] = join(",\n", $items);
        $content[] = '};';
        $content[] = "\n";
        $content[] = 'export default Icons;';

        $file->write(join("\n", $content));
    }

}