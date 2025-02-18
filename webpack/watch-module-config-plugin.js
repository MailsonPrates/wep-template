const path = require("path");
const glob = require("glob");
const chokidar = require("chokidar");
const { exec } = require("child_process");

class WatchModuleConfigPlugin {
  apply(compiler) {
    // 🔍 Encontra todos os `config/module.php`, ignorando `Vendor/`
    const filePaths = glob.sync("src/Modules/**/config/module.php", { ignore: "src/Modules/Vendor/**" });

    if (filePaths.length === 0) {
      console.warn("⚠️ Nenhum arquivo de config encontrado.");
      return;
    }

    compiler.hooks.afterCompile.tap("WatchModuleConfigPlugin", (compilation) => {
      filePaths.forEach((filePath) => {
        const fullPath = path.resolve(__dirname, filePath);
        compilation.fileDependencies.add(fullPath);
      });
    });

    // 🔄 Monitorando mudanças em tempo real com `chokidar`
    const watcher = chokidar.watch(filePaths, { persistent: true });

    watcher.on("change", (filePath) => {
      let modulePath = filePath.split("src\\Modules\\").join("").split("\\config\\module.php").join("");
      console.log(`⚡ Config módulo alterada: ${modulePath}`);

      // 🔥 Rodar comando PHP
      exec("php app update", (err, stdout, stderr) => {
        if (err) {
          console.error(`❌ Erro ao executar PHP para ${filePath}:`, err);
          return;
        }
        //console.log(`✅ Saída do PHP (${filePath}):`, stdout);
      });
    });

    watcher.on("error", (error) => console.error(`❌ Erro no watcher:`, error));
  }
}

module.exports = WatchModuleConfigPlugin;
