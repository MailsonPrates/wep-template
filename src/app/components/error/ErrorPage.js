import { Link } from "react-router";
import { homePath } from "core/user";

/** Página de erro (403, 404...) com botão de voltar para a página inicial do usuário. */
export default function ErrorPage({ code, description, backButton = true }) {
    return (
        <div className="error-page">
            <div>
                <div className="d-flex align-items-center justify-content-center">
                    <div className="error-page-code">{code}</div>
                    <div className="error-page-description">{description}</div>
                </div>
                {backButton && (
                    <div className="text-center mt-4">
                        <Link to={homePath()} className="btn btn-primary btn-lg w-50">voltar</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
