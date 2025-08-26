import configs from "storage/builds/configs.build.json";

export default function data(key='', fallback=null){
    window.App = window.App || {};
    return configs[key] || window.App[key] || fallback;
}