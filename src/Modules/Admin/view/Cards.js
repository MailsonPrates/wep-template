import React from "react";

import { Col, Row } from "react-bootstrap";
import { Link } from "react-router";

export default function Cards(){

    return (
        <>
         <Row>
                <Col sm={4} className="mb-3">
                   <div className="border rounded p-3 d-flex flex-wrap h-100">
                        <h4 className="text-secondary d-flex align-items-center">
                            <span className="ms-2">Usuários</span>
                        </h4>
                        <div className="mt-3 fw-light fs-14">Cadaste, edite ou delete usuários do sistema</div>
                        <div className="mt-2">
                            <Link to="/admin/user" className="btn btn-default bg-light text-primary">Acessar</Link>
                        </div>
                    </div>
                </Col>
                <Col sm={4} className="mb-3">
                   <div className="border rounded p-3 d-flex flex-wrap h-100">
                        <h4 className="text-secondary d-flex align-items-center">
                            <span className="ms-2">Grupos de usuários</span>
                        </h4>
                        <div className="mt-3 fw-light fs-14">Crie diferentes grupos de usuários do sistema</div>
                        <div className="mt-2">
                            <Link to="/admin/user/group" className="btn btn-default bg-light text-primary">Acessar</Link>
                        </div>
                    </div>
                </Col>
                <Col sm={4} className="mb-3">
                   <div className="border rounded p-3 d-flex flex-wrap h-100">
                        <h4 className="text-secondary d-flex align-items-center">
                            <span className="ms-2">Convite de usuários</span>
                        </h4>
                        <div className="mt-3 fw-light fs-14">Convide usuários externos para se cadastrar no sistema</div>
                        <div className="mt-2">
                            <Link to="/admin/user/invite" className="btn btn-default bg-light text-primary">Acessar</Link>
                        </div>
                    </div>
                </Col>
            </Row>
        </>
    )
}