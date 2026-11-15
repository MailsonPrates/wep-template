import { Button } from "react-bootstrap";
import BackLink from "./BackLink";

/**
 * Barra de ações do formulário: "voltar" à esquerda e o botão de salvar à direita.
 *   <FormActions back="/admin/user/" saving={saving} />   (o botão é type="submit")
 */
export default function FormActions({ back, saving = false, label = "Salvar", className = "mb-3" }) {
    return (
        <div className={`d-flex align-items-center justify-content-between ${className}`}>
            <div>{back && <BackLink to={back} />}</div>
            <Button type="submit" variant="primary" size="lg" className="px-5 fs-5" disabled={saving}>
                {saving ? "Salvando..." : label}
            </Button>
        </div>
    );
}
