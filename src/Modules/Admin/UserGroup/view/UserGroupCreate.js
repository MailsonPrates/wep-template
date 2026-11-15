import { useNavigate } from "react-router";
import { TemplateMain } from "components";
import UserGroupForm from "./UserGroupForm";

export default function UserGroupCreate() {
    const navigate = useNavigate();

    return (
        <TemplateMain title="Novo grupo de usuários" breadcrumbs={["page.admin", "page.admin.user.group"]}>
            <UserGroupForm onSaved={() => navigate("/admin/user/group/")} />
        </TemplateMain>
    );
}
