import { useNavigate } from "react-router";
import { TemplateMain } from "components";
import UserForm from "./UserForm";

export default function UserCreate() {
    const navigate = useNavigate();

    return (
        <TemplateMain title="Criar novo usuário" breadcrumbs={["page.admin", "page.admin.user"]}>
            <UserForm onSaved={() => navigate("/admin/user/")} />
        </TemplateMain>
    );
}
