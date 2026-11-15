import { Link } from "react-router";
import { Button } from "react-bootstrap";
import { HiOutlineTrash, HiMiniPlus } from "react-icons/hi2";
import { UserGroupApi } from "api";
import { ListState, TemplateMain } from "components";
import route from "core/route";
import { useAction, useApi } from "hooks";

export default function UserGroup() {
    const groups = useApi(() => UserGroupApi.get(), [], { initial: [] });

    const [remove, { loading: removing }] = useAction((id) => UserGroupApi.delete(id), {
        confirm: "Remover este grupo? Usuários do grupo ficam sem permissões.",
        success: "Grupo removido",
    });

    const onRemove = async (id) => {
        const res = await remove(id);
        if (res && !res.error) groups.setData((list) => list.filter((item) => item.user_group_id !== id));
    };

    return (
        <TemplateMain
            title="Grupos de usuários"
            breadcrumbs={["page.admin"]}
            actions={<Link className="btn btn-primary m-1" to="/admin/user/group/create/"><HiMiniPlus className="fs-5" /> Novo grupo</Link>}
        >
            <ListState loading={groups.loading || removing} items={groups.data} empty="Nenhum grupo cadastrado" className="w-md-75">
                {(item) => {
                    const home = route(item.home_role || "page.home");

                    return (
                        <div key={item.user_group_id} className="my-2 p-2 border shadow-sm rounded bg-white d-flex align-items-center justify-content-between">
                            <Link className="text-reset flex-grow-1" to={`/admin/user/group/${item.user_group_id}/edit/`}>
                                <div className="fw-medium">{item.name}</div>
                                <div className="fs-13 text-secondary">Página inicial: {home ? home.title : "Home"}{home && home.path ? ` (${home.path})` : ""}</div>
                            </Link>
                            <Button variant="link" className="text-danger fs-4" onClick={() => onRemove(item.user_group_id)} aria-label="Remover grupo">
                                <HiOutlineTrash />
                            </Button>
                        </div>
                    );
                }}
            </ListState>
        </TemplateMain>
    );
}
