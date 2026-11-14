import React, {useEffect} from "react";
import App from "app";
import Nav from "./Nav";

const TemplateClean = ({documentTitle, title, children, header, fluid}) => {

    useEffect(() => {
        document.title = `${documentTitle} | ${App.data("title", "Wep")}`
    }, []);

    return (
        <div className="main">
            <div className={"mt-4 container"+(fluid ? "-fluid" : "")} style={{maxWidth: '700px'}}>
                <Nav fluid={true} />
                {header !== false && 
                    <TemplateClean.Header>
                        {title && <TemplateClean.Title>{title}</TemplateClean.Title>}
                    </TemplateClean.Header>}
                <div className="mt-4 bg-white rounded-3 p-3 px-5">{children}</div>
            </div>
        </div>
    );
}

TemplateClean.Title = ({children}) => <h1 className="fw-light">{children || "Sem título"}</h1>;
TemplateClean.Header = ({children}) => <div className="page-header">{children}</div>;

export default TemplateClean;