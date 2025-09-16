import {UserProfileApi} from "api";
import App from "app";
import useReqToast from 'ui/useReqToast';
import React, { useEffect, useRef, useState } from "react";
import Header from "./Header";
import Firstname from "./Firstname";
import Lastname from "./Lastname";
import Email from "./Email";
import Nickname from "./Nickname";
import Type from "./Type";
import Password from "ui/Password";
import Username from "./Username";
import { Button, Col, Row, Form } from "react-bootstrap";
import $ from "app/ref";
import SectionHeader from "./SectionHeader";

let hasChangedImage = false;

export default function UserProfileForm({config}){

    const Toast = useReqToast();
    const imageRef = useRef(null);

    const [status, setStatus] = useState("ready");
    const [firstname, setFirstname] = useState(config.firstname || "");
    const [username, setUsername] = useState(config.username || "");
    const [lastname, setLastname] = useState(config.lastname || "");
    const [email, setEmail] = useState(config.email || "");
    const [nickname, setNickname] = useState(config.nickname || "");
    const [password, setPassword] = useState("");
    const [type, setType] = useState(config.type || "");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isValidPasswords, setIsValidPasswords] = useState(null);
    const [image, setImage] = useState(config.profile_images?.medium ?? "");
    const [formValidated, setFormValidated] = useState(true)

    useEffect(() => {
        if ( App.params.get("save") ){

            Toast({
                type: "success",
                message: "Salvo com succeso"
            })

            App.params.remove("save");
        }
    }, [])

    const Core = {

        onSaveBtnClick: async (e) => {

            Core.handleFormValidate();

            if ( !formValidated ) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            let payload = {
                firstname, 
                lastname, 
                nickname,
                password,
                image_update: false,
                image_remove: image === "",
                profile_image: image
            };

            console.log({payload})

            setStatus("processing");

            let saveProfile;

            if ( hasChangedImage ){
                var fd = new FormData();
                var files = imageRef.current.files[0];

                console.log({files});

                fd.append('file', files);
                fd.append('firstname', firstname);
                fd.append('lastname', lastname);
                fd.append('nickname', nickname);
                fd.append('password', password);
                fd.append("image_update", true);
                fd.append("image_remove", payload.image_remove);

                saveProfile = await UserProfileApi.requestOptions({
                    data: fd,
                    contentType: false,
                    processData: false,
                }).salvar();

                console.log("[update]", {saveProfile})

            } else {

                saveProfile = await UserProfileApi.salvar(payload);
            }

            console.log({saveProfile});

            setPassword("");
            setConfirmPassword("");

            if ( saveProfile.error ) {
                setStatus("ready");
                Toast(saveProfile);
                return
            }

            App.params.set("save", true);

            let url = window.location.href.split('?&').join("?");

            window.location.href = url;
        },

        onImageInputChange: function(e){

            var file = e.target.files[0];
            var preview = URL.createObjectURL(file);

            console.log({file, preview})

            setImage(preview)
            hasChangedImage = true;
        },

        onRemoveImageBtnClick: () => {
            
            if ( !confirm("Tem certeza?") ) return;

            setImage("");
            hasChangedImage = true;
        },

        validatePassword: () => {
            let pass = password;
            let confirmPass = confirmPassword;

            let isEqual = (pass === confirmPass);
            let isMissing = (!pass || !confirmPass);
            let isEmpty = !pass && !confirmPass;

            console.log({pass, confirmPass})

            if ( isEmpty ) return true;

            if ( isMissing ) {
                console.log({isMissing})
                setIsValidPasswords(null);
                return null;
            }

            if ( isEqual ) {
                //console.log({isEqual, pass, confirmPass})
                setIsValidPasswords(true)
                return true;
            }

            setIsValidPasswords(false);

            return false;
        },

        handleSubmit: () => {
            $.btnSubmit.click();
        },

        onFormKeyDown: e => {
            e.keyCode === 13 && Core.handleSubmit();
        },
 
        handleFormValidate: e => {
            const isAllFilled = Core.validateFilling(e);
            const isValidPass = Core.validatePassword()
            const isFormValidated = isAllFilled && isValidPass;
            console.log({isFormValidated, isAllFilled, isValidPass})
            setFormValidated(isFormValidated);
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
                let required = $elem.getAttribute("required");
                let isRequired = required !== null;

                if ( !inputTypes.includes(tag) || !isRequired ) continue;

                if ( value ){
                    console.log({$elem, showInvalid})
                    $elem.classList.remove("is-invalid")
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
    }

    return (
        <div className={"p-2 form"+(status === "processing" ? " full-loading" : "")}>
            <Form onSubmit={Core.handleSubmit} onKeyDown={Core.onFormKeyDown} onKeyUp={Core.handleFormValidate}>
                <Header 
                    imageRef={imageRef}
                    image={image}
                    username={config.username}
                    fullname={`${firstname} ${lastname}`} 
                    firstname={firstname}
                    apelido={nickname}
                    createdAt={config.created_at}
                    onRemoveImage={Core.onRemoveImageBtnClick}
                    onImageChange={Core.onImageInputChange}
                />
                <SectionHeader>Dados de acesso</SectionHeader>
                <Row>
                    <Col sm="4">
                        {/*<Email 
                            ref={$.refs.email} 
                            value={email} 
                            onChange={e => setEmail(e.target.value) && Core.handleFormValidate()} />
                        */}
                        <Username value={username} />
                    </Col>
                    <Col ms="4">
                        <Password 
                            ref={$.refs.password} 
                            name="password" 
                            onKeyUp={Core.validatePassword}
                            onChange={(e) => setPassword(e.target.value) && Core.handleFormValidate()}
                            />
                            <div className="text-danger small px-2">{isValidPasswords === false ? "As senhas precisam ser iguais" : ""}</div>
                    </Col>
                    <Col ms="4">
                        <Password 
                            label="Repita a senha" 
                            ref={$.refs.confirmPassword}  
                            name="confirmPassword"  
                            onChange={(e) => setConfirmPassword(e.target.value) && Core.handleFormValidate()}
                            onKeyUp={Core.validatePassword}
                        />
                    </Col>
                </Row>
                
                <SectionHeader>Dados de cadastro</SectionHeader>
                <Row>
                    <Col sm="4">
                        <Type
                            ref={$.refs.type} 
                            value={type} 
                            onChange={e => setType(e.target.value) && Core.handleFormValidate()} 
                            required />
                    </Col>
                    <Col sm="4">
                        <Firstname
                            ref={$.refs.firstname} 
                            value={firstname} 
                            onChange={e => setFirstname(e.target.value) && Core.handleFormValidate()} 
                            required />
                    </Col>
                    <Col sm="4">
                        <Lastname 
                            ref={$.refs.lastname} 
                            value={lastname} 
                            onChange={e => setLastname(e.target.value) && Core.handleFormValidate()} 
                            required />
                    </Col>
                </Row>
                <Row>
                    <Col sm="4">
                        <Nickname 
                            ref={$.refs.nickname} 
                            value={nickname} 
                            onChange={e => setNickname(e.target.value) && Core.handleFormValidate()} />
                    </Col>
                </Row>
                
                <div className="mt-5 text-end">
                    <Button className={formValidated ? '' : 'disabled'} ref={$.refs.btnSubmit} size="lg" variant="primary" onClick={Core.onSaveBtnClick}>Salvar</Button>
                </div>
            </Form>
        </div>
    )
}