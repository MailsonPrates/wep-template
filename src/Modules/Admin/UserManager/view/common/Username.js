import { FloatingLabel, Form } from "react-bootstrap";

export default function Username({value, onChange, onKeyDown}){
    return (
        <FloatingLabel key="username" label="Usuário" className="mb-2">
            <Form.Control 
                onChange={onChange} 
                onKeyDown={onKeyDown}
                name="username"
                placeholder="Usuário"
                value={value}
                required />
        </FloatingLabel>
    )
}