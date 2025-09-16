import React from "react";
import { FloatingLabel, Form } from "react-bootstrap";

export default function Name({value, onChange, onKeyDown, ref}){
    return (
        <FloatingLabel key="name" label="Nome" className="mb-2">
            <Form.Control 
                ref={ref}
                onChange={onChange} 
                onKeyDown={onKeyDown}
                name="name"
                placeholder="Nome"
                value={value}
                required />
        </FloatingLabel>
    )
}