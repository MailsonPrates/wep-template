import Error403 from "./Error403";
import Error404 from "./Error404";
import ErrorPage from "./ErrorPage";

import React, { createContext, useState, useContext, useEffect } from "react";
import { registerSetError } from "./errorManager";

const ErrorContext = createContext();

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null);

  // registra o setter global na inicialização
  useEffect(() => {
    registerSetError(setError);
  }, []);

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {error ? <ErrorPageComponent status={error.status} /> : children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  return useContext(ErrorContext);
}

// Um exemplo de página de erro
function ErrorPageComponent({ status }) {
  if (status === 403) return <Error403 />;
  if (status === 404) return <Error404 />;
  return <ErrorPage code="***" description="Erro desconhecido!" goBackBtn={true} />;
}
