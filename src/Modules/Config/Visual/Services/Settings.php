<?php

namespace App\Modules\Config\Visual\Services;

use Wep\Cache;
use Wep\DB;

/**
 * Configurações do app em chave/valor (tabela `setting`), com cache. Valores em JSON.
 *
 *   Settings::get('visual.colors', []);
 *   Settings::set('visual.colors', ['primary_bg' => '#ff7a59']);
 */
class Settings
{
    private const CACHE_KEY = 'settings';

    private static bool $unavailable = false;

    /** A última leitura falhou (banco indisponível)? */
    public static function unavailable(): bool
    {
        return self::$unavailable;
    }

    public static function get(string $name, $default = null)
    {
        $all = self::all();

        return array_key_exists($name, $all) ? $all[$name] : $default;
    }

    /**
     * @return bool false se o banco recusou a gravação
     */
    public static function set(string $name, $value): bool
    {
        $json = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $save = DB::table('setting')
            ->onDuplicateUpdate('value')
            ->insert(['name' => $name, 'value' => $json]);

        Cache::delete(self::CACHE_KEY);

        return !$save->error;
    }

    public static function forget(string $name): bool
    {
        $delete = DB::table('setting')->where('name', $name)->delete();

        Cache::delete(self::CACHE_KEY);

        return !$delete->error;
    }

    /** @return array<string, mixed> */
    public static function all(): array
    {
        $cached = Cache::get(self::CACHE_KEY);

        if ( is_array($cached) ) return $cached;

        $rows = DB::table('setting')->get('name', 'value');

        // banco indisponível (ex.: antes da instalação): usa os padrões sem guardar no cache
        if ( $rows->error ){
            self::$unavailable = true;
            return [];
        }

        self::$unavailable = false;

        $all = [];

        foreach( $rows->data ?? [] as $row ){
            $all[$row['name']] = json_decode((string) $row['value'], true);
        }

        Cache::set(self::CACHE_KEY, $all, false);

        return $all;
    }
}
