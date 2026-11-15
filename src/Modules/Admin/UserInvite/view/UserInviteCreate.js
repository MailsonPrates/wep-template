import { useNavigate } from "react-router";
import { Form } from "react-bootstrap";
import { UserGroupApi, UserInviteApi } from "api";
import { Field, FormActions, TemplateMain } from "components";
import { useAction, useApi, useForm } from "hooks";

export default function UserInviteCreate() {
    const navigate = useNavigate();
    const groups = useApi(() => UserGroupApi.get(), [], { initial: [] });

    const form = useForm({ email: "", user_group_id: "" }, {
        email: { required: "Informe o e-mail", email: true },
        user_group_id: { required: "Escolha o grupo" },
    });

    const [save, { loading: saving }] = useAction((payload) => UserInviteApi.create(payload), { success: "Convite enviado" });

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!form.validate()) return;

        const res = await save(form.values);

        // antes voltava para a lista mesmo quando o convite falhava
        if (res && !res.error) navigate("/admin/user/invite/");
    };

    const options = (groups.data || []).map((group) => ({ value: String(group.user_group_id), text: group.name }));

    return (
        <TemplateMain title="Novo convite de usuário" breadcrumbs={["page.admin", "page.admin.user.invite"]}>
            <Form noValidate onSubmit={onSubmit} className={`p-2${saving ? " full-loading" : ""}`}>
                <FormActions back="/admin/user/invite/" saving={saving} label="Enviar convite" />
                <Field type="email" label="E-mail" autoFocus {...form.field("email")} />
                <Field as="select" label="Grupo" placeholder="Selecione" loading={groups.loading} options={options} {...form.field("user_group_id")} />
            </Form>
        </TemplateMain>
    );
}
