import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { pageForPath } from "core/route";
import { can, user } from "core/user";
import Error403 from "./Error403";
import Error404 from "./Error404";
import ErrorPage from "./ErrorPage";
import { registerSetError } from "./errorManager";

const ErrorContext = createContext();

const HOME_ROLE = "page.home";

/**
 * A página exige uma permissão que o usuário não tem? Mesma regra do CheckPermission no servidor:
 * só páginas que passam por ele (check), e a Home é liberada.
 */
function isForbidden(pathname) {
    const current = user();

    if (!current.is_logged) return false;

    const page = pageForPath(pathname);

    return Boolean(page && page.check && page.role !== HOME_ROLE && !can(page.role));
}

/**
 * Tela de erro no lugar da página (403, 404...). Mostra "Acesso negado":
 *  - na primeira carga, quando o servidor recusou a página (window.App.forbidden);
 *  - ao navegar dentro do app para uma página sem permissão (essa navegação não passa pelo
 *    servidor, então a regra é conferida aqui; os dados continuam protegidos pela API).
 */
export function ErrorProvider({ children }) {
    const { pathname } = useLocation();

    // erro definido por uma tela/requisição (triggerError); vale só para o caminho em que surgiu
    const [state, setState] = useState(() => ({
        path: pathname,
        error: window.App && window.App.forbidden ? { status: 403 } : null,
    }));

    useEffect(() => {
        registerSetError((error) => setState((prev) => ({ ...prev, error })));
        return () => registerSetError(null);
    }, []);

    // trocou de página: o erro anterior sai (atualização durante a renderização, sem montar a
    // página antiga com o erro nem a nova antes da checagem)
    let current = state;

    if (state.path !== pathname) {
        current = { path: pathname, error: null };
        setState(current);
    }

    // a permissão é conferida ANTES de montar a página: uma página proibida nem chega a chamar a API
    const error = current.error || (isForbidden(pathname) ? { status: 403 } : null);
    const setError = (value) => setState((prev) => ({ ...prev, error: value }));

    return (
        <ErrorContext.Provider value={{ error, setError }}>
            {error ? <ErrorPageComponent status={error.status} /> : children}
        </ErrorContext.Provider>
    );
}

export function useError() {
    return useContext(ErrorContext);
}

function ErrorPageComponent({ status }) {
    if (status === 403) return <Error403 />;
    if (status === 404) return <Error404 />;
    return <ErrorPage code={status || "Erro"} description="Erro desconhecido!" />;
}
