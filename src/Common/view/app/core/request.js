
function buildUrl(url, data) {
    const query = new URLSearchParams(data).toString();
    if (!query) return url;
    return url + (url.includes('?') ? '&' : '?') + query;
}

function buildBody(data, dataType) {
    if (data instanceof FormData) return data;

    if (dataType === 'json') return JSON.stringify(data);
    if (dataType === 'urlencoded') return new URLSearchParams(data);
    
    return data;
}

function parseResponse(response, dataType) {
    if (dataType === 'json') return response.json();
    if (dataType === 'text') return response.text();
    if (dataType === 'blob') return response.blob();
    return response;
}

const request = function(options) {
    const {
        url,
        method = 'GET',
        data = null,
        headers = {},
        dataType = 'json', // define o tipo de resposta E o content-type
        success,
        error,
        complete,
    } = options;

    const isFormData = data instanceof FormData;

    // Define o content-type com base no dataType
    let contentTypeHeader = '';
    if (!isFormData) {
        if (dataType === 'json') {
            contentTypeHeader = 'application/json';
        } else if (dataType === 'urlencoded') {
            contentTypeHeader = 'application/x-www-form-urlencoded; charset=UTF-8';
        }
    }

    const fetchOptions = {
        method: method.toUpperCase(),
        headers: {
            ...headers,
            ...(contentTypeHeader && { 'Content-Type': contentTypeHeader }),
        }
    };

    let finalUrl = url;

    if (fetchOptions.method === 'GET' && data) {
        finalUrl = buildUrl(url, data);
    } else if (data) {
        fetchOptions.body = buildBody(data, dataType);
    }

    return fetch(finalUrl, fetchOptions)
        .then(response =>
            parseResponse(response, dataType).then(parsed => {
                if (!response.ok) throw { response, data: parsed };

                if (typeof success === 'function') {
                    success(parsed, 'success', response);
                }

                return parsed;
            })
        )
        .catch(err => {
            if (typeof error === 'function') {
                error(err.data || null, 'error', err.response || null);
            }

            throw err.data || err;
        })
        .finally(() => {
            if (typeof complete === 'function') {
                complete();
            }
        });
};

export default request;