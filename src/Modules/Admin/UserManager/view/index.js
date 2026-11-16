import { Link } from "react-router";
import { Badge, Button } from "react-bootstrap";
import { HiOutlineTrash, HiMiniPlus, HiOutlineKey } from "react-icons/hi2";
import { UserManagerApi } from "api";
import { Avatar, ListState, TemplateMain } from "components";
import { useAction, useApi, useToast } from "hooks";
import { STATUS } from "./status";

function UserItem({ item, onReset, onRemove }) {
    const status = STATUS[item.status] || { text: item.status, bg: "light" };
    const name = `${item.firstname || ""} ${item.lastname || ""}`.trim() || item.username;

    return (
        <div className="my-2 p-2 border shadow-sm rounded bg-white d-flex flex-wrap align-items-center justify-content-between gap-2">
            <Link
                className="text-reset d-flex align-items-center flex-wrap gap-2 flex-grow-1"
                to={`/admin/user/${item.user_id}/edit/`}
            >
                <Avatar image={item.profile_images && item.profile_images.small} name={item.firstname || item.username} />
                <span className="fw-medium">{name}</span>
                <span className="text-secondary">{item.username}</span>
                {item.user_group_name && <span className="text-secondary">· {item.user_group_name}</span>}
                <Badge bg={status.bg} className="fw-normal">{status.text}</Badge>
            </Link>
            <div className="d-flex gap-1">
                <Button variant="outline-primary" size="sm" onClick={() => onReset(item)}>
                    <HiOutlineKey /> <span className="ms-1">Resetar senha</span>
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => onRemove(item)}>
                    <HiOutlineTrash /> <span className="ms-1">Remover</span>
                </Button>
            </div>
        </div>
    );
}

export default function UserManager() {
    const toast = useToast();
    const users = useApi(() => UserManagerApi.get(), [], { initial: [] });

    const [remove, removing] = useAction((id) => UserManagerApi.delete({ id }), {
        confirm: "Remover este usuário?",
        success: "Usuário removido",
    });

    const [reset, resetting] = useAction((id) => UserManagerApi.resetPassword({ user_id: id }), {
        confirm: "Resetar a senha deste usuário?",
    });

    const onRemove = async (item) => {
        const res = await remove(item.user_id);
        if (res && !res.error) users.setData((list) => list.filter((user) => user.user_id !== item.user_id));
    };

    const onReset = async (item) => {
        const res = await reset(item.user_id);

        // sem e-mail a resposta traz a senha temporária: o aviso fica até o admin fechar
        if (res && !res.error) toast({ type: "success", message: res.message || "Senha resetada", autoHide: false });
    };

    return (
        <TemplateMain
            title="Usuários"
            breadcrumbs={["page.admin"]}
            actions={(
                <>
                    <Link className="btn btn-outline-primary m-1" to="/admin/user/invite/create/">Convidar usuário</Link>
                    <Link
                        className="btn btn-primary m-1"
                        to="/admin/user/create/"
                    >
                        <HiMiniPlus className="fs-5" /> Novo usuário
                    </Link>
                </>
            )}
        >
            <ListState
                loading={users.loading || removing.loading || resetting.loading}
                items={users.data}
                empty="Nenhum usuário cadastrado"
            >
                {(item) => <UserItem key={item.user_id} item={item} onReset={onReset} onRemove={onRemove} />}
            </ListState>
        </TemplateMain>
    );
}
