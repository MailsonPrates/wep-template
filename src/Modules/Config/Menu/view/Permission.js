import React from "react";
import { FloatingLabel, Form } from "react-bootstrap";

export default function Permission({value, onChange, onKeyDown, permissionList=[]}){
    console.log({permissionList});
    return (
        <FloatingLabel key="permission" label="Permissão" className="mb-2">
            <Form.Select name="permission" onChange={onChange} value={value} onKeyDown={onKeyDown} required>
                {!permissionList.length
                    ? <option key="loading" selected value="" disabled>Carregando...</option>
                    : permissionList.map(item => {
                        return (
                            <option 
                                value={item.value} 
                                key={item.value || item.text} 
                                disabled={item.disabled}
                            >{item.text}</option>
                        )
                    })
                }
            </Form.Select>
        </FloatingLabel>
    )
}