import { createContext, useCallback, useContext, useMemo, useState } from "react";
import ToastContainer from "./ToastContainer";

const ToastContext = createContext(null);

let nextId = 0;

/**
 * Normaliza o que as telas passam para um toast:
 *  - uma resposta da API ({error, message}): erro vira "danger", sucesso vira "success";
 *  - {type|state: "success"|"error"|"danger"|"info"|"warning", message, autoHide, duration}.
 */
function normalize(input = {}) {
    const aliases = { error: "danger", danger: "danger", success: "success", warning: "warning", info: "info" };

    let type = input.type || input.state;

    if (!type && typeof input.error === "boolean") type = input.error ? "error" : "success";

    type = aliases[type] || "info";

    const message = input.message || input.content || (type === "danger" ? "Houve um erro" : "Realizado com sucesso");

    return {
        id: input.id || `toast-${++nextId}`,
        type,
        message,
        body: input.body,
        // autoHide: false mantém o toast até o usuário fechar (ex.: senha temporária para copiar).
        // Antes "autoHide ? autoHide : true" ignorava o false e o toast sumia em 5s.
        autoHide: input.autoHide !== false,
        duration: input.duration || 5000,
    };
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const remove = useCallback((id) => {
        setToasts((list) => list.filter((toast) => toast.id !== id));
    }, []);

    const add = useCallback((input) => {
        const toast = normalize(input);

        // mesmo id = mesmo aviso: não empilha duplicado
        setToasts((list) => (list.some((item) => item.id === toast.id) ? list : [...list, toast]));

        return { id: toast.id, remove: () => remove(toast.id) };
    }, [remove]);

    const value = useMemo(() => ({ add, remove }), [add, remove]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onClose={remove} />
        </ToastContext.Provider>
    );
}

/**
 * const toast = useToast();
 * toast(res);                      // resposta da API: erro ou sucesso, com a mensagem do servidor
 * toast({type: "success", message: "Salvo", autoHide: false});
 * toast.success("Salvo"); toast.error("Falhou");
 * const t = toast.info("Enviando..."); t.remove();
 */
export function useToast() {
    const context = useContext(ToastContext);

    return useMemo(() => {
        const add = context ? context.add : () => ({ id: null, remove() {} });
        const toast = (input) => add(input);

        toast.success = (message, options = {}) => add({ ...options, type: "success", message });
        toast.error = (message, options = {}) => add({ ...options, type: "error", message });
        toast.info = (message, options = {}) => add({ ...options, type: "info", message });
        toast.remove = (id) => context && context.remove(id);

        return toast;
    }, [context]);
}
