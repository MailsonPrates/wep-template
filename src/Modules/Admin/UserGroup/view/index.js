
import React, { useEffect, useState, useLoca } from "react";
import MainTemplate from "ui/templates/main";
import useReqToast from 'ui/useReqToast';
import { HiOutlineTrash, HiMiniPlus } from "react-icons/hi2";
import Empty from "ui/Empty";
import {UserGroupApi} from "api";
import { Link, useLocation } from "react-router";

export default function UserGroup(){

    const [status, setStatus] = useState("processing");
    const [roles, setRoles] = useState([]);

    const Toast = useReqToast();
    const location = useLocation();

    useEffect(() => {
        Core.getGroups(); 
    }, [])

    useEffect(() => {
        if (location.state?.updated) {
           Core.getGroups(); 
        }
    }, [location.state])

    const Core = {

        onRemoveBtnClick: id => {

            if ( !confirm("Tem certeza?") ) return;

            setStatus("processing");

            UserGroupApi.delete("user_group_id", id)
                .then(response => {

                    setStatus("ready");

                    if ( response.error ) return Toast(response);

                    setRoles(values => values.filter(item => item.user_group_id !== id))
                    
                    Toast({
                        type: "success",
                        message: "Removido"
                    })
                })
        },

        getGroups: () => UserGroupApi
        .orderBy("user_group_id", "DESC")
        .get()
        .then(function(response){

            console.log({response})

            if ( response.error ) return Toast(response);

            setStatus("ready");
            setRoles(response.data);
        }),

        updateList: () => {
            setStatus("processing");
            Core.getGroups();
        },

    }

    const DataList = () => {
        let isProcessing = status === "processing";
        return (
            <div className={`mt-2 w-md-50${isProcessing ? ' full-loading' : ''}`}>
                {
                    roles.length
                    ? roles.map(item => <DataItem key={item.user_group_id} {...item} />)
                    : (isProcessing ? <span></span> : <Empty />)
                }
            </div>
        )
    }

    const DataItem = props => {
        return (
            <div className="my-2 p-2 border shadow-sm rounded bg-white d-flex align-items-center justify-content-between">
                <Link className="text-decoration-none text-reset col-11" to={`/admin/user/group/${props.user_group_id}/edit`}>
                    <div>{props.name}</div>
                </Link>
                <span className="text-danger fs-4 pointer col-1 text-end" onClick={Core.onRemoveBtnClick.bind(this, props.user_group_id)}>
                    <HiOutlineTrash />
                </span>
            </div>
        )
    }

    const Header = () => {
        return (
            <div className="text-end">
                <Link className="btn btn-primary rounded-3 m-2" to="/admin/user/group/create">
                    <HiMiniPlus className="fs-5" /> Novo grupo
                </Link>
            </div>
        )
    }

     return (
        <MainTemplate title="Grupos de usuários" breadcrumbs={['page.admin']}>
            <Header />
            <DataList />
        </MainTemplate>
    )
}