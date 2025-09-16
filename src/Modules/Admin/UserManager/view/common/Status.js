import { FloatingLabel, Form } from "react-bootstrap";

export default function Status({value, onChange, onKeyDown}){
    return (
        <FloatingLabel key="status" label="Status" className="mb-2">
            <Form.Select name="active" onChange={onChange} onKeyDown={onKeyDown}>
                <option value="ativado">Ativado</option>
                <option value="desativado">Desativado</option>
            </Form.Select>
        </FloatingLabel>
    )
}