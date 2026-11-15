import normalizeString from "./normalize-string";

/**
 * Texto digitado → nome de usuário: minúsculo, sem acentos, espaços viram ponto.
 * "João da Silva" → "joao.da.silva"
 */
export default function toUsername(value = "") {
    return normalizeString(String(value))
        .trim()
        .replace(/\s+/g, ".")
        .replace(/[^a-z0-9._-]/g, "");
}
