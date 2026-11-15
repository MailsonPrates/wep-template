import Item from "./Item";
import React from "react";

export default function Menu({menuList, onToggle, isSidebarOpen, openMenus}){

    return <ul className="pb-3 pt-4 px-0">
        {menuList.map((item, index) => {
            item.isMain = true;
            return <Item key={item.id} props={item} onClick={onToggle} isSidebarOpen={isSidebarOpen} openMenus={openMenus} />
        })}
    </ul>
}