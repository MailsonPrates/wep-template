import React from "react";
import { Link } from "react-router";
import { HiOutlineHome } from "react-icons/hi2";

export default function Breadcrumbs(props){

    const list = props.list || [];

    list.unshift({
        title: "Início",
        path: "/",
        icon: <HiOutlineHome />
    });

    return (
        <nav style={{"--bs-breadcrumb-divider": "'›'"}}>
            <ol className="breadcrumb mb-0 fs-14 text-secondary">
                {
                    list.map((item, i) => 
                        <li key={item.title} className={`breadcrumb-item${item.active ? ' active' : ''}`}>
                            {
                                item.active 
                                    ? item.title
                                    : <Link className="text-reset text-decoration-none" to={item.path}>
                                        {
                                        item.icon 
                                            ? (<span className="d-flex align-items-center">
                                                {item.icon}
                                                <span className="ms-1">{item.title}</span>
                                            </span>)
                                            : item.title
                                        }
                                     </Link>
                            }
                        </li>
                    )
                }
            </ol>
        </nav>
    )
}
