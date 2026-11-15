import routesByRole from "storage/builds/route-maps.build.json";

/**
 * Página pela permissão ("page.admin.user" → {title: "Usuários", path: "/admin/user/"}).
 * O mapa é gerado pelo `php app update` (hook CreatePathByRoleMap). Permissão desconhecida → null.
 *
 * @example
 * <TemplateMain breadcrumbs={["page.admin", "page.admin.user"]}>
 */
export default function route(role) {
    const item = routesByRole?.[role];

    return item ? { title: item.title, path: item.path } : null;
}

const trim = (path) => `/${String(path || "").replace(/^\/+|\/+$/g, "")}`;

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// "/admin/user/{id}/edit/" → /^\/admin\/user\/[^/]+\/edit$/
const patterns = Object.entries(routesByRole || {}).map(([role, item]) => {
    const parts = trim(item.path).split("/").map((part) => (/^\{.+\}$/.test(part) ? "[^/]+" : escape(part)));

    return {
        role,
        check: Boolean(item.check),
        dynamic: /\{.+\}/.test(item.path),
        regex: new RegExp(`^${parts.join("/")}$`),
    };
});

/**
 * Página do caminho atual: {role, check} (check = a página exige permissão), ou null.
 * Rotas estáticas vencem as com parâmetro, como no roteador do servidor.
 */
export function pageForPath(pathname) {
    const path = trim(pathname);

    return patterns.find((page) => !page.dynamic && page.regex.test(path))
        || patterns.find((page) => page.dynamic && page.regex.test(path))
        || null;
}
