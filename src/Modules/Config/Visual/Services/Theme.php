<?php

namespace App\Modules\Config\Visual\Services;

use Wep\File;

/**
 * Cores do tema (Config > Visual) e o arquivo public/assets/css/theme.css.
 *
 * O CSS é gerado a partir das cores salvas, só com variáveis do Bootstrap 5.3 e do app
 * (--bs-btn-bg, --app-nav-bg...). É um arquivo estático, carregado no <head> logo depois do
 * main.css: funciona com a CSP ligada, fica no cache do navegador (versão pela data do arquivo)
 * e a página já abre com as cores certas, sem "piscar".
 */
class Theme
{
    public const SETTING = 'visual.colors';

    /** Padrões: os mesmos do src/app/styles/_variables.scss. */
    public const DEFAULTS = [
        'primary_bg' => '#ff7a59',
        'primary_text' => '#ffffff',
        'secondary_bg' => '#6c757d',
        'secondary_text' => '#ffffff',
        'nav_bg' => '#f8f9fa',
        'nav_text' => '#212529',
        'nav_hover' => '#ff7a59',
    ];

    public static function file(): string
    {
        return DIR_ASSETS . '/css/theme.css';
    }

    /** Cores salvas por cima dos padrões. */
    public static function colors(): array
    {
        $saved = Settings::get(self::SETTING, []);
        $valid = is_array($saved) ? self::validate($saved) : [];

        // valor corrompido no banco: fica com os padrões
        return array_merge(self::DEFAULTS, is_array($valid) ? $valid : []);
    }

    /**
     * Só as chaves conhecidas, com cor no formato #rrggbb (nada de CSS livre no arquivo gerado).
     *
     * @return array|string as cores, ou a mensagem de erro
     */
    public static function validate(array $input)
    {
        $colors = [];

        foreach( self::DEFAULTS as $key => $default ){
            if ( !array_key_exists($key, $input) ) continue;

            $value = strtolower(trim((string) $input[$key]));

            if ( !preg_match('/^#[0-9a-f]{6}$/', $value) ) return "Cor inválida em \"$key\": use o formato #rrggbb";

            $colors[$key] = $value;
        }

        return $colors;
    }

    /**
     * Salva as cores e regera o theme.css.
     *
     * @return string|null mensagem de erro
     */
    public static function save(array $input): ?string
    {
        $colors = self::validate($input);

        if ( is_string($colors) ) return $colors;

        if ( !Settings::set(self::SETTING, array_merge(self::colors(), $colors)) ) return 'Não foi possível salvar as cores';

        return self::build() ? null : 'Cores salvas, mas não foi possível gravar o arquivo de tema (public/assets/css/theme.css)';
    }

    /** Grava o theme.css. */
    public static function build(): bool
    {
        return File::putAtomic(self::file(), self::css(self::colors()));
    }

    /** Versão do tema para o cache do navegador (data do arquivo). */
    public static function version(): int
    {
        return is_file(self::file()) ? (int) filemtime(self::file()) : 0;
    }

    public static function css(array $c): string
    {
        $button = function (string $name, string $bg, string $text): string {
            $rgb = self::rgb($bg);
            $hover = self::shade($bg, -0.12);
            $active = self::shade($bg, -0.2);

            return <<<CSS
            .btn-$name {
                --bs-btn-color: $text;
                --bs-btn-bg: $bg;
                --bs-btn-border-color: $bg;
                --bs-btn-hover-color: $text;
                --bs-btn-hover-bg: $hover;
                --bs-btn-hover-border-color: $hover;
                --bs-btn-focus-shadow-rgb: $rgb;
                --bs-btn-active-color: $text;
                --bs-btn-active-bg: $active;
                --bs-btn-active-border-color: $active;
                --bs-btn-disabled-color: $text;
                --bs-btn-disabled-bg: $bg;
                --bs-btn-disabled-border-color: $bg;
            }
            .btn-outline-$name {
                --bs-btn-color: $bg;
                --bs-btn-border-color: $bg;
                --bs-btn-hover-color: $text;
                --bs-btn-hover-bg: $bg;
                --bs-btn-hover-border-color: $bg;
                --bs-btn-focus-shadow-rgb: $rgb;
                --bs-btn-active-color: $text;
                --bs-btn-active-bg: $active;
                --bs-btn-active-border-color: $active;
                --bs-btn-disabled-color: $bg;
                --bs-btn-disabled-border-color: $bg;
            }

            CSS;
        };

        $primaryRgb = self::rgb($c['primary_bg']);
        $secondaryRgb = self::rgb($c['secondary_bg']);
        $gradientEnd = self::shade($c['primary_bg'], 0.35);

        return "/* Gerado por Config > Visual. Não edite: as alterações são sobrescritas. */\n"
            . ":root {\n"
            . "    --bs-primary: {$c['primary_bg']};\n"
            . "    --bs-primary-rgb: $primaryRgb;\n"
            . "    --bs-secondary: {$c['secondary_bg']};\n"
            . "    --bs-secondary-rgb: $secondaryRgb;\n"
            . "    --app-nav-bg: {$c['nav_bg']};\n"
            . "    --app-nav-color: {$c['nav_text']};\n"
            . "    --app-nav-link-hover: {$c['nav_hover']};\n"
            . "    --app-gradient-start: {$c['primary_bg']};\n"
            . "    --app-gradient-end: $gradientEnd;\n"
            . "}\n"
            . $button('primary', $c['primary_bg'], $c['primary_text'])
            . $button('secondary', $c['secondary_bg'], $c['secondary_text'])
            . ".gradient-primary, .gradient-primary-hover:hover { color: {$c['primary_text']}; }\n";
    }

    /** "#ff7a59" → "255, 122, 89" */
    private static function rgb(string $hex): string
    {
        [$r, $g, $b] = sscanf($hex, '#%02x%02x%02x');

        return "$r, $g, $b";
    }

    /** Clareia (fator > 0) ou escurece (fator < 0) a cor. */
    private static function shade(string $hex, float $factor): string
    {
        [$r, $g, $b] = sscanf($hex, '#%02x%02x%02x');

        $mix = fn (int $channel) => (int) round($factor < 0
            ? $channel * (1 + $factor)
            : $channel + (255 - $channel) * $factor);

        return sprintf('#%02x%02x%02x', $mix($r), $mix($g), $mix($b));
    }
}
