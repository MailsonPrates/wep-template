<?php

namespace App\Modules\Config\Visual\Services;

/**
 * Fonte do app (Google Fonts). Lista com os pesos certos de cada família; qualquer outro nome
 * do Google Fonts também é aceito, carregando só o peso padrão (400).
 *
 *   Fonts::url('Inter');  // https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap
 */
final class Fonts
{
    public const DEFAULT = 'Jost';

    /** família => pesos carregados */
    public const CATALOG = [
        'Jost' => [300, 400, 500, 700, 900],
        'Inter' => [300, 400, 500, 600, 700, 900],
        'Roboto' => [300, 400, 500, 700, 900],
        'Open Sans' => [300, 400, 500, 600, 700, 800],
        'Lato' => [300, 400, 700, 900],
        'Montserrat' => [300, 400, 500, 600, 700, 900],
        'Poppins' => [300, 400, 500, 600, 700, 900],
        'Nunito' => [300, 400, 500, 600, 700, 900],
        'Raleway' => [300, 400, 500, 600, 700, 900],
        'Source Sans 3' => [300, 400, 500, 600, 700, 900],
        'Work Sans' => [300, 400, 500, 600, 700, 900],
        'Rubik' => [300, 400, 500, 600, 700, 900],
        'DM Sans' => [300, 400, 500, 600, 700, 900],
        'Manrope' => [300, 400, 500, 600, 700, 800],
        'Outfit' => [300, 400, 500, 600, 700, 900],
        'Plus Jakarta Sans' => [300, 400, 500, 600, 700, 800],
        'Mulish' => [300, 400, 500, 600, 700, 900],
        'Quicksand' => [300, 400, 500, 600, 700],
        'Ubuntu' => [300, 400, 500, 700],
        'Noto Sans' => [300, 400, 500, 600, 700, 900],
        'IBM Plex Sans' => [300, 400, 500, 600, 700],
        'Figtree' => [300, 400, 500, 600, 700, 900],
    ];

    /**
     * Nome normalizado (com a grafia da lista, se estiver nela), ou null se for inválido.
     * Só letras, números e espaços: o nome vai para a URL e para o CSS gerado.
     */
    public static function normalize(string $family): ?string
    {
        $family = preg_replace('/\s+/', ' ', trim($family));

        if ( !preg_match('/^[A-Za-z][A-Za-z0-9 ]{0,48}[A-Za-z0-9]$/', $family) ) return null;

        foreach( array_keys(self::CATALOG) as $known ){
            if ( strcasecmp($known, $family) === 0 ) return $known;
        }

        return $family;
    }

    public static function url(string $family): string
    {
        $family = self::normalize($family) ?? self::DEFAULT;
        $param = str_replace(' ', '+', $family);
        $weights = self::CATALOG[$family] ?? null;

        if ( $weights ) $param .= ':wght@' . implode(';', $weights);

        return "https://fonts.googleapis.com/css2?family=$param&display=swap";
    }

    /** Valor de font-family, com as fontes do sistema de reserva. */
    public static function stack(string $family): string
    {
        $family = self::normalize($family) ?? self::DEFAULT;

        return "\"$family\", system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif";
    }
}
