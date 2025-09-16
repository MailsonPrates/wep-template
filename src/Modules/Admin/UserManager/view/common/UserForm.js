import {UserManagerApi, UserGroupApi} from "api";
import App from "app";
import Password from "ui/Password";
import React, { useEffect, useRef, useState } from "react";
import useReqToast from 'ui/useReqToast';
import { Col, Row, Form, Button } from "react-bootstrap";
import Firstname from "./Firstname";
import Lastname from "./Lastname";
import Email from "./Email";
import Group from "./Group";
import Nickname from "./Nickname";
import Status from "./Status";
import Username from "./Username";

/**
 * @param {object} config 
 * @param {function} config.save
 * @param {function} config.afterSave
 */
export default function UserForm(config={}){

    const Toast = useReqToast();
    const isUpdate = config.id;
    const formRef = useRef(null);
    
    const [status, setStatus] = useState('ativado');
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [nickname, setNickname] = useState("");
    const [userGroupId, setUserGroupId] = useState("");

    const [pageStatus, setPageStatus] = useState("processing");
    const [groupList, setGroupList] = useState([]);
    const [validated, setValidated] = useState(false);

    useEffect(() => {
        
        const onMount = async () => {

            console.log("[Mount]")

            let getUserGroups = await UserGroupApi.get();

            console.log({getUserGroups, config});

            if ( getUserGroups.error ){
                setPageStatus("ready");
                return Toast(getUserGroups)
            }

            setGroupList(getUserGroups.data);
            
            if ( !isUpdate ){
                setPageStatus("ready");
                return;
            }

            let getUser = await UserManagerApi.get({
                user_id: config.id
            });

            console.log({getUser});

            if ( getUser.error ) return Toast(getUser);

            let user = getUser.data[0] || {};

            setPageStatus("ready");

            setUsername(user.username);
            setFirstname(user.firstname);
            setLastname(user.lastname);
            setStatus(user.status);
            setNickname(user.nickname);
            setUserGroupId(user.user_group_id);
            setEmail(user.email);

        }

        onMount();
    }, [])

    let temporario = false;

    const Core = {

        onSaveBtnClick: async (e) => {

            const form = e.currentTarget;

            if (form.checkValidity() === false) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }

            if ( !firstname || !lastname || !username ){
                setValidated(true);
                return;
            }

            const payload = {
                user_id: config.id,
                firstname,
                lastname,
                username,
                email,
                status,
                nickname,
                user_group_id: userGroupId
            }

            if ( !payload.email ){

                if ( !confirm("E-mail não preenchido, está correto?") ) return;
                
                payload.no_email = true;
                temporario = true;
            }

            setPageStatus("processing");

            console.log({payload})

            let saveUser = await UserManagerApi.save(payload);

            setPageStatus("ready");

            if ( saveUser.error ) return Toast(saveUser);

            temporario && !isUpdate && Toast({
                type: "success",
                message: `Cadastrado com sucesso! <br>Senha temporária: <b>mudar123</b>`
            })

            typeof config.afterSave && config.afterSave(saveUser);
        },

        onKeyDown: e => {
            if ( e.keyCode === 13 ) Core.handleSubmit();
        },

        handleSubmit: e => {
            formRef.current.click();
        },

        onUsernameChange: e => {
            let value = App.normalizeString(e.target.value);
            value = value.trim();
            value = value.split(" ").join(".");
            setUsername(value);
        }
    }

    const BtnSave = () => <Button variant="primary" className="px-5 fs-5" size="lg" onClick={Core.onSaveBtnClick}  ref={formRef}>Salvar</Button>

        return (
            <Form className={`p-2 user-form${(pageStatus === "processing" ? " full-loading" : "")}`} noValidate validated={validated} onSubmit={Core.handleSubmit}>
                <Status value={status} onChange={e => setStatus(e.target.value)} />
                <Row>
                    <Col ms="6"><Firstname value={firstname} onKeyDown={Core.onKeyDown} onChange={e => setFirstname(e.target.value)} /></Col>
                    <Col ms="6"><Lastname value={lastname} onKeyDown={Core.onKeyDown} onChange={e => setLastname(e.target.value)} /></Col>
                </Row>
                <Row>
                    <Col ms="6"><Username value={username} onKeyDown={Core.onKeyDown} onChange={Core.onUsernameChange} /></Col>
                    <Col ms="6"><Nickname value={nickname} onKeyDown={Core.onKeyDown} onChange={e => setNickname(e.target.value)} /></Col>
                </Row>
                <Email value={email} onKeyDown={Core.onKeyDown} onChange={e => setEmail(e.target.value)} />
                <Group value={userGroupId} onKeyDown={Core.onKeyDown} onChange={e => setUserGroupId(e.target.value)} groupList={groupList} />
                {isUpdate &&  <Password key="pass" name="password" onKeyDown={Core.onKeyDown} onChange={e => setPassword(e.target.value)} value={password} />}
                <div className="text-end mt-3">
                    <BtnSave />
                </div>
            </Form>
        )

}