/**
 * Opções de um <select> de páginas a partir das roles dos módulos (Roles::get() no servidor):
 *
 *   MÓDULO: ADMIN          (título do grupo, desabilitado)
 *   Admin > Página Inicial  value="page.admin"
 *
 * Usado no Menu (rota de um item) e no Grupo de usuários (rota inicial).
 *
 * @param {Array} modules    [{module_title, module_name, pages: [{role, title, path}]}]
 * @param {object} options
 * @param {(page) => boolean} options.filter   páginas que entram (ex.: só as permitidas ao grupo)
 * @param {string|false} options.placeholder   primeira opção desabilitada ("Selecione"); false = sem
 * @returns {Array<{value: string, text: string, disabled?: boolean, className?: string}>}
 */
export default function routeOptions(modules = [], { filter = () => true, placeholder = "Selecione" } = {}) {
    const options = placeholder ? [{ value: "", text: placeholder, disabled: true }] : [];

    modules.forEach((module) => {
        // páginas com parâmetro ({id}) não podem ser destino direto
        const pages = (module.pages || []).filter((page) => !String(page.path || "").includes("{") && filter(page));

        if (!pages.length) return;

        const moduleName = module.module_title || module.module_name || "";

        options.push({ value: `module:${moduleName}`, text: `MÓDULO: ${moduleName.toUpperCase()}`, disabled: true, className: "fw-bold" });

        pages.forEach((page) => {
            options.push({ value: page.role, text: `${moduleName} > Página ${page.title || page.role}` });
        });
    });

    return options;
}
