import App from "app";

import { useSidebar } from "./SidebarContext";
import { motion } from "motion/react";
import Menu from "./menu";
import SidebarToggleBtn from "./SidebarToggleBtn";

export default function Sidebar(){

    const user = App.data("user") || {};
    const menu = (user.menu.filter(item => item.slug === "principal") || [])[0] || {};
    const menuList = menu.child || [];
    const { openMenus, isSidebarOpen, toggleMenu, toggleSidebar } = useSidebar();

    const Core = {
        onToggleSidebarBtnClick: () => {
            toggleSidebar();
        },

        onMenuItemClick: (props, e) => {

            const isTypeGroup = props.type === "group"; 

            if ( !isSidebarOpen && isTypeGroup ) toggleSidebar();

            let id = `${props.parent_id}:${props.id}`;
            toggleMenu(id, props.isMain);
        }
    }

    return (
        <div className={`sidebar d-none d-md-block col-sm-2 p-0${isSidebarOpen ? ' sidebar-open' : ''}`}>
            <motion.div
                className="sidebar-content bg-white position-relative border-end h-100"
                initial={{ width: isSidebarOpen ? 250 : 64 }}
                animate={{ width: isSidebarOpen ? 250 : 64 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}>
                <div className="sticky-top">
                    <SidebarToggleBtn isSidebarOpen={isSidebarOpen} onToggleSidebarBtnClick={Core.onToggleSidebarBtnClick} />
                    <Menu
                        menuList={menuList} 
                        onToggle={Core.onMenuItemClick} 
                        isSidebarOpen={isSidebarOpen} 
                        openMenus={openMenus.map(id => parseFloat(id.split(":")[1]))} 
                    />
                </div>
            </motion.div>
        </div>
    )
}