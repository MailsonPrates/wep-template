import { HiOutlineArchiveBoxXMark } from "react-icons/hi2";

/**
 * Estado vazio de uma lista.
 *   <Empty />  <Empty message="Nenhum convite" />
 */
export default function Empty({ message = "Nenhum registro cadastrado!", children, className = "" }) {
    return (
        <div className={`p-4 text-secondary opacity-50 ${className}`}>
            {children || (
                <div className="d-flex align-items-center">
                    <HiOutlineArchiveBoxXMark className="fs-1 flex-shrink-0" />
                    <span className="ms-2 fs-4 fw-light">{message}</span>
                </div>
            )}
        </div>
    );
}
