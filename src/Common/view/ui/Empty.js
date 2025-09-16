import React from "react";
import { HiOutlineArchiveBoxXMark } from "react-icons/hi2";

/**
 * @param {object|string} props or message
 * @param {string} props.bg
 * @param {mixed} props.content
 * @param {string} props.message
 */
export default function Empty({bg, message, content, children}){

    let cls = [
        'p-4 text-secondary opacity-50',
        `bg-${bg || ''}`
    ];

    return (
        <div className={cls.join(" ")} key="empty">
            {children || 
            <div className="d-flex align-items-center">
                <HiOutlineArchiveBoxXMark className="fs-1" />
                <span className="ms-2 fs-4 fw-light">
                    {message || 'Nenhum registro cadastrado!'}
                </span>
            </div>}
        </div>  
    )
}