import React, {useRef} from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { Button, Row, Col } from 'react-bootstrap';

export default function InstallForm(props={}){

    const formRef = useRef(null);

    const Core = {
        onKeyDown: e => {
            if ( e.keyCode === 13 ) formRef.current.click();
        }
    }

    return (
        <Form className="mt-3 bg-white p-4 rounded shadow-sm" noValidate validated={props.validated} onSubmit={props.handleSubmit}>
            <div className='h4'>Aplicação</div>
            <FloatingLabel label="Url da aplicação" className="mb-2">
                <Form.Control 
                    onKeyDown={Core.onKeyDown}
                    onChange={props.onInputChange} 
                    name="url"
                    id="url" 
                    type="text" 
                    value={props.url}
                    placeholder="Url da aplicação" 
                    required />
            </FloatingLabel>
            <div className='h4 mt-4'>Banco de Dados</div>
            <Row>
                <Col sm="6">
                    <FloatingLabel label="Nome" className="mb-2">
                        <Form.Control 
                            onKeyDown={Core.onKeyDown}
                            onChange={props.onInputChange} 
                            name="db_name"
                            id="db_name" 
                            type="text" 
                            value={props.db_name}
                            placeholder="Nome" 
                            required />
                    </FloatingLabel>
                </Col>
                <Col sm="6">
                    <FloatingLabel label="Host" className="mb-2">
                        <Form.Control 
                            onKeyDown={Core.onKeyDown}
                            onChange={props.onInputChange} 
                            name="db_host"
                            id="db_host" 
                            type="text" 
                            value={props.db_host}
                            placeholder="Host" 
                            required />
                    </FloatingLabel>
                </Col>
                <Col sm="6">
                    <FloatingLabel label="Usuário" className="mb-2">
                        <Form.Control 
                            onKeyDown={Core.onKeyDown}
                            onChange={props.onInputChange} 
                            name="db_username"
                            id="db_username" 
                            type="text" 
                            value={props.db_username}
                            placeholder="Usuário" 
                            required />
                    </FloatingLabel>
                </Col>
                 <Col sm="6">
                    <FloatingLabel label="Senha" className="mb-2">
                        <Form.Control 
                            onKeyDown={Core.onKeyDown}
                            onChange={props.onInputChange} 
                            name="db_password"
                            id="db_password" 
                            type="text" 
                            value={props.db_password}
                            placeholder="Senha" 
                            required />
                    </FloatingLabel>
                </Col>
            </Row>
            <div className='h4 mt-4'>Usuário Admin</div>
            <Row>
                <Col sm="6">
                    <FloatingLabel label="Nome completo" className="mb-2">
                        <Form.Control 
                            onKeyDown={Core.onKeyDown}
                            onChange={props.onInputChange} 
                            name="name"
                            id="name" 
                            type="text" 
                            value={props.name}
                            placeholder="Nome completo" 
                            required />
                    </FloatingLabel>
                </Col>
                <Col sm="6">
                    <FloatingLabel label="Usuário" className="mb-2">
                        <Form.Control 
                            onKeyDown={Core.onKeyDown}
                            onChange={props.onInputChange} 
                            name="username"
                            id="username" 
                            type="text" 
                            value={props.username}
                            placeholder="Usuário" 
                            required />
                    </FloatingLabel>
                </Col>
                <Col sm="6">
                    <FloatingLabel label="Senha" className="mb-2">
                        <Form.Control 
                            onKeyDown={Core.onKeyDown}
                            onChange={props.onInputChange} 
                            name="password"
                            id="password" 
                            type="text" 
                            value={props.password}
                            placeholder="Senha" 
                            required />
                    </FloatingLabel>
                </Col>
            </Row>
            <div className="mt-4 d-flex align-items-end justify-content-end">
                <Button
                    ref={formRef}
                    variant="primary" 
                    size="lg"
                    className='gradient-primary border-0 fw-medium rounded-5 w-25'
                    style={{padding: 13}}
                    onClick={props.handleSubmit}>
                        {props.status === "processing" ? "Instalando..." : "Instalar"}
                    </Button>
            </div>
        </Form>
    );
}