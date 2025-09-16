import { useState } from "react";
import {  Form, InputGroup } from "react-bootstrap";

export default function Icon({icon, triggerChange}){

    const [iconImport, setIconImport] = useState(icon.import || "");
    const [iconFrom, setIconFrom] = useState(icon.from || "");

    return <>
        <label className="mt-3 fw-semibold">Ícone</label>
        <InputGroup className="mb-3">
            <InputGroup.Text>import</InputGroup.Text>
            <Form.Control aria-label="Import" id="import" name="icon_import" onChange={e => {
                const value = e.target.value;
                setIconImport(value);
                triggerChange({ import: value, from: iconFrom });
            }} value={iconImport} />
            <InputGroup.Text>from</InputGroup.Text>
            <Form.Control aria-label="From" id="from" name="icon_from" onChange={e => {
                const value = e.target.value;
                setIconFrom(value);
                triggerChange({ import: iconImport, from: value });
            }} value={iconFrom}/>
        </InputGroup>
    </>

}