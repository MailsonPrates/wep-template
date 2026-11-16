/**
 * Garante as dependências do front antes do build (npm run prod e php app install).
 *
 * Roda `npm ci` só quando precisa: node_modules não existe ou não bate com o package-lock.json
 * (pacote faltando ou em outra versão, ex.: depois de um `git pull` que mudou o lock).
 * node_modules como link (junction do sandbox de testes) nunca é reinstalado.
 *
 *   node webpack/ensure-deps.js
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const MODULES = path.join(ROOT, "node_modules");
const LOCK = path.join(ROOT, "package-lock.json");
const INSTALLED = path.join(MODULES, ".package-lock.json"); // lock "oculto" que o npm grava ao instalar

function readJson(file) {
    try {
        return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (e) {
        return null;
    }
}

function isLink(file) {
    try {
        return fs.lstatSync(file).isSymbolicLink();
    } catch (e) {
        return false;
    }
}

/** @returns {string|null} motivo para reinstalar, ou null se está em dia */
function outdatedReason() {
    if (!fs.existsSync(MODULES)) return "node_modules não existe";

    const lock = readJson(LOCK);
    const installed = readJson(INSTALLED);

    if (!installed || !installed.packages) return "node_modules sem o registro da instalação";

    for (const [name, wanted] of Object.entries(lock.packages || {})) {
        // "" é o próprio projeto; opcionais (ex.: binários de outro sistema) podem faltar
        if (!name || wanted.link) continue;

        const current = installed.packages[name];

        if (!current) {
            if (wanted.optional) continue;
            return `falta ${name.replace(/^node_modules\//, "")}`;
        }

        if (current.version !== wanted.version) return `${name.replace(/^node_modules\//, "")} em outra versão`;
    }

    return null;
}

function main() {
    if (!fs.existsSync(LOCK)) return;

    if (isLink(MODULES)) return;

    const reason = outdatedReason();

    if (!reason) return;

    console.log(`Dependências do front desatualizadas (${reason}): npm ci`);

    // no Windows o npm é um .cmd: precisa do shell
    const result = spawnSync("npm", ["ci", "--no-audit", "--no-fund"], {
        cwd: ROOT,
        stdio: "inherit",
        shell: process.platform === "win32",
    });

    if (result.status !== 0) {
        console.error("npm ci falhou");
        process.exit(result.status || 1);
    }
}

main();
