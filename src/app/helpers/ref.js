import React from "react";

/**
 * Atalho para refs de elementos:
 *
 *   <input ref={$.refs.password} />
 *   $.password.value   // elemento atual (null se não estiver na tela)
 *
 * O elemento é lido do ref a cada acesso. (Antes o primeiro valor ficava guardado para sempre:
 * ao voltar para a tela, `$.password` apontava para o input antigo, já desmontado.)
 */
const refs = new Proxy({}, {
    get(target, key) {
        if (!target[key]) target[key] = React.createRef();
        return target[key];
    }
});

const $ = new Proxy({}, {
    get(_, key) {
        if (key === "refs") return refs;
        return refs[key].current ?? null;
    }
});

export default $;
