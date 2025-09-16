import { FloatingLabel, Form } from "react-bootstrap";

export default function Nickname({value, onChange, onKeyDown}){
    return (
        <FloatingLabel key="nickname" label="Apelido" className="mb-2">
            <Form.Control 
                onChange={onChange} 
                onKeyDown={onKeyDown}
                name="nickname"
                placeholder="Apelido"
                value={value} />
        </FloatingLabel>
    )
}