import React from "react";
import MainTemplate from "ui/templates/main";
import {UserManagerApi} from "api";
import Empty from "ui/Empty";
import App from "app";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import useReqToast from 'ui/useReqToast';
import { HiOutlineTrash, HiMiniPlus } from "react-icons/hi2";

export default function User(){

    const [status, setStatus] = useState("processing");
    const [data, setData] = useState([]);

    let [searchParams] = useSearchParams();
    const hasSaveParam = searchParams.get("save");
    const Toast = useReqToast();

    useEffect(() => {

        if ( hasSaveParam ){
            App.params.remove("save");
            
            Toast({
                state: "success",
                message: "Salvo com succeso"
            })
        }

        UserManagerApi.get()
            .then(function(response){

                console.log({response});

                if ( response.error ) return Toast(response)

                setStatus("ready");
                setData(response.data);
            })
    }, [])


    const Core = {

        onRemoveBtnClick: user_id => {

            if ( !confirm("Tem certeza?") ) return;

            setStatus('processing');

            UserManagerApi.delete({
                user_id
            })
                .then(response => {

                    setStatus('ready');

                    if ( response.error ) return Toast(response);

                    setData(data => data.filter(item => item.user_id !== user_id));
                    
                    Toast({
                        type: "success",
                        message: "Removido"
                    })
                })
            
        },

        onResetPasswordBtnClick: async (user_id) => {
            
            if ( !confirm("Tem certeza?") ) return;

            setStatus("processing");

            let resetPassword = await UserManagerApi.resetPassword({
                user_id
            });

            console.log({resetPassword})

            setStatus("ready");

            resetPassword.autoHide = false;

            Toast(resetPassword)
        }
    }

    const DataList = () => {

        if ( !data.length ){

            if ( status === "processing" ) return (<div className="p-4"></div>);

            return <Empty />
        } 

        return (
            <>
            {data.map(item => <DataItem key={item.user_id} {...item} />)}
            </>
        )
    }

    const DataItem = props => {

        return (
            <div className="my-2 p-2 border shadow-sm rounded bg-white d-flex align-items-center justify-content-between">
                <Link className="text-decoration-none text-reset col-8 d-flex align-items-center flex-wrap flex-md-nowrap" to={`/admin/user/${props.user_id}/edit`}>
                    <span className="profile-image border bg-light" style={{height: '36px', width: '36px', borderRadius: "50%"}}>
                        { props.profile_images
                            ? <span className="img-thumbnails d-block" style={{
                                borderRadius: "50%",
                                backgroundImage: `url(${props.profile_images.small})`,
                                height: "36px",
                                width: "36px",
                                backgroundSize: "cover",
                                backgroundPosition: "center"
                            }}></span>
                            : <span className="d-flex align-items-center justify-content-center fw-bold h-100" style={{
                                color: "#555",
                                fontSize: ""
                            }}>{props.firstname[0].toUpperCase()}</span>
                        }
                    </span>
                    <span className="ms-2">{`${props.firstname} ${props.lastname}`}</span>
                    <span className="ms-3">{props.username}</span>
                    <span className="ms-3">{props.user_group_name}</span>
                </Link>
                <div className="col-4 text-end">
                    <span
                        className="btn btn-outline-primary p-1 m-1"
                        onClick={() => Core.onResetPasswordBtnClick(props.user_id)}
                    >
                        Resetar senha
                    </span>
                    <span
                        className="btn btn-outline-danger p-1 m-1"
                        onClick={() => Core.onRemoveBtnClick(props.user_id)}
                    >
                        <HiOutlineTrash className="fs-5" /> Remover
                    </span>
                </div>
            </div>
        )
    }

    const Header = () => {
        return (
            <div className="text-end">
                <Link className="btn btn-outline-primary rounded-3 m-2" to="/admin/user/invite/create">
                    Convidar usuário
                </Link>
                <Link className="btn btn-primary rounded-3 m-2" to="/admin/user/create">
                    <HiMiniPlus className="fs-5" /> Novo usuário
                </Link>
            </div>
        )
    }

    return (
        <MainTemplate title="Usuários" breadcrumbs={['page.admin']}>
            <Header />
            <div className={`mt-2${status === "processing" ? ' full-loading' : ''}`}>
                <DataList />
            </div>
        </MainTemplate>
    )
}