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
