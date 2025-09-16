import { FloatingLabel, Form } from "react-bootstrap";

export default function Group({value, onChange, groupList, onKeyDown}){
    return (
        <FloatingLabel key="group" label="Grupo" className="mb-2">
            <Form.Select name="user_group_id" onChange={onChange} value={value} onKeyDown={onKeyDown} required>
                <option key="empty" value="" disabled>Selecione</option>
                {
                    
                groupList.length
                        ? groupList.map(item => (
                            <option key={item.user_group_id} value={item.user_group_id}>{item.name}</option>
                        )) : <option disabled>Carregando...</option>
                }
            </Form.Select>
        </FloatingLabel>
    )
}