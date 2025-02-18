import React from 'react';
import { Toast as BootstrapToast } from 'react-bootstrap';

function Toast({ toast, onClose }) {

    const id = toast.id || `toast-${new Date().getTime()}`;
    const message = toast.header || toast.message;

    return (
        <BootstrapToast
            id={id}
            className={`text-bg-${toast.type} border-0 position-relative`}
            onClose={() => onClose(id)}
            show={true}
            delay={5000}
            autohide={toast.autoHide ? toast.autoHide : true}
        >
            {toast.header !== false && message && <BootstrapToast.Header closeVariant="white" className="bg-transparent text-white d-flex align-items-center justify-content-between">{message}</BootstrapToast.Header>}
            {toast.body && <BootstrapToast.Body>{toast.body}</BootstrapToast.Body>}
        </BootstrapToast>
    );
}

export default Toast;

/* # USAGE
import React from 'react';
import { useToast } from './ToastContext';
import { Button } from 'react-bootstrap';

function MyComponent() {
    const { addToast } = useToast();

    const handleShowToast = () => {
        addToast({
            id: '',
            type: 'success',
            header: 'Toast Header',
            message: 'This is a success toast!'
        });
    };

    return (
        <div>
            <Button onClick={handleShowToast}>Show Toast</Button>
        </div>
    );
}

export default MyComponent;


*/