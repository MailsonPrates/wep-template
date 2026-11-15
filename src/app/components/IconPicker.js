import { useEffect, useMemo, useState } from "react";
import { Button, Form } from "react-bootstrap";
import SvgIcon from "./SvgIcon";

/**
 * Seletor de ícone (Heroicons 2, Outline) para itens de menu.
 *
 *   <IconPicker value="HiOutlineHome" onChange={(name) => ...} />
 *
 * O catálogo (public/assets/icons/hi2-outline.json, ~28 KB com gzip) só é baixado quando o seletor
 * abre, uma vez por página (e o navegador guarda em cache). O valor gravado é só o nome do ícone:
 * o servidor valida e resolve o desenho.
 */

export const CATALOG_URL = "/assets/icons/hi2-outline.json";

let catalogPromise = null;

export function loadIconCatalog() {
    if (!catalogPromise) {
        catalogPromise = fetch(CATALOG_URL, { credentials: "same-origin" })
            .then((response) => (response.ok ? response.json() : {}))
            .catch(() => ({}))
            .then((catalog) => {
                if (!Object.keys(catalog).length) catalogPromise = null; // tenta de novo na próxima abertura
                return catalog;
            });
    }

    return catalogPromise;
}

/** "HiOutlineArrowRightCircle" → "arrow right circle" */
const label = (name) => name.replace(/^HiOutline/, "").replace(/([a-z])([A-Z0-9])/g, "$1 $2").toLowerCase();

export default function IconPicker({ value = "", onChange }) {
    const [open, setOpen] = useState(false);
    const [catalog, setCatalog] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!open && !value) return;

        let active = true;
        loadIconCatalog().then((data) => { if (active) setCatalog(data); });

        return () => { active = false; };
    }, [open, value]);

    const names = useMemo(() => {
        if (!catalog) return [];

        const term = search.trim().toLowerCase();
        const all = Object.keys(catalog);

        return term ? all.filter((name) => label(name).includes(term) || name.toLowerCase().includes(term)) : all;
    }, [catalog, search]);

    const current = value && catalog ? catalog[value] : null;

    return (
        <div className="mt-3">
            <label className="fw-semibold d-block mb-2">Ícone</label>
            <div className="d-flex align-items-center gap-3">
                <span className="icon-picker-current" title={value ? label(value) : "Sem ícone"}>
                    {current ? <SvgIcon icon={current} /> : <span className="fs-14 text-secondary">—</span>}
                </span>
                <div className="d-flex flex-wrap gap-2">
                    <Button variant="outline-secondary" size="sm" onClick={() => setOpen((prev) => !prev)}>
                        {open ? "Fechar" : (value ? "Trocar ícone" : "Escolher ícone")}
                    </Button>
                    {value && (
                        <Button variant="link" size="sm" className="text-danger" onClick={() => onChange("")}>
                            Remover
                        </Button>
                    )}
                </div>
            </div>

            {open && (
                <div className="mt-3 border rounded p-2 bg-light">
                    <Form.Control
                        size="sm"
                        type="search"
                        placeholder="Buscar ícone (ex.: user, home, cog)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mb-2"
                        autoFocus
                    />
                    {!catalog
                        ? <div className="loading m-3" />
                        : (
                            <div className="icon-picker-grid" role="listbox" aria-label="Ícones">
                                {names.map((name) => (
                                    <button
                                        key={name}
                                        type="button"
                                        role="option"
                                        aria-selected={name === value}
                                        title={label(name)}
                                        className={`icon-picker-item${name === value ? " active" : ""}`}
                                        onClick={() => { onChange(name); setOpen(false); }}
                                    >
                                        <SvgIcon icon={catalog[name]} />
                                    </button>
                                ))}
                                {!names.length && <div className="text-secondary small p-2">Nenhum ícone encontrado</div>}
                            </div>
                        )}
                </div>
            )}
        </div>
    );
}
