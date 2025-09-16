import MainTemplate from "ui/templates/main";
import UserGroupForm from "./common/UserGroupForm";
import React from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router";

export default function UserGroupUpdate(){

    const navigate = useNavigate();
    const { id } = useParams();

    const breadcrumbs = [
        {title: "Admin", path: "/admin/"},
        {title: "Grupos de usuários", path: "/admin/user/group/"}
    ]

    return (
        <MainTemplate title="Grupos de usuários" breadcrumbs={breadcrumbs}>
            <UserGroupForm afterSave={() => navigate("/admin/user/group/", {state: {update: true}})} config={{id}} />
        </MainTemplate>
    )
}