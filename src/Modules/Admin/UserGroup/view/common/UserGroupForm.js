import React, { useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import Name from "./Name";
import BtnSave from "./BtnSave";
import RoleGroup from "./RoleGroup";
import {UserGroupApi} from "api";
import useReqToast from 'ui/useReqToast';
import { Link } from "react-router";
import { HiChevronLeft } from "react-icons/hi2";

export default function UserGroupForm({config={}, afterSave}){

    const isUpdate = config.id;
    const Toast = useReqToast();
    const nameRef = useRef(null);

    const [name, setName] = useState("");
    const [status, setStatus] = useState("processing");
    const [roles, setRoles] = useState([]);
    const [moduleRoles, setModuleRoles] = useState([]);

    useEffect(() => {

        UserGroupApi
        .getRoles()
        .then(response => {
        
            console.log({response});

            if ( response.error ) return Toast(response);

            !isUpdate && setStatus("ready");
            setModuleRoles(response.data);
        })
        
        if ( !isUpdate ) return;
        
        UserGroupApi
        .where("user_group_id", config.id)
        .get()
        .then(response => {
           //console.log({response});

            if ( response.error ) return Toast(response);

            let item = response.data[0] || {};
            let roles = item.roles 
                ? item.roles.split(",")
                : []

            setStatus("ready");
            setRoles(roles);
            setName(item.name);
        })

    }, [])

    const Core = {
        onBtnSaveClick: async () => {

            if ( !name ) {
                
                Toast({
                    type: "error",
                    message: "Preencha o campo nome"
                });

                nameRef.current.focus();
                return;
            }

            setStatus("processing");

            console.log({roles});

            let save = isUpdate 
                ? UserGroupApi
                    .where("user_group_id", config.id)
                    .update({
                        name,
                        roles: roles.join(",")
                    })
                : UserGroupApi.create({
                    name,
                    id: config.id,
                    roles: roles.join(",")
                })

            setStatus("ready");

            if ( save.error ) return Toast(save);

            Toast({
                type: "success",
                message: save.message || "Salvo com sucesso"
            })
            
            typeof afterSave && afterSave(save);
        },

        onModuleClick: module => {
            let rolesSelected = JSON.parse(JSON.stringify(roles));
            let rolesList = [];

           rolesList = module.pages.map(page => page.role);

           module.methods.forEach(method => {
            rolesList.push(method.role);
           })

            rolesList.forEach(function(item){
                
                let isSelected = rolesSelected.includes(item);
              
                if ( isSelected ){
                    rolesSelected = rolesSelected.filter(role => role !== item);
                    return;
                }

                rolesSelected.push(item);
            })

            setRoles(rolesSelected);
        },

        onPageGroupClick: page => {

            let rolesSelected = JSON.parse(JSON.stringify(roles));
            let methods = page.methods || [];
            let pageRole = page.role;
            let pageMethodRoles = methods.map(method => method.role);
            let isPageSelected = rolesSelected.includes(pageRole);

            // Remove pagina e metodos
            if ( isPageSelected ){
                pageMethodRoles.push(pageRole);
                rolesSelected = rolesSelected.filter(role => !pageMethodRoles.includes(role));

                setRoles(rolesSelected)
                return;
            }

            methods.forEach(function(method){
                
                let methodRole = method.role;
                let isSelected = rolesSelected.includes(methodRole);

                if ( isSelected ){
                    rolesSelected = rolesSelected.filter(role => role !== methodRole);
                    return;
                }

                rolesSelected.push(methodRole);
            })

            rolesSelected.push(pageRole);

            setRoles(rolesSelected)
        },

        onRoleBtnClick: ({method, page}) => {

            if ( !method ) return;

            let rolesSelected = JSON.parse(JSON.stringify(roles));
            let methodRole = method.role;
            let isSelected = rolesSelected.includes(methodRole);

            console.log({method, page, rolesSelected, methodRole, isSelected});

            if ( isSelected ){
                rolesSelected = rolesSelected.filter(role => role !== methodRole);

                let hasSomePageMethodSelected = false;
                let pageMethodsLen = page.methods.length;

                for( let i=0; i<pageMethodsLen; i++ ){
                    let method = page.methods[i];

                    if ( rolesSelected.includes(method.role) ){
                        hasSomePageMethodSelected = true;
                        break;
                    }
                }

                if ( !hasSomePageMethodSelected ){
                    rolesSelected = rolesSelected.filter(role => role !== page.role);
                }


                setRoles(rolesSelected);
                return;
            }
            
            rolesSelected.push(methodRole);
            
            let isPageSelected = rolesSelected.includes(page.role);

            if ( !isPageSelected ){
                rolesSelected.push(page.role);
            }

             console.log({rolesSelected})

            setRoles(rolesSelected);
        },
    }

    const Roles = () => {
        return (
            <div className="my-2">
                <div className="border p-3 rounded bg-light">
                    {
                        moduleRoles.map((item, index) => {
                            return item.pages && item.pages.length 
                                ? (<RoleGroup 
                            key={index} 
                            index={index} 
                            selected={roles} 
                            module={item} 
                            onModuleClick={Core.onModuleClick} 
                            onPageClick={Core.onPageGroupClick}
                            onRoleClick={Core.onRoleBtnClick}
                        />) : ""
                        })
                    }
                </div>
            </div>
        )
    }

    return (
        <Form className={`p-2 form${status === "processing" ? ' full-loading' : '' }`}>
            <div className="mb-2 d-flex align-items-center justify-content-between">
                <Link className="text-reset text-decoration-none d-flex align-items-center justify-content-end" to="/admin/user/group">
                    <HiChevronLeft className="fs-6" />
                    <span className="ms-1">voltar</span>
                </Link>
                <BtnSave onClick={Core.onBtnSaveClick} />
            </div>
            <Name ref={nameRef} value={name} onChange={e => setName(e.target.value)} />
            <Roles />
        </Form>
    )

}