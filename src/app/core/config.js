import configs from "storage/builds/configs.build.json";

/**
 * Configuração do app: primeiro o build (config/app.php → configs.build.json), depois o que o
 * servidor injetou na página (window.App). `false`, `0` e "" são respeitados (antes caíam no fallback).
 */
export default function config(key = "", fallback = null) {
    if (configs[key] !== undefined && configs[key] !== null) return configs[key];

    const injected = (window.App || {})[key];

    return injected !== undefined && injected !== null ? injected : fallback;
}
