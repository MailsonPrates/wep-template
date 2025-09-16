import {LoginApi} from "api";
import React from "react";
import { useState, useEffect } from "react";
import useReqToast from 'ui/useReqToast';
import { Link, useParams, useNavigate } from "react-router";
import RecoveryForm from "./RecoveryForm";
import App from "app";
import { BsInfoCircle } from "react-icons/bs";
import $ from "app/ref";

export default function RecoveryUpdate(config){

    let {code} = useParams();
    const Toast = useReqToast();
    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState("");
    const [status, setStatus] = useState("processing");
    const [isValidPasswords, setIsValidPasswords] = useState(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(function(){
       Core.validateCode();
    }, []);

    useEffect(() => {
        document.title = `Criar nova senha | ${App.data("title", "Wep")}`
    }, [config.title]);

    const Core = {
        onChange: e => {
            let name = e.target.name;
            let value = e.target.value;
            console.log("onChange", {name, value});

            if ( name == "password" ) setPassword(value);
            if ( name == "confirmPassword" ) setConfirmPassword(value);
        },

        handleSubmit: async () => {
            console.log("handle submit")

            if ( !Core.validatePassword() ) return;

            console.log("aqui");

            setStatus("processing");

            let submit = await LoginApi.handleUpdatePassword({
                password: $.password.value,
                code
            });

            console.log({submit})

            if ( submit.error ){
                setStatus('ready');
                Toast(submit);
                return;
            }

            let redirectToast = null;

            redirectToast = Toast({
                type: "success",
                message: "Redirecionando..."
            })

            setTimeout(function(){
                redirectToast.remove();
                navigate(`/login/?recover=true`)
            }, 1500);
        },

        validatePassword: () => {
            let pass = $.password.value;
            let confirmPass = $.confirmPassword.value;

            let isEqual = (pass === confirmPass);
            let isMissing = (!pass || !confirmPass);

            console.log({isEqual, pass, confirmPass})

            if ( isMissing ) {
                setIsValidPasswords(null);
                return null;
            }

            if ( isEqual ) {
                setIsValidPasswords(true)
                return true;
            }

            setIsValidPasswords(false);

            return false;
        },

        validateCode: async () => {
            if ( !code ){
                setErrorMessage('Token inválido!');
                setStatus("error");
                return;
            }

            let validateCode = await LoginApi.validateRecoveryCode({
                code
            });

            console.log({validateCode})

            if ( validateCode.error ){
                setErrorMessage(validateCode.message);
                setStatus("error");
                return;
            }

            setStatus("ready");
        }
    }

    const Error = ({message}) => {
        return (
            <div className="text-danger p-3 d-flex align-items-center justify-content-center">
                <span style={{fontSize: 40}}><BsInfoCircle /></span>
                <span className="ms-2 fw-light lh-1">
                    <span style={{fontSize: 26}}>{message}</span>
                </span>
            </div>
        )
    }

    const Head = () => (
        <div className="fw-light fs-5 my-3 text-center">Redefina a sua senha</div>
    );


    const Content = () => (
        <div>
            <Head />
            <RecoveryForm props={{
                refPassword: $.refs.password,
                refConfirmPassword: $.refs.confirmPassword,
                status,
                isValidPasswords,
                password,
                confirmPassword,
                onChange: Core.onChange,
                handleSubmit: Core.handleSubmit
            }} />
        </div>
    );

    return (
        <div className="position-absolute px-2 w-100 h-100 bg-light d-flex align-items-center justify-content-center">
            <div className={`border-light shadow-sm rounded-4 p-3 bg-white w-100${status == "processing" ? ' full-loading' : ''}`} style={{maxWidth: 400}}>
                <Link to="/" className="text-center d-block">
                    <img src="/assets/images/logo.png" alt="Logo" style={{maxWidth: 140}} />
                </Link>
                <div className="">{status === 'error' ? <Error message={errorMessage} /> : <Content />}</div>
            </div>
        </div>
    );

}