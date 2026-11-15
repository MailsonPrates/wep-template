import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import { Button } from "react-bootstrap";
import { GoCheckCircle } from "react-icons/go";
import { LoginApi } from "api";
import { useReqToast } from "hooks";
import App from "app";

/**
 * "Esqueceu a senha?": pede o e-mail e o servidor envia o link de nova senha.
 *
 * A mensagem de confirmação é sempre a mesma: o servidor não revela se o e-mail está cadastrado.
 */
export default function Recovery(props) {

    const showToast = useReqToast();
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("ready"); // ready | processing | sent
    const [validated, setValidated] = useState(false);

    useEffect(() => {
        document.title = `Recuperar senha | ${App.config("title", "Wep")}`;
    }, [props.title]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim() || !e.currentTarget.checkValidity()) {
            setValidated(true);
            return;
        }

        setStatus("processing");

        const res = await LoginApi.recovery({ email: email.trim() });

        if (res.error) {
            setStatus("ready");
            showToast({ state: "error", message: res.message });
            return;
        }

        setStatus("sent");
    };

    return (
        <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center bg-light">
            <div className={`w-100${status === "processing" ? " full-loading" : ""}`}>
                <div className="mx-auto text-center px-2" style={{ maxWidth: 400 }}>
                    <Link to="/">
                        <img src="/assets/images/logo.png" alt="Logo" style={{ maxWidth: 140 }} />
                    </Link>
                    <div className="my-4 text-center">
                        <h1 className="mb-0 h2">Recuperar senha</h1>
                        <div className="text-secondary">
                            Informe o e-mail da sua conta para receber o link de nova senha.
                        </div>
                    </div>

                    {status === "sent" ? (
                        <div className="mt-3 bg-white p-4 rounded shadow-sm text-success">
                            <div className="fs-1"><GoCheckCircle /></div>
                            <div className="fw-light">
                                Se o e-mail estiver cadastrado, você receberá em instantes um link para criar
                                uma nova senha. O link vale por 1 hora.
                            </div>
                        </div>
                    ) : (
                        <Form className="mt-3 bg-white p-4 rounded shadow-sm text-start" noValidate validated={validated} onSubmit={handleSubmit}>
                            <FloatingLabel label="E-mail" className="mb-2">
                                <Form.Control
                                    type="email"
                                    name="email"
                                    placeholder="E-mail"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                />
                                <Form.Control.Feedback type="invalid">Informe um e-mail válido</Form.Control.Feedback>
                            </FloatingLabel>
                            <div className="mt-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    className="gradient-primary border-0 fw-medium rounded-5 w-100"
                                    style={{ padding: 13 }}
                                    disabled={status === "processing"}>
                                    {status === "processing" ? "Enviando..." : "Enviar link"}
                                </Button>
                            </div>
                        </Form>
                    )}

                    <div className="mt-3">
                        <Link className="text-decoration-none" to="/login/">Voltar para o login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
