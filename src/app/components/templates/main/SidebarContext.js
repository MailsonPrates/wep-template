import React, { createContext, useContext, useEffect, useState } from "react";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {

    const [openMenus, setOpenMenus] = useState([]);
    const [open, setOpen] = useState(true);
    const [openMain, setOpenMain] = useState(null);

    useEffect(() => {
        const bools = {"true": true, "false": false};
        const storage = localStorage.getItem("sidebar_open");
        const initialSidebarOpen = bools[storage];
        setOpen(initialSidebarOpen);
    }, [])

    const toggleMenu = (id, isMain=false) => {

        let isIdSameMainOpened = id === openMain;

        setOpenMenus((prev) => {
            
            let prevCopy = JSON.parse(JSON.stringify(prev));

            if ( isMain ){

                if ( isIdSameMainOpened ) return [];

                prevCopy = [];
            }
            
            // Remove ele mesmo quando for o caso
            if ( prevCopy.includes(id) ){
                return prevCopy.filter(item => item !== id);
            }

            // Remove outros com mesmo parent (só pode ter aberto um item por parent)
            let parent = id.split(":")[0] + ":";
            prevCopy = prevCopy.filter(item => !item.includes(parent));

            // Adiciona
            return [...prevCopy, id];
        });

        if ( isMain ){
            setOpenMain(isIdSameMainOpened ? null : id);
        }

    }

    const toggleSidebar = () => {
        let value = !open;
        setOpen(value);
        localStorage.setItem("sidebar_open", value);
    };

    return (
        <SidebarContext.Provider value={{ openMenus, isSidebarOpen: open, toggleMenu, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => useContext(SidebarContext);
