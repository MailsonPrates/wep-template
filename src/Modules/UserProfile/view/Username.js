import React from "react";
import { FloatingLabel, Form } from "react-bootstrap";

export default function Username({value, onChange, onKeyDown, ref, required}){
    return (
        <FloatingLabel key="username" label="Usuário" className="mb-2 disabled">
            <Form.Control 
                ref={ref}
                onChange={onChange} 
                onKeyDown={onKeyDown}
                name="username"
                placeholder="Usuário"
                value={value}
                readOnly={true}
                required={required ? true : null} />
        </FloatingLabel>
    )
}