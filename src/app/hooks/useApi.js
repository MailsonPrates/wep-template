import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "components/toast/ToastContext";

/**
 * Carrega dados da API quando a tela abre (e quando `deps` mudam).
 *
 *   const { data, loading, reload, setData } = useApi(() => UserGroupApi.get(), []);
 *
 * - `data` é o `data` da resposta; erros mostram um toast (desligue com {toastError: false});
 * - respostas que chegam depois de a tela fechar ou de uma chamada mais nova são descartadas.
 *
 * @param {() => Promise<object>} request
 * @param {Array} deps
 * @param {{initial?: any, toastError?: boolean, enabled?: boolean}} options
 */
export function useApi(request, deps = [], options = {}) {
    const { initial = null, toastError = true, enabled = true } = options;
    const toast = useToast();

    const [state, setState] = useState({ data: initial, loading: enabled, error: null, response: null });
    const callId = useRef(0);
    const requestRef = useRef(request);
    requestRef.current = request;

    const load = useCallback(async () => {
        const id = ++callId.current;

        setState((prev) => ({ ...prev, loading: true }));

        const response = await requestRef.current();

        if (id !== callId.current) return response;

        if (!response || response.error) {
            if (toastError && response) toast(response);
            setState((prev) => ({ ...prev, loading: false, error: response, response }));
            return response;
        }

        setState({ data: response.data ?? initial, loading: false, error: null, response });

        return response;
    }, [toast, toastError]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!enabled) return undefined;

        load();

        // ao sair da tela, respostas pendentes são ignoradas
        return () => { callId.current++; };
    }, [enabled, load, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

    const setData = useCallback((updater) => {
        setState((prev) => ({ ...prev, data: typeof updater === "function" ? updater(prev.data) : updater }));
    }, []);

    return { ...state, reload: load, setData };
}

/**
 * Executa uma ação (salvar, remover...) com estado de carregando e toast.
 *
 *   const [save, { loading }] = useAction((payload) => UserApi.save(payload), { success: "Salvo" });
 *   const res = await save(payload);  // sempre resolve com a resposta; erro já mostrou toast
 *
 * @param {(...args) => Promise<object>} action
 * @param {{success?: string|boolean, confirm?: string, toastError?: boolean}} options
 *   success: mensagem de sucesso (true = mensagem do servidor ou "Salvo com sucesso");
 *   confirm: pergunta antes de executar (cancelar resolve com null).
 */
export function useAction(action, options = {}) {
    const { success = false, confirm = null, toastError = true } = options;
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const mounted = useRef(true);
    const actionRef = useRef(action);
    actionRef.current = action;

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    const run = useCallback(async (...args) => {
        if (confirm && !window.confirm(confirm)) return null;

        setLoading(true);

        const response = await actionRef.current(...args);

        if (mounted.current) setLoading(false);

        if (!response) return response;

        if (response.error) {
            if (toastError) toast(response);
            return response;
        }

        if (success) {
            toast.success(typeof success === "string" ? success : (response.message || "Salvo com sucesso"));
        }

        return response;
    }, [confirm, success, toast, toastError]);

    return [run, { loading }];
}
