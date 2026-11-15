import { Link } from "react-router";
import { HiChevronLeft } from "react-icons/hi2";

/** Link "voltar" do topo dos formulários. */
export default function BackLink({ to, children = "voltar" }) {
    return (
        <Link className="text-reset d-inline-flex align-items-center" to={to}>
            <HiChevronLeft className="fs-6" />
            <span className="ms-1">{children}</span>
        </Link>
    );
}
