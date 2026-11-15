const fs = require("fs");
const path = require("path");

/**
 * Catálogo de ícones do menu: public/assets/icons/hi2-outline.json
 *
 *   { "HiOutlineHome": {"tag": "svg", "attr": {...}, "child": [...]}, ... }
 *
 * Só os ícones Outline do Heroicons 2 (react-icons/hi2). É o que permite trocar o ícone de um item
 * de menu pelo painel sem colocar a biblioteca no bundle e sem recompilar o front:
 *  - o seletor do painel baixa este arquivo só quando é aberto (cache do navegador);
 *  - o servidor valida o nome e anexa a árvore do ícone ao item no cache dos menus, que chega na
 *    página junto com os dados do usuário (sem requisição extra nem "piscar" no primeiro acesso).
 *
 * Gerado no build (plugin abaixo) e por `npm run icons`.
 */

const OUTPUT = path.resolve(__dirname, "../public/assets/icons/hi2-outline.json");
const PREFIX = "HiOutline";

function buildCatalog() {
    const file = require.resolve("react-icons/hi2"); // CommonJS: module.exports.HiX = function (props) { return GenIcon({...})(props) }
    const source = fs.readFileSync(file, "utf8");
    const module = { exports: {} };

    // GenIcon(data) devolve um componente; aqui devolve uma função que entrega os dados
    const fakeRequire = (id) => (id === "../lib" ? { GenIcon: (data) => () => data } : require(id));

    // eslint-disable-next-line no-new-func
    new Function("module", "exports", "require", source)(module, module.exports, fakeRequire);

    const catalog = {};

    Object.keys(module.exports)
        .filter((name) => name.startsWith(PREFIX))
        .sort()
        .forEach((name) => {
            const tree = module.exports[name]();
            if (tree && tree.tag === "svg") catalog[name] = tree;
        });

    return catalog;
}

/** Grava o catálogo se mudou. Devolve a quantidade de ícones. */
function writeCatalog() {
    const catalog = buildCatalog();
    const content = JSON.stringify(catalog);

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

    const current = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, "utf8") : null;

    if (current !== content) {
        const temp = `${OUTPUT}.${process.pid}.tmp`;
        fs.writeFileSync(temp, content);
        fs.renameSync(temp, OUTPUT);
    }

    return Object.keys(catalog).length;
}

class IconsCatalogPlugin {
    apply(compiler) {
        let done = false;

        const run = () => {
            if (done) return;
            done = true;
            writeCatalog();
        };

        compiler.hooks.beforeRun.tap("IconsCatalogPlugin", run);
        compiler.hooks.watchRun.tap("IconsCatalogPlugin", run);
    }
}

module.exports = { writeCatalog, IconsCatalogPlugin, OUTPUT };

if (require.main === module) {
    const total = writeCatalog();
    console.log(`Catálogo de ícones: ${total} ícones em ${path.relative(process.cwd(), OUTPUT)}`);
}
