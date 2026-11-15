import React from "react";
import { Link } from "react-router";
import { HiOutlineHome } from "react-icons/hi2";
import App from "app";

export default function Breadcrumbs(props){

    // "page.admin" → {title, path} pelo mapa de permissões; permissão desconhecida é ignorada
    let list = Array.isArray(props.list) ? props.list : [];
    list = list
        .map(item => typeof item === "string" ? App.route(item) : item)
        .filter(item => item && item.title);

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
                        <li key={`${i}-${item.title}`} className={`breadcrumb-item${item.active ? ' active' : ''}`}>
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
