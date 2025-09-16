import React from "react";
import { GoCheckCircle } from "react-icons/go";

export default function RecoveryMessage(){

    return (
        <div className="mb-2 text-success p-1 fs-5 bg-white fw-light text-center d-flex align-items-center border-success-subtle border rounded justify-content-center">
            <span className="fs-2"><GoCheckCircle /></span>
            <span className="ms-2">Senha alterada com sucesso</span>
        </div>
    )
}