import { Toast as BootstrapToast } from "react-bootstrap";

export default function Toast({ toast, onClose }) {
    return (
        <BootstrapToast
            className={`text-bg-${toast.type} border-0`}
            onClose={() => onClose(toast.id)}
            show
            autohide={toast.autoHide}
            delay={toast.duration}
        >
            <BootstrapToast.Header closeVariant="white" className="bg-transparent text-white d-flex align-items-start justify-content-between">
                {/* selecionável: a senha temporária precisa ser copiada */}
                <span className="me-2 text-break" style={{ userSelect: "text" }}>{toast.message}</span>
            </BootstrapToast.Header>
            {toast.body && <BootstrapToast.Body>{toast.body}</BootstrapToast.Body>}
        </BootstrapToast>
    );
}
