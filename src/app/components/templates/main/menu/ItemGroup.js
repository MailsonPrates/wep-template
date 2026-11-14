import React from "react";
export default function ItemGroup({props, classes, onClick, children}){
    return (
        <div className={classes} onClick={onClick.bind(this, props)}>
            {children}
        </div>
    );
}