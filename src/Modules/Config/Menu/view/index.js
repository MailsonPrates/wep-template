import { useState } from "react";
import { Button } from "react-bootstrap";
import { ReactSortable } from "react-sortablejs";
import {
    HiOutlineTrash, HiMiniPlus, HiChevronDown, HiChevronUp, HiArrowTurnDownRight,
    HiOutlinePlusCircle, HiOutlinePencilSquare, HiOutlineBars2,
} from "react-icons/hi2";
import { MenuApi } from "api";
import { Empty, SvgIcon, TemplateMain } from "components";
import { useAction, useApi } from "hooks";
import MenuForm from "./MenuForm";
import MenuItemForm from "./MenuItemForm";

const TYPE_LABEL = { route: "Rota", group: "Grupo", external_link: "Link externo", text: "Texto" };

/** Troca os filhos de um nível da árvore (sem mutar o estado). */
function replaceChildren(items, parentId, children) {
    return items.map((item) => (
        item.id === parentId
            ? { ...item, child: children }
            : { ...item, child: replaceChildren(item.child || [], parentId, children) }
    ));
}

/**
 * Lista ordenável de um nível do menu. Só salva quando a ordem muda de fato
 * (o react-sortablejs também chama setList sem mudança).
 */
function SortableLevel({ items, onSort, children, depth }) {
    const ids = items.map((item) => item.id).join(",");

    return (
        <ReactSortable
            list={items.map((item) => ({ ...item }))}
            setList={(list) => {
                if (list.map((item) => item.id).join(",") !== ids) onSort(list.map(({ chosen, selected, ...item }) => item));
            }}
            group={`level-${depth}`}
            handle=".sortable-handle"
            animation={200}
            ghostClass="sortable-ghost"
        >
            {items.map(children)}
        </ReactSortable>
    );
}

function ItemRow({ item, depth, onEdit, onAdd, onRemove, onSort }) {
    const children = item.child || [];

    return (
        <div>
            <div className={`px-3 py-2 d-flex align-items-center border-bottom${depth ? " bg-light" : ""}`}>
                <span className="sortable-handle text-secondary me-2" title="Arraste para ordenar"><HiOutlineBars2 /></span>
                {depth > 0 && <HiArrowTurnDownRight className="text-secondary me-2" style={{ marginLeft: (depth - 1) * 28 }} />}
                <span
                    className="me-2 fs-5 d-inline-flex"
                    style={{ width: 22 }}
                >
                    {item.icon_svg && <SvgIcon icon={item.icon_svg} />}
                </span>
                <button
                    type="button"
                    className="btn btn-link text-reset text-decoration-none p-0 text-start flex-grow-1"
                    onClick={() => onEdit(item)}
                >
                    {item.title}
                    <span className="ms-2 fs-12 text-secondary">{TYPE_LABEL[item.type] || item.type}{item.link ? ` · ${item.link}` : ""}</span>
                </button>
                <button
                    type="button"
                    className="btn btn-link text-primary p-1"
                    title="Adicionar subitem"
                    onClick={() => onAdd(item)}
                >
                    <HiOutlinePlusCircle className="fs-5" />
                </button>
                <button type="button" className="btn btn-link text-danger p-1" title="Remover" onClick={() => onRemove(item)}>
                    <HiOutlineTrash className="fs-5" />
                </button>
            </div>
            {children.length > 0 && (
                <SortableLevel items={children} depth={depth + 1} onSort={(list) => onSort(item.id, list)}>
                    {(child) => (
                        <ItemRow
                            key={child.id}
                            item={child}
                            depth={depth + 1}
                            onEdit={onEdit}
                            onAdd={onAdd}
                            onRemove={onRemove}
                            onSort={onSort}
                        />
                    )}
                </SortableLevel>
            )}
        </div>
    );
}

export default function Menu() {
    const menus = useApi(() => MenuApi.get(), [], { initial: [] });
    const options = useApi(() => MenuApi.getRolesData(), [], { initial: null });

    const [openMenus, setOpenMenus] = useState([]);
    const [editingMenu, setEditingMenu] = useState(null);
    const [editingItem, setEditingItem] = useState(null);

    const [removeMenu, removingMenu] = useAction(
        (id) => MenuApi.delete({ id }),
        { confirm: "Remover o menu e todos os itens?", success: "Menu removido" }
    );
    // antes o erro era testado em "remove.erro" (erro de digitação): falhas apareciam como sucesso
    const [removeItem, removingItem] = useAction(
        (id) => MenuApi.deleteItem({ id }),
        { confirm: "Remover o item e os subitens?", success: "Item removido" }
    );
    const [saveSort] = useAction((items) => MenuApi.sort({ items }));

    const toggleOpen = (id) => setOpenMenus((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

    const onSaved = () => {
        setEditingMenu(null);
        setEditingItem(null);
        menus.reload();
    };

    const onSort = (menu) => (parentId, list) => {
        menus.setData((all) => all.map((current) => {
            if (current.id !== menu.id) return current;
            if (parentId === 0) return { ...current, child: list };

            return { ...current, child: replaceChildren(current.child || [], parentId, list) };
        }));

        saveSort(list.map((item, index) => ({ id: item.id, sort_order: index })));
    };

    const onRemoveItem = async (item) => {
        const res = await removeItem(item.id);
        if (res && !res.error) menus.reload();
    };

    const onRemoveMenu = async (menu) => {
        const res = await removeMenu(menu.id);
        if (res && !res.error) menus.reload();
    };

    const list = menus.data || [];
    const loading = menus.loading || removingMenu.loading || removingItem.loading;

    return (
        <TemplateMain
            title="Menus"
            breadcrumbs={["page.config"]}
            actions={
                <Button variant="primary" className="m-1" onClick={() => setEditingMenu({})}>
                    <HiMiniPlus className="fs-5" /> Novo menu
                </Button>
            }
        >
            <div
                className={`w-md-75${loading ? " full-loading" : ""}`}
                style={loading && !list.length ? { minHeight: 120 } : undefined}
            >
                {!list.length && !loading && <Empty message="Nenhum menu cadastrado" />}

                {list.map((menu) => {
                    const isOpen = openMenus.includes(menu.id);
                    const items = menu.child || [];
                    const addItem = (parent) => setEditingItem({
                        menu_id: menu.id,
                        parent_id: parent ? parent.id : 0,
                        sort_order: (parent ? (parent.child || []).length : items.length),
                    });

                    return (
                        <div key={menu.id} className="border rounded mb-3 bg-white">
                            <button
                                type="button"
                                className="btn w-100 d-flex align-items-center justify-content-between p-3 text-start"
                                onClick={() => toggleOpen(menu.id)}
                                aria-expanded={isOpen}
                            >
                                <span className="fs-4 fw-semibold">{menu.name} <span className="fs-6 fw-normal text-secondary">({menu.slug})</span></span>
                                {isOpen ? <HiChevronUp className="fs-4" /> : <HiChevronDown className="fs-4" />}
                            </button>

                            {isOpen && (
                                <div className="border-top">
                                    {items.length
                                        ? (
                                            <SortableLevel items={items} depth={0} onSort={(next) => onSort(menu)(0, next)}>
                                                {(item) => (
                                                    <ItemRow
                                                        key={item.id}
                                                        item={item}
                                                        depth={0}
                                                        onEdit={setEditingItem}
                                                        onAdd={addItem}
                                                        onRemove={onRemoveItem}
                                                        onSort={onSort(menu)}
                                                    />
                                                )}
                                            </SortableLevel>
                                        )
                                        : <div className="p-4 text-center text-secondary bg-light">Nenhum item cadastrado</div>}

                                    <div className="px-2 py-1 d-flex align-items-center justify-content-between">
                                        <Button
                                            variant="link"
                                            className="text-primary text-decoration-none"
                                            onClick={() => addItem(null)}
                                        >
                                            <HiMiniPlus /> <span className="ms-1">Novo item</span>
                                        </Button>
                                        <div>
                                            <Button
                                                variant="link"
                                                className="text-secondary text-decoration-none"
                                                onClick={() => onRemoveMenu(menu)}
                                            >
                                                <HiOutlineTrash /> <span className="ms-1">Remover</span>
                                            </Button>
                                            <Button
                                                variant="link"
                                                className="text-primary text-decoration-none"
                                                onClick={() => setEditingMenu(menu)}
                                            >
                                                <HiOutlinePencilSquare /> <span className="ms-1">Editar</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <MenuForm menu={editingMenu} onClose={() => setEditingMenu(null)} onSaved={onSaved} />
            <MenuItemForm
                item={editingItem}
                options={options.data}
                loadingOptions={options.loading}
                onClose={() => setEditingItem(null)}
                onSaved={onSaved}
            />
        </TemplateMain>
    );
}
