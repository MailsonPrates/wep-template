import React from "react";
import { FloatingLabel, Form } from "react-bootstrap";

export default function Nickname({value, onChange, onKeyDown, ref, required}){
    return (
        <FloatingLabel key="nickname" label="Apelido" className="mb-2">
            <Form.Control 
                ref={ref}   
                onChange={onChange} 
                onKeyDown={onKeyDown}
                name="nickname"
                placeholder="Apelido"
                value={value}
                required={required ? true : null} />
        </FloatingLabel>
    )
}