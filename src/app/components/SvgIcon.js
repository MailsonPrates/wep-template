import { createElement } from "react";

/**
 * Ícone a partir dos dados do catálogo (public/assets/icons/hi2-outline.json), no formato do
 * react-icons: {tag, attr, child}. É assim que os ícones do menu chegam: o servidor anexa a árvore
 * ao item, então a biblioteca de ícones não entra no bundle e nada precisa ser recompilado.
 *
 *   <SvgIcon icon={item.icon_svg} className="menu-icon" />
 *
 * Só tags e atributos de desenho SVG são aceitos (nada de eventos, href ou <script>), e o elemento
 * é montado pelo React: nenhum HTML é injetado como texto.
 */

const TAGS = new Set(["svg", "g", "path", "circle", "ellipse", "line", "polyline", "polygon", "rect"]);

const ATTRS = new Set([
    "viewBox", "fill", "stroke", "strokeWidth", "strokeLinecap", "strokeLinejoin", "strokeMiterlimit",
    "fillRule", "clipRule", "d", "cx", "cy", "r", "rx", "ry", "x", "y", "x1", "y1", "x2", "y2",
    "points", "width", "height", "transform", "opacity", "fillOpacity", "strokeOpacity",
]);

function cleanAttrs(attr = {}) {
    const props = {};

    Object.keys(attr).forEach((name) => {
        const value = attr[name];

        if (!ATTRS.has(name)) return;
        if (typeof value !== "string" && typeof value !== "number") return;

        props[name] = value;
    });

    return props;
}

function renderNode(node, key) {
    if (!node || typeof node !== "object" || !TAGS.has(node.tag) || node.tag === "svg") return null;

    const children = Array.isArray(node.child) ? node.child.map(renderNode) : null;

    return createElement(node.tag, { key, ...cleanAttrs(node.attr) }, children && children.length ? children : null);
}

export default function SvgIcon({ icon, size = "1em", className = "", title }) {
    if (!icon || typeof icon !== "object" || icon.tag !== "svg") return null;

    const children = Array.isArray(icon.child) ? icon.child.map(renderNode) : null;

    return createElement(
        "svg",
        {
            // padrão do react-icons; os atributos do ícone (fill="none", stroke...) sobrescrevem
            stroke: "currentColor",
            fill: "currentColor",
            strokeWidth: 0,
            ...cleanAttrs(icon.attr),
            width: size,
            height: size,
            className,
            "aria-hidden": title ? undefined : true,
            role: title ? "img" : undefined,
            focusable: "false",
        },
        title ? createElement("title", { key: "title" }, title) : null,
        children
    );
}
