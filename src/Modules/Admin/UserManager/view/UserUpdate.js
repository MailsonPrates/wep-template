import { useNavigate, useParams } from "react-router";
import { TemplateMain } from "components";
import UserForm from "./UserForm";

export default function UserUpdate() {
    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <TemplateMain title="Editar usuário" breadcrumbs={["page.admin", "page.admin.user"]}>
            <UserForm id={id} onSaved={() => navigate("/admin/user/")} />
        </TemplateMain>
    );
}
