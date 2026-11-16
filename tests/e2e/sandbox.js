#!/usr/bin/env node
/**
 * Sandbox: uma app instalada a partir deste template, para validar mudanças no template e no Core.
 *
 *   npm run e2e                      sync + reset + build + servidor + testes (tests/e2e/run.js)
 *   npm run e2e -- --skip-build      idem, sem recompilar o front (mudança só em PHP)
 *   npm run sandbox sync             copia o template para o sandbox
 *   npm run sandbox reset            recria o banco e reinstala (admin: maria / SenhaForte123)
 *   npm run sandbox build            compila o front no sandbox
 *   npm run sandbox serve            sobe o servidor (Ctrl+C para parar)
 *   npm run sandbox clean            apaga o sandbox e o banco (remove os links antes)
 *
 * ATENÇÃO: o sandbox tem links para o Core (vendor/wep/framework) e para o node_modules do template.
 * Nunca apague a pasta com rm -rf / Remove-Item -Recurse: use `npm run sandbox clean`.
 *
 * Variáveis (opcionais): WEP_SANDBOX (pasta, padrão ../sandbox), WEP_CORE (Core, padrão ../Wep),
 * WEP_SANDBOX_DB (padrão wep_sandbox), WEP_DB_HOST/WEP_DB_USER/WEP_DB_PASS (127.0.0.1/root/vazio),
 * WEP_MYSQL (cliente mysql; padrão o do XAMPP), WEP_SANDBOX_PORT (8766).
 */
const fs = require("fs");
const path = require("path");
const http = require("http");
const { execFileSync, spawn, spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "../..");
const SANDBOX = path.resolve(process.env.WEP_SANDBOX || path.join(ROOT, "../sandbox"));
const CORE = path.resolve(process.env.WEP_CORE || path.join(ROOT, "../Wep"));
const PORT = Number(process.env.WEP_SANDBOX_PORT || 8766);
const BASE = `http://127.0.0.1:${PORT}`;
const DB = {
    name: process.env.WEP_SANDBOX_DB || "wep_sandbox",
    host: process.env.WEP_DB_HOST || "127.0.0.1",
    user: process.env.WEP_DB_USER || "root",
    pass: process.env.WEP_DB_PASS || "",
};
const ADMIN = { name: "Maria Silva", username: "maria", password: "SenhaForte123" };
const WINDOWS = process.platform === "win32";
const MYSQL = process.env.WEP_MYSQL || (WINDOWS && fs.existsSync("C:/xampp/mysql/bin/mysql.exe") ? "C:/xampp/mysql/bin/mysql.exe" : "mysql");
const MANIFEST = path.join(SANDBOX, ".sandbox-files");

const log = (message) => console.log(`[sandbox] ${message}`);

function run(command, args, options = {}) {
    const result = spawnSync(command, args, { encoding: "utf8", shell: false, ...options });

    if (result.status !== 0 && !options.allowFail) {
        const output = `${result.stdout || ""}${result.stderr || ""}`.trim().split("\n").slice(-15).join("\n");
        throw new Error(`${path.basename(command)} ${args.join(" ")} falhou:\n${output}`);
    }

    return result;
}

/** php com as extensões que o php.ini local não carrega. */
function phpArgs() {
    const probe = run("php", ["-r", "echo extension_loaded('gd') ? 1 : 0, extension_loaded('pdo_mysql') ? 1 : 0;"], { allowFail: true });
    const [gd, pdo] = String(probe.stdout || "00");
    const args = [];
    if (gd !== "1") args.push("-d", "extension=gd");
    if (pdo !== "1") args.push("-d", "extension=pdo_mysql");
    return args;
}

/** Arquivos do template (versionados e novos, respeitando o .gitignore). */
function templateFiles() {
    const output = execFileSync("git", ["-C", ROOT, "ls-files", "--cached", "--others", "--exclude-standard", "-z"], { encoding: "utf8" });

    return output.split("\0").filter((file) => file && fs.existsSync(path.join(ROOT, file)) && !file.startsWith("tests/"));
}

function linkDir(target, link) {
    if (fs.existsSync(link)) return;

    if (WINDOWS) run("cmd", ["/c", "mklink", "/J", link, target]);
    else fs.symlinkSync(target, link, "dir");
}

function sync() {
    fs.mkdirSync(SANDBOX, { recursive: true });

    const files = templateFiles();
    const previous = fs.existsSync(MANIFEST) ? fs.readFileSync(MANIFEST, "utf8").split("\n").filter(Boolean) : [];
    const current = new Set(files);

    // arquivos que saíram do template saem do sandbox
    previous.filter((file) => !current.has(file)).forEach((file) => fs.rmSync(path.join(SANDBOX, file), { force: true }));

    let copied = 0;

    for (const file of files) {
        if (file === "composer.json") continue;

        const from = path.join(ROOT, file);
        const to = path.join(SANDBOX, file);
        const stat = fs.statSync(from);

        if (fs.existsSync(to) && fs.statSync(to).mtimeMs >= stat.mtimeMs && fs.statSync(to).size === stat.size) continue;

        fs.mkdirSync(path.dirname(to), { recursive: true });
        fs.copyFileSync(from, to);
        copied++;
    }

    fs.writeFileSync(MANIFEST, files.join("\n"));

    // composer.json do template + o Core local (symlink: mudanças no Core valem sem reinstalar)
    const composer = JSON.parse(fs.readFileSync(path.join(ROOT, "composer.json"), "utf8"));
    composer.repositories = [{ type: "path", url: CORE.replace(/\\/g, "/"), options: { symlink: true, versions: { "wep/framework": "2.999.0" } } }];
    delete composer.scripts;

    const composerFile = path.join(SANDBOX, "composer.json");
    const composerJson = JSON.stringify(composer, null, 4) + "\n";
    const composerChanged = !fs.existsSync(composerFile) || fs.readFileSync(composerFile, "utf8") !== composerJson;

    if (composerChanged) fs.writeFileSync(composerFile, composerJson);

    if (!fs.existsSync(path.join(SANDBOX, "config/.env"))) {
        fs.copyFileSync(path.join(SANDBOX, "config/.env.example"), path.join(SANDBOX, "config/.env"));
    }

    linkDir(path.join(ROOT, "node_modules"), path.join(SANDBOX, "node_modules"));

    if (composerChanged || !fs.existsSync(path.join(SANDBOX, "vendor/autoload.php"))) {
        log("composer update (Core de " + CORE + ")");
        const composerArgs = ["update", "--no-interaction", "--quiet"];
        if (WINDOWS) run("cmd", ["/c", "composer", ...composerArgs], { cwd: SANDBOX });
        else run("composer", composerArgs, { cwd: SANDBOX });
    }

    log(`sync: ${copied} arquivo(s) copiado(s) para ${SANDBOX}`);
}

function mysql(sql) {
    const args = ["-h", DB.host, "-u", DB.user];
    if (DB.pass) args.push(`-p${DB.pass}`);
    run(MYSQL, [...args, "-e", sql]);
}

function reset() {
    mysql(`DROP DATABASE IF EXISTS \`${DB.name}\`; CREATE DATABASE \`${DB.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);

    // estado limpo: trava da instalação, cache, uploads e tema
    for (const item of ["storage/install.lock", "storage/cache", "public/assets/css/theme.css", "public/assets/images/logo", "public/assets/images/profile", "public/assets/images/cache"]) {
        fs.rmSync(path.join(SANDBOX, item), { recursive: true, force: true });
    }

    fs.copyFileSync(path.join(SANDBOX, "config/.env.example"), path.join(SANDBOX, "config/.env"));

    const answers = ["DEV", BASE, DB.host, DB.name, DB.user, DB.pass, ADMIN.name, ADMIN.username, ADMIN.password].join("\n") + "\n";
    const result = run("php", [...phpArgs(), "app", "install"], { cwd: SANDBOX, input: answers, allowFail: true });
    const output = `${result.stdout}${result.stderr}`;

    if (!/SUCESSO/.test(output)) throw new Error(`php app install falhou:\n${output.slice(-1500)}`);

    log(`reset: banco ${DB.name} reinstalado (admin ${ADMIN.username} / ${ADMIN.password})`);
}

function build() {
    const started = Date.now();
    const result = run("node", [path.join(SANDBOX, "node_modules/webpack-cli/bin/cli.js"), "--mode", "production", "--no-color"], { cwd: SANDBOX, allowFail: true });
    const output = `${result.stdout}${result.stderr}`;

    if (result.status !== 0 || /^ERROR/m.test(output)) {
        throw new Error("build falhou:\n" + output.split("\n").filter((line) => /ERROR|Module not found|export '/.test(line)).slice(0, 20).join("\n"));
    }

    log(`build: ok em ${Math.round((Date.now() - started) / 1000)}s`);
}

function waitForServer(timeout = 15000) {
    const until = Date.now() + timeout;

    return new Promise((resolve, reject) => {
        const attempt = () => {
            http.get(`${BASE}/login/`, (res) => { res.resume(); resolve(); })
                .on("error", () => (Date.now() > until ? reject(new Error("servidor não respondeu")) : setTimeout(attempt, 300)));
        };
        attempt();
    });
}

function startServer(stdio = "ignore") {
    const server = spawn("php", [...phpArgs(), "-S", `127.0.0.1:${PORT}`, "router.php"], { cwd: path.join(SANDBOX, "public"), stdio });
    return server;
}

/**
 * Apaga o sandbox e o banco. Os links (vendor/wep/framework → Core, node_modules → template) são
 * removidos ANTES: um delete recursivo atravessaria o link e apagaria o Core ou o node_modules.
 */
function clean() {
    for (const link of ["vendor/wep/framework", "node_modules"]) {
        const target = path.join(SANDBOX, link);
        let stat = null;
        try { stat = fs.lstatSync(target); } catch (e) { continue; }

        // junction no Windows aparece como link simbólico para o lstat
        if (stat.isSymbolicLink()) fs.unlinkSync(target);
        else if (WINDOWS) run("cmd", ["/c", "rmdir", target], { allowFail: true });
    }

    for (const link of ["vendor/wep/framework", "node_modules"]) {
        if (fs.existsSync(path.join(SANDBOX, link)) && fs.readdirSync(path.join(SANDBOX, link)).length) {
            throw new Error(`não foi possível remover o link ${link}: nada foi apagado`);
        }
    }

    fs.rmSync(SANDBOX, { recursive: true, force: true });
    mysql(`DROP DATABASE IF EXISTS \`${DB.name}\`;`);
    log(`clean: ${SANDBOX} e o banco ${DB.name} removidos`);
}

/** jsdom fica em tests/e2e (fora do package.json do template, que vai para os apps). */
function ensureTestDeps() {
    if (fs.existsSync(path.join(__dirname, "node_modules/jsdom"))) return;

    log("instalando as dependências dos testes (tests/e2e)");
    const npmArgs = ["install", "--no-audit", "--no-fund", "--silent"];
    if (WINDOWS) run("cmd", ["/c", "npm", ...npmArgs], { cwd: __dirname });
    else run("npm", npmArgs, { cwd: __dirname });
}

async function test(options) {
    ensureTestDeps();
    sync();
    reset();
    if (!options.skipBuild) build();

    const server = startServer();

    try {
        await waitForServer();
        const failures = await require("./run.js")({ base: BASE, sandbox: SANDBOX, admin: ADMIN, fixtures: path.join(__dirname, "fixtures") });
        return failures;
    } finally {
        server.kill();
    }
}

async function main() {
    const [command = "test", ...rest] = process.argv.slice(2);
    const options = { skipBuild: rest.includes("--skip-build") };

    try {
        if (command === "sync") return sync();
        if (command === "reset") return reset();
        if (command === "build") return build();
        if (command === "clean") return clean();
        if (command === "serve") {
            log(`${BASE} (admin ${ADMIN.username} / ${ADMIN.password}) — Ctrl+C para parar`);
            startServer("inherit");
            return undefined;
        }
        if (command === "test") {
            const failures = await test(options);
            process.exit(failures ? 1 : 0);
        }

        console.error(`comando desconhecido: ${command} (use sync, reset, build, serve ou test)`);
        process.exit(2);
    } catch (error) {
        console.error(`[sandbox] ${error.message}`);
        process.exit(1);
    }

    return undefined;
}

main();
