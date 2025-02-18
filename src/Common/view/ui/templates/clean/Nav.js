import React from "react"
import { Link } from "react-router"

export default function Nav({fluid}){
    return (
        <div className="text-center">
            <Link to="/" className="navbar-brand">
                <img src="/assets/images/logo.png" alt="" />
            </Link>
        </div>
    ) 
}