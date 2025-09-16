import { FloatingLabel, Form } from "react-bootstrap";

export default function Email({value, onChange, onKeyDown}){
    return (
        <FloatingLabel key="email" label="E-mail" className="mb-2">
            <Form.Control 
                onChange={onChange} 
                onKeyDown={onKeyDown}
                name="email"
                placeholder="E-mail"
                value={value}
                type="email" />
        </FloatingLabel>
    )
}