const path = require("path");
const chokidar = require("chokidar");
const { execFile } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const MODULES = path.join(ROOT, "src", "Modules");

const isModuleConfig = (file) => {
  const normalized = file.split(path.sep).join("/");
  return normalized.endsWith("/config/module.php") && !normalized.includes("/Modules/Vendor/");
};

/**
 * No `npm run dev`: quando um config/module.php muda (ou um módulo novo é criado), roda o
 * `php app update` para regerar rotas e APIs, e o webpack recompila em seguida.
 *
 * (Antes: só os módulos que existiam ao iniciar eram vigiados, o caminho registrado no webpack
 * estava errado e a saída do update, inclusive os ALERTAS, era descartada.)
 */
class WatchModuleConfigPlugin {
  apply(compiler) {
    let running = false;
    let pending = false;

    const update = () => {
      if (running) {
        pending = true;
        return;
      }

      running = true;

      execFile("php", ["app", "update"], { cwd: ROOT }, (err, stdout, stderr) => {
        const output = `${stdout || ""}${stderr || ""}`.trim();

        if (output) console.log(output);
        if (err && !output) console.error("❌ Erro ao rodar php app update:", err.message);

        running = false;

        if (pending) {
          pending = false;
          update();
        }
      });
    };

    chokidar
      .watch(MODULES, {
        ignoreInitial: true,
        ignored: (file, stats) => stats?.isFile() && !isModuleConfig(file),
      })
      .on("add", (file) => isModuleConfig(file) && update())
      .on("change", (file) => {
        if (!isModuleConfig(file)) return;
        console.log(`⚡ Config alterada: ${path.relative(MODULES, file)}`);
        update();
      })
      .on("unlink", (file) => isModuleConfig(file) && update())
      .on("error", (error) => console.error("❌ Erro no watcher:", error));
  }
}

module.exports = WatchModuleConfigPlugin;
