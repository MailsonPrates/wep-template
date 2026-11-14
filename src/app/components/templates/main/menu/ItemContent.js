import { motion, AnimatePresence } from "motion/react";
import { HiChevronDown } from "react-icons/hi";
import React, {useEffect, useState} from "react";
import Icons from "storage/builds/menu-icons.build.js";

export default function ItemContent({props, isSidebarOpen}){

    const [isFirstRender, setIsFirstRender] = useState(true);

    props.icon = props.icon && typeof props.icon === "string" 
        ? JSON.parse(props.icon) 
        : {};
    
    const Icon = Icons[props.id] || null;

    useEffect(() => {
        if (!isFirstRender) return;
        setIsFirstRender(false);
    }, []);
    
    return (
        <span className="head d-flex align-items-center justify-content-between">
            <span className="d-flex align-items-center">
                {props.isMain && Icon && <Icon className="fs-5" />}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.span 
                            className={`title text-nowrap ${props.isMain ? "ms-2 fw-medium" : "fs-6"}`}
                            initial={{ opacity: isFirstRender ? 1 : 0}}
                            exit={{ opacity: 0 }}
                            animate={{ opacity: 1}}
                            transition={{duration: 0.3, ease: "easeInOut"}}>
                            {props.title}
                        </motion.span>
                    )}
                </AnimatePresence>
            </span>
            {props.type === "group" && <HiChevronDown className={`i-caret fs-11${isSidebarOpen ? '' : ' d-none'}`} />}
        </span>
    )
}
