import { FloatingLabel, Form } from "react-bootstrap";

export default function Firstname({value, onChange, onKeyDown}){
    return (
        <FloatingLabel key="firstname" label="Primeiro nome" className="mb-2">
            <Form.Control 
                onChange={onChange} 
                onKeyDown={onKeyDown}
                name="firstname"
                placeholder="Primeiro nome"
                value={value}
                required />
        </FloatingLabel>
    )
}