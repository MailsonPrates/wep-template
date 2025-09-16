import React from "react";
import { Button, Container, Dropdown, Navbar, NavItem } from "react-bootstrap";
import { Link } from "react-router";
import App from 'app';
import { HiOutlineUser, HiOutlineArrowRightOnRectangle,
     HiBars3, HiOutlineQuestionMarkCircle, HiOutlineBell  
} from "react-icons/hi2";

export default function Nav({toggleSidebarMobile}){
    
    let user = App.data("user") || {};

    console.log({user})

    let nickname = user.nickname || "";
    let firstname = user.firstname || "";
    let profile_images = user.profile_images || {};
   
    let name = nickname || firstname || "";

    let firstLetter = name ? name[0].toUpperCase() : "";

    return <Navbar className="navbar-light bg-light py-1">
        <Container fluid className="ps-0 ps-md-3">
            <div className="d-flex">
                <Button className="d-md-none" variant="default" onClick={toggleSidebarMobile}>
                    <HiBars3 className="fs-1" />
                </Button>
                <Navbar.Brand className="ps-3 ps-md-0">
                    <Link className="navbar-brand" to="/">
                        <img src="/assets/images/logo.png" alt="" width={100} height={45}/>
                    </Link>
                </Navbar.Brand>
            </div>
            <div className="d-flex align-items-center">
                <span className="me-4 fs-5 d-none" title="Avisos"><HiOutlineBell /></span>
                <Link className="me-4 text-reset fs-5 d-none" to="" target="_blank" title="Central de Ajuda"><HiOutlineQuestionMarkCircle /></Link>
                <Dropdown>
                    <Dropdown.Toggle className="d-flex align-items-center pointer" as={NavItem}>
                        <span className="me-2 text-decoration-none d-none d-md-block">{name}</span>
                        <div className="profile-image bg-white" style={{height: 36, width: 36, borderRadius: "50%"}}>
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
                    </Dropdown.Toggle>
                    <Dropdown.Menu align="end" className="shadow border-light">
                        <Dropdown.Item as="span">
                            <Link to="/user/profile/" className="text-decoration-none d-block text-secondary">
                                <HiOutlineUser className="fs-4" />
                                <span className="ms-2 title">Meus dados</span>
                            </Link>
                        </Dropdown.Item>
                        <Dropdown.Item as="span">
                            <Link to="/login/logout/" className="text-decoration-none d-block text-secondary">
                                <HiOutlineArrowRightOnRectangle className="fs-4" />
                                <span className="ms-2 title">Sair</span>
                            </Link>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </Container>
    </Navbar>
}