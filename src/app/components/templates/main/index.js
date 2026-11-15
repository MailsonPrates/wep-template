import { useEffect, useState } from "react";
import config from "core/config";
import Breadcrumbs from "./Breadcrumbs";
import Nav from "./Nav";
import { Sidebar, SidebarMobile } from "./Sidebar";

/**
 * Layout das páginas logadas: nav, sidebar com o menu principal, título e breadcrumbs.
 *
 *   <TemplateMain title="Usuários" breadcrumbs={["page.admin"]} actions={<Button/>}>...</TemplateMain>
 *
 * @param {string} title
 * @param {Array|false} breadcrumbs  permissões de página ou {title, path}; false esconde
 * @param {boolean} header           false esconde título e breadcrumbs (ex.: Home)
 * @param {React.ReactNode} actions  botões à direita do título
 */
export default function TemplateMain({ title = "Sem título", breadcrumbs = [], header = true, actions, children }) {
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    useEffect(() => {
        document.title = `${title} | ${config("title", "") || config("name", "") || "Wep"}`;
    }, [title]);

    return (
        <div className="main">
            <Nav onMenuClick={() => setShowMobileMenu(true)} />
            <div className="container-fluid">
                <div className="row flex-nowrap">
                    <Sidebar />
                    <SidebarMobile show={showMobileMenu} onClose={() => setShowMobileMenu(false)} />
                    <main className="col p-3 ms-md-4 min-w-0" style={{ minWidth: 0 }}>
                        {header !== false && (
                            <div className="page-header d-flex flex-wrap align-items-end justify-content-between gap-2">
                                <div>
                                    <h1 className="fw-light">{title}</h1>
                                    {breadcrumbs !== false && <Breadcrumbs list={breadcrumbs} />}
                                </div>
                                {actions && <div className="page-actions">{actions}</div>}
                            </div>
                        )}
                        <div className="main-content mt-4 bg-white rounded-3 p-md-3">{children}</div>
                    </main>
                </div>
            </div>
        </div>
    );
}
