import { Offcanvas } from "react-bootstrap";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { user } from "core/user";
import Menu, { mainMenuItems } from "./Menu";
import { useSidebar } from "./SidebarContext";

/** Sidebar do desktop: aberta (250px) ou recolhida só com os ícones (64px). */
export function Sidebar() {
    const { isOpen, toggleSidebar } = useSidebar();

    return (
        <aside className={`sidebar d-none d-md-block col-auto p-0${isOpen ? " sidebar-open" : ""}`}>
            <div className="sidebar-content bg-white position-relative border-end h-100">
                <div className="sticky-top">
                    <button
                        type="button"
                        className="sidebar-toggle"
                        onClick={() => toggleSidebar()}
                        aria-label={isOpen ? "Recolher menu" : "Expandir menu"}
                    >
                        {isOpen ? <HiChevronLeft /> : <HiChevronRight />}
                    </button>
                    <Menu items={mainMenuItems(user())} collapsed={!isOpen} onExpand={() => toggleSidebar(true)} />
                </div>
            </div>
        </aside>
    );
}

/** Menu do celular: painel lateral que fecha ao navegar. */
export function SidebarMobile({ show, onClose }) {
    return (
        <Offcanvas show={show} onHide={onClose} className="w-75 d-md-none">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Menu</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="px-0">
                <Menu items={mainMenuItems(user())} onNavigate={onClose} />
            </Offcanvas.Body>
        </Offcanvas>
    );
}
