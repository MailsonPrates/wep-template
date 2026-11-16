import { HiOutlineUser, HiOutlineUserGroup, HiOutlineEnvelope } from "react-icons/hi2";
import { LinkCards, TemplateMain } from "components";

const CARDS = [
    {
        title: "Usuários",
        icon: <HiOutlineUser />,
        description: "Cadastre, edite ou remova usuários do sistema",
        to: "/admin/user/",
        role: "page.admin.user",
    },
    {
        title: "Grupos de usuários",
        icon: <HiOutlineUserGroup />,
        description: "Crie grupos com permissões e página inicial próprias",
        to: "/admin/user/group/",
        role: "page.admin.user.group",
    },
    {
        title: "Convite de usuários",
        icon: <HiOutlineEnvelope />,
        description: "Convide pessoas para se cadastrarem no sistema",
        to: "/admin/user/invite/",
        role: "page.admin.user.invite",
    },
];

export default function Admin() {
    return (
        <TemplateMain title="Admin">
            <div className="mt-4"><LinkCards items={CARDS} /></div>
        </TemplateMain>
    );
}
