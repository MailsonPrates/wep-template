import React, {useEffect} from "react";
import App from "app";
import { Row, Col } from "react-bootstrap";
import Breadcrumbs from "./breadcrumbs";
import Nav from "./Nav";
import Sidebar from "./Sidebar";
import "./main.scss";

const TemplateMain = ({title="Sem título", children, header, breadcrumbs}) => {

    useEffect(() => {
        document.title = `${title} | ${App.data("title", "Wep")}`
    }, [title]);

    const hasSidebar = true;

    return (
        <div className="main">
            <Nav />
            <div className="container-fluid">
                <Row>
                    <Sidebar />
                    <Col className={`p-3 h-100${hasSidebar ? ' ms-5' : ''}`} sm={hasSidebar ? "9" : "12"}>
                    {header !== false && 
                        <TemplateMain.Header>
                            <TemplateMain.Title>{title}</TemplateMain.Title>
                            {breadcrumbs !== false && <Breadcrumbs list={breadcrumbs} />}
                        </TemplateMain.Header>}
                        <div className="main-content mt-4 bg-white rounded-3 p-3">{children}</div>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

TemplateMain.Title = ({children}) => <h1 className="fw-light">{children || "Sem título"}</h1>;
TemplateMain.Header = ({children}) => <div className="page-header">{children}</div>;

export default TemplateMain;