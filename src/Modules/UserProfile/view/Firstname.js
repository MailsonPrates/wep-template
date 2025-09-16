import React from "react";
import { FloatingLabel, Form } from "react-bootstrap";

export default function Firstname({value, onChange, onKeyDown, ref, required}){
    return (
        <FloatingLabel key="firstname" label="Primeiro nome" className="mb-2">
            <Form.Control 
                ref={ref}
                onChange={onChange} 
                onKeyDown={onKeyDown}
                name="firstname"
                placeholder="Primeiro nome"
                value={value}
                required={required ? true : null} />
        </FloatingLabel>
    )
}