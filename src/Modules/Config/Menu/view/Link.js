import React from "react";
import { FloatingLabel, Form } from "react-bootstrap";

export default function Link({value, onChange, onKeyDown, ref}){
    return (
        <FloatingLabel key="link" label="Link" className="mb-2">
            <Form.Control 
                ref={ref}
                onChange={onChange} 
                onKeyDown={onKeyDown}
                name="link"
                placeholder="Link"
                value={value}
                required />
        </FloatingLabel>
    )
}