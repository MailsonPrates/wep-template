import { useState } from "react";
import { FloatingLabel, Form } from "react-bootstrap";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";

/**
 * Campo de senha com botão de mostrar/ocultar. Controlado: recebe `value` e `onChange`
 * (antes guardava o próprio valor e ignorava o `value`, então nenhuma tela conseguia limpar o campo).
 *
 *   <Password label="Nova senha" {...form.field("password")} autoComplete="new-password" />
 */
export default function Password({ label = "Senha", error, className = "mb-2", ...props }) {
    const [visible, setVisible] = useState(false);
    const id = props.id || (props.name ? `field-${props.name}` : undefined);

    return (
        <FloatingLabel controlId={id} label={label} className={`password-field ${className}`}>
            <Form.Control
                autoComplete="current-password"
                placeholder={label}
                {...props}
                type={visible ? "text" : "password"}
                isInvalid={Boolean(error)}
            />
            <button
                type="button"
                className="visibility-toggle"
                onClick={() => setVisible((value) => !value)}
                aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                tabIndex={-1}
            >
                {visible ? <HiOutlineEyeSlash className="fs-5" /> : <HiOutlineEye className="fs-5" />}
            </button>
            {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
        </FloatingLabel>
    );
}
