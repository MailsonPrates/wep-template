import { useEffect } from "react";
import { Button, Form, Offcanvas } from "react-bootstrap";
import { MenuApi } from "api";
import { Field } from "components";
import { useAction, useForm } from "hooks";

/**
 * Criar ou renomear um menu (o slug é gerado no servidor a partir do nome).
 *
 * @param {object|null} menu  {id, name} para editar; {} para criar; null fecha
 */
export default function MenuForm({ menu, onClose, onSaved }) {
    const isUpdate = Boolean(menu && menu.id);
    const form = useForm({ name: "" }, { name: { required: "Informe o nome do menu" } });

    useEffect(() => {
        if (menu) form.reset({ name: menu.name || "" });
    }, [menu]); // eslint-disable-line react-hooks/exhaustive-deps

    const [save, { loading }] = useAction(
        (fields) => (isUpdate ? MenuApi.update({ id: menu.id, ...fields }) : MenuApi.create(fields)),
        { success: "Menu salvo" }
    );

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!form.validate()) return;

        const res = await save({ name: form.values.name });

        if (res && !res.error) onSaved();
    };

    return (
        <Offcanvas show={Boolean(menu)} onHide={onClose} placement="end">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>{isUpdate ? "Editar menu" : "Novo menu"}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Form noValidate onSubmit={onSubmit} className={loading ? "full-loading" : ""}>
                    <Field label="Nome" autoFocus {...form.field("name")} />
                    <div className="mt-5 text-end">
                        <Button variant="light" className="mx-2" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" variant="primary" disabled={loading}>Salvar</Button>
                    </div>
                </Form>
            </Offcanvas.Body>
        </Offcanvas>
    );
}
