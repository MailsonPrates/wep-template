import {UserInviteApi} from "api";
import App from "app";
import Password from "ui/Password";
import React, { useEffect, useState } from "react";
import useReqToast from 'ui/useReqToast';
import { Col, Row, Form, Button } from "react-bootstrap";
import Firstname from "./form/Firstname";
import Lastname from "./form/Lastname";
import Username from "./form/Username";
import TemplateClean from "ui/templates/clean";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import { useNavigate, useParams } from "react-router";
import $ from "app/ref";

export default function UserInviteSignup(){
    
    const Toast = useReqToast();
    const { token } = useParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState("pending");
    const [validated, setValidated] = useState(false);
    const [usernameCheckStatus, setUsernameCheckStatus] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [username, setUsername] = useState('');
    const [isValidPasswords, setIsValidPasswords] = useState(null);

    useEffect(() => {
        Core.validateInvite();
    }, [])

    useEffect(()=> {

        const timer = setTimeout(Core.validateUsername, 800);
        return () => clearTimeout(timer);

    }, [username])


    const Core = {

        onSaveBtnClick: async e => {
        
            Core.handleFormValidate();

            if ( !validated ) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            const payload = {
                username: $.username.value,
                firstname: $.firstname.value,
                lastname: $.lastname.value,
                password: $.password.value,
                token
            }

            console.log({payload});

            setStatus("processing");

            let registerUser = await UserInviteApi.registerUser(payload);

            console.log({registerUser});

        
            if ( registerUser.error ) {
                setStatus("ready");
                Toast(registerUser);
                return
            }

            let successToast = Toast({
                type: "success",
                message: "Cadastrado com sucesso"
            })

            let redirectToast = null;

            setTimeout(function(){
                redirectToast = Toast({
                    type: "success",
                    message: "Redirecionando..."
                })
            }, 100)

            setTimeout(function(){
                successToast.remove();
                redirectToast.remove();
                navigate('/login/')
            }, 1500);

        },

        onUsernameChange: e => {

            setValidated(false);

            let value = App.normalizeString(e.target.value || "");
            value = value.trim();
            value = value.split(" ").join(".");
            
            setUsername(value);
        },
        
        onFormKeyDown: e => {
           e.keyCode === 13 && Core.handleSubmit();
        },

        handleFormValidate: e => {

            const isFormValidated = Core.validateFilling(e) && Core.validatePassword();

            setValidated(isFormValidated);
        },

        validateFilling: (silent=false) => {

            const inputTypes = ['INPUT', 'SELECT', 'CHECKBOX', 'RADIO'];
            const refKeys =  Object.keys($.refs);
            let isValid = true;
            let showInvalid = silent === false;  

            for( let i=0; i<refKeys.length; i++ ){
                let key = refKeys[i];
                let $elem = $.refs[key].current;

                let value = $elem.value || "";
                value = value.trim();
                let tag = $elem.tagName;
                let isRequired = $elem.getAttribute("required") !== null;

                if ( !inputTypes.includes(tag) || !isRequired ) continue;
                if ( value ){
                    console.log({$elem, showInvalid})
                    /*showInvalid && */$elem.classList.remove("is-invalid")
                    continue;
                }

                if ( showInvalid ){
                    $elem.classList.add("is-invalid");
                    $elem.focus();
                }
              
                isValid = false;

                break;
            }
    
            return isValid;
        },

        validatePassword: () => {
            let pass = $.password.value;
            let confirmPass = $.confirmPass.value;

            let isEqual = (pass === confirmPass);
            let isMissing = (!pass || !confirmPass);

            if ( isMissing ) {
                console.log({isMissing})
                setIsValidPasswords(null);
                return null;
            }

            if ( isEqual ) {
                console.log({isEqual, pass, confirmPass})
                setIsValidPasswords(true)
                return true;
            }

            setIsValidPasswords(false);

            return false;
        },

        validateUsername: async () => {

            console.log("Validanting...");

            setValidated(false);

            if ( !username ){
                setUsernameCheckStatus("")
                return;
            }

            if ( usernameCheckStatus === "checking" ) return;

            console.log("Checking...");

            setUsernameCheckStatus("checking")

            let response = await UserInviteApi.validateUsername({username})

            console.log({response});

            if ( response.error ) {
                setUsernameCheckStatus("invalid")
                response.id = 'error_username';
                Core.handleFormValidate();
                return;
            }

            setUsernameCheckStatus("valid");
            Core.handleFormValidate();
        },
        
        handleSubmit: e => {
            $.btnSave.click();
        },

        validateInvite: async () => {
            let validateInvite = await UserInviteApi.validate({token});
    
            console.log({validateInvite});
    
            if ( validateInvite.error ) {
                setStatus("error");
                setErrorMessage(validateInvite.message)
                return;
            }
            
            setStatus(validateInvite.data);
        }
    }

    const Error = ({message}) => {
        return (
            <div className="text-danger p-3 d-flex align-items-center justify-content-center">
                <HiOutlineExclamationTriangle style={{fontSize: "80px"}} />
                <div>
                    <span className="ms-1 fw-light lh-1">
                        <span style={{fontSize: "40px"}}>{message}</span>
                    </span>
                    <span className="d-block text-secondary ms-3 fs-5 mt-1 fw-light">Entre em contato conosco</span>
                </div>
            </div>
        )
    }

    return (
        <TemplateClean documentTitle="Convite para cadastro">
            <div className={ ['pending', 'processing'].includes(status) ? 'full-loading' : ""}>
                {
                   status === "error"
                    ? <Error message={errorMessage} />
                    : (status === "pending"
                        ? <div className="p-5"></div>
                        : <Form ref={$.refs.form} className="form m-auto my-3" onSubmit={Core.handleSubmit} onKeyDown={Core.onFormKeyDown} onKeyUp={Core.handleFormValidate}>
                                <div className="fw-light fs-3">Preencha o seu cadastro</div>
                                <div className="mt-3">
                                    <Row>
                                        <Col ms="6"><Firstname ref={$.refs.firstname}  /></Col>
                                        <Col ms="6"><Lastname ref={$.refs.lastname}  /></Col>
                                    </Row>
                                    <Username 
                                        ref={$.refs.username}
                                        checkStatus={usernameCheckStatus}
                                        onChange={Core.onUsernameChange}
                                        value={username}
                                        />
                                    <Row>
                                        <Col ms="6">
                                            <Password 
                                                ref={$.refs.password} 
                                                name="password" 
                                                onKeyUp={Core.validatePassword}
                                             />
                                             <div className="text-danger small px-2">{isValidPasswords === false ? "As senhas precisam ser iguais" : ""}</div>
                                        </Col>
                                        <Col ms="6">
                                            <Password 
                                                label="Repita a senha" 
                                                ref={$.refs.confirmPass}  
                                                name="confirmPassword"  
                                                onKeyUp={Core.validatePassword} 
                                            />
                                        </Col>
                                    </Row>
                                </div>
                                <div className="mt-3 text-end">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        ref={$.refs.btnSave}
                                        onClick={Core.onSaveBtnClick}
                                        className={"d-inlie-block"+(!validated || usernameCheckStatus !== "valid" ? " disabled" : "")}>
                                        Cadastrar
                                    </Button>
                                </div>
                            </Form>
                     )
                }
            </div>
        </TemplateClean>
    )
}