import MainTemplate from "ui/templates/main";
import UserInviteForm from "./common/UserInviteForm";
import React from "react";

import { useNavigate } from "react-router";

export default function UserInviteCreate(){

    const navigate = useNavigate();

    const breadcrumbs = [
        {title: "Admin", path: "/admin/"},
        {title: "Convites", path: "/admin/user/invite/"}
    ]

    return (
        <MainTemplate title="Novo convite de usuário" breadcrumbs={breadcrumbs}>
            <UserInviteForm afterSave={() => navigate("/admin/user/invite/", {state: {update: true}})}/>
        </MainTemplate>
    )
}