import React from "react";
import { FloatingLabel, Form } from "react-bootstrap";

export default function Title({value, onChange, onKeyDown, ref}){
    return (
        <FloatingLabel key="title" label="Título" className="mb-2">
            <Form.Control 
                ref={ref}
                onChange={onChange} 
                onKeyDown={onKeyDown}
                name="title"
                placeholder="Título"
                value={value}
                required />
        </FloatingLabel>
    )
}