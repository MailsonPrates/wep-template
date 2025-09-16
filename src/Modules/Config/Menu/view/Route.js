import React from "react";
import { FloatingLabel, Form } from "react-bootstrap";

export default function Route({value, onChange, onKeyDown, routesList=[]}){

    console.log({value, routesList})

    return (
        <FloatingLabel key="route" label="Rota" className="mb-2">
            <Form.Select name="route" onChange={onChange} value={value} onKeyDown={onKeyDown} required>
                {!routesList.length
                    ? <option key="loading" value="" disabled>Carregando...</option>
                    : routesList.map(item => {
                        return (
                            <option className={item.class} value={item.value} key={item.value || item.text} disabled={item.disabled}>{item.text}</option>
                        )
                    })
                }
            </Form.Select>
        </FloatingLabel>
    )
}