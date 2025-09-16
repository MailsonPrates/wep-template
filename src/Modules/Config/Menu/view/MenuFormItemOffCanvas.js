import React, { useRef, useState } from "react";
import { Offcanvas, Button } from "react-bootstrap";
import {MenuApi, UserGroupApi} from "api";
import useReqToast from 'ui/useReqToast';
import Title from "./Title";
import Type from "./Type";
import Route from "./Route";
import UserGroups from "./UserGroups";
import Link from "./Link";
import Icon from "./Icon";

export default function MenuFormItemOffCanvas({config={}, children, onComplete}){

    //console.log("[MenuFormItemOffCanvas]", config)

    const isUpdate = config.id;
    const Toast = useReqToast();
    const titleRef = useRef(null);

    const [show, setShow] = useState(false);
    const [status, setStatus] = useState("processing");
    const [title, setTitle] = useState(config.title || "");
    const [link, setLink] = useState(config.link || "");
    const [type, setType] = useState(config.type || "route");
    const [permission, setPermission] = useState(config.permission || "");
    const [userGroupPermission, setUserGroupPermission] = useState(config.user_groups ?? "");
    const [userGroupList, setUserGroupList] = useState([]);
    const [routesList, setRoutesList] = useState([]);
    const [icon, setIcon] = useState(JSON.parse(config.icon || "{}"));

    const Core = {
        show: () => {

            if ( !routesList.length || !userGroupList.length ){
                Core.getRolesData();
            }

            setShow(true);
        },

        close: () => setShow(false),

        onSaveBtnClick: async () => {

            titleRef.current.classList.remove('is-invalid');

            if ( !title ){
                titleRef.current.classList.add('is-invalid');
                titleRef.current.focus();
                return;
            }

            const payload = {
                title,
                permission,
                user_groups: userGroupPermission,
                external: type === "external_link",
                type,
                link,
                menu_id: config.menu_id,
                parent_id: config.parent_id,
                sort_order: config.sort_order,
                icon: JSON.stringify(icon)
            };

            setStatus("processing");

            console.log({payload, isUpdate});

            let save = isUpdate
                ? await MenuApi.where("id", config.id).updateItem(payload)
                : await MenuApi.createItem(payload);

            console.log({save});

            setStatus("ready");

            Toast(save);

            typeof onComplete == "function" && onComplete(save, payload);
        },

        onUserGroupChange: e => {
            let userGroupId = e.target.value;
            let userGroupsSelected = userGroupPermission 
                ? userGroupPermission.split(",")
                : [];

            let isRemove = userGroupsSelected.includes(userGroupId);
            
            if ( isRemove ){
                userGroupsSelected = userGroupsSelected.filter(id => id !== userGroupId);
            } else {
                userGroupsSelected.push(userGroupId)
            }

            setUserGroupPermission(userGroupsSelected.join(","));
        },

        getRolesData: async () => {

            let getRolesData = await MenuApi.getRolesData();
    
            setStatus("ready");
    
            console.log({getRolesData});
    
            if ( getRolesData.error ) return Toast(getRolesData)
    
            let data = getRolesData.data || [];
    
            let routeOptions = [{
                text: "Selecione",
                value: "",
                disabled: true
            }];

            const {roles, userGroups} = data;
    
            roles.forEach(item => {
    
                const pages = item.pages || [];

                if ( !pages.length ) return;

                let moduleName = item.module_title || item.module_name;
    
                let moduleOption = {
                    text: `MÓDULO: ${moduleName.toUpperCase()}`,
                    value: "",
                    class: "fw-bold",
                    disabled: true
                }
    
                routeOptions.push(moduleOption)
    
                pages.forEach(page => {

                    routeOptions.push({
                        text: `${moduleName} > Página ${page.title || page.role}`,
                        value: page.role
                    })
                })
            })

            
            setRoutesList(routeOptions);
            setUserGroupList(userGroups);
        }
    }

    const Footer = () => {
        return (
            <div className="mt-5 text-end">
                <Button variant="default" className="mx-2" onClick={Core.close}>Cancelar</Button>
                <Button variant="primary" onClick={Core.onSaveBtnClick}>Salvar</Button>
            </div>
        )
    }

    const Trigger = () => React.cloneElement(children, {
        onClick: Core.show
    })

    return (
        <>
            <Trigger />
            {show && <Offcanvas show={show} onHide={Core.close} placement="end">
                <div className={status === "processing" ? 'full-loading' : ''}>
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>{`${isUpdate ? 'Editar' : 'Novo'} ${title}`}</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <Title ref={titleRef} value={title} onChange={e => setTitle(e.target.value)} />
                        <Type value={type} onChange={e => setType(e.target.value)} />
                        {type === "external_link" && <Link value={link} onChange={e => setLink(e.target.value)} />}
                        {type === "route" && <Route value={permission} onChange={e => setPermission(e.target.value)} routesList={routesList}  />}
                        {type !== "route" && <UserGroups selected={userGroupPermission} onChange={Core.onUserGroupChange} userGroupList={userGroupList}  />}
                        <Icon triggerChange={value => setIcon(value)} icon={icon} />
                        <Footer />
                    </Offcanvas.Body>
                </div>
            </Offcanvas>}

        </>
    )
}