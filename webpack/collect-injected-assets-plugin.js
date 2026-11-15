const path = require('path');
const fs = require('fs');

/**
 * Gera storage/builds/view-assets.build.php: os <script>/<link> que o template PHP (Main.php)
 * coloca na página.
 *
 * Só entram os arquivos do ENTRYPOINT (runtime, vendors e main). As telas carregadas sob demanda
 * (lazy) ficam de fora: o webpack as busca quando a rota abre. (Antes todos os chunks eram
 * injetados, então cada página baixava o JS de todas as telas.)
 */
class CollectInjectedAssetsPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('CollectInjectedAssetsPlugin', (compilation) => {
      const files = [];

      for (const entrypoint of compilation.entrypoints.values()) {
        for (const file of entrypoint.getFiles()) {
          if (!files.includes(file)) files.push(file);
        }
      }

      // nome do arquivo como string PHP segura (os nomes vêm do webpack, mas não custa)
      const php = (value) => "'" + String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";

      const content = [
        '<?php',
        '// Gerado pelo webpack (npm run dev / npm run prod). Não edite.',
        'use App\\App;',
        '',
        '$use_cache_booster = ENV_DEV;',
        '',
        'return ['
      ];

      for (const file of files) {
        const src = php(`view/${file}`);

        if (file.endsWith('.js')) {
          content.push(`\t["script", ["src" => App::assets(${src}, $use_cache_booster), "defer" => true]],`);
        } else if (file.endsWith('.css')) {
          content.push(`\t["link", ["rel" => "stylesheet", "href" => App::assets(${src}, $use_cache_booster)]],`);
        }
      }

      content.push('];', '');

      const target = path.resolve(__dirname, '../storage/builds/view-assets.build.php');
      const temp = `${target}.${process.pid}.tmp`;

      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(temp, content.join("\n"));
      fs.renameSync(temp, target); // atômico: a página nunca inclui o arquivo pela metade
    });
  }
}

module.exports = CollectInjectedAssetsPlugin;
