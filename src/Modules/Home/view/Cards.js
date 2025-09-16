import React from "react";
import {
    HiOutlineSpeakerphone, HiOutlineCollection, HiOutlineChatAlt2,
    HiOutlineUserGroup, HiOutlineViewGrid, HiOutlineTicket 
 } from "react-icons/hi";

import { ImWhatsapp } from "react-icons/im";
import { Col, Row } from "react-bootstrap";
import { Link } from "react-router";

export default function Cards(){

    return (
        <>
         <Row>
                <Col sm={4} className="mb-3">
                   <div className="border rounded p-3 d-flex flex-wrap h-100">
                        <h4 className="text-secondary d-flex align-items-center">
                            <HiOutlineSpeakerphone />
                            <span className="ms-2">Título</span>
                        </h4>
                        <div className="mt-3 fw-light fs-14">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</div>
                        <div className="mt-2">
                            <Link to="/painel" className="btn btn-default bg-light text-primary">Link</Link>
                        </div>
                   </div>
                </Col>
                <Col sm={4} className="mb-3">
                   <div className="border rounded p-3 d-flex flex-wrap h-100">
                        <h4 className="text-secondary d-flex align-items-center">
                            <HiOutlineTicket />
                             <span className="ms-2">Título</span>
                        </h4>
                        <div className="mt-3 fw-light fs-14">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</div>
                        <div className="mt-2">
                            <Link to="/painel" className="btn btn-default bg-light text-primary">Link</Link>
                        </div>
                   </div>
                </Col>
                <Col sm={4} className="mb-3">
                   <div className="border rounded p-3 d-flex flex-wrap h-100">
                        <h4 className="text-secondary d-flex align-items-center">
                            <HiOutlineViewGrid />
                            <span className="ms-2">Título</span>
                        </h4>
                        <div className="mt-3 fw-light fs-14">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</div>
                        <div className="mt-2">
                            <Link to="/painel" className="btn btn-default bg-light text-primary">Link</Link>
                        </div>
                   </div>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col sm={4} className="mb-3">
                   <div className="border rounded p-3 d-flex flex-wrap h-100">
                        <h4 className="text-secondary d-flex align-items-center">
                            <span className="ms-2">Título</span>
                        </h4>
                        <div className="mt-3 fw-light fs-14">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</div>
                        <div className="mt-2">
                            <Link to="/painel" className="btn btn-default bg-light text-primary">Link</Link>
                        </div>
                   </div>
                </Col>
                <Col sm={4} className="mb-3">
                   <div className="border rounded p-3 d-flex flex-wrap h-100">
                        <h4 className="text-secondary d-flex align-items-center">
                            <HiOutlineUserGroup  />
                            <span className="ms-2">Título</span>
                        </h4>
                        <div className="mt-3 fw-light fs-14">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</div>
                        <div className="mt-2">
                            <Link to="/painel" className="btn btn-default bg-light text-primary">Link</Link>
                        </div>
                   </div>
                </Col>
                <Col sm={4} className="mb-3">
                   <div className="border rounded p-3 d-flex flex-wrap h-100">
                        <h4 className="text-secondary d-flex align-items-center">
                            <HiOutlineChatAlt2 />
                                 <span className="ms-2">Título</span>
                        </h4>
                        <div className="mt-3 fw-light fs-14">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</div>
                        <div className="mt-2">
                            <Link to="/painel" className="btn btn-default bg-light text-primary">Link</Link>
                        </div>
                   </div>
                </Col>
            </Row>
        </>
    )
}