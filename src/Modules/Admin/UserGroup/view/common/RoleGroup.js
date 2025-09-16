import React from "react";
import { Row, Col } from "react-bootstrap";

export default function RoleGroup({index, selected, module, onModuleClick, onPageClick, onRoleClick}){

   //console.log("[RoleGroup] "+module.module_title, {module})

    const RoleItem = ({page, pageIndex}) => {

        let isPageSelected = selected.includes(page.role);

        return (
            <div className="mb-3 border p-2 rounded-3 bg-white">
                <div className="pointer" onClick={onPageClick.bind(null, page)}>
                    <span style={{fontSize: '9px'}} className={"badge me-2 text-bg-"+(isPageSelected ? "primary" : "secondary")}>
                        Página
                    </span>
                    <span className={ isPageSelected ? "fw-semibold text-success" : ""}>{page.title || page.role}</span>
                </div>
                <div className="mt-2">
                    {page.methods.map(method => <MethodItem key={method.role} method={method} page={page} />)}
                </div>
            </div>
        )
    }

    const MethodItem = ({method, page}) => {
        let isSelected = selected.includes(method.role);

        return (
            <div onClick={onRoleClick.bind(null, {method, page})} className={`d-inline-flex align-items-center rounded-3 px-2 p1 m-1 pointer border ${isSelected ? 'text-success border-successx' : 'border-white'}`}>
                <span style={{fontSize: "8px", background: "#b0b0b0"}} className={"badge me-2 text-white"+(isSelected ? ' text-bg-success' : '')}>Função</span>
                <span className={isSelected ? '' : 'text-secondary'}>{method.title || method.role}</span>
            </div>
        )
    }

    return (
        <div className={`mb-3 pt-3${index > 0 ? ' border-top' : ''}`}>
            <div className="mb-1 fw-semibold pointer fs-4" onClick={onModuleClick.bind(this, module)}>
                {module.module_title || module.module_name}
            </div>
            <Row>
                {module.pages.map((page, pageIndex) => <Col key={page.role} sm="6"><RoleItem page={page} pageIndex={pageIndex} /></Col>)}
            </Row>
        </div>
    )
}