import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Col, Form, Row } from "react-bootstrap";
import { HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiOutlineXCircle } from "react-icons/hi2";
import { UserInviteApi } from "api";
import { Field, Password, TemplateClean } from "components";
import { toUsername } from "helpers";
import { useAction, useApi, useForm } from "hooks";

const MIN_PASSWORD = 8;

/**
 * Disponibilidade do nome de usuário, conferida 600 ms depois que a pessoa para de digitar.
 * @returns {"" | "checking" | "valid" | "invalid"}
 */
function useUsernameCheck(username) {
    const [state, setState] = useState({ status: "", message: "" });

    useEffect(() => {
        if (!username) {
            setState({ status: "", message: "" });
            return undefined;
        }

        let active = true;
        setState({ status: "checking", message: "" });

        const timer = setTimeout(async () => {
            const res = await UserInviteApi.validateUsername({ username });
            if (active) setState(res.error ? { status: "invalid", message: res.message || "Nome de usuário indisponível" } : { status: "valid", message: "" });
        }, 600);

        return () => { active = false; clearTimeout(timer); };
    }, [username]);

    return state;
}

const CHECK_ICON = {
    valid: <HiOutlineCheckCircle className="text-success fs-4" />,
    invalid: <HiOutlineXCircle className="text-danger fs-4" />,
    checking: <span className="loading" />,
};

/**
 * Cadastro público a partir do link do convite (/admin/user/invite/signup/{token}/).
 */
export default function UserInviteSignup() {
    const { token } = useParams();
    const navigate = useNavigate();

    const invite = useApi(() => UserInviteApi.validate({ token }), [token], { toastError: false });

    const form = useForm({ firstname: "", lastname: "", username: "", password: "", confirmPassword: "" }, {
        firstname: { required: "Informe o nome" },
        lastname: { required: "Informe o sobrenome" },
        username: { required: "Escolha um nome de usuário" },
        password: { required: "Crie uma senha", minLength: [MIN_PASSWORD, `Mínimo de ${MIN_PASSWORD} caracteres`] },
        confirmPassword: { required: "Repita a senha", equals: ["password", "As senhas precisam ser iguais"] },
    });

    const usernameCheck = useUsernameCheck(form.values.username);

    const [register, { loading: saving }] = useAction(
        (payload) => UserInviteApi.registerUser(payload),
        { success: "Cadastro concluído! Faça o login." }
    );

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!form.validate() || usernameCheck.status !== "valid") return;

        const { confirmPassword, ...values } = form.values;
        const res = await register({ ...values, token });

        if (res && !res.error) navigate("/login/");
    };

    if (!invite.loading && invite.error) {
        return (
            <TemplateClean documentTitle="Convite para cadastro">
                <div className="text-danger p-3 d-flex align-items-center justify-content-center">
                    <HiOutlineExclamationTriangle style={{ fontSize: 80 }} className="flex-shrink-0" />
                    <div className="ms-2">
                        <div className="fs-3 fw-light">{invite.error.message || "Convite inválido"}</div>
                        <div className="text-secondary fs-5 fw-light">Peça um novo convite ao administrador.</div>
                    </div>
                </div>
            </TemplateClean>
        );
    }

    const usernameField = form.field("username", { transform: toUsername });

    return (
        <TemplateClean documentTitle="Convite para cadastro" title="Preencha o seu cadastro">
            <Form noValidate onSubmit={onSubmit} className={invite.loading || saving ? "full-loading" : ""}>
                <Row>
                    <Col md={6}><Field label="Nome" autoComplete="given-name" {...form.field("firstname")} /></Col>
                    <Col md={6}><Field label="Sobrenome" autoComplete="family-name" {...form.field("lastname")} /></Col>
                </Row>
                <Field
                    label="Usuário"
                    autoComplete="username"
                    {...usernameField}
                    error={usernameField.error || (usernameCheck.status === "invalid" ? usernameCheck.message : undefined)}
                >
                    <span className="position-absolute top-0 end-0 mt-3 me-3">{CHECK_ICON[usernameCheck.status]}</span>
                </Field>
                <Row>
                    <Col md={6}><Password autoComplete="new-password" {...form.field("password")} /></Col>
                    <Col md={6}><Password label="Repita a senha" autoComplete="new-password" {...form.field("confirmPassword")} /></Col>
                </Row>
                <div className="mt-3 text-end">
                    <Button type="submit" variant="primary" size="lg" disabled={saving || usernameCheck.status !== "valid"}>
                        {saving ? "Cadastrando..." : "Cadastrar"}
                    </Button>
                </div>
            </Form>
        </TemplateClean>
    );
}
