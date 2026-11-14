import React, { createContext, useContext, useState } from 'react';
import ToastContainer from './ToastContainer';

const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = (toast) => {

        let isAlreadyAdded = false;

        for( let i=0; i<toasts.length; i++){
            let item = toasts[i];

            if ( item.id !== toast.id ) continue;
            isAlreadyAdded = true;
            break;
        }

        if ( isAlreadyAdded ) return;

        setToasts((prevToasts) => [...prevToasts, toast]);
    };

    const removeToast = (id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}
