import App from "app";

const DbMethods = ['get', 'create', 'delete', 'update'];

const fluent = {
    where() {
        let args = Core.getArgs(arguments);
        args.unshift('where');
        return Core.setCondition.apply(null, args);
    },

    or(){
        let args = Core.getArgs(arguments);
        args.unshift('or');
        return Core.setCondition.apply(null, args); 
    },

    andOr(){
        let args = Core.getArgs(arguments);
        args.unshift('andOr');
        return Core.setCondition.apply(null, args); 
    },

    orderBy(state){
        let args = Core.getArgs(arguments);

        args.shift();

        let argsCount = args.length;
        let haSingleArg = argsCount === 1;

        if ( !argsCount ) return state;

        let firstArgType = App.type(args[0]);

        // .orderBy("nome")
        if ( haSingleArg && firstArgType == 'string' ){
            state.query.orderBy = [args[0]];
            return state;
        }

        if ( firstArgType == 'array' ){
            args = args[0];
            argsCount = args.length;
        }

        let lastArg = args[argsCount - 1];
        let lastIsSort = typeof lastArg == 'string' && ['desc', 'asc'].includes(lastArg.toLowerCase());
        
        let argsList = args;

        if ( lastIsSort ){

            // orderBy("nome", "...", "desc")
            argsList = argsList.slice(0, argsCount - 1);

            state.query.orderBy = [argsList, lastArg];

            return state;
        }

        state.query.orderBy = argsList;

        return state;
    },

    limit(state){
        let args = Core.getArgs(arguments);

        args.shift();

        let argsCount = args.length;
        let haSingleArg = argsCount === 1;

        if ( !argsCount ) return state;

        let isSingleList = Array.isArray(args[0]);

        if ( haSingleArg ){
            state.query.limit = isSingleList 
            ? args[0] 
            : [args[0]];
            return state;
        }

        if ( argsCount === 2 ){
            state.query.limit = args;
        }

        return state;
    },

    page(state, page=1){
        state.query.page = page;
        return state;
    },

    requestOptions(state, options={}){
        state.query.requestOptions = options;
        return state;
    },

    debug(state) {
        console.log('DEBUG query:', JSON.stringify(state.query, null, 2));
        return state;
    }
};

const DB = {
    
    get: function(state, route, args){

        let argsCount = args.length;

        //console.log("[Get]", {args})

        if ( !argsCount ) return Core.buildRequestProps(state, route);

        let firstArg = args[0];
        let typeFirstArg = App.type(firstArg);
  
        // .get(["nome", "idade"])
        let isFieldsList = argsCount === 1 && typeFirstArg == 'array';

        let fieldsList = isFieldsList ? args[0] : args;

        for( let i=0; i<fieldsList.length; i++ ){
            let field = fieldsList[i];
            state.query.fields.push(field);
        }

        return Core.buildRequestProps(state, route);
    },

    create: function(state, route, args){

        let argsCount = args.length;

        if ( !argsCount ) return {error: true, message: "Está faltando dados no método: create"};
        
        let fields = args[0];

        //console.log({args});

        if ( App.type(fields) !== "object" ) return {error: true, message: "Método create: os campos precisam ser um objeto"};

        state.query.fields = fields;

        return Core.buildRequestProps(state, route);
    },

    update: function(state, route, args){

        let argsCount = args.length;

        if ( !argsCount ) return {error: true, message: "Está faltando dados no método: update"};

        let firstArg = args[0];
        let fields = {};
        let isVerboseProps = App.type(firstArg) == "object";

        if ( argsCount === 2 ){
            fields[firstArg] = args[1];

        } else if ( isVerboseProps ){
            fields = firstArg;

            if ( fields.where ){
                Core.setCondition.apply(state, ['where', state, ...fields.where])
                delete fields.where;
            }
        }

        state.query.fields = fields;

        return Core.buildRequestProps(state, route);
    },

    delete: function(state, route, args){
        let argsCount = args.length;

        if ( argsCount ){
            Core.setCondition.apply(state, ['where', state, ...args]);
        }

        return Core.buildRequestProps(state, route);
    },
}

const Core = {

    setCondition: (type, state, arg1, arg2, arg3) => {

        // .where({id})
        if ( App.type(arg1) == "object" ){

            Object.keys(arg1).forEach(key => {
                let value = arg1[key];
                state.query[type].push([key, '=', value]);
            })
            return state;
        }

        // where("id", "=", 123)
        if ( arg3 ){
            state.query[type].push([arg1, arg2, arg3]);
            return state;
        }

        // where(["id", "=", 123],["idade", ">", 18]])
        if ( !arg2 && Array.isArray(arg1) ){
            state.query[type] = state.query[type].concat(arg1);
            return state;
        }

        if ( arg1 && arg2 ){

            if ( typeof arg2 == "string" && arg2.toLowerCase().includes('is') ){

                // where("id", "is not null")
                // where("id", "is null")
                // where("id", "is not empty")
                state.query[type].push([arg1, arg2]);
                return state;
            }

            // where("id", 123)
            state.query[type].push([arg1, '=', arg2]);
        }

        return state;
    },

    getStateData: () => {
        return {
            fields: [],
           // onDuplicateUpdate: [],
            requestOptions: {},
            where: [],
            or: [],
            andOr: [],
            orderBy: [],
            limit: [],
            page: 1,
            //leftJoin: []
        }
    },

    getArgs: function(args){
        return Array.prototype.slice.call(args);
    },

    buildRequestProps: (state, route) => {

        let requestOptions = state.query.requestOptions;

        delete state.query.requestOptions;

        let requestProps = App.extendObj(true, {
            url: route.path,
            method: route.type || 'post',
            dataType: "json",
            headers: {},    
            data: state.query,
        }, requestOptions);

        // reset do state para garantir que a mesma chain não mantenha dados
        state.query = Core.getStateData();

        return requestProps;
    },
}

/**
 * Substitua essa função pelo seu request real (fetch/axios).
 * Retornamos Promise para que o consumo possa usar await/then.
 */
function performRequest(props) {
  // Exemplo: simula requisição assíncrona
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        ok: true,
        props
      });
    }, 0);
  });
}

/**
 * Api factory:
 * - routes: objeto com rotas (get/create/update/delete...)
 */
function apiFactory(routes, config = {}) {

  // detecta se um objeto é *rota* (leaf) ou um grupo
  function isRoute(obj) {
    return obj && typeof obj === 'object' && (
      'method' in obj || 'path' in obj || 'type' in obj
    );
  }
  
  function isGroup(obj) {
    return obj && typeof obj === 'object' && !isRoute(obj);
  }

  // cria um chain (builder) com STATE isolado
  function createChain(routeGroup = routes) {
    const state = { query: Core.getStateData() || [] };

    // handler do chain (vai tratar fluent + rotas + subgrupos)
    const chainHandler = {
      get(_, prop) {
        // 1) fluent methods (somente se não for vendor)
        if (!config.vendor && fluent && typeof fluent[prop] === 'function') {
          return function (...args) {
            fluent[prop].apply(fluent, [state, ...args]);
            return chainProxy; // encadeável e com mesmo state
          };
        }

        // 2) subgrupo (ex: routeGroup.template -> retorna novo chain para esse grupo)
        if (isGroup(routeGroup[prop])) {
          return createChain(routeGroup[prop]);
        }

        // 3) rota leaf => retorna função executor
        if (isRoute(routeGroup[prop])) {
          return function (...args) {
            // clona rota para não mutar original
            const route = App.extendObj({}, routeGroup[prop]);

            // vendor mode: normalmente ignoramos fluent e usamos request direto
            if (config.vendor) {
              // se você precisar transformar path com placeholders etc, faça aqui
              // Ex.: preencher {slug} se args vierem assim
              // Para simplicidade, montamos requestProps com Core.buildRequestProps({}, route, args)
              args = Core.getArgs(args);

              let requestProps = {
                url: route.path,
                method: route.type || 'post',
                dataType: "json",
                headers: {},    
                data: args[0] ?? {}
              };

              return App.request(requestProps);
            }

            // Non-vendor: considerar DbMethods ou builder
            route.method = route.custom?.method ?? route.method;
            let requestProps = {};
            const isDbMethod = DbMethods.includes(route.method);

            if (isDbMethod) {
              const parsedArgs = Core.getArgs(args);
              requestProps = DB[route.method](state, route, parsedArgs);

            } else {

              requestProps = App.extendObj(true, {
                  url: route.path,
                  method: route.type || 'post',
                  dataType: "json",
                  headers: {},    
                  data: args[0] ?? {},
              }, (state.query.requestOptions || {}));
            }

            // reset do state (segurança: impedindo vazamento se alguém reutilizar chain)
            state.query = Core.getStateData();

            return App.request(requestProps);
          };
        }

        // nada encontrado
        return undefined;
      }
    };

    const chainProxy = new Proxy({}, chainHandler);
    return chainProxy;
  }

  // main proxy handler (top-level: TesteApi.* ou VendorApi.*)
  const mainHandler = {
    get(_, prop) {
      // 1) fluent initiation: TesteApi.where(...) -> cria chain e executa método fluent
      if (!config.vendor && fluent && typeof fluent[prop] === 'function') {
        return function (...args) {
          const chain = createChain(routes);
          return chain[prop](...args);
        };
      }

      // 2) se prop é um grupo (ex: VendorApi.template) -> retorna chain para esse grupo
      if (isGroup(routes[prop])) {
        return createChain(routes[prop]);
      }

      // 3) se prop é rota no topo (ex: TesteApi.get()) -> cria chain para top-level e retorna função
      if (isRoute(routes[prop])) {
        const chain = createChain(routes);
        return chain[prop]; // retorna a função executor definida no chain
      }

      return undefined;
    }
  };

  return new Proxy({}, mainHandler);
}

export default apiFactory;