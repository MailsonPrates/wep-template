<?php

namespace App\Modules\Config\Visual\Services;

use Wep\File;

/**
 * Cores, fonte e título do tema (Config > Visual) e o arquivo public/assets/css/theme.css.
 *
 * O CSS é gerado a partir das cores salvas, só com variáveis do Bootstrap 5.3 e do app
 * (--bs-btn-bg, --app-nav-bg...). É um arquivo estático, carregado no <head> logo depois do
 * main.css: funciona com a CSP ligada, fica no cache do navegador (versão pela data do arquivo)
 * e a página já abre com as cores certas, sem "piscar".
 */
class Theme
{
    public const SETTING = 'visual.colors';
    public const TEXT_SETTING = 'visual.text';

    /** Padrões: os mesmos do src/app/styles/_variables.scss. */
    public const DEFAULTS = [
        'primary_bg' => '#ff7a59',
        'primary_text' => '#ffffff',
        'secondary_bg' => '#6c757d',
        'secondary_text' => '#ffffff',
        'nav_bg' => '#f8f9fa',
        'nav_text' => '#212529',
        'nav_hover' => '#ff7a59',
        'title_text' => '#212529',
    ];

    /** Fonte (Google Fonts) e tamanho do título das páginas em px (0 = padrão do Bootstrap). */
    public const TEXT_DEFAULTS = [
        'font' => Fonts::DEFAULT,
        'title_size' => 0,
    ];

    public const TITLE_SIZE_MIN = 16;
    public const TITLE_SIZE_MAX = 60;

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

    /** Fonte e tamanho do título salvos por cima dos padrões. */
    public static function text(): array
    {
        $saved = Settings::get(self::TEXT_SETTING, []);
        $valid = is_array($saved) ? self::validateText($saved) : [];

        return array_merge(self::TEXT_DEFAULTS, is_array($valid) ? $valid : []);
    }

    /**
     * @return array|string os valores, ou a mensagem de erro
     */
    public static function validateText(array $input)
    {
        $text = [];

        if ( array_key_exists('font', $input) ){
            $font = Fonts::normalize((string) $input['font']);

            if ( $font === null ) return 'Fonte inválida: use o nome da família no Google Fonts (só letras, números e espaços)';

            $text['font'] = $font;
        }

        if ( array_key_exists('title_size', $input) ){
            $size = filter_var($input['title_size'], FILTER_VALIDATE_INT);
            $inRange = $size >= self::TITLE_SIZE_MIN && $size <= self::TITLE_SIZE_MAX;

            if ( $size === false || ($size !== 0 && !$inRange) ){
                return 'Tamanho do título inválido: de ' . self::TITLE_SIZE_MIN . ' a ' . self::TITLE_SIZE_MAX . ' px (0 = padrão)';
            }

            $text['title_size'] = $size;
        }

        return $text;
    }

    /** Cor escura? (ex.: nav escura usa o logo para fundo escuro) */
    public static function isDark(string $hex): bool
    {
        if ( !preg_match('/^#[0-9a-f]{6}$/i', $hex) ) return false;

        [$r, $g, $b] = sscanf(strtolower($hex), '#%02x%02x%02x');

        // luminância (aproximação): abaixo da metade, o fundo é escuro
        return (0.299 * $r + 0.587 * $g + 0.114 * $b) / 255 < 0.5;
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
     * Salva cores, fonte e tamanho do título e regera o theme.css.
     *
     * @return string|null mensagem de erro
     */
    public static function save(array $colorsInput, array $textInput = []): ?string
    {
        $colors = self::validate($colorsInput);

        if ( is_string($colors) ) return $colors;

        $text = self::validateText($textInput);

        if ( is_string($text) ) return $text;

        $savedColors = Settings::set(self::SETTING, array_merge(self::colors(), $colors));

        if ( !$savedColors ) return 'Não foi possível salvar as cores';

        $savedText = Settings::set(self::TEXT_SETTING, array_merge(self::text(), $text));

        if ( !$savedText ) return 'Não foi possível salvar a fonte';

        if ( !self::build() ) return 'Tema salvo, mas não foi possível gravar o arquivo public/assets/css/theme.css';

        return null;
    }

    /** Grava o theme.css. */
    public static function build(): bool
    {
        return File::putAtomic(self::file(), self::css(self::colors(), self::text()));
    }

    /** Versão do tema para o cache do navegador (data do arquivo). */
    public static function version(): int
    {
        return is_file(self::file()) ? (int) filemtime(self::file()) : 0;
    }

    public static function css(array $c, array $text = self::TEXT_DEFAULTS): string
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

        $c = array_merge(self::DEFAULTS, $c);
        $text = array_merge(self::TEXT_DEFAULTS, $text);
        $primary = $c['primary_bg'];
        $primaryRgb = self::rgb($primary);
        $secondaryRgb = self::rgb($c['secondary_bg']);
        $gradientEnd = self::shade($primary, 0.35);
        $linkHover = self::shade($primary, -0.2);
        $linkHoverRgb = self::rgb($linkHover);
        $focusBorder = self::shade($primary, 0.5);
        $font = Fonts::stack((string) $text['font']);
        $titleSize = (int) $text['title_size'] > 0 ? " font-size: {$text['title_size']}px;" : '';

        return "/* Gerado por Config > Visual. Não edite: as alterações são sobrescritas. */\n"
            . ":root {\n"
            . "    --bs-primary: $primary;\n"
            . "    --bs-primary-rgb: $primaryRgb;\n"
            . "    --bs-primary-text-emphasis: " . self::shade($primary, -0.6) . ";\n"
            . "    --bs-primary-bg-subtle: " . self::shade($primary, 0.8) . ";\n"
            . "    --bs-primary-border-subtle: " . self::shade($primary, 0.6) . ";\n"
            . "    --bs-link-color: $primary;\n"
            . "    --bs-link-color-rgb: $primaryRgb;\n"
            . "    --bs-link-hover-color: $linkHover;\n"
            . "    --bs-link-hover-color-rgb: $linkHoverRgb;\n"
            . "    --bs-focus-ring-color: rgba($primaryRgb, .25);\n"
            . "    --bs-font-sans-serif: $font;\n"
            . "    --bs-body-font-family: $font;\n"
            . "    --bs-secondary: {$c['secondary_bg']};\n"
            . "    --bs-secondary-rgb: $secondaryRgb;\n"
            . "    --app-nav-bg: {$c['nav_bg']};\n"
            . "    --app-nav-color: {$c['nav_text']};\n"
            . "    --app-nav-link-hover: {$c['nav_hover']};\n"
            . "    --app-gradient-start: $primary;\n"
            . "    --app-gradient-end: $gradientEnd;\n"
            . "}\n"
            . $button('primary', $c['primary_bg'], $c['primary_text'])
            . $button('secondary', $c['secondary_bg'], $c['secondary_text'])
            . ".gradient-primary, .gradient-primary-hover:hover { color: {$c['primary_text']}; }\n"
            // o que o Bootstrap compila com a cor primária fixa (botão link, foco, checkbox...)
            . ".btn-link { --bs-btn-color: $primary; --bs-btn-hover-color: $linkHover; --bs-btn-active-color: $linkHover; }\n"
            . ".form-control:focus, .form-select:focus, .form-check-input:focus"
            . " { border-color: $focusBorder; box-shadow: 0 0 0 .25rem rgba($primaryRgb, .25); }\n"
            . ".form-check-input:checked { background-color: $primary; border-color: $primary; }\n"
            . ".nav-pills { --bs-nav-pills-link-active-bg: $primary; }\n"
            . ".pagination { --bs-pagination-active-bg: $primary; --bs-pagination-active-border-color: $primary; }\n"
            . ".list-group { --bs-list-group-active-bg: $primary; --bs-list-group-active-border-color: $primary; }\n"
            . ".progress, .progress-stacked { --bs-progress-bar-bg: $primary; }\n"
            . ".page-header h1 { color: {$c['title_text']};$titleSize }\n";
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
