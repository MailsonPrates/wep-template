import { user } from "core/user";
import TemplateMain from "../templates/main";
import ErrorPage from "./ErrorPage";

/** Acesso negado: logado, dentro do layout (nav e menu continuam); deslogado, tela cheia. */
export default function Error403() {
    if (user().is_logged) {
        return (
            <TemplateMain title="Acesso negado" header={false}>
                <ErrorPage code="403" description="Acesso negado" inline />
            </TemplateMain>
        );
    }

    return <ErrorPage code="403" description="Acesso negado" />;
}
