import React from "react";

import { Col, Row } from "react-bootstrap";
import { Link } from "react-router";

export default function Cards(){

    return (
        <>
         <Row>
            <Col sm={4}>
                <div className="border rounded p-3 d-flex flex-wrap h-100">
                    <h4 className="text-secondary d-flex align-items-center">
                        <span className="ms-2">Menu</span>
                    </h4>
                    <div className="mt-3 fw-light fs-14">Cadastre links no menu da barra lateral</div>
                    <div className="mt-2">
                        <Link to="/config/menu" className="btn btn-default bg-light text-primary">Acessar</Link>
                    </div>
                </div>
            </Col>
            </Row>
        </>
    )
}