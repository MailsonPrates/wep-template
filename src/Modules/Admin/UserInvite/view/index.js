import MainTemplate from "ui/templates/main";
import {UserInviteApi} from "api";
import Empty from "ui/Empty";
import useReqToast from 'ui/useReqToast';
import React, { useEffect, useState } from "react";
import { HiOutlineTrash, HiMiniPlus } from "react-icons/hi2";
import { Link, useLocation } from "react-router";

export default function UserInvite(){

    const [status, setStatus] = useState("processing");
    const [data, setData] = useState([]);

    const Toast = useReqToast();
    const location = useLocation();
    
    useEffect(() => {
        Core.getInvites();
    }, [])

    useEffect(() => {
        if (location.state?.updated) {
            Core.getInvites(); 
        }
    }, [location.state])

    const Core = {

        onRemoveBtnClick: id => {

            if ( !confirm("Tem certeza?") ) return;

            setStatus("processing");

            UserInviteApi.delete("user_invite_id", id)
                .then(response => {

                    setStatus("ready");

                    if ( response.error ) return Toast(response);

                    setData(data => data.filter(item => item.user_invite_id !== id))
                    
                    Toast({
                        type: "success",
                        message: "Removido"
                    })
                })
            
        },

        onCancelBtnClick: async (id) => {

            if ( !confirm("Tem certeza?") ) return;

            setStatus("processing");

            let update = await UserInviteApi
                .where("user_invite_id", id)
                .update("status", "cancelled");
            
            setStatus("ready");

            if ( update.error ) return Toast(update);

            Toast({
                type: "success",
                content: "Cancelado"
            })

            Core.getInvites();
        },

        onResendBtnClick: async id => {

            if ( !confirm("Tem certeza?") ) return;

            setStatus("processing");

            let resend = await UserInviteApi.resendUserInvite({
                "user_invite_id": id
            });

            setStatus("ready");

            if ( resend.error ) return Toast(resend);

            Toast({
                type: "success",
                content: "Reenviado"
            })

            Core.getInvites();
        },

        getInvites: () => {
            UserInviteApi.get()
            .then(function(response){

                console.log({response});

                if ( response.error ) return Toast(response);

                setStatus("ready");
                setData(response.data);
            })
        }
    }

    const isProcessing = status === "processing";
    
  
    const Header = () => {
        return (
            <div className="text-end">
                <Link className="btn btn-primary rounded-3 m-2" to="/admin/user/invite/create">
                    <HiMiniPlus className="fs-5" /> Novo convite
                </Link>
            </div>
        )
    }

    const DataList = () => {
        return (
            <div className={`mt-2${isProcessing ? ' full-loading' : ''}`}>
                {
                    data.length
                        ? data.map(item => <DataItem key={item.user_invite_id} {...item} />)
                        : (isProcessing ? <span></span> : <Empty />)
                }
            </div>
        )
    }

    const DataItem = item => {

        const isPending = item.status === "pending";

        return (
            <div className="my-2 p-2 border shadow-sm rounded bg-white d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                    <Status status={item.status} />
                    <span className="ms-3">{item.email}</span>
                    <span className="ms-3">{item.user_group_name}</span>
                </div>
                <div>
                    <span 
                        className="btn btn-outline-danger m-1 px-2 py-1 fs-13 d-inline-flex"
                        onClick={Core.onRemoveBtnClick.bind(null, item.user_invite_id)}>
                            <HiOutlineTrash className="fs-5" />
                            <span className="ms-1">Remover</span>
                    </span>
                    {isPending && <>
                        <span 
                            className="btn btn-outline-danger m-1 px-2 py-1 fs-13"
                            onClick={Core.onCancelBtnClick.bind(null, item.user_invite_id)}>
                                <span>Cancelar</span>
                        </span>
                        <span 
                            className="btn btn-outline-primary m-1 px-2 py-1 fs-13"
                            onClick={Core.onResendBtnClick.bind(null, item.user_invite_id)}>
                                <span>Reenviar</span>
                        </span>
                        <Link to={`/user/invite/signup/${item.token}/`} className="btn btn-outline-dark m-1 px-2 py-1 fs-13" target="_blank">Link</Link>
                    </>}
                </div>
            </div>
        )
    }
 
    const Status = ({status}) => {
        let statusData = {
            'pending': {
                title: "Pendente",
                bg: "secondary"
            },
            'cancelled': {
                title: "Cancelado",
                bg: "danger"
            },
            'used': {
                title: "Usado",
                bg: "success"
            },
            'other': {
                title: status,
                bg: "primary"
            }
        }

        let currentStatus = statusData[status] || statusData.other;

        return (
            <span className="d-flex align-items-center">
                <span className={`bg-${currentStatus.bg} d-inline-block`} style={{
                    height: '12px', width: '12px', borderRadius: '50px'
                }}></span>
                <span className="ms-1 text-secondary">{currentStatus.title}</span>
            </span>
        )
    }

    return (
        <MainTemplate title="Convites de usuários" breadcrumbs={['page.admin']}>
            <Header />
            <DataList />
        </MainTemplate>
    )
}