import React from "react";
import { FloatingLabel, Form } from "react-bootstrap";

export default function Type({value, onChange, onKeyDown}){
    return (
        <FloatingLabel key="type" label="Tipo" className="mb-2">
            <Form.Select name="type" onChange={onChange} value={value} onKeyDown={onKeyDown} required>
                <option key="empty" value="" disabled>Selecione</option>
                <option key="route" value="route">Rota</option>
                <option key="link" value="external_link">Link externo</option>
                <option key="group" value="group">Grupo</option>
                <option key="text" value="text">Texto</option>
            </Form.Select>
        </FloatingLabel>
    )
}