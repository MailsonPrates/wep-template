<?php

namespace App\Modules\Config\Menu\Services;

use App\Core\Cache;
use App\Core\DB;
use App\Core\File;

class MenuItemService
{
    
    public static function create($props=[])
    {
        $table = DB::table('menu_items');
        $create = $table->create($props);
        $created_id = DB::$pdo->lastInsertId();

        // Adiciona icone
        $fields = $props['fields'] ?? [];
        $icon = $fields['icon'] ?? '{}';
        $icon = json_decode($icon, true);
        $icons = Cache::get("menu_icons") ?: [];
        $icons[$created_id] = $icon;

        Cache::set('menu_icons', $icons, false);
        self::buildMenuIconsFrontFile($icons);
        
        MenuService::buildMenusCache();

        return $create;
    }

    public static function delete($props=[])
    {
        $table = DB::table('menu_items');
        
        $wheres = $props['where'] ?? [];
        $id = 0;

        foreach($wheres as $item){

            if ( $item[0] != "id" ) continue;

            $id = $item[2];

            break;
        }

        // Remove childs (se ouver)
        $deleteChilds = $table->where('parent_id', '=', $id)->delete();

        if ( $deleteChilds->error ) return $deleteChilds;

        $delete = $table->delete($props);

        // Remove icone
        $icons = Cache::get("menu_icons") ?: [];
        unset($icons[$id]);

        Cache::set('menu_icons', $icons, false);
        self::buildMenuIconsFrontFile($icons);

        MenuService::buildMenusCache();

        return $delete;
    }

    public static function update($props=[])
    {
        $table = DB::table('menu_items');
        $update = $table->update($props);

        $wheres = $props['where'] ?? [];
        $id = 0;

        foreach($wheres as $item){

            if ( $item[0] != "id" ) continue;

            $id = $item[2];

            break;
        }

        // Atualiza icone
        $fields = $props['fields'] ?? [];
        $icon = $fields['icon'] ?? '{}';
        $icon = json_decode($icon, true);

        $icons = Cache::get("menu_icons") ?: [];
        $icons[$id] = $icon;

        Cache::set('menu_icons', $icons, false);
        self::buildMenuIconsFrontFile($icons);

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