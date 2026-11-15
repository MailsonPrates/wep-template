import { Link } from "react-router";
import { HiOutlineHome } from "react-icons/hi2";
import route from "core/route";
import { homePath } from "core/user";

/**
 * Trilha de navegação. Itens: permissão de página ("page.admin" → título e caminho pelo mapa de
 * rotas) ou {title, path}. "Início" leva à página inicial do grupo do usuário.
 */
export default function Breadcrumbs({ list = [] }) {
    const items = (Array.isArray(list) ? list : [])
        .map((item) => (typeof item === "string" ? route(item) : item))
        .filter((item) => item && item.title);

    return (
        <nav aria-label="breadcrumb" style={{ "--bs-breadcrumb-divider": "'›'" }}>
            <ol className="breadcrumb mb-0 fs-14 text-secondary">
                <li className="breadcrumb-item">
                    <Link className="text-reset d-inline-flex align-items-center" to={homePath()}>
                        <HiOutlineHome />
                        <span className="ms-1">Início</span>
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={`${index}-${item.title}`} className={`breadcrumb-item${item.active ? " active" : ""}`}>
                        {item.active || !item.path
                            ? item.title
                            : <Link className="text-reset" to={item.path}>{item.title}</Link>}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
