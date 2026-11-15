import { useEffect } from "react";
import { Link } from "react-router";
import config from "core/config";
import Logo from "./Logo";

/**
 * Layout das telas de autenticação (login, recuperação de senha, nova senha).
 *
 *   <AuthPage documentTitle="Login" title="Acesse sua conta" loading={loading}>...</AuthPage>
 */
export default function AuthPage({ documentTitle, title, subtitle, loading = false, footer, children }) {
    useEffect(() => {
        const appName = config("title", "") || config("name", "") || "Wep";
        document.title = documentTitle ? `${documentTitle} | ${appName}` : appName;
    }, [documentTitle]);

    return (
        <div className="auth-page">
            <div className={`auth-page-box${loading ? " full-loading" : ""}`}>
                <Link to="/" className="d-inline-block"><Logo /></Link>
                {(title || subtitle) && (
                    <div className="my-4">
                        {title && <h1 className="mb-0 h2">{title}</h1>}
                        {subtitle && <div className="text-secondary">{subtitle}</div>}
                    </div>
                )}
                <div className="mt-3 bg-white p-4 rounded shadow-sm text-start">{children}</div>
                {footer && <div className="mt-3">{footer}</div>}
            </div>
        </div>
    );
}
