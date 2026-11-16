import { useEffect, useRef, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { HiOutlineArrowUpTray, HiOutlineArrowUturnLeft } from "react-icons/hi2";
import { VisualApi } from "api";
import { TemplateMain } from "components";
import { useAction, useApi } from "hooks";

const GROUPS = [
    {
        title: "Botão principal (primary)",
        fields: [
            ["primary_bg", "Fundo (também links, foco e destaques)"],
            ["primary_text", "Texto"],
        ],
    },
    {
        title: "Botão secundário (secondary)",
        fields: [
            ["secondary_bg", "Fundo"],
            ["secondary_text", "Texto"],
        ],
    },
    {
        title: "Barra superior (nav)",
        fields: [
            ["nav_bg", "Fundo"],
            ["nav_text", "Texto e ícones"],
            ["nav_hover", "Destaque ao passar o mouse"],
        ],
    },
];

const IMAGES = [
    {
        key: "logo",
        title: "Logo",
        help: "Usado na barra superior e nas telas de login.",
    },
    {
        key: "logo_dark",
        title: "Logo para fundo escuro",
        help: "Usado quando o fundo da barra superior é escuro. Sem ele, vale o logo normal.",
        dark: true,
    },
    {
        key: "favicon",
        title: "Favicon",
        help: "Ícone da aba do navegador. Use uma imagem quadrada: são geradas as versões 32x32 e 180x180.",
        small: true,
    },
];

const OTHER_FONT = "__other";
const HEX = /^#[0-9a-f]{6}$/i;

function ColorField({ label, value, onChange }) {
    const [text, setText] = useState(value);

    useEffect(() => setText(value), [value]);

    const onText = (e) => {
        setText(e.target.value);
        if (HEX.test(e.target.value)) onChange(e.target.value.toLowerCase());
    };

    return (
        <Form.Group className="mb-3">
            <Form.Label className="mb-1 fs-14">{label}</Form.Label>
            <div className="color-field">
                <Form.Control type="color" value={value} onChange={(e) => onChange(e.target.value)} title={label} />
                <Form.Control value={text} maxLength={7} isInvalid={!HEX.test(text)} onChange={onText} />
            </div>
        </Form.Group>
    );
}

/** Troca o theme.css carregado na página pela versão nova (sem recarregar). */
function refreshTheme(version) {
    const href = `/assets/css/theme.css?v=${version || Date.now()}`;
    let link = document.getElementById("app-theme");

    if (!link) {
        link = document.createElement("link");
        link.rel = "stylesheet";
        link.id = "app-theme";
        document.head.appendChild(link);
    }

    link.href = href;
}

/** Carrega a fonte do Google Fonts para a pré-visualização. */
function useFontPreview(font) {
    useEffect(() => {
        if (!/^[A-Za-z][A-Za-z0-9 ]{0,48}[A-Za-z0-9]$/.test(font || "")) return;

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${font.trim().replace(/ +/g, "+")}&display=swap`;
        document.head.appendChild(link);

        return () => link.remove();
    }, [font]);
}

function Preview({ colors, text, images }) {
    const navDark = isDark(colors.nav_bg);
    const logo = navDark && images.logo_dark.custom ? images.logo_dark.url : images.logo.url;
    const fontFamily = `"${text.font}", system-ui, sans-serif`;

    useFontPreview(text.font);

    return (
        <div className="visual-preview" style={{ fontFamily }}>
            <div
                className="d-flex align-items-center justify-content-between px-3 py-2"
                style={{ background: colors.nav_bg, color: colors.nav_text }}
            >
                <img src={logo} alt="" style={{ maxHeight: 36, maxWidth: 120 }} />
                <span className="fs-14">Usuário</span>
            </div>
            <div className="p-3 bg-white">
                <div
                    className="fw-light mb-3"
                    style={{ color: colors.title_text, fontSize: text.title_size > 0 ? text.title_size : 32 }}
                >
                    Título da página
                </div>
                <div className="d-flex flex-wrap gap-2">
                    <span
                        className="btn"
                        style={{ background: colors.primary_bg, color: colors.primary_text, borderColor: colors.primary_bg }}
                    >
                        Primary
                    </span>
                    <span className="btn" style={{ color: colors.primary_bg, borderColor: colors.primary_bg }}>Outline</span>
                    <span
                        className="btn"
                        style={{
                            background: colors.secondary_bg,
                            color: colors.secondary_text,
                            borderColor: colors.secondary_bg,
                        }}
                    >
                        Secondary
                    </span>
                </div>
            </div>
        </div>
    );
}

/** Mesma conta do servidor (Theme::isDark). */
function isDark(hex) {
    if (!HEX.test(hex || "")) return false;

    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

function FontField({ fonts, value, onChange }) {
    const known = fonts.includes(value);
    const [other, setOther] = useState(!known);

    const onSelect = (e) => {
        if (e.target.value === OTHER_FONT) {
            setOther(true);
            return;
        }

        setOther(false);
        onChange(e.target.value);
    };

    return (
        <Form.Group className="mb-3">
            <Form.Label className="mb-1 fs-14">Fonte (Google Fonts)</Form.Label>
            <Form.Select value={other ? OTHER_FONT : value} onChange={onSelect}>
                {fonts.map((font) => <option key={font} value={font}>{font}</option>)}
                <option value={OTHER_FONT}>Outra...</option>
            </Form.Select>
            {other && (
                <>
                    <Form.Control
                        className="mt-2"
                        value={value}
                        maxLength={50}
                        placeholder="Nome da família, ex.: Space Grotesk"
                        onChange={(e) => onChange(e.target.value)}
                    />
                    <div className="form-text">Fontes fora da lista carregam só o peso normal (400).</div>
                </>
            )}
        </Form.Group>
    );
}

function ImageCard({ image, state, busy, onUpload, onRemove }) {
    const fileRef = useRef(null);

    const onChange = (e) => {
        const file = e.target.files && e.target.files[0];
        e.target.value = "";

        if (file) onUpload(image.key, file);
    };

    return (
        <div className="mb-4">
            <h6 className="mb-1">{image.title}</h6>
            <div className="form-text mt-0 mb-2">{image.help}</div>
            <div className={`border rounded p-3 text-center ${image.dark ? "bg-dark" : "bg-light"}`}>
                <img
                    src={state.url}
                    alt={image.title}
                    className={image.small ? "d-block mx-auto" : "brand-logo mx-auto"}
                    style={image.small ? { width: 32, height: 32 } : undefined}
                />
            </div>
            <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
                <Button size="sm" variant="outline-primary" disabled={busy} onClick={() => fileRef.current.click()}>
                    <HiOutlineArrowUpTray /> <span className="ms-1">Enviar</span>
                </Button>
                {state.custom && (
                    <Button size="sm" variant="outline-secondary" disabled={busy} onClick={() => onRemove(image.key)}>
                        <HiOutlineArrowUturnLeft /> <span className="ms-1">Restaurar padrão</span>
                    </Button>
                )}
                <span className="fs-13 text-secondary">{state.custom ? "Personalizado" : "Padrão do template"}</span>
            </div>
            <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="d-none"
                onChange={onChange}
            />
        </div>
    );
}

/**
 * Config > Visual: cores, fonte, título das páginas, logos e favicon.
 * Cores e fonte viram o public/assets/css/theme.css (variáveis do Bootstrap), gerado no servidor.
 */
export default function Visual() {
    const settings = useApi(() => VisualApi.settings(), []);
    const [colors, setColors] = useState(null);
    const [text, setText] = useState(null);

    useEffect(() => {
        if (!settings.data) return;

        setColors(settings.data.colors);
        setText(settings.data.text);
    }, [settings.data]);

    const [saveTheme, saving] = useAction((payload) => VisualApi.saveColors(payload), { success: true });
    const [uploadImage, uploading] = useAction(
        (data) => VisualApi.requestOptions({ data }).uploadLogo(),
        { success: true }
    );
    const [removeImage, removing] = useAction(
        (variant) => VisualApi.removeLogo({ variant }),
        { success: true, confirm: "Voltar para a imagem padrão?" }
    );

    const apply = (res) => {
        if (!res || res.error) return;

        settings.setData(res.data);
        refreshTheme(res.data.theme_version);

        // logos novos valem para as outras telas no próximo carregamento
        if (window.App && window.App.visual) {
            window.App.visual.logo = res.data.images.logo.url;
            window.App.visual.logo_dark = res.data.images.logo_dark.url;
            window.App.visual.nav_dark = isDark(res.data.colors.nav_bg);
        }
    };

    const onSave = async (e) => {
        e.preventDefault();
        apply(await saveTheme({ colors, text }));
    };

    const onUpload = async (variant, file) => {
        const data = new FormData();
        data.append("variant", variant);
        data.append("file", file);

        apply(await uploadImage(data));
    };

    const onRestoreDefaults = () => {
        setColors(state.defaults);
        setText(state.text_defaults);
    };

    const setColor = (key, value) => setColors((prev) => ({ ...prev, [key]: value }));
    const setTextValue = (key, value) => setText((prev) => ({ ...prev, [key]: value }));

    const busy = uploading.loading || removing.loading;
    const loading = settings.loading || saving.loading || busy;
    const state = settings.data || {};
    const sizes = state.title_size || {};

    return (
        <TemplateMain title="Visual" breadcrumbs={["page.config"]}>
            <div className={loading ? "full-loading" : ""} style={{ minHeight: 200 }}>
                {colors && text && (
                    <Row className="g-4">
                        <Col lg={7}>
                            <Form onSubmit={onSave}>
                                {GROUPS.map((group) => (
                                    <div key={group.title} className="mb-4">
                                        <h5 className="fw-light border-bottom pb-2 mb-3">{group.title}</h5>
                                        <Row>
                                            {group.fields.map(([key, label]) => (
                                                <Col sm={6} key={key}>
                                                    <ColorField
                                                        label={label}
                                                        value={colors[key]}
                                                        onChange={(value) => setColor(key, value)}
                                                    />
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                ))}

                                <div className="mb-4">
                                    <h5 className="fw-light border-bottom pb-2 mb-3">Texto</h5>
                                    <Row>
                                        <Col sm={6}>
                                            <FontField
                                                fonts={state.fonts || []}
                                                value={text.font}
                                                onChange={(value) => setTextValue("font", value)}
                                            />
                                        </Col>
                                        <Col sm={6}>
                                            <ColorField
                                                label="Cor do título das páginas"
                                                value={colors.title_text}
                                                onChange={(value) => setColor("title_text", value)}
                                            />
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="mb-1 fs-14">Tamanho do título (px)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min={0}
                                                    max={sizes.max}
                                                    value={text.title_size}
                                                    onChange={(e) => setTextValue("title_size", Number(e.target.value) || 0)}
                                                />
                                                <div className="form-text">
                                                    De {sizes.min} a {sizes.max}. 0 usa o tamanho padrão.
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </div>

                                <div className="d-flex flex-wrap gap-2 justify-content-end">
                                    <Button variant="light" onClick={onRestoreDefaults}>Restaurar padrões</Button>
                                    <Button type="submit" variant="primary" disabled={saving.loading}>Salvar tema</Button>
                                </div>
                            </Form>
                        </Col>
                        <Col lg={5}>
                            <h5 className="fw-light border-bottom pb-2 mb-3">Pré-visualização</h5>
                            <Preview colors={colors} text={text} images={state.images} />

                            <h5 className="fw-light border-bottom pb-2 mb-3 mt-5">Imagens</h5>
                            {IMAGES.map((image) => (
                                <ImageCard
                                    key={image.key}
                                    image={image}
                                    state={state.images[image.key]}
                                    busy={busy}
                                    onUpload={onUpload}
                                    onRemove={async (variant) => apply(await removeImage(variant))}
                                />
                            ))}
                            <div className="form-text">
                                PNG, JPG, GIF ou WebP de até 2 MB. O original fica guardado; o site usa versões otimizadas.
                            </div>
                        </Col>
                    </Row>
                )}
            </div>
        </TemplateMain>
    );
}
