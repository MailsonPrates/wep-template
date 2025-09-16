import React from 'react';
import Form from 'react-bootstrap/Form';
import { Button } from 'react-bootstrap';
import Password from "ui/Password";

export default function RecoveryForm({props}){

    return (
        <Form className="mt-3 bg-white p-4" noValidate onSubmit={props.handleSubmit}>
            <div className="text-danger small px-2">{props.isValidPasswords === false ? "As senhas precisam ser iguais" : ""}</div>
            <Password
                ref={props.refPassword}
                name="password" 
                required
            />
            <Password 
                ref={props.refConfirmPassword}
                label="Repita a senha" 
                name="confirmPassword"
                required
            />
            
            <div className="mt-4 text-center d-flex align-items-center justify-content-between">
                <Button
                    variant="primary" 
                    size="lg"
                    className='gradient-primary border-0 fw-medium rounded-5 w-100'
                    style={{padding: 13}}
                    onClick={props.handleSubmit}>
                        {props.status === "processing" ? "Salvando..." : "Alterar"}
                    </Button>
            </div>
        </Form>
    );
}