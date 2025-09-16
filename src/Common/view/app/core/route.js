import map from "storage/builds/route-maps.build.json";

export default function route(role, params={}){
    
    let route = map[role] || "";

    if ( !route ) return;
    
    if ( !route.path.includes("{") ) return route;

    route.path = route.path.replace(/{(\w+)}/g, (_, key) => params[key] ?? `{${key}}`);

    return route;
}