import {UserInviteApi, UserGroupApi} from "api";
import React, { useEffect, useRef, useState } from "react";
import useReqToast from 'ui/useReqToast';
import { Form, Button } from "react-bootstrap";
import Email from "./Email";
import Group from "./Group";
import { Link } from "react-router";
import { HiChevronLeft } from "react-icons/hi2";

/**
 * @param {object} config 
 * @param {function} config.save
 * @param {function} config.afterSave
 */
export default function UserInviteForm(config={}){

    const Toast = useReqToast();
    const formRef = useRef(null);
    
    const [email, setEmail] = useState("");
    const [userGroupId, setUserGroupId] = useState("");

    const [status, setStatus] = useState("processing");
    const [groupList, setGroupList] = useState([]);
    const [validated, setValidated] = useState(false);

    useEffect(() => {
       Core.getGroups()
    }, [])

    const Core = {

        onSaveBtnClick: async (e) => {

            const form = e.currentTarget;

            if (form.checkValidity() === false) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }

            if ( !email ){
                setValidated(true);
                return;
            }

            const payload = {
                email,
                user_group_id: userGroupId
            }

            setStatus("processing");

            console.log({payload})

            let save = await UserInviteApi.create(payload);

            setStatus("ready");

            save.message = save.error ? save.message : "Salvo com sucesso";

            Toast(save);

            typeof config.afterSave && config.afterSave();
        },

        onKeyDown: e => {
            if ( e.keyCode === 13 ) Core.handleSubmit();
        },

        handleSubmit: e => {
            formRef.current.click();
        },

        getGroups: async () => {

            console.log("[Mount]")

            let getUserGroups = await UserGroupApi.get();

            setStatus("ready");

            console.log({getUserGroups, config});

            if ( getUserGroups.error ) return Toast(getUserGroups)

            setGroupList(getUserGroups.data);
        }
    }

    const BtnSave = () => <Button variant="primary" className="px-5 fs-5" size="lg" onClick={Core.onSaveBtnClick}  ref={formRef}>Salvar</Button>

    return (
        <Form className={`p-2${(status === "processing" ? " full-loading" : "")}`} noValidate validated={validated} onSubmit={Core.handleSubmit}>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <Link className="text-reset text-decoration-none d-flex align-items-center justify-content-end" to="/admin/user/invite">
                    <HiChevronLeft className="fs-6" />
                    <span className="ms-1">voltar</span>
                </Link>
                 <BtnSave />
            </div>
            <Email value={email} onKeyDown={Core.onKeyDown} onChange={e => setEmail(e.target.value)} />
            <Group value={userGroupId} onKeyDown={Core.onKeyDown} onChange={e => setUserGroupId(e.target.value)} groupList={groupList} />
        </Form>
    )
}