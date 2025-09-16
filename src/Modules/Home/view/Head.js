import React from "react";
import { Link } from "react-router";
import App from "app";

const user = App.data("user") || {};

export default function Head(){
    return (
        <>
            <div>
                Olá <b>{user.nickname || user.firstname || "Usuário"}</b>
            </div>
            <div className="d-flex align-items-center justify-content-between mt-3">
                <div>
                    <h1 className="mb-0">Título</h1>
                    <span className="h1 text-gradient gradient-primary fw-bold">Subtítulo</span>
                </div>
            </div>
        </>
    )
}