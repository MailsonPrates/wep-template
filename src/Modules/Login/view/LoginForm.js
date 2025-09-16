import React, {useRef} from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router';
import Password from "ui/Password";

export default function LoginForm(props={}){

    const formRef = useRef(null);

    const Core = {
        onKeyDown: e => {
            if ( e.keyCode === 13 ) formRef.current.click();
        }
    }

    return (
        <Form className="mt-3 bg-white p-4 rounded shadow-sm" noValidate validated={props.validated} onSubmit={props.handleSubmit}>
            <FloatingLabel label="Usuário" className="mb-2">
                <Form.Control 
                    onKeyDown={Core.onKeyDown}
                    onChange={props.onInputChange} 
                    name="user"
                    id="user" type="text" 
                    value={props.user}
                    placeholder="Usuário" 
                    required />
            </FloatingLabel>
            <Password id="password" onKeyDown={Core.onKeyDown} name="password" onChange={props.onInputChange} required={true} />
            <Link className="text-decoration-none" to="/login/recovery/">Esqueceu a senha?</Link>
            <div className="mt-4 text-center d-flex align-items-center justify-content-between">
                <Button
                    ref={formRef}
                    variant="primary" 
                    size="lg"
                    className='gradient-primary border-0 fw-medium rounded-5 w-100'
                    style={{padding: 13}}
                    onClick={props.handleSubmit}>
                        {props.status === "processing" ? "Entrando..." : "Entrar"}
                    </Button>
            </div>
            <div className='mt-3'>
               <Form.Check type="checkbox" className='d-flex justify-content-center'>
                    <Form.Check.Input type="checkbox" className='border-2' name="keep" onChange={props.onInputChange} />
                    <Form.Check.Label className='ms-2'>Mantenha conectado</Form.Check.Label>
                </Form.Check>
            </div>
        </Form>
    );
}