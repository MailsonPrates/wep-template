import React from "react";
import { FloatingLabel, Form } from "react-bootstrap";

export default function Type({value, onChange, onKeyDown, ref, required}){
    return (
        <FloatingLabel key="type" label="Tipo de cadastro" className="mb-2 disabled">
             <Form.Select 
                ref={ref}
                name="type"
                onChange={onChange} 
                onKeyDown={onKeyDown}
                value={value}
                required={required ? true : null}
                aria-label="Default select example">
                <option value="pf">Pessoal</option>
                <option value="pj">Empresarial</option>
            </Form.Select>
        </FloatingLabel>
    )
}