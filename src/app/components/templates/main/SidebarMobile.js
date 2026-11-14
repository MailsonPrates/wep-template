import { Offcanvas } from "react-bootstrap"
import { useSidebar } from "./SidebarContext";
import Menu from "./menu";
import App from "app";

export default function SidebarMobile({show, close}){

    const user = App.data("user") || {};
    const menu = (user.menu.filter(item => item.slug === "principal") || [])[0] || {};
    const menuList = menu.child || [];

    const { openMenus, toggleMenu, toggleSidebar } = useSidebar();

    const Core = {

        onMenuItemClick: (props, e) => {

              const isTypeGroup = props.type === "group"; 

            if ( isTypeGroup ) toggleSidebar();

            let id = `${props.parent_id}:${props.id}`;
            toggleMenu(id, props.isMain);
        }
    }

    return (
        <Offcanvas show={show} onHide={close} className="w-75 d-md-none">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Menu</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="px-0">
                <Menu
                    menuList={menuList} 
                    onToggle={Core.onMenuItemClick} 
                    isSidebarOpen={true} 
                    openMenus={openMenus.map(id => parseFloat(id.split(":")[1]))} 
                />
            </Offcanvas.Body>
        </Offcanvas>
    )
}