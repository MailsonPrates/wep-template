import React from "react";
import { HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi2";

export default function UsernameCheck({status}){

    if ( !status ) return;

    const statusData = {
        valid: {class: "text-success fs-4 me-4", content: <HiOutlineCheckCircle />},
        invalid: {class: "text-danger fs-4 me-4", content: <HiOutlineXCircle />},
        checking: {class: "loading mt-2 me-4", content: ""}
    }

    const currentStatus = statusData[status];


    return <span className={currentStatus.class}>{currentStatus.content}</span>
}