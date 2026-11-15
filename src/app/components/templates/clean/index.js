import { useEffect } from "react";
import { Link } from "react-router";
import config from "core/config";
import Logo from "components/Logo";

/**
 * Layout limpo (sem menu), para páginas públicas como o cadastro por convite.
 *   <TemplateClean documentTitle="Convite" title="Preencha o seu cadastro">...</TemplateClean>
 */
export default function TemplateClean({ documentTitle, title, children, fluid = false }) {
    useEffect(() => {
        const appName = config("title", "") || config("name", "") || "Wep";
        document.title = documentTitle ? `${documentTitle} | ${appName}` : appName;
    }, [documentTitle]);

    return (
        <div className="main">
            <div className={`mt-4 ${fluid ? "container-fluid" : "container"}`} style={{ maxWidth: 700 }}>
                <div className="text-center">
                    <Link to="/" className="d-inline-block"><Logo className="mx-auto" /></Link>
                </div>
                {title && <h1 className="fw-light mt-4">{title}</h1>}
                <div className="mt-4 bg-white rounded-3 p-3 px-md-5">{children}</div>
            </div>
        </div>
    );
}
