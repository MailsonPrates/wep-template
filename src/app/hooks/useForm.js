import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Estado de formulário controlado + validação. Substitui o antigo helper `$` (refs globais lidos
 * direto do DOM), que guardava o input da primeira montagem e lia valores velhos ao voltar à tela.
 *
 *   const form = useForm({ email: "", password: "" }, {
 *       email: { required: "Informe o e-mail", email: true },
 *       password: { required: true, minLength: 8 },
 *       confirm: { equals: ["password", "As senhas precisam ser iguais"] },
 *   });
 *
 *   <Field label="E-mail" {...form.field("email")} />
 *   if (!form.validate()) return;
 *   api.save(form.values);
 *
 * Regras: required, minLength, email, equals: [outroCampo, mensagem], validate: (valor, valores) => mensagem|null.
 * Cada regra aceita `true` (mensagem padrão) ou a mensagem.
 */
export default function useForm(initialValues = {}, rules = {}) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const rulesRef = useRef(rules);
    rulesRef.current = rules;

    const validateField = useCallback((name, allValues) => {
        const rule = rulesRef.current[name];

        if (!rule) return null;

        const raw = allValues[name];
        const value = typeof raw === "string" ? raw.trim() : raw;
        const message = (option, fallback) => (typeof option === "string" ? option : fallback);
        const empty = value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length);

        if (rule.required && empty) return message(rule.required, "Preencha este campo");

        if (empty) return null;

        if (rule.minLength) {
            const [min, text] = Array.isArray(rule.minLength) ? rule.minLength : [rule.minLength];
            if (String(value).length < min) return text || `Mínimo de ${min} caracteres`;
        }

        if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) return message(rule.email, "E-mail inválido");

        if (rule.equals) {
            const [other, text] = Array.isArray(rule.equals) ? rule.equals : [rule.equals];
            if (value !== allValues[other]) return text || "Os valores não conferem";
        }

        if (typeof rule.validate === "function") return rule.validate(value, allValues) || null;

        return null;
    }, []);

    const collectErrors = useCallback((allValues) => {
        const next = {};

        Object.keys(rulesRef.current).forEach((name) => {
            const error = validateField(name, allValues);
            if (error) next[name] = error;
        });

        return next;
    }, [validateField]);

    const validate = useCallback(() => {
        const next = collectErrors(values);

        setErrors(next);
        setSubmitted(true);

        return Object.keys(next).length === 0;
    }, [collectErrors, values]);

    // depois da primeira tentativa de envio, os erros acompanham a digitação
    useEffect(() => {
        if (submitted) setErrors(collectErrors(values));
    }, [values]); // eslint-disable-line react-hooks/exhaustive-deps

    const set = useCallback((name, value) => {
        setValues((prev) => (typeof name === "object" ? { ...prev, ...name } : { ...prev, [name]: value }));
    }, []);

    const reset = useCallback((nextValues = initialValues) => {
        setValues(nextValues);
        setErrors({});
        setSubmitted(false);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /**
     * Props para um <Field>/<Form.Control>: name, value, onChange e o erro.
     * @param {string} name
     * @param {{transform?: (value) => any, checkbox?: boolean}} options
     */
    const field = useCallback((name, options = {}) => ({
        name,
        value: options.checkbox ? undefined : (values[name] ?? ""),
        checked: options.checkbox ? Boolean(values[name]) : undefined,
        error: errors[name],
        onChange: (e) => {
            const target = e && e.target ? e.target : null;
            let value = target ? (options.checkbox || target.type === "checkbox" ? target.checked : target.value) : e;

            if (options.transform) value = options.transform(value);

            set(name, value);
        },
    }), [values, errors, set]);

    return useMemo(() => ({
        values, errors, set, field, validate, reset,
        setErrors,
        isValid: Object.keys(errors).length === 0,
    }), [values, errors, set, field, validate, reset]);
}
