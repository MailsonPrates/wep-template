import { FloatingLabel, Form } from "react-bootstrap";

/**
 * Campo de formulário com label flutuante e mensagem de erro.
 *
 *   <Field label="Nome" {...form.field("firstname")} required />
 *   <Field as="select" label="Grupo" options={[{value: 1, text: "Admin"}]} {...form.field("group")} />
 *   <Field as="textarea" label="Observação" rows={3} ... />
 *
 * @param {object} props
 * @param {string} props.label
 * @param {"input"|"select"|"textarea"} [props.as]
 * @param {string} [props.error]        mensagem (marca o campo como inválido)
 * @param {Array}  [props.options]      opções do select: {value, text, disabled, className}
 * @param {string} [props.placeholder]  select: primeira opção desabilitada
 * @param {boolean} [props.loading]     select: mostra "Carregando..."
 * @param {string} [props.className]    classe do wrapper (padrão "mb-2")
 */
export default function Field({
    label, as = "input", error, options, placeholder, loading = false, className = "mb-2",
    disabled, children, ...props
}) {
    const id = props.id || (props.name ? `field-${props.name}` : undefined);
    const wrapperClass = `${className}${disabled ? " disabled" : ""}`;

    if (as === "select") {
        return (
            <FloatingLabel controlId={id} label={label} className={wrapperClass}>
                <Form.Select {...props} disabled={disabled} isInvalid={Boolean(error)}>
                    {loading
                        ? <option value="">Carregando...</option>
                        : (
                            <>
                                {placeholder && <option value="" disabled>{placeholder}</option>}
                                {(options || []).map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                        disabled={option.disabled}
                                        className={option.className}
                                    >
                                        {option.text}
                                    </option>
                                ))}
                                {children}
                            </>
                        )}
                </Form.Select>
                {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
            </FloatingLabel>
        );
    }

    return (
        <FloatingLabel controlId={id} label={label} className={wrapperClass}>
            <Form.Control
                as={as === "textarea" ? "textarea" : undefined}
                placeholder={props.placeholder || label}
                {...props}
                disabled={disabled}
                isInvalid={Boolean(error)}
                style={as === "textarea" ? { height: "auto", ...(props.style || {}) } : props.style}
            />
            {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
            {children}
        </FloatingLabel>
    );
}
