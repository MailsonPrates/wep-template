import React, { useRef, useState } from "react";
import Name from "./Name";
import { Form, Offcanvas, Button } from "react-bootstrap";
import useReqToast from 'ui/useReqToast';
import {MenuApi} from "api";

export default function MenuFormOffCanvas({config={}, children, onComplete}){

    const isUpdate = config.id;
    const nameRef = useRef(null);
    const Toast = useReqToast();

    const [show, setShow] = useState(false);
    const [status, setStatus] = useState("ready");
    const [name, setName] = useState(config.name || '');

    const Core = {
        show: () => setShow(true),
        close: () => setShow(false),

        onSaveBtnClick: async () => {

            nameRef.current.classList.remove("is-invalid");

            if ( !name ){

                nameRef.current.classList.add("is-invalid");
                nameRef.current.focus();
                return;
            }

            setStatus("processing");

            const payload = {
                name
            }

            console.log({payload});

            let save = isUpdate
                ? await MenuApi.where("id", config.id).update(payload)
                : await MenuApi.create(payload);

            console.log({save});

            setStatus("ready");

            if ( save.error ) return Toast(save);

            Core.close();
            typeof onComplete == "function" && onComplete(save);
        }
    }
    
    const Footer = () => {
        return (
            <div className="mt-5 text-end">
                <Button variant="default" className="mx-2" onClick={Core.close}>Cancelar</Button>
                <Button variant="primary" onClick={Core.onSaveBtnClick}>Salvar</Button>
            </div>
        )
    }

    const Trigger = () => React.cloneElement(children, {
        onClick: Core.show
    })

    return (
        <>
            <Trigger />
            <Offcanvas show={show} onHide={Core.close} placement="end">
                <div className={status === "processing" ? 'full-loading' : ''}>
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>{`${isUpdate ? 'Editar' : 'Novo'} menu`}</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <Form>
                            <Name ref={nameRef} value={name} onChange={e => setName(e.target.value)} />
                        </Form>
                        <Footer />
                    </Offcanvas.Body>
                </div>
            </Offcanvas>

        </>
    )

}