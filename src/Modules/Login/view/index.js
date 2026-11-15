import { Link, useSearchParams } from "react-router";
import { Alert, Button, Form } from "react-bootstrap";
import { GoCheckCircle } from "react-icons/go";
import { LoginApi } from "api";
import { AuthPage, Field, Password } from "components";
import { useAction, useForm } from "hooks";

/**
 * Login. Depois de entrar, o servidor manda para a página que o usuário tentou abrir ou para a
 * página inicial do grupo dele (o redirect da resposta é seguido pelo request.js).
 */
export default function Login() {
    const [searchParams] = useSearchParams();
    const passwordChanged = searchParams.get("recover");

    const form = useForm(
        { username: searchParams.get("email") || "", password: "", keep: false },
        {
            username: { required: "Informe o usuário" },
            password: { required: "Informe a senha" },
        }
    );

    const [login, { loading }] = useAction((values) => LoginApi.login(values));

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!form.validate()) return;

        const res = await login(form.values);

        if (res && res.error) form.set("password", "");
    };

    return (
        <AuthPage documentTitle="Login" title="Acesse sua conta" loading={loading}>
            {passwordChanged && (
                <Alert variant="success" className="d-flex align-items-center py-2">
                    <GoCheckCircle className="fs-4 flex-shrink-0" />
                    <span className="ms-2">Senha alterada com sucesso</span>
                </Alert>
            )}
            <Form noValidate onSubmit={onSubmit}>
                <Field label="Usuário" autoComplete="username" autoFocus {...form.field("username")} />
                <Password {...form.field("password")} />
                <Link to="/login/recovery/">Esqueceu a senha?</Link>
                <Button
                    type="submit"
                    size="lg"
                    className="gradient-primary border-0 fw-medium rounded-5 w-100 mt-4"
                    style={{ padding: 13 }}
                    disabled={loading}
                >
                    {loading ? "Entrando..." : "Entrar"}
                </Button>
                <Form.Check
                    type="checkbox"
                    id="login-keep"
                    className="mt-3 d-flex justify-content-center gap-2"
                    label="Mantenha conectado"
                    {...form.field("keep", { checkbox: true })}
                />
            </Form>
        </AuthPage>
    );
}
