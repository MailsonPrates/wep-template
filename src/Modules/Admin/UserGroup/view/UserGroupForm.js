import { useEffect, useMemo } from "react";
import { Form } from "react-bootstrap";
import { UserGroupApi } from "api";
import { Field, FormActions } from "components";
import { routeOptions } from "helpers";
import { useAction, useApi, useForm } from "hooks";
import RolesPicker from "./RolesPicker";

export const DEFAULT_HOME = "page.home";

/**
 * Formulário do grupo: nome, rota inicial e permissões.
 *
 * A rota inicial (para onde o usuário vai depois do login) só lista as páginas marcadas nas
 * permissões do grupo, mais a Home, que é o padrão. Se a página escolhida for desmarcada, volta para
 * a Home. O servidor valida a mesma regra.
 *
 * @param {number|string} [id] grupo a editar
 */
export default function UserGroupForm({ id, onSaved }) {
    const isUpdate = Boolean(id);

    const modules = useApi(() => UserGroupApi.getRoles(), [], { initial: [] });
    const group = useApi(() => UserGroupApi.get(id), [id], { enabled: isUpdate });

    const form = useForm(
        { name: "", home_role: DEFAULT_HOME, roles: [] },
        { name: { required: "Informe o nome do grupo" } }
    );

    useEffect(() => {
        if (!group.data) return;

        form.reset({
            name: group.data.name || "",
            home_role: group.data.home_role || DEFAULT_HOME,
            roles: group.data.roles ? group.data.roles.split(",").filter(Boolean) : [],
        });
    }, [group.data]); // eslint-disable-line react-hooks/exhaustive-deps

    const { roles, home_role: homeRole } = form.values;

    const homeOptions = useMemo(
        () => routeOptions(modules.data || [], {
            placeholder: false,
            filter: (page) => page.role === DEFAULT_HOME || roles.includes(page.role),
        }),
        [modules.data, roles]
    );

    // página inicial desmarcada nas permissões: volta para a Home
    useEffect(() => {
        if (!modules.data || !modules.data.length) return;

        const available = homeOptions.some((option) => !option.disabled && option.value === homeRole);
        if (!available && homeRole !== DEFAULT_HOME) form.set("home_role", DEFAULT_HOME);
    }, [homeOptions]); // eslint-disable-line react-hooks/exhaustive-deps

    const [save, { loading: saving }] = useAction(
        (payload) => (isUpdate ? UserGroupApi.update(id, payload) : UserGroupApi.create(payload)),
        { success: "Grupo salvo" }
    );

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!form.validate()) return;

        // antes o save não esperava a resposta: o "sucesso" aparecia antes e os erros nunca
        const res = await save({ name: form.values.name, home_role: homeRole, roles: roles.join(",") });

        if (res && !res.error && onSaved) onSaved(res);
    };

    return (
        <Form noValidate onSubmit={onSubmit} className={`p-2${modules.loading || group.loading || saving ? " full-loading" : ""}`}>
            <FormActions back="/admin/user/group/" saving={saving} />
            <Field label="Nome" {...form.field("name")} />
            <Field
                as="select"
                label="Rota inicial (depois do login)"
                loading={modules.loading}
                options={homeOptions}
                {...form.field("home_role")}
            />
            <div className="form-text mb-3">Só aparecem as páginas marcadas nas permissões abaixo, além da Home.</div>
            <label className="fw-semibold mb-2">Permissões</label>
            <RolesPicker modules={modules.data || []} value={roles} onChange={(next) => form.set("roles", next)} />
        </Form>
    );
}
