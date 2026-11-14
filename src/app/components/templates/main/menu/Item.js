import ItemLink from "./ItemLink";
import React from "react";
import { Collapse } from "react-bootstrap";

export default function Item({props, openMenus, isSidebarOpen, onClick}){
    const isActive = openMenus.includes(props.id)
    const linkProps = {...props, isActive};
    const hasChild = props.child && props.child.length;

    return <li className={`menu-item item-${props.type} pointer ${props.isMain ? 'item-main' : 'item-child'}${hasChild ? ' has-child' : ''}`}>
        <ItemLink props={linkProps} onClick={onClick} isSidebarOpen={isSidebarOpen} />
        {props.child.length ? 
            <Collapse in={isActive && isSidebarOpen}>
                <div className="menu-item-childs">
                    <ul className="p-0 border-bottom mb-3 pb-3 mt-2">
                        {props.child.map(child => {
                            return <Item key={child.id} props={child} openMenus={openMenus} isSidebarOpen={isSidebarOpen} onClick={onClick} />
                        })}
                    </ul>
                </div>
            </Collapse> : ""
        }
    </li>
}