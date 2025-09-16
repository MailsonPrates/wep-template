import React from "react";
import { Button } from "react-bootstrap";

export default function BtnSave({onClick, ref}){

    return (
        <Button 
            variant="primary" 
            className="px-5 fs-5" 
            size="lg" 
            onClick={onClick}  
            ref={ref}>Salvar</Button>
    )
}