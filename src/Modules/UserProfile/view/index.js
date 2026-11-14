import React, { useEffect } from "react";
import {MainTemplate} from "components";
import UserProfileForm from "./UserProfileForm";
import App from "app";

export default function UserProfile(){
    
    return (
        <MainTemplate title="Meus dados" breadcrumbs={false}>
            <UserProfileForm config={App.config("user") || {}} />
        </MainTemplate>
    )
}