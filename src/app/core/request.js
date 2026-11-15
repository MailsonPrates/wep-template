import { triggerError } from "components/error/errorManager";

/**
 * Requisição para a API do app.
 *
 * A promise SEMPRE resolve com o corpo da resposta ({error, message, data, http_code...}).
 * Erros também: as telas tratam com `if (res.error) ...` em vez de try/catch.
 *
 *  - 401 (sessão expirada): vai para o login. O servidor guarda a página atual para voltar a ela.
 *  - 403/404: devolve o erro para a tela. Com `errorPage: true`, mostra a página de erro.
 *  - falha de rede ou resposta que não é JSON: {error: true, message, http_code}.
 *
 * @example
 * const res = await request({url: "/admin/user/api/get/", method: "post", data: {id: 1}});
 * if (res.error) showToast({state: "error", message: res.message});
 */

const LOGIN_PATH = "/login";

const NETWORK_ERROR = "Não foi possível conectar ao servidor. Verifique sua conexão.";
const SERVER_ERROR = "Houve um erro no servidor. Tente novamente.";

/**
 * Query string no formato do PHP: {filters: {status: "on"}} → filters[status]=on
 */
function toQuery(data, prefix = "", params = new URLSearchParams()) {
    Object.entries(data || {}).forEach(([key, value]) => {
        const name = prefix ? `${prefix}[${key}]` : key;

        if (value === undefined) return;

        if (value !== null && typeof value === "object") {
            toQuery(value, name, params);
            return;
        }

        params.append(name, value === null ? "" : String(value));
    });

    return params;
}

function buildUrl(url, data) {
    const query = toQuery(data).toString();
    if (!query) return url;
    return url + (url.includes("?") ? "&" : "?") + query;
}

function buildBody(data, dataType) {
    if (data instanceof FormData || data instanceof Blob) return data;
    if (dataType === "json") return JSON.stringify(data);
    if (dataType === "urlencoded") return toQuery(data);
    return data;
}

async function parseBody(response, dataType) {
    if (dataType === "blob") return response.blob();

    const text = await response.text();

    if (dataType === "text") return text;

    try {
        return text ? JSON.parse(text) : null;
    } catch (e) {
        return undefined; // não é JSON (ex.: página de erro HTML)
    }
}

/** Só caminhos do próprio site: um "redirect" nunca leva para outro domínio. */
function isSafeRedirect(path) {
    return typeof path === "string" && path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");
}

let redirectingToLogin = false;

function goToLogin() {
    if (redirectingToLogin || window.location.pathname.startsWith(LOGIN_PATH)) return;

    redirectingToLogin = true;
    window.location.assign(LOGIN_PATH);
}

export const request = function (options) {

    const {
        url,
        method = "GET",
        data = null,
        headers = {},
        dataType = "json",
        errorPage = false,
        success,
        error,
        complete,
    } = options;

    const isRawBody = data instanceof FormData || data instanceof Blob;

    const fetchOptions = {
        method: method.toUpperCase(),
        credentials: "same-origin",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            ...(dataType === "json" && { "Accept": "application/json" }),
            ...(!isRawBody && dataType === "json" && { "Content-Type": "application/json" }),
            ...(!isRawBody && dataType === "urlencoded" && { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }),
            ...headers,
        },
    };

    let finalUrl = url;

    if (fetchOptions.method === "GET" && data) {
        finalUrl = buildUrl(url, data);
    } else if (data) {
        fetchOptions.body = buildBody(data, dataType);
    }

    const finish = (result, response = null) => {
        const failed = !response?.ok || (result && typeof result === "object" && result.error === true);

        if (failed) {
            if (typeof error === "function") error(result, "error", response);
        } else if (typeof success === "function") {
            success(result, "success", response);
        }

        return result;
    };

    return fetch(finalUrl, fetchOptions)
        .then(response => parseBody(response, dataType).then(
            parsed => [response, parsed],
            () => [response, undefined]
        ))
        .then(([response, parsed]) => {

            // sessão expirada (401; "is_logged_out" mantém compatibilidade com servidores antigos)
            if (response.status === 401 || parsed?.is_logged_out) {
                goToLogin();
            }

            if (errorPage && (response.status === 403 || response.status === 404)) {
                triggerError({ status: response.status });
            }

            if (!response.ok) {
                const body = parsed && typeof parsed === "object" ? parsed : {};

                return finish({
                    ...body,
                    error: true,
                    message: body.message || SERVER_ERROR,
                    http_code: body.http_code || response.status,
                }, response);
            }

            if (parsed === undefined) {
                return finish({ error: true, message: SERVER_ERROR, http_code: response.status }, response);
            }

            if (parsed?.redirect && isSafeRedirect(parsed.redirect)) {
                window.location.assign(parsed.redirect);
            }

            return finish(parsed, response);
        },
        // só falhas do fetch (rede, CORS): erros nos callbacks da tela não viram "falha de conexão"
        () => finish({ error: true, message: NETWORK_ERROR, http_code: 0 }))
        .finally(() => {
            if (typeof complete === "function") complete();
        });
};
