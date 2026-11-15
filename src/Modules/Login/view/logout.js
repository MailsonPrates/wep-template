import { useEffect } from "react";

/**
 * /login/logout/: o middleware "logout" do servidor encerra a sessão. Se a tela chegar a abrir pelo
 * roteador do front (link interno), faz a navegação completa para o servidor processar.
 */
export default function Logout() {
    useEffect(() => {
        window.location.replace("/login/logout/");
    }, []);

    return null;
}
