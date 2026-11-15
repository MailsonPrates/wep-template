<?php

namespace App\Modules\Config\Menu\Services;

/**
 * Ícones dos itens de menu (Heroicons 2, Outline).
 *
 * O catálogo public/assets/icons/hi2-outline.json é gerado no build do front (webpack/icons-catalog.js)
 * a partir do react-icons: {nome: {tag, attr, child}}. O item de menu guarda só o nome
 * (`{"lib":"hi2-outline","name":"HiOutlineHome"}`), validado aqui; o desenho é anexado ao item no
 * cache dos menus e chega na página com os dados do usuário.
 *
 * Antes o painel gravava `import {X} from 'Y'` digitado livremente e o servidor concatenava isso num
 * arquivo JS do bundle: qualquer um com acesso ao Menu injetava JavaScript, e cada troca exigia
 * recompilar o front.
 */
class MenuIcons
{
    public const LIB = 'hi2-outline';

    private static ?array $catalog = null;

    /** @return array<string, array> nome => árvore do SVG */
    public static function catalog(): array
    {
        if ( self::$catalog !== null ) return self::$catalog;

        $file = DIR_ASSETS . '/icons/hi2-outline.json';
        $data = is_file($file) ? json_decode((string) file_get_contents($file), true) : null;

        return self::$catalog = is_array($data) ? $data : [];
    }

    public static function exists(string $name): bool
    {
        return $name !== '' && isset(self::catalog()[$name]);
    }

    /**
     * Nome do ícone a partir do que está gravado (formato novo, ou o antigo {import, from} quando
     * era um HiOutline* do react-icons/hi2). Vazio se não houver ícone válido.
     *
     * @param mixed $icon string JSON, array ou nome
     */
    public static function name($icon): string
    {
        if ( is_string($icon) ){
            $decoded = json_decode($icon, true);
            $icon = is_array($decoded) ? $decoded : ['name' => $icon];
        }

        if ( !is_array($icon) ) return '';

        $name = (string) ($icon['name'] ?? '');

        // formato antigo: {"import": "HiOutlineHome", "from": "react-icons/hi2"}
        if ( $name === '' && ($icon['from'] ?? '') === 'react-icons/hi2' ){
            $name = (string) ($icon['import'] ?? '');
        }

        $name = trim($name);

        return self::exists($name) ? $name : '';
    }

    /**
     * Valor para gravar na coluna `icon` a partir do nome enviado pelo painel.
     *
     * @return string|null JSON para gravar, ou null se o nome não existe no catálogo
     */
    public static function encode($name): ?string
    {
        $name = trim((string) $name);

        if ( $name === '' ) return '{}';

        if ( !self::exists($name) ) return null;

        return json_encode(['lib' => self::LIB, 'name' => $name]);
    }

    /** Árvore do SVG do ícone gravado, ou null. */
    public static function svg($icon): ?array
    {
        $name = self::name($icon);

        return $name !== '' ? self::catalog()[$name] : null;
    }
}
