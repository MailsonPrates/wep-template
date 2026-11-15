import Error403 from "./Error403";
import Error404 from "./Error404";
import ErrorPage from "./ErrorPage";

import { createContext, useState, useContext, useEffect } from "react";
import { useLocation } from "react-router";
import { registerSetError } from "./errorManager";

const ErrorContext = createContext();

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null);
  const { pathname } = useLocation();

  // registra o setter global na inicialização
  useEffect(() => {
    registerSetError(setError);
    return () => registerSetError(null);
  }, []);

  // ao trocar de página a tela de erro sai (antes ficava presa até recarregar)
  useEffect(() => {
    setError(null);
  }, [pathname]);

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {error ? <ErrorPageComponent status={error.status} /> : children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  return useContext(ErrorContext);
}

function ErrorPageComponent({ status }) {
  if (status === 403) return <Error403 />;
  if (status === 404) return <Error404 />;
  return <ErrorPage code={status || "Erro"} description="Erro desconhecido!" />;
}
