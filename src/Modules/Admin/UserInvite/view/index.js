import { Link } from "react-router";
import { Button } from "react-bootstrap";
import { HiOutlineTrash, HiMiniPlus, HiOutlineLink } from "react-icons/hi2";
import { UserInviteApi } from "api";
import { ListState, TemplateMain } from "components";
import { useAction, useApi } from "hooks";

const STATUS = {
    pending: { text: "Pendente", bg: "secondary" },
    cancelled: { text: "Cancelado", bg: "danger" },
    used: { text: "Usado", bg: "success" },
};

function Status({ status }) {
    const item = STATUS[status] || { text: status, bg: "primary" };

    return (
        <span className="d-inline-flex align-items-center">
            <span className={`bg-${item.bg} d-inline-block rounded-circle`} style={{ width: 12, height: 12 }} />
            <span className="ms-1 text-secondary">{item.text}</span>
        </span>
    );
}

export default function UserInvite() {
    const invites = useApi(() => UserInviteApi.get(), [], { initial: [] });

    const [remove, removing] = useAction((id) => UserInviteApi.delete(id), { confirm: "Remover este convite?", success: "Convite removido" });
    const [cancel, cancelling] = useAction((id) => UserInviteApi.update(id, { status: "cancelled" }), { confirm: "Cancelar este convite?", success: "Convite cancelado" });
    // antes chamava "resendUserInvite", que não existia (e não havia rota para reenviar)
    const [resend, resending] = useAction((id) => UserInviteApi.resend({ user_invite_id: id }), { confirm: "Reenviar o convite por e-mail?", success: "Convite reenviado" });

    const list = Array.isArray(invites.data) ? invites.data : (invites.data ? [invites.data] : []);
    const loading = invites.loading || removing.loading || cancelling.loading || resending.loading;

    const onRemove = async (id) => {
        const res = await remove(id);
        if (res && !res.error) invites.setData((items) => (items || []).filter((item) => item.user_invite_id !== id));
    };

    const onCancel = async (id) => {
        const res = await cancel(id);
        if (res && !res.error) invites.reload();
    };

    return (
        <TemplateMain
            title="Convites de usuários"
            breadcrumbs={["page.admin"]}
            actions={<Link className="btn btn-primary m-1" to="/admin/user/invite/create/"><HiMiniPlus className="fs-5" /> Novo convite</Link>}
        >
            <ListState loading={loading} items={list} empty="Nenhum convite enviado">
                {(item) => {
                    const isPending = item.status === "pending";

                    return (
                        <div key={item.user_invite_id} className="my-2 p-2 border shadow-sm rounded bg-white d-flex flex-wrap align-items-center justify-content-between gap-2">
                            <div className="d-flex flex-wrap align-items-center gap-3">
                                <Status status={item.status} />
                                <span>{item.email}</span>
                                <span className="text-secondary">{item.user_group_name}</span>
                            </div>
                            <div className="d-flex flex-wrap gap-1">
                                {isPending && (
                                    <>
                                        <Button variant="outline-secondary" size="sm" onClick={() => onCancel(item.user_invite_id)}>Cancelar</Button>
                                        <Button variant="outline-primary" size="sm" onClick={() => resend(item.user_invite_id)}>Reenviar</Button>
                                        {/* antes apontava para /user/invite/signup/..., que não existe (404) */}
                                        <a className="btn btn-outline-dark btn-sm" href={`/admin/user/invite/signup/${encodeURIComponent(item.token)}/`} target="_blank" rel="noopener noreferrer">
                                            <HiOutlineLink /> Link
                                        </a>
                                    </>
                                )}
                                <Button variant="outline-danger" size="sm" onClick={() => onRemove(item.user_invite_id)}>
                                    <HiOutlineTrash /> Remover
                                </Button>
                            </div>
                        </div>
                    );
                }}
            </ListState>
        </TemplateMain>
    );
}
