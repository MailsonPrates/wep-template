import { useEffect } from "react";
import NProgress from "nprogress";

NProgress.configure({ showSpinner: false, trickleSpeed: 120 });

/**
 * Barra de progresso no topo enquanto a tela (carregada sob demanda) baixa.
 * Usada como fallback do <Suspense>: aparece quando o chunk da rota começa a carregar e some
 * quando ele termina. (Antes era um timer fixo de 500 ms a cada troca de rota.)
 */
export default function ProgressBar() {
    useEffect(() => {
        NProgress.start();
        return () => NProgress.done();
    }, []);

    return null;
}
