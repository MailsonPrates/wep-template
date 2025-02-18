export default function uniqueId(prefix=""){

    return prefix + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}