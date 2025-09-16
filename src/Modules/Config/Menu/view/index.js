import {MenuApi} from "api";
import React, { useEffect, useState } from "react";
import useReqToast from 'ui/useReqToast';
import MainTemplate from "ui/templates/main";
import { Button } from "react-bootstrap";
import { HiOutlineTrash, HiMiniPlus, HiChevronDown, 
    HiArrowTurnDownRight, HiOutlinePlusCircle, HiOutlinePencilSquare  } from "react-icons/hi2";
import MenuFormOffCanvas from "./MenuFormOffCanvas";
import MenuFormItemOffCanvas from "./MenuFormItemOffCanvas";
import { ReactSortable } from "react-sortablejs";

export default function Menu(){

    const Toast = useReqToast();
    const menuMaps = {};

    const [menus, setMenus] = useState([]);
    const [status, setStatus] = useState("processing");
    const [menuOpen, setMenuOpen] = useState([]);

    useEffect(() => {
        Core.getMenus();
    }, [])
    

    const Core = {

        onRemoveMenuBtnClick: async (props) => {

            if ( !confirm("Tem certeza?") ) return;

            setStatus("processing");

            let remove = await MenuApi.where("id", props.id).delete();

            console.log({remove});

            setStatus("ready");

            if ( remove.error ) return Toast(remove);

            Toast({
                type: "success",
                message: "Removido com succeso"
            })

            Core.getMenus();
        },

        onMenuHeaderClick: props => {
            setMenuOpen(prev => {
                prev = JSON.parse(JSON.stringify(prev));

                if ( menuOpen.includes(props.id) ){
                    prev = prev.filter(item => item !== props.id);
                    return prev;
                }

                prev.push(props.id);

                return prev;
            })
        },

        onRemoveItemBtnClick: async (props) => {

            if ( !confirm("Tem certeza?") ) return;

            setStatus("processing")

            let remove = await MenuApi.deleteItem({
                id: props.id
            });

            setStatus("ready")

            console.log({remove})

            if ( remove.erro ) return Toast(remove)

            Toast({
                type: "success",
                message: "Removido com succeso"
            })

            Core.getMenus()
        },

        setList: (props, list) => {
            menuMaps[props.id] = list;
        },

        onEndSort: async (props, b, c) => {

            console.log("[onEndSort]", {props, menuMaps, menus});

            let menuUpdated = menuMaps[props.id];
            let menusCloned = JSON.parse(JSON.stringify(menus));
            let idsToUpdate = [];

            menuUpdated.forEach((item, index) => {
                idsToUpdate.push({
                    id: item.id,
                    sort_order: index
                })
            })

            Core.findDeep(menusCloned, props.id, (items, item) => {
                item.child = menuUpdated;
            })

            setMenus(menusCloned);

            let updateSort = await MenuApi.sort({
                items: idsToUpdate
            })

            console.log({updateSort})

            if ( updateSort.error ) return Toast(updateSort);
        },

        findDeep: (items, id, callback) => {

            for( let i=0; i<items.length; i++ ){
                let item = items[i];

                if ( item.id === id ){
                    callback(items, item);
                    break;
                }

                if ( item.child.length ) Core.findDeep(item.child, id, callback);
            }
        },

        getMenus: async () => {

            let getMenus = await MenuApi.get();

            console.log("[MOUNT]", {getMenus});

            setStatus('ready');
    
            if ( getMenus.error ) return Toast(getMenus);
    
            setMenus(getMenus.data);
        },
    }

    const Menu = ({props, isLast, isOpen}) => {

        return (
            <div className={'border rounded mb-3' + (isLast ? "" : " border-bottom")}>
                <div className="d-flex align-items-center justify-content-between p-3 pointer">
                    <MenuFormOffCanvas config={{id: props.id, name: props.name}} onComplete={Core.getMenus}>
                        <span className="fs-4 fw-semibold">
                            {`${props.name} (${props.slug})`}
                        </span>
                    </MenuFormOffCanvas>
                    <span className="fs-4 px-2 rounded-3 border shadow-sm" onClick={Core.onMenuHeaderClick.bind(this, props)}>
                        <HiChevronDown />
                    </span>
                </div>
                <div className={"border-top" + (isOpen ? '' : ' d-none')}>
                    <div className="menu-content nested-sortable">
                        <MenuItems props={props} />
                    </div>
                    <MenuFooter props={props} />
                </div>
            </div>
        )
    }

    const MenuItems = ({props}) => {

        let childs = props.child || [];
        let childsLen = childs.length;

        if ( !childsLen ) return <div className="p-4 text-center text-secondary bg-light">
            Nenhum item cadastrado
        </div>

        return (
            <ReactSortable group="first" animation={200} delayOnTouchStart={true} delay={2} 
            list={childs} setList={Core.setList.bind(this, props)} onSort={Core.onEndSort.bind(this, props)}>
                {
                    childs.map((item, i) => {
                        let isLast = (i === (childsLen - 1));

                        return (
                            <div 
                                key={item.id}
                                data-id={item.id}
                                data-parent={item.parent_id}
                                data-menu={item.menu_id}
                                className={"menu-item-wrap"+(item.child.length ? ' has-child' : "")}>
                                    <MenuItem props={item} isLast={isLast} />
                                    {item.child.length ? <MenuChildItem props={item} margin={0} /> : ""}
                            </div>
                        )
                    })
                }
            </ReactSortable>
        )
    }

    const MenuItem = ({props, isLast, isChild=false, margin=0}) => {
       // console.log("[MenuItem]", props)
        return (
            <div
                data-id={props.id}
                data-parent={props.parent_id}
                data-menu={props.menu_id}
                className={"menu-item"+(isChild ? "-child" : "")+" px-3 py-2 d-flex align-items-center"+(!isLast ? " border-bottom" : "")+(isChild ? ' bg-light' : '')}>
                    {isChild && <span className="me-3" style={{
                        width: "20px", 
                        height: "13px", 
                        marginLeft: margin, 
                        marginTop: "-9px"
                        }}><HiArrowTurnDownRight className="fs-5 text-secondary" />
                    </span>}
                    <span className="d-flex align-items-center justify-content-between w-100">
                        <MenuFormItemOffCanvas config={props} onComplete={Core.getMenus}>
                            <span className="pointer">
                                {props.title}
                            </span>
                        </MenuFormItemOffCanvas>
                        <span className="d-flex align-items">
                            <span className="mx-3 m-1 text-danger pointer" onClick={Core.onRemoveItemBtnClick.bind(this, props)}>
                                <HiOutlineTrash className="fs-5" />
                            </span>
                            <MenuFormItemOffCanvas config={{
                                menu_id: props.menu_id,
                                parent_id: props.id,
                                sort_order: props.length
                            }} onComplete={Core.getMenus}>
                                <span className="m-1 text-primary pointer">
                                    <HiOutlinePlusCircle className="fs-5" />
                                </span>
                            </MenuFormItemOffCanvas>
                        </span>
                    </span>
            </div>
        )
    }

    const MenuChildItem = ({props, margin=0}) => {

        let child = props.child || [];
        let childLen = child.length;

       // console.log({props})

        return (
             <ReactSortable group="nested" animation={200} delayOnTouchStart={true} delay={2} 
            list={child} setList={Core.setList.bind(this, props)} onSort={Core.onEndSort.bind(this, props)}>
                {child.map((item, i) => {

                    item.length = childLen +1;
                    return (
                        <div key={item.id}>
                            <MenuItem props={item} margin={margin} isLast={false} isChild={true} />
                            {item.child.length ? <MenuChildItem props={item} margin={(margin + 35)} /> : ""}
                        </div>
                    )
                })}
            </ReactSortable>
        )
    }

    const MenuFooter = ({props}) => {

        return (
            <div className="px-2 py-1 d-flex align-items justify-content-between border-top">
               
                <MenuFormItemOffCanvas config={{
                     parent_id: 0,
                     menu_id: props.id || "",
                     external: false,
                     type: "route",
                     sort_order: props.child.length 
                         ? (props.child.length + 1)
                         : 0
                }} onComplete={Core.getMenus}>
                    <Button variant="default" className="text-primary border-0">
                        <HiMiniPlus />
                        <span className="ms-2">Novo item</span>
                    </Button>
                </MenuFormItemOffCanvas>
                <div>
                    <Button variant="default" className="text-secondary border-0" onClick={Core.onRemoveMenuBtnClick.bind(this, props)}>
                        <HiOutlineTrash />
                        <span className="ms-1">Remover</span>
                    </Button>
                    
                    <MenuFormOffCanvas config={{id: props.id, name: props.name}} onComplete={Core.getMenus}>
                        <Button variant="default" className="text-priamry border-0" onClick={Core.show}>
                            <HiOutlinePencilSquare />
                            <span className="ms-1">Editar</span>
                        </Button>
                    </MenuFormOffCanvas>
                </div>
            </div>
        )
    }

    const EmptyMenu = () => <div className="text-secondary fs-4 fw-light p-3">Nenhum menu cadastrado!</div>

    const Header = () => {
        return (
            <div className="text-end">
                <MenuFormOffCanvas onComplete={Core.getMenus}>
                    <Button variant="primary" className="rounded-3 m-2" onClick={Core.show}>
                        <HiMiniPlus className="fs-5" /> Novo menu
                    </Button>
                </MenuFormOffCanvas>    
            </div>
        )
    }

    const Content = () => {

        let menuLen = menus.length;

        if ( !menuLen && status === "processing" ) return;

        if ( !menuLen ) return <EmptyMenu />;

        return (
            <div className="content w-md-50 mt-3">
                {menus.map((item, index) => {

                    let isLast = (index === (menuLen - 1));
                    let isOpen = menuOpen.includes(item.id);

                    return <Menu key={item.id} props={item} isLast={isLast} isOpen={isOpen} />
                })}
            </div>
        )
    }

    return (
        <MainTemplate title="Menus" breadcrumbs={['page.config']}>
           <div className={`body${status === "processing" ? ' full-loading' : ""}`}>
                <Header />
                <Content />
           </div>
        </MainTemplate>
    )
}