import React from "react";
import { FloatingLabel, Form } from "react-bootstrap";
import UsernameCheck from "./UsernameCheck";

export default function Username({value, onChange, onKeyDown, onKeyUp, checkStatus, ref, invalid}){
    return (
        <FloatingLabel key="username" label="Usuário" className="mb-2">
            <Form.Control 
                ref={ref}
                onChange={onChange} 
                onKeyDown={onKeyDown}
                onKeyUp={onKeyUp}
                name="username"
                placeholder="Usuário"
                value={value}
                required />
            <span className="username-check-state position-absolute top-0 end-0 mt-2 me-2">
                <UsernameCheck status={checkStatus} />
            </span>
            {checkStatus === "invalid" && <div className="text-danger small px-2">Nome de usuário indisponível</div>}
        </FloatingLabel>
    )
}
