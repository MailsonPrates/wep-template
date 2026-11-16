import { useEffect } from "react";
import { Collapse } from "react-bootstrap";
import { NavLink, useLocation } from "react-router";
import { HiChevronDown } from "react-icons/hi2";
import SvgIcon from "components/SvgIcon";
import { useSidebar } from "./SidebarContext";

/**
 * Menu da sidebar a partir dos itens que o servidor injeta (window.App.user.menu, já filtrados
 * pelas permissões do grupo). Tipos: route, group, external_link, text.
 */

const isActivePath = (link, pathname) => {
    if (!link) return false;
    if (link === "/") return pathname === "/";
    return pathname === link || pathname.startsWith(link.endsWith("/") ? link : `${link}/`);
};

/** O item (ou algum filho) aponta para a página atual? */
const containsPath = (item, pathname) =>
    isActivePath(item.link, pathname) || (item.child || []).some((child) => containsPath(child, pathname));

function ItemContent({ item, isMain, collapsed }) {
    return (
        <span className="d-flex align-items-center justify-content-between">
            <span className="d-flex align-items-center text-nowrap">
                {isMain && item.icon_svg && <SvgIcon icon={item.icon_svg} className="menu-icon" />}
                {!collapsed && (
                    <span className={`menu-title${isMain ? " ms-2 fw-medium" : ""}${isMain && !item.icon_svg ? " ms-0" : ""}`}>
                        {item.title}
                    </span>
                )}
            </span>
            {item.type === "group" && !collapsed && <HiChevronDown className="i-caret fs-11" />}
        </span>
    );
}

function Item({ item, siblings, isMain, collapsed, onNavigate, onExpand }) {
    const { openGroups, toggleGroup } = useSidebar();
    const { pathname } = useLocation();
    const children = item.child || [];
    const isOpen = openGroups.includes(item.id);
    const siblingIds = siblings.map((sibling) => sibling.id);
    const className = `menu-item item-${item.type} ${isMain ? "item-main" : "item-child"}${children.length ? " has-child" : ""}`;
    const linkClass = (active) => `menu-item-link px-3${active ? " active" : ""}`;

    let link;

    if (item.type === "group") {
        link = (
            <button
                type="button"
                className={linkClass(isOpen || containsPath(item, pathname))}
                aria-expanded={isOpen}
                title={collapsed ? item.title : undefined}
                onClick={() => {
                    if (collapsed && onExpand) onExpand();
                    toggleGroup(item, siblingIds, collapsed ? true : undefined);
                }}
            >
                <ItemContent item={item} isMain={isMain} collapsed={collapsed} />
            </button>
        );
    } else if (item.type === "route" && item.link) {
        link = (
            <NavLink
                to={item.link}
                end={item.link === "/"}
                className={({ isActive }) => linkClass(isActive)}
                title={collapsed ? item.title : undefined}
                onClick={onNavigate}
            >
                <ItemContent item={item} isMain={isMain} collapsed={collapsed} />
            </NavLink>
        );
    } else if (item.type === "external_link" && item.link) {
        link = (
            <a
                className={linkClass(false)}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                title={collapsed ? item.title : undefined}
            >
                <ItemContent item={item} isMain={isMain} collapsed={collapsed} />
            </a>
        );
    } else {
        link = (
            <div className={`${linkClass(false)} pe-none`}>
                <ItemContent item={{ ...item, type: "text" }} isMain={isMain} collapsed={collapsed} />
            </div>
        );
    }

    return (
        <li className={className}>
            {link}
            {children.length > 0 && (
                <Collapse in={isOpen && !collapsed}>
                    <div className="menu-item-childs">
                        <ul>
                            {children.map((child) => (
                                <Item
                                    key={child.id}
                                    item={child}
                                    siblings={children}
                                    isMain={false}
                                    collapsed={collapsed}
                                    onNavigate={onNavigate}
                                    onExpand={onExpand}
                                />
                            ))}
                        </ul>
                    </div>
                </Collapse>
            )}
        </li>
    );
}

/**
 * @param {Array} items
 * @param {boolean} collapsed  sidebar recolhida (só ícones)
 * @param {() => void} onNavigate ao clicar num link (o menu mobile fecha)
 * @param {() => void} onExpand   ao clicar num grupo com a sidebar recolhida (ela abre)
 */
export default function Menu({ items = [], collapsed = false, onNavigate, onExpand }) {
    const { toggleGroup } = useSidebar();
    const { pathname } = useLocation();

    // abre o(s) grupo(s) que contêm a página atual
    useEffect(() => {
        const openPath = (list) => {
            list.forEach((item) => {
                if (item.type !== "group" || !containsPath(item, pathname)) return;
                toggleGroup(item, list.map((sibling) => sibling.id), true);
                openPath(item.child || []);
            });
        };

        openPath(items);
    }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <ul className="menu">
            {items.map((item) => (
                <Item
                    key={item.id}
                    item={item}
                    siblings={items}
                    isMain
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                    onExpand={onExpand}
                />
            ))}
        </ul>
    );
}

/** Itens do menu principal (slug "principal") do usuário logado. */
export function mainMenuItems(user) {
    const menu = (user.menu || []).find((item) => item.slug === "principal");
    return (menu && menu.child) || [];
}
