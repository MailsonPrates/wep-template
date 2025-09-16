import React from "react";
import { FloatingLabel, Form } from "react-bootstrap";

export default function Lastname({value, onChange, onKeyDown, ref, invalid}){
    return (
        <FloatingLabel key="lastname" label="Sobrenome" className="mb-2">
            <Form.Control 
                ref={ref}
                onChange={onChange} 
                onKeyDown={onKeyDown}
                name="lastname"
                placeholder="Sobrenome"
                value={value}
                required />
        </FloatingLabel>
    )
}