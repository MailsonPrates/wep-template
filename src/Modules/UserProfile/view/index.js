import React, { useEffect } from "react";
import {TemplateMain} from "components";
import UserProfileForm from "./UserProfileForm";
import App from "app";

export default function UserProfile(){
    
    return (
        <TemplateMain title="Meus dados" breadcrumbs={false}>
            <UserProfileForm config={App.config("user") || {}} />
        </TemplateMain>
    )
}