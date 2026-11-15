import { Container, Dropdown, Navbar } from "react-bootstrap";
import { Link } from "react-router";
import { HiBars3, HiOutlineUser, HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import { user, homePath } from "core/user";
import Avatar from "components/Avatar";
import Logo from "components/Logo";

/** Nav principal. Cores vêm do tema (Config > Visual → .main-nav). */
export default function Nav({ onMenuClick }) {
    const current = user();
    const name = current.nickname || current.firstname || "";

    return (
        <Navbar className="main-nav py-1">
            <Container fluid className="ps-0 ps-md-3">
                <div className="d-flex align-items-center">
                    <button type="button" className="btn nav-menu-btn d-md-none" onClick={onMenuClick} aria-label="Abrir menu">
                        <HiBars3 className="fs-1" />
                    </button>
                    <Link className="navbar-brand ps-3 ps-md-0" to={homePath()}>
                        <Logo small />
                    </Link>
                </div>
                <Dropdown align="end">
                    <Dropdown.Toggle as="button" type="button" className="btn nav-user d-flex align-items-center border-0 hide-arrow">
                        <span className="me-2 d-none d-md-block">{name}</span>
                        <Avatar image={current.profile_images && current.profile_images.small} name={name} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="shadow border-light">
                        <Dropdown.Item as={Link} to="/user/profile/" className="text-secondary">
                            <HiOutlineUser className="fs-4" />
                            <span className="ms-2">Meus dados</span>
                        </Dropdown.Item>
                        {/* logout é uma rota do servidor (encerra a sessão): navegação completa */}
                        <Dropdown.Item href="/login/logout/" className="text-secondary">
                            <HiOutlineArrowRightOnRectangle className="fs-4" />
                            <span className="ms-2">Sair</span>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Container>
        </Navbar>
    );
}
