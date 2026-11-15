/**
 * Dados do usuário logado, injetados pelo servidor no HTML (Main.php → window.App.user).
 * Chegam com a página: nenhuma requisição extra para montar menu, nav e permissões.
 */
export function user() {
    return (window.App && window.App.user) || {};
}

/** O usuário tem a permissão (role)? Ex.: can("api.admin.user.save") */
export function can(role) {
    const permissions = user().permissions || [];
    return permissions.includes(role);
}

/** Página inicial do grupo do usuário (Admin > Grupo de usuários > Rota inicial). */
export function homePath() {
    return user().home_path || "/";
}

/** Configurações visuais (Config > Visual): {logo, ...}. */
export function visual() {
    return (window.App && window.App.visual) || {};
}
