import NProgress from "nprogress";
import { useEffect } from "react";
import { useLocation } from "react-router";

const ProgressBar = () => {
  const location = useLocation(); // Detecta mudanças de rota

  useEffect(() => {
    NProgress.start(); // Inicia a barra de progresso
    const timer = setTimeout(() => NProgress.done(), 500); // Simula um tempo mínimo

    return () => {
      clearTimeout(timer);
      NProgress.done(); // Finaliza a barra de progresso ao sair da página
    };
  }, [location.pathname]); // Executa quando a URL mudar

  return null;
};

export default ProgressBar;
