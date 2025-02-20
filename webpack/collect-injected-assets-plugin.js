const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

class CollectInjectedAssetsPlugin {
  apply(compiler) {
    // Captura os arquivos injetados durante a geração do HTML
    compiler.hooks.compilation.tap('CollectInjectedAssetsPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'CollectInjectedAssetsPlugin',
        (data, cb) => {
          // Captura os scripts e estilos diretamente do HTML gerado
          const html = data.html;
          
          // Use uma expressão regular para extrair os scripts
          const scriptRegex = /<script[^>]*src="([^"]+)"[^>]*><\/script>/g;
          const stylesRegex = /<link[^>]*href="([^"]+)"[^>]*>/g;

          const content = [
            '<?php',
            'use App\\App;',
            '',
            '$use_cache_booster = ENV_DEV;',
            '',
            'return ['
          ];

          let match;

          // Extrai os scripts
          while ((match = scriptRegex.exec(html)) !== null) {
            const url = match[1];
            content.push(`\t["script", ["src" => App::assets("view/${url}", $use_cache_booster)]],`);
          }

          // Extrai os estilos
          while ((match = stylesRegex.exec(html)) !== null) {
            const url = match[1];
            content.push(`\t["link", ["rel" => "stylesheet", "href" => App::assets("view/${url}", $use_cache_booster)]],`);
          }

          content.push('];');

          // Grava o manifesto em um arquivo JSON
          fs.writeFileSync(
            path.resolve(__dirname, '../storage/builds/view-assets.build.php'),
            content.join("\r")
          );

          cb(null, data);
        }
      );
    });
  }
}

module.exports = CollectInjectedAssetsPlugin;