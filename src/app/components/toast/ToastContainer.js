import React from 'react';
import { ToastContainer as BootstrapToastContainer } from 'react-bootstrap';
import Toast from './Toast';

function ToastContainer({ toasts, removeToast }) {
    return (
        <BootstrapToastContainer position="top-end" className="p-3 position-fixed">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onClose={removeToast} />
            ))}
        </BootstrapToastContainer>
    );
}

export default ToastContainer;
