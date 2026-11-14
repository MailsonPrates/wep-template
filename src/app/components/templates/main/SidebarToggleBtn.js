import React from "react";
import { HiChevronRight, HiChevronLeft } from "react-icons/hi2";

export default function SidebarToggleBtn({onToggleSidebarBtnClick, isSidebarOpen}){
    return <div className="position-absolute d-flex align-items-center justify-content-center pointer z-1 rounded-5" style={{
        top: 8, right: -16, "backgroundColor": "#edeaea", padding: 6
    }} onClick={onToggleSidebarBtnClick}>
        {isSidebarOpen ? <HiChevronLeft /> : <HiChevronRight />}
    </div>
}