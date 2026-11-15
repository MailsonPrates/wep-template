import { Link, useNavigate, useParams } from "react-router";
import { Button, Form } from "react-bootstrap";
import { BsInfoCircle } from "react-icons/bs";
import { LoginApi } from "api";
import { AuthPage, Password } from "components";
import { useAction, useApi, useForm } from "hooks";

const MIN_PASSWORD = 8;

/**
 * Nova senha a partir do link de recuperação (/login/recovery/update/{code}/).
 * O código é validado ao abrir; depois de salvar, volta ao login com o aviso de sucesso.
 */
export default function RecoveryUpdate() {
    const { code } = useParams();
    const navigate = useNavigate();

    const validation = useApi(() => LoginApi.validateRecoveryCode({ code }), [code], { toastError: false });

    const form = useForm({ password: "", confirmPassword: "" }, {
        password: { required: "Informe a nova senha", minLength: [MIN_PASSWORD, `Mínimo de ${MIN_PASSWORD} caracteres`] },
        confirmPassword: { required: "Repita a senha", equals: ["password", "As senhas precisam ser iguais"] },
    });

    const [save, { loading }] = useAction(
        (password) => LoginApi.handleUpdatePassword({ password, code }),
        { success: "Senha alterada! Redirecionando..." }
    );

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!form.validate()) return;

        const res = await save(form.values.password);

        if (res && !res.error) navigate("/login/?recover=true");
    };

    const invalid = !validation.loading && validation.error;

    return (
        <AuthPage
            documentTitle="Criar nova senha"
            title="Redefina a sua senha"
            loading={validation.loading || loading}
            footer={<Link to="/login/">Voltar para o login</Link>}
        >
            {invalid ? (
                <div className="text-danger d-flex align-items-center justify-content-center py-2">
                    <BsInfoCircle className="fs-1 flex-shrink-0" />
                    <span className="ms-2 fs-5 fw-light lh-sm">
                        {validation.error.message || "Link inválido ou expirado"}
                        <Link to="/login/recovery/" className="d-block fs-6 mt-1">Pedir um novo link</Link>
                    </span>
                </div>
            ) : (
                <Form noValidate onSubmit={onSubmit}>
                    <Password label="Nova senha" autoComplete="new-password" autoFocus {...form.field("password")} />
                    <Password label="Repita a senha" autoComplete="new-password" {...form.field("confirmPassword")} />
                    <Button
                        type="submit"
                        size="lg"
                        className="gradient-primary border-0 fw-medium rounded-5 w-100 mt-3"
                        style={{ padding: 13 }}
                        disabled={loading || validation.loading}
                    >
                        {loading ? "Salvando..." : "Alterar"}
                    </Button>
                </Form>
            )}
        </AuthPage>
    );
}
