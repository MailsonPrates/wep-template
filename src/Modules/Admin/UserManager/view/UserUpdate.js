import MainTemplate from "ui/templates/main";
import UserForm from "./common/UserForm";
import { Link } from "react-router";
import { HiChevronLeft } from "react-icons/hi2";
import { useNavigate, useParams  } from "react-router";

export default function UserUpdate(){

    const navigate = useNavigate();
    const { id } = useParams();

    const Header = () => {
        return (
            <div className="text-end">
                <Link to="/admin/user/" className="text-reset text-decoration-none d-flex align-items-center justify-content-end">
                    <HiChevronLeft className="fs-6" />
                    <span className="ms-1">voltar</span>
                </Link>
            </div>
        )
    }

    return (
        <MainTemplate title="Editar usuário" breadcrumbs={['page.admin', 'page.admin.user']}>
            <Header />
            <UserForm afterSave={() => navigate("/admin/user/")} id={id} />
        </MainTemplate>
    )
}