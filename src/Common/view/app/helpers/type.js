// Cria o mapeamento interno usado pelo jQuery
const class2type = {};
const toString = Object.prototype.toString;

[
  "Boolean", "Number", "String", "Function", "Array",
  "Date", "RegExp", "Object", "Error", "Symbol", "Map",
  "Set", "WeakMap", "WeakSet", "BigInt"
].forEach(name => {
  class2type[`[object ${name}]`] = name.toLowerCase();
});

function type(obj) {
  if (obj == null) {
    return obj + ""; // "null" ou "undefined"
  }

  // typeof com fallback para objetos "complexos"
  return typeof obj === "object" || typeof obj === "function"
    ? class2type[toString.call(obj)] || "object"
    : typeof obj;
}

export default type; // ESM
