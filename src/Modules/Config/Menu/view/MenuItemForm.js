import { useEffect } from "react";
import { Button, Form, Offcanvas } from "react-bootstrap";
import { MenuApi } from "api";
import { Field, IconPicker } from "components";
import { routeOptions } from "helpers";
import { useAction, useForm } from "hooks";

const TYPES = [
    { value: "route", text: "Rota" },
    { value: "external_link", text: "Link externo" },
    { value: "group", text: "Grupo" },
    { value: "text", text: "Texto" },
];

const EMPTY = { title: "", type: "route", permission: "", link: "", user_groups: [], icon: "" };

/**
 * Criar ou editar um item de menu.
 *
 *  - Rota: escolhe a página (o caminho é resolvido pela permissão; quem não tem a permissão da
 *    página não vê o item);
 *  - Grupo / Link externo / Texto: escolhe os grupos de usuários que veem o item;
 *  - Ícone: escolhido da lista (Heroicons Outline), aparece nos itens do primeiro nível.
 *
 * @param {object|null} item     item a editar, ou {menu_id, parent_id, sort_order} para criar; null fecha
 * @param {{roles: Array, userGroups: Array}} options dados de MenuApi.getRolesData()
 */
export default function MenuItemForm({ item, options, loadingOptions, onClose, onSaved }) {
    const isUpdate = Boolean(item && item.id);

    const form = useForm(EMPTY, {
        title: { required: "Informe o título" },
        permission: { validate: (value, values) => (values.type === "route" && !value ? "Escolha a página" : null) },
        link: { validate: (value, values) => (values.type === "external_link" && !value ? "Informe o endereço" : null) },
    });

    useEffect(() => {
        if (!item) return;

        form.reset({
            title: item.title || "",
            type: item.type || "route",
            permission: item.permission || "",
            link: item.type === "external_link" ? (item.link || "") : "",
            user_groups: item.user_groups ? String(item.user_groups).split(",").filter(Boolean) : [],
            icon: item.icon_name || "",
        });
    }, [item]); // eslint-disable-line react-hooks/exhaustive-deps

    const pages = routeOptions((options && options.roles) || []);
    const userGroups = (options && options.userGroups) || [];
    const { type, user_groups: selectedGroups } = form.values;

    const toggleGroup = (id) => {
        const value = String(id);
        form.set("user_groups", selectedGroups.includes(value)
            ? selectedGroups.filter((groupId) => groupId !== value)
            : [...selectedGroups, value]);
    };

    const [save, { loading }] = useAction(
        (fields) => (isUpdate ? MenuApi.updateItem({ id: item.id, ...fields }) : MenuApi.createItem(fields)),
        { success: "Item salvo" }
    );

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!form.validate()) return;

        const { values } = form;
        const fields = {
            title: values.title,
            type: values.type,
            permission: values.type === "route" ? values.permission : "",
            link: values.type === "external_link" ? values.link.trim() : "",
            external: values.type === "external_link",
            user_groups: values.type === "route" ? "" : values.user_groups.join(","),
            icon: values.icon,
        };

        if (!isUpdate) {
            fields.menu_id = item.menu_id;
            fields.parent_id = item.parent_id || 0;
            fields.sort_order = item.sort_order || 0;
        }

        const res = await save(fields);

        if (res && !res.error) onSaved();
    };

    return (
        <Offcanvas show={Boolean(item)} onHide={onClose} placement="end">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>{isUpdate ? `Editar ${item.title}` : "Novo item"}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Form noValidate onSubmit={onSubmit} className={loading || loadingOptions ? "full-loading" : ""}>
                    <Field label="Título" autoFocus {...form.field("title")} />
                    <Field as="select" label="Tipo" options={TYPES} {...form.field("type")} />

                    {type === "route" && (
                        <Field as="select" label="Rota" loading={loadingOptions} options={pages} {...form.field("permission")} />
                    )}

                    {type === "external_link" && (
                        <Field type="url" label="Endereço (https://...)" {...form.field("link")} />
                    )}

                    {type !== "route" && (
                        <div className="mt-3">
                            <label className="fw-semibold">Usuários permitidos</label>
                            <div className="mt-2">
                                {userGroups.map((group) => (
                                    <Form.Check
                                        key={group.user_group_id}
                                        type="switch"
                                        id={`menu-item-group-${group.user_group_id}`}
                                        className="mb-2"
                                        label={group.name}
                                        checked={selectedGroups.includes(String(group.user_group_id))}
                                        onChange={() => toggleGroup(group.user_group_id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <IconPicker value={form.values.icon} onChange={(name) => form.set("icon", name)} />

                    <div className="mt-5 text-end">
                        <Button variant="light" className="mx-2" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" variant="primary" disabled={loading}>Salvar</Button>
                    </div>
                </Form>
            </Offcanvas.Body>
        </Offcanvas>
    );
}
