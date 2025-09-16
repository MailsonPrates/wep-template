import InstallForm from "./InstallForm";
import {InstallApi} from "api";
import React from "react";
import { useState, useEffect } from "react";
import useReqToast from 'ui/useReqToast';
import { Link, Navigate, useSearchParams } from "react-router";
import App from "app";

export default function Install(props){
 
    const showToast = useReqToast();

    const [status, setStatus] = useState("ready");
    const [formData, setFormData] = useState({
        name: "",
        username: "admin",
        password: "",
        db_name: "",
        db_host: "localhost",
        db_username: "",
        db_password: "",
        url: ""
    });

    const setField = (field, value) => {
        setFormData((prev) => ({
        ...prev,
        [field]: value,
        }));
    };

    const [validated, setValidated] = useState(false);

    useEffect(() => {
        document.title = `Instalar | ${App.data("title", "Wep")}`
    }, [props.title]);


    const Core = {

        onInputChange: (e) => {
            const $input = e.target;
            const name = $input.name;
            const value = $input.value;

            setField(name, value);
        },

        handleSubmit: e => {
            const form = e.currentTarget;

            if (form.checkValidity() === false) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }

            console.log({form, formData})

            if ( 
                !formData.name || 
                !formData.password || 
                !formData.db_name || 
                !formData.db_username || 
                !formData.db_password || 
                !formData.username || 
                !formData.url 
            ){
                setValidated(true);
                return;
            }
        
            setStatus('processing');
            
            Core.submit(formData);
        },

        submit: async () => {

            let login = await InstallApi.run(formData);

            if ( login.error ) {

                showToast({
                    state: "error",
                    message: login.message
                })
                 
                setStatus("ready")

                return;
            }

            console.log({login})

            window.location.href = "/login";
        }
    }

    return (
        <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light pb-5">
            <div className={`w-75${status === "processing" ? ' full-loading' : ''}`}>
                <div className="mx-auto">
                    <div className="my-4 text-center">
                        <h1 className="mb-0 h2">Instalação e Configuração</h1>
                    </div>
                    <InstallForm
                        status={status}
                        onInputChange={Core.onInputChange}
                        handleSubmit={Core.handleSubmit}
                        validated={validated}
                        />
                </div>
            </div>
        </div>
    );
}