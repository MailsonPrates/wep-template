import { triggerError } from "ui/error/errorManager";

function buildUrl(url, data) {
    const query = new URLSearchParams(data).toString();
    if (!query) return url;
    return url + (url.includes("?") ? "&" : "?") + query;
}

function buildBody(data, dataType) {
    if (data instanceof FormData) return data;
    if (dataType === "json") return JSON.stringify(data);
    if (dataType === "urlencoded") return new URLSearchParams(data);
    return data;
}

function parseResponse(response, dataType) {
    if (dataType === "json") return response.json();
    if (dataType === "text") return response.text();
    if (dataType === "blob") return response.blob();
    return response;
}

export const request = function (options) {

    const {
        url,
        method = "GET",
        data = null,
        headers = {},
        dataType = "json",
        success,
        error,
        complete,
    } = options;

    const isFormData = data instanceof FormData;

    let contentTypeHeader = "";
    if (!isFormData) {
        if (dataType === "json") contentTypeHeader = "application/json";
        if (dataType === "urlencoded")
            contentTypeHeader = "application/x-www-form-urlencoded; charset=UTF-8";
    }

    const fetchOptions = {
        method: method.toUpperCase(),
        headers: {
            ...headers,
            ...(contentTypeHeader && { "Content-Type": contentTypeHeader }),
        },
    };

    let finalUrl = url;

    if (fetchOptions.method === "GET" && data) {
        finalUrl = buildUrl(url, data);
    } else if (data) {
        fetchOptions.body = buildBody(data, dataType);
    }

    return fetch(finalUrl, fetchOptions)
        .then(async response => {

            const parsed = await parseResponse(response, dataType);

              //console.log({parsed, response, fetchOptions});

            if (!response.ok) {

                if (response.status === 403 || response.status === 404 ) {
                    triggerError({ status: res.status });
                    return null;
                }

                throw { response, data: parsed };
            }

            if ( parsed ){

                if ( parsed.error && parsed.http_code > 400 ){
                    return parsed;
                }

                if (parsed.redirect) {
                    window.location.href = parsed.redirect;
                }
            }

            if (typeof success === 'function') success(parsed, 'success', response);
            return parsed;
        })
        .catch((err) => {
            if (typeof error === "function")
                error(err.data || null, "error", err.response || null);

            throw err.data || err;
        })
        .finally(() => {
            if (typeof complete === "function") complete();
        });
};
