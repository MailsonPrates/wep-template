import React from "react";
import { Container, Dropdown, Navbar, NavItem } from "react-bootstrap";
import { Link } from "react-router";
import App from 'app';
import { HiOutlineUser, HiOutlineArrowRightOnRectangle } from "react-icons/hi2";

export default function Nav(props){

    let {firstname, nickname, profile_images} = App.data("user");
    let name = nickname || firstname || [];

    console.log({name})

    let firstLetter = Array.isArray(name) && name.length ? 
        name[0].toUpperCase()
        : "";

    return <Navbar className="navbar-light bg-light">
        <Container fluid>
            <Navbar.Brand>
                <Link className="navbar-brand" to="/">
                    <img src="/assets/images/logo.png" alt="" />
                </Link>
           </Navbar.Brand>
            <div className="d-flex align-items-center">
                <Dropdown>
                    <Dropdown.Toggle className="d-flex align-items-center pointer" as={NavItem}>
                        <div className="profile-image border bg-light" style={{height: '36px', width: '36px', borderRadius: "50%"}}>
                            {
                                profile_images.small
                                    ? <span className="img-thumbnails d-block" style={{
                                        borderRadius: "50%", 
                                        backgroundImage: `url(${profile_images.small})`,
                                        height: 36, width: 36,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center"
                                    }}></span>
                                    : <span className="d-flex align-items-center justify-content-center fw-bold h-100" style={{
                                        color: "#555"
                                    }}>{firstLetter}</span>
                            }
                        </div>
                        <span className="ms-2 text-decoration-none">{name}</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu align="end" className="shadow border-light">
                        <Dropdown.Item as="span">
                            <Link to="/user/profile/" className="text-decoration-none d-block text-secondary">
                                <HiOutlineUser className="fs-4" />
                                <span className="ms-2">Meu perfil</span>
                            </Link>
                        </Dropdown.Item>
                        <Dropdown.Item as="span">
                            <Link to="/login/logout/" className="text-decoration-none d-block text-secondary">
                                <HiOutlineArrowRightOnRectangle className="fs-4" />
                                <span className="ms-2">Sair</span>
                            </Link>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </Container>
    </Navbar>
}