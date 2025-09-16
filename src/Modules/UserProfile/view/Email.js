import React from "react";
import { FloatingLabel, Form } from "react-bootstrap";

export default function Email({value, onChange, onKeyDown, ref, required}){
    return (
        <FloatingLabel key="email" label="E-mail" className="mb-2 disabled">
            <Form.Control 
                ref={ref}
                onChange={onChange} 
                onKeyDown={onKeyDown}
                name="email"
                placeholder="E-mail"
                value={value}
                type="email"
                required={required ? true : null} />
        </FloatingLabel>
    )
}