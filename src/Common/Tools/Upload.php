<?php

namespace App\Common\Tools;

use Wep\Upload as CoreUpload;

/**
 * Upload de imagens do app. A validação fica no Core (Wep\Upload): o tipo vem do conteúdo do
 * arquivo, não do nome nem do "type" enviado pelo navegador, e a subpasta não sai de assets/images.
 */
class Upload
{
    /**
     * @param array $props
     *  - directory: subpasta dentro de assets/images (ex.: "/profile/")
     *  - file: item de $_FILES (padrão: $_FILES['file'])
     *  - prefix: início do nome do arquivo
     *
     * @return string caminho relativo a assets/images (ex.: "/profile/12-ab34.png")
     */
    public static function handle($props = [])
    {
        return CoreUpload::relative(CoreUpload::image($props));
    }
}
