import React from "react";
import { Link } from "react-router";
import ItemGroup from "./ItemGroup";
import ItemRoute from "./ItemRoute";
import ItemContent from "./ItemContent";

export default function ItemLink({props, isSidebarOpen, onClick}){

    const className = `menu-item-link px-3${props.isActive ? ' active' : ''}`;

    const types = {
        group: () => <ItemGroup props={props} classes={className} onClick={onClick}><ItemContent props={props} isSidebarOpen={isSidebarOpen} /></ItemGroup>,
        route: () => <ItemRoute props={props} classes={className} onClick={onClick}><ItemContent props={props} isSidebarOpen={isSidebarOpen} /></ItemRoute>,
        external_link: () => (<Link className={className} to={`${props.link}`} target="_blank">{props.title}</Link>),
        text: () => <div className={`title text-nowrap fs-6 ${className}`}>{props.title}</div>
    }

    return types[props.type]();
}