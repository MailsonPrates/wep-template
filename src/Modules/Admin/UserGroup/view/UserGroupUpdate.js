import { useNavigate, useParams } from "react-router";
import { TemplateMain } from "components";
import UserGroupForm from "./UserGroupForm";

export default function UserGroupUpdate() {
    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <TemplateMain title="Editar grupo de usuários" breadcrumbs={["page.admin", "page.admin.user.group"]}>
            <UserGroupForm id={id} onSaved={() => navigate("/admin/user/group/")} />
        </TemplateMain>
    );
}
