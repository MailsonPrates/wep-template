import { createContext, useContext, useState } from "react";

const SidebarContext = createContext(null);
const STORAGE_KEY = "sidebar_open";

function readOpen() {
    try {
        // primeira visita (nada salvo): aberta. Antes o valor ausente virava `undefined` e a sidebar
        // começava fechada.
        return window.localStorage.getItem(STORAGE_KEY) !== "false";
    } catch (e) {
        return true;
    }
}

/**
 * Estado da sidebar: aberta/recolhida (lembrado no navegador) e quais grupos do menu estão
 * expandidos. Só um grupo fica aberto por nível: abrir um fecha os irmãos.
 */
export function SidebarProvider({ children }) {
    const [isOpen, setIsOpen] = useState(readOpen);
    const [openGroups, setOpenGroups] = useState([]);

    const toggleSidebar = (value) => {
        setIsOpen((prev) => {
            const next = typeof value === "boolean" ? value : !prev;
            try { window.localStorage.setItem(STORAGE_KEY, String(next)); } catch (e) { /* sem storage */ }
            return next;
        });
    };

    /**
     * @param {{id: number}} item  grupo clicado
     * @param {number[]} siblingIds ids dos itens do mesmo nível (fechados ao abrir este)
     * @param {boolean} [force]     true = só abrir (ex.: grupo da página atual)
     */
    const toggleGroup = (item, siblingIds = [], force) => {
        setOpenGroups((prev) => {
            const isOpenNow = prev.includes(item.id);

            if (isOpenNow && force !== true) return prev.filter((id) => id !== item.id);
            if (isOpenNow) return prev;

            return [...prev.filter((id) => !siblingIds.includes(id)), item.id];
        });
    };

    const value = { isOpen, toggleSidebar, openGroups, toggleGroup };

    return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
    return useContext(SidebarContext);
}
