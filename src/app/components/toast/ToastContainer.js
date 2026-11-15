import { ToastContainer as BootstrapToastContainer } from "react-bootstrap";
import Toast from "./Toast";

export default function ToastContainer({ toasts, onClose }) {
    return (
        <BootstrapToastContainer position="top-end" className="p-3 position-fixed" style={{ zIndex: 1090 }}>
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onClose={onClose} />
            ))}
        </BootstrapToastContainer>
    );
}
