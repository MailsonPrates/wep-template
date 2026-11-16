import { useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { UserGroupApi, UserManagerApi } from "api";
import { Field, FormActions, Password } from "components";
import { toUsername } from "helpers";
import { useAction, useApi, useForm, useToast } from "hooks";
import { STATUS } from "./status";

const MIN_PASSWORD = 8;

/**
 * Formulário de usuário (criar e editar).
 *  - criar com e-mail: o servidor envia o link para a pessoa definir a senha;
 *  - criar sem e-mail: o servidor gera uma senha temporária, mostrada uma única vez;
 *  - editar: senha opcional (vazia = mantém a atual). Antes o campo aparecia mas não era enviado.
 *
 * @param {number|string} [id] usuário a editar
 * @param {(res) => void} onSaved
 */
export default function UserForm({ id, onSaved }) {
    const toast = useToast();
    const isUpdate = Boolean(id);

    const groups = useApi(() => UserGroupApi.get(), [], { initial: [] });
    const user = useApi(() => UserManagerApi.get({ id }), [id], { enabled: isUpdate });

    const form = useForm(
        {
            status: "ativado",
            firstname: "",
            lastname: "",
            username: "",
            nickname: "",
            email: "",
            user_group_id: "",
            password: "",
        },
        {
            firstname: { required: "Informe o nome" },
            lastname: { required: "Informe o sobrenome" },
            username: { required: "Informe o usuário" },
            email: { email: true },
            user_group_id: { required: "Escolha o grupo" },
            password: { minLength: [MIN_PASSWORD, `Mínimo de ${MIN_PASSWORD} caracteres`] },
        }
    );

    // preenche o formulário quando o usuário carrega
    useEffect(() => {
        const data = Array.isArray(user.data) ? user.data[0] : user.data;

        if (!data) return;

        form.reset({
            status: data.status || "ativado",
            firstname: data.firstname || "",
            lastname: data.lastname || "",
            username: data.username || "",
            nickname: data.nickname || "",
            email: data.email || "",
            user_group_id: String(data.user_group_id || ""),
            password: "",
        });
    }, [user.data]); // eslint-disable-line react-hooks/exhaustive-deps

    const [save, { loading: saving }] = useAction((payload) => UserManagerApi.save(payload));

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!form.validate()) return;

        const payload = { ...form.values, user_id: id || undefined };

        if (!isUpdate) delete payload.password;
        if (isUpdate && !payload.password) delete payload.password;

        if (!payload.email) {
            if (!window.confirm("E-mail não preenchido: será gerada uma senha temporária. Continuar?")) return;
            payload.no_email = true;
        }

        const res = await save(payload);

        if (!res || res.error) return;

        // a mensagem pode trazer a senha temporária (mostrada só agora): fica até o admin fechar
        toast({ type: "success", message: res.message || "Salvo com sucesso", autoHide: !res.message });

        if (onSaved) onSaved(res);
    };

    const groupOptions = (groups.data || []).map((group) => ({ value: String(group.user_group_id), text: group.name }));
    const statusOptions = Object.entries(STATUS).map(([value, item]) => ({
        value,
        text: item.text,
        // "aguardando nova senha" só aparece para quem já está nele (não é escolhido à mão)
        disabled: value === "mudar_senha" && form.values.status !== "mudar_senha",
    }));

    return (
        <Form noValidate onSubmit={onSubmit} className={`p-2${user.loading || saving ? " full-loading" : ""}`}>
            <FormActions back="/admin/user/" saving={saving} />
            {isUpdate && <Field as="select" label="Status" options={statusOptions} {...form.field("status")} />}
            <Row>
                <Col md={6}><Field label="Nome" autoComplete="off" {...form.field("firstname")} /></Col>
                <Col md={6}><Field label="Sobrenome" autoComplete="off" {...form.field("lastname")} /></Col>
            </Row>
            <Row>
                <Col md={6}>
                    <Field label="Usuário" autoComplete="off" {...form.field("username", { transform: toUsername })} />
                </Col>
                <Col md={6}><Field label="Apelido" autoComplete="off" {...form.field("nickname")} /></Col>
            </Row>
            <Field type="email" label="E-mail" autoComplete="off" {...form.field("email")} />
            <Field
                as="select"
                label="Grupo"
                placeholder="Selecione"
                loading={groups.loading}
                options={groupOptions}
                {...form.field("user_group_id")}
            />
            {isUpdate && (
                <Password
                    label="Nova senha (deixe em branco para manter)"
                    autoComplete="new-password"
                    {...form.field("password")}
                />
            )}
        </Form>
    );
}
