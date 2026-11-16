import { Col, Row } from "react-bootstrap";

/**
 * Permissões do grupo por módulo → páginas → funções (APIs da página).
 *
 *  - módulo: marca (ou desmarca, se tudo já estiver marcado) todas as páginas e funções;
 *  - página: marca a página e suas funções; desmarcar tira a página e as funções;
 *  - função: marca a função e a página dela; sem nenhuma função marcada, a página sai junto.
 *
 * @param {Array} modules  Roles::get(): [{module_name, module_title, pages: [{role, title, methods}], methods}]
 * @param {string[]} value roles marcadas
 * @param {(roles: string[]) => void} onChange
 */
export default function RolesPicker({ modules = [], value = [], onChange }) {
    const selected = new Set(value);
    const emit = (set) => onChange(Array.from(set));

    const toggleModule = (module) => {
        const roles = [
            ...(module.pages || []).map((page) => page.role),
            ...(module.methods || []).map((method) => method.role),
        ];
        const allSelected = roles.every((role) => selected.has(role));
        const next = new Set(selected);

        roles.forEach((role) => (allSelected ? next.delete(role) : next.add(role)));
        emit(next);
    };

    const togglePage = (page) => {
        const roles = [page.role, ...(page.methods || []).map((method) => method.role)];
        const next = new Set(selected);
        const remove = selected.has(page.role);

        roles.forEach((role) => (remove ? next.delete(role) : next.add(role)));
        emit(next);
    };

    const toggleMethod = (method, page) => {
        const next = new Set(selected);

        if (next.has(method.role)) {
            next.delete(method.role);

            const hasOtherMethod = (page.methods || []).some((item) => next.has(item.role));
            if (!hasOtherMethod) next.delete(page.role);
        } else {
            next.add(method.role);
            next.add(page.role);
        }

        emit(next);
    };

    return (
        <div className="border p-3 rounded bg-light">
            {modules.filter((module) => (module.pages || []).length).map((module, index) => (
                <div key={module.module_name} className={`roles-module${index > 0 ? " border-top pt-3" : ""}`}>
                    <button
                        type="button"
                        className="btn btn-link text-reset text-decoration-none p-0 mb-2 fw-semibold fs-4"
                        onClick={() => toggleModule(module)}
                    >
                        {module.module_title || module.module_name}
                    </button>
                    <Row>
                        {module.pages.map((page) => {
                            const pageSelected = selected.has(page.role);

                            return (
                                <Col key={page.role} md={6} className="mb-3">
                                    <div className="border p-2 rounded-3 bg-white h-100">
                                        <button
                                            type="button"
                                            className="btn btn-link text-reset text-decoration-none p-0 text-start"
                                            onClick={() => togglePage(page)}
                                        >
                                            <span className={`roles-badge me-2${pageSelected ? " is-on" : ""}`}>Página</span>
                                            <span className={pageSelected ? "fw-semibold text-success" : "roles-off"}>{page.title || page.role}</span>
                                        </button>
                                        {(page.methods || []).length > 0 && (
                                            <div className="mt-2">
                                                {page.methods.map((method) => {
                                                    const methodSelected = selected.has(method.role);

                                                    return (
                                                        <button
                                                            key={method.role}
                                                            type="button"
                                                            onClick={() => toggleMethod(method, page)}
                                                            className={`btn btn-sm d-inline-flex align-items-center rounded-3 px-2 m-1 border ${methodSelected ? "text-success border-success-subtle" : "border-white roles-off"}`}
                                                        >
                                                            <span className={`roles-badge roles-badge-sm me-2${methodSelected ? " is-on" : ""}`}>Função</span>
                                                            {method.title || method.role}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                </div>
            ))}
        </div>
    );
}
