const path = require('path');
const fs = require('fs');

class CollectInjectedAssetsPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('CollectInjectedAssetsPlugin', (compilation) => {
      const content = [
        '<?php',
        'use App\\App;',
        '',
        '$use_cache_booster = ENV_DEV;',
        '',
        'return ['
      ];

      // Percorre os chunks finais emitidos pelo Webpack
      for (const chunk of compilation.chunks) {
        for (const file of chunk.files) {
          if (file.endsWith('.js')) {
            content.push(`\t["script", ["src" => App::assets("view/${file}", $use_cache_booster)]],`);
          } else if (file.endsWith('.css')) {
            content.push(`\t["link", ["rel" => "stylesheet", "href" => App::assets("view/${file}", $use_cache_booster)]],`);
          }
        }
      }

      content.push('];');

      fs.writeFileSync(
        path.resolve(__dirname, '../storage/builds/view-assets.build.php'),
        content.join("\r")
      );
    });
  }
}

module.exports = CollectInjectedAssetsPlugin;
