import { useState } from "react";
import { Link } from "react-router";
import { Button, Form } from "react-bootstrap";
import { GoCheckCircle } from "react-icons/go";
import { LoginApi } from "api";
import { AuthPage, Field } from "components";
import { useAction, useForm } from "hooks";

/**
 * "Esqueceu a senha?": pede o e-mail e o servidor envia o link de nova senha.
 * A confirmação é sempre a mesma: o servidor não revela se o e-mail está cadastrado.
 */
export default function Recovery() {
    const [sent, setSent] = useState(false);
    const form = useForm({ email: "" }, { email: { required: "Informe o e-mail", email: true } });
    const [send, { loading }] = useAction((email) => LoginApi.recovery({ email }));

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!form.validate()) return;

        const res = await send(form.values.email.trim());

        if (res && !res.error) setSent(true);
    };

    return (
        <AuthPage
            documentTitle="Recuperar senha"
            title="Recuperar senha"
            subtitle="Informe o e-mail da sua conta para receber o link de nova senha."
            loading={loading}
            footer={<Link to="/login/">Voltar para o login</Link>}
        >
            {sent ? (
                <div className="text-success text-center">
                    <div className="fs-1"><GoCheckCircle /></div>
                    <div className="fw-light">
                        Se o e-mail estiver cadastrado, você receberá em instantes um link para criar
                        uma nova senha. O link vale por 1 hora.
                    </div>
                </div>
            ) : (
                <Form noValidate onSubmit={onSubmit}>
                    <Field type="email" label="E-mail" autoComplete="email" autoFocus {...form.field("email")} />
                    <Button
                        type="submit"
                        size="lg"
                        className="gradient-primary border-0 fw-medium rounded-5 w-100 mt-3"
                        style={{ padding: 13 }}
                        disabled={loading}
                    >
                        {loading ? "Enviando..." : "Enviar link"}
                    </Button>
                </Form>
            )}
        </AuthPage>
    );
}
