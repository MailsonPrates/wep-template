import { request } from "./request";

/** "string" | "number" | "object" (objeto simples) | "array" | ... */
const getType = (value) => {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object") return Object.getPrototypeOf(value) === Object.prototype ? "object" : "instance";
    return typeof value;
};

/**
 * Api factory: transforma o mapa de rotas de um módulo (gerado pelo `php app update`)
 * em funções de chamada. Só existem os métodos declarados no config/module.php do módulo.
 *
 * Cada método envia o payload como está, e o controller (<Módulo>Api.php) trata os dados:
 *
 *   PedidoApi.get({ id: 3 })
 *   PedidoApi.update({ id: 3, status: "pago" })
 *   LoginApi.login({ username, password })
 *
 * Exceção: rotas do CRUD automático do Core ('methods' => [...] no module.php, marcadas com
 * `crud` no build) seguem o contrato {id, fields}, em que o front não monta queries:
 *
 *   XApi.get()  XApi.get(id)  XApi.get({status: "on", page: 2})
 *   XApi.create({name})  XApi.update(id, {name})  XApi.delete(id)
 *
 * Opções da requisição (FormData, headers...):  UserProfileApi.requestOptions({data: fd}).salvar()
 */

const DB_METHODS = ['get', 'create', 'update', 'delete'];

/** Métodos do construtor de queries antigo: removidos (a query é definida no servidor). */
const REMOVED = ['where', 'or', 'andOr', 'orderBy', 'limit', 'page', 'fields', 'debug'];

const isScalar = (value) => ['string', 'number'].includes(getType(value)) && value !== '';

const failure = (message) => {
    console.error(`[api] ${message}`);
    return Promise.resolve({error: true, message});
};

/**
 * Payload de cada método de banco, ou {error} quando os argumentos estão fora do contrato.
 */
const DB = {

    get(args) {
        const [first] = args;

        if ( first === undefined || first === null ) return {};

        if ( isScalar(first) ) return {id: first};

        if ( getType(first) === 'object' ){
            const {page, per_page, ...filters} = first;
            const data = {filters};

            if ( page !== undefined ) data.page = page;
            if ( per_page !== undefined ) data.per_page = per_page;

            return data;
        }

        return {error: 'get(): use get(), get(id) ou get({filtro: valor})'};
    },

    create(args) {
        const [fields] = args;

        if ( getType(fields) !== 'object' ) return {error: 'create(campos): os campos precisam ser um objeto'};

        return {fields};
    },

    update(args) {
        const [id, fields] = args;

        if ( !isScalar(id) ) return {error: 'update(id, campos): informe o id do registro'};
        if ( getType(fields) !== 'object' ) return {error: 'update(id, campos): os campos precisam ser um objeto'};

        return {id, fields};
    },

    delete(args) {
        const [id] = args;

        if ( !isScalar(id) ) return {error: 'delete(id): informe o id do registro'};

        return {id};
    },
};

/**
 * Junta as opções padrão com as do requestOptions(). Merge raso, exceto headers:
 * um merge profundo transformaria FormData/Blob em objeto vazio.
 */
function buildRequest(route, data, options = {}) {
    return {
        url: route.path,
        method: route.type || 'post',
        dataType: 'json',
        data,
        ...options,
        headers: {...(options.headers || {})},
    };
}

function apiFactory(routes, config = {}) {

    // rota (folha) ou grupo de rotas
    const isRoute = (obj) => obj && typeof obj === 'object' && ('method' in obj || 'path' in obj || 'type' in obj);
    const isGroup = (obj) => obj && typeof obj === 'object' && !isRoute(obj);

    function createChain(routeGroup = routes) {
        // estado isolado por chain: só opções da requisição
        const state = {requestOptions: {}};

        const handler = {
            get(_, prop) {

                if ( prop === 'requestOptions' ){
                    return (options = {}) => {
                        state.requestOptions = {...state.requestOptions, ...options};
                        return proxy;
                    };
                }

                if ( REMOVED.includes(prop) && !routeGroup[prop] ){
                    return () => {
                        throw new Error(
                            `[api] ${String(prop)}() foi removido: o front não monta mais queries. `
                            + 'Use get(), get(id), get({filtro: valor}), create(campos), update(id, campos) ou delete(id).'
                        );
                    };
                }

                if ( isGroup(routeGroup[prop]) ) return createChain(routeGroup[prop]);

                if ( !isRoute(routeGroup[prop]) ) return undefined;

                return (...args) => {
                    const route = {...routeGroup[prop]};
                    const options = state.requestOptions;

                    // estado não vaza para a próxima chamada da mesma chain
                    state.requestOptions = {};

                    if ( config.vendor ){
                        return request(buildRequest(route, args[0] ?? {}, options));
                    }

                    // só o CRUD automático do Core (rotas de 'methods', marcadas com crud no build)
                    // usa o contrato {id, fields}; os demais métodos enviam o payload como está
                    const isCrud = route.crud === true && DB_METHODS.includes(route.method);

                    if ( isCrud ){
                        const data = DB[route.method](args);

                        if ( data.error ) return failure(data.error);

                        return request(buildRequest(route, data, options));
                    }

                    return request(buildRequest(route, args[0] ?? {}, options));
                };
            }
        };

        const proxy = new Proxy({}, handler);

        return proxy;
    }

    return createChain(routes);
}

export default apiFactory;
