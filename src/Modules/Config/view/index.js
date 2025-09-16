import TemplateMain from "ui/templates/main";
import React from "react";
import Cards from "./Cards";

export default function Config(){
    return <TemplateMain title="Configurações">
        <div className="mt-5">
            <Cards />
        </div>
    </TemplateMain>
}