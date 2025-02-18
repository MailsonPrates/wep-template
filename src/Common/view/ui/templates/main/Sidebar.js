import React, {useEffect, useState} from "react";
import App from "app";
import { HiChevronRight, HiChevronLeft, HiOutlineHome, HiChevronDown } from "react-icons/hi2";
import { Collapse } from "react-bootstrap";
import { useSidebar } from "./SidebarContext";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";


const Menu = ({menuList, onToggle, isSidebarOpen, openMenus}) => {

    return <ul className="pb-3 pt-4 px-0">
        {menuList.map((item, index) => {
            item.isMain = true;
            return <MenuItem key={item.id} props={item} onClick={onToggle} isSidebarOpen={isSidebarOpen} openMenus={openMenus} />
        })}
    </ul>
}

const MenuItem = ({props, openMenus, isSidebarOpen, onClick}) => {
    const isActive = openMenus.includes(props.id)
    const linkProps = {...props, isActive};
    const hasChild = props.child && props.child.length;

    return <li className={`menu-item item-${props.type} pointer ${props.isMain ? 'item-main' : 'item-child'}${hasChild ? ' has-child' : ''}`}>
        <MenuItemLink props={linkProps} onClick={onClick} isSidebarOpen={isSidebarOpen} />
        {props.child.length ? 
            <Collapse in={isActive && isSidebarOpen}>
                <div className="menu-item-childs">
                    <ul className="p-0 border-bottom mb-3 pb-3 mt-2">
                        {props.child.map(child => {
                            return <MenuItem key={child.id} props={child} openMenus={openMenus} isSidebarOpen={isSidebarOpen} onClick={onClick} />
                        })}
                    </ul>
                </div>
            </Collapse> : ""
        }
    </li>
}

const MenuItemLink = ({props, isSidebarOpen, onClick}) => {

    const className = `menu-item-link px-3${props.isActive ? ' active' : ''}`;

    const types = {
        group: () => <ItemGroup props={props} classes={className} onClick={onClick}><Content props={props} isSidebarOpen={isSidebarOpen} /></ItemGroup>,
        route: () => <ItemRoute props={props} classes={className} onClick={onClick}><Content props={props} isSidebarOpen={isSidebarOpen} /></ItemRoute>
    }

    return types[props.type]();
}

const Content = ({props, isSidebarOpen}) => {

    const [isFirstRender, setIsFirstRender] = useState(true);

    useEffect(() => {
        if (!isFirstRender) return;
        setIsFirstRender(false);
    }, []);

    return (
        <span className="head d-flex align-items-center justify-content-between">
            <span className="d-flex align-items-center">
                {props.isMain && <HiOutlineHome className="fs-5" />}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.span 
                            className={`title text-nowrap ${props.isMain ? "ms-2 fw-bold" : "fs-6"}`}
                            initial={{ opacity: isFirstRender ? 1 : 0}}
                            exit={{ opacity: 0 }}
                            animate={{ opacity: 1}}
                            transition={{duration: 0.3, ease: "easeInOut"}}>
                            {props.title}
                        </motion.span>
                    )}
                </AnimatePresence>
            </span>
            {props.type === "group" && <HiChevronDown className={`i-caret fs-11${isSidebarOpen ? '' : ' d-none'}`} />}
        </span>
    )
}

const ItemRoute = ({props, classes, children, onClick}) => (
    <Link className={classes} to={`/${props.link}`} onClick={onClick.bind(this, props)}>
        {children}
    </Link>
)

const ItemGroup = ({props, classes, onClick, children}) => (
    <div className={classes} onClick={onClick.bind(this, props)}>
        {children}
    </div>
);


export default function Sidebar(){

    const user = App.data("user");
    const menu = user.menu || [];
    const menuList = menu[0].child;

    const { openMenus, isSidebarOpen, toggleMenu, toggleSidebar } = useSidebar();

    const Core = {
        onToggleSidebarBtnClick: () => {
            toggleSidebar();
        },

        onMenuItemClick: (props, e) => {

            // console.log("click", props, e)

            const isTypeGroup = props.type === "group"; 

            if ( !isSidebarOpen && isTypeGroup ) toggleSidebar();

            let id = `${props.parent_id}:${props.id}`;
            toggleMenu(id, props.isMain);
        }
    }

    const ToggleSidebarBtn = () => {
        return <div className="position-absolute d-flex align-items-center justify-content-center pointer z-1 rounded-5" style={{
            top: 8, right: -16, "backgroundColor": "#edeaea", padding: 6
        }} onClick={Core.onToggleSidebarBtnClick}>
            {isSidebarOpen ? <HiChevronLeft /> : <HiChevronRight />}
        </div>
    }

    return (
        <div className={`sidebar col-sm-2 p-0${isSidebarOpen ? ' sidebar-open' : ''}`}>
            <motion.div
                className="sidebar-content bg-white position-relative border-end border-light h-100"
                initial={{ width: isSidebarOpen ? 250 : 64 }}
                animate={{ width: isSidebarOpen ? 250 : 64 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}>
                <div className="sticky-top">
                    <ToggleSidebarBtn />
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