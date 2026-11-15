import React, { useState } from "react";
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { HiOutlineEye, HiOutlineEyeSlash  } from "react-icons/hi2";

export default function Password(props={}){

    const [visible, setVisible] = useState(false);
    const [value, setValue] = useState("");

    const Core = {
        onPassToggle: () => setVisible(value => !value),
        onChange: e => {
            const value = e.target.value;
            setValue(value);
            typeof props.onChange === "function" && props.onChange(e);
        }
    }

    return (
        <FloatingLabel label={props.label || "Senha"} className="mb-2">
            <Form.Control
                {...props}
                value={value}
                onChange={Core.onChange}
                //name={props.name}
                //onKeyDown={props.onKeyDown}
                //onKeyUp={props.onKeyUp}
                //ref={props.ref}
                //id={props.id} 
                type={visible ? "text" : "password"} 
                placeholder={props.placeholder || "Digite sua senha"} 
                //required={props.required || true} 
            />
        <div 
            className="visibility-toggle position-absolute text-secondary pointer" 
            onClick={Core.onPassToggle}>
                {visible ? <HiOutlineEyeSlash className="fs-5" /> : <HiOutlineEye className="fs-5" />}
        </div>
        </FloatingLabel>
    )
}