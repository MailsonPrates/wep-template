import React from "react"
import { Link } from "react-router"

export default function ItemRoute({props, classes, children, onClick}){
    return (
        <Link className={classes} to={`${window.location.origin}${props.link}`} onClick={onClick.bind(this, props)}>
            {children}
        </Link>
    )
}