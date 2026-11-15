import { Col, Row } from "react-bootstrap";
import { Link } from "react-router";
import { can } from "core/user";

/**
 * Cartões de atalho (páginas de entrada do Admin, Configurações...). Cartões com `role` só
 * aparecem para quem tem a permissão da página.
 *
 *   <LinkCards items={[{title: "Menu", description: "...", to: "/config/menu/", role: "page.config.menu", icon: <HiOutlineBars3 />}]} />
 */
export default function LinkCards({ items = [], linkLabel = "Acessar" }) {
    const visible = items.filter((item) => !item.role || can(item.role));

    return (
        <Row>
            {visible.map((item) => (
                <Col key={item.title} sm={6} lg={4} className="mb-3">
                    <div className="border rounded p-3 d-flex flex-column h-100">
                        <h4 className="text-secondary d-flex align-items-center">
                            {item.icon}
                            <span className={item.icon ? "ms-2" : ""}>{item.title}</span>
                        </h4>
                        {item.description && <div className="mt-2 fw-light fs-14 flex-grow-1">{item.description}</div>}
                        {item.to && (
                            <div className="mt-3">
                                <Link to={item.to} className="btn btn-light text-primary">{linkLabel}</Link>
                            </div>
                        )}
                    </div>
                </Col>
            ))}
        </Row>
    );
}
