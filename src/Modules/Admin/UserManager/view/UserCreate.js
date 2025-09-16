import MainTemplate from "ui/templates/main";
import UserForm from "./common/UserForm";
import { Link } from "react-router";
import { HiChevronLeft } from "react-icons/hi2";
import { useNavigate } from "react-router";

export default function UserCreate(){

    const navigate = useNavigate();

    const Header = () => {
        return (
            <div className="text-end">
                <Link className="text-reset text-decoration-none d-flex align-items-center justify-content-end" to="/admin/user/">
                    <HiChevronLeft className="fs-6" />
                    <span className="ms-1">voltar</span>
                </Link>
            </div>
        )
    }

    return (
        <MainTemplate title="Criar novo usuário" breadcrumbs={["page.admin", "page.admin.user"]}>
            <Header />
            <UserForm afterSave={() => navigate("/admin/user/")}/>
        </MainTemplate>
    )
}