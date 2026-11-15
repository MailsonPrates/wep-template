import { useEffect, useRef, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { HiOutlineArrowUpTray, HiOutlineArrowUturnLeft } from "react-icons/hi2";
import { VisualApi } from "api";
import { TemplateMain } from "components";
import { useAction, useApi } from "hooks";

const GROUPS = [
    {
        title: "Botão principal (primary)",
        fields: [["primary_bg", "Fundo"], ["primary_text", "Texto"]],
    },
    {
        title: "Botão secundário (secondary)",
        fields: [["secondary_bg", "Fundo"], ["secondary_text", "Texto"]],
    },
    {
        title: "Barra superior (nav)",
        fields: [["nav_bg", "Fundo"], ["nav_text", "Texto e ícones"], ["nav_hover", "Destaque ao passar o mouse"]],
    },
];

const HEX = /^#[0-9a-f]{6}$/i;

function ColorField({ label, value, onChange }) {
    const [text, setText] = useState(value);

    useEffect(() => setText(value), [value]);

    return (
        <Form.Group className="mb-3">
            <Form.Label className="mb-1 fs-14">{label}</Form.Label>
            <div className="color-field">
                <Form.Control type="color" value={value} onChange={(e) => onChange(e.target.value)} title={label} />
                <Form.Control
                    value={text}
                    maxLength={7}
                    isInvalid={!HEX.test(text)}
                    onChange={(e) => {
                        setText(e.target.value);
                        if (HEX.test(e.target.value)) onChange(e.target.value.toLowerCase());
                    }}
                />
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

function Preview({ colors, logo }) {
    return (
        <div className="visual-preview">
            <div className="d-flex align-items-center justify-content-between px-3 py-2" style={{ background: colors.nav_bg, color: colors.nav_text }}>
                <img src={logo} alt="" style={{ maxHeight: 36, maxWidth: 120 }} />
                <span className="fs-14">Usuário</span>
            </div>
            <div className="p-3 d-flex flex-wrap gap-2 bg-white">
                <span className="btn" style={{ background: colors.primary_bg, color: colors.primary_text, borderColor: colors.primary_bg }}>Primary</span>
                <span className="btn" style={{ color: colors.primary_bg, borderColor: colors.primary_bg }}>Outline</span>
                <span className="btn" style={{ background: colors.secondary_bg, color: colors.secondary_text, borderColor: colors.secondary_bg }}>Secondary</span>
            </div>
        </div>
    );
}

/**
 * Config > Visual: cores dos botões e da barra superior, e o logo.
 * As cores viram o public/assets/css/theme.css (variáveis do Bootstrap), gerado no servidor.
 */
export default function Visual() {
    const settings = useApi(() => VisualApi.settings(), []);
    const [colors, setColors] = useState(null);
    const fileRef = useRef(null);

    useEffect(() => {
        if (settings.data) setColors(settings.data.colors);
    }, [settings.data]);

    const [saveColors, saving] = useAction((payload) => VisualApi.saveColors({ colors: payload }), { success: true });
    const [uploadLogo, uploading] = useAction((data) => VisualApi.requestOptions({ data }).uploadLogo(), { success: true });
    const [removeLogo, removing] = useAction(() => VisualApi.removeLogo(), { success: true, confirm: "Voltar para o logo padrão?" });

    const apply = (res) => {
        if (!res || res.error) return;

        settings.setData(res.data);
        refreshTheme(res.data.theme_version);

        // logo e cores novos valem para as outras telas no próximo carregamento
        if (window.App && window.App.visual) window.App.visual.logo = res.data.logo;
    };

    const onSaveColors = async (e) => {
        e.preventDefault();
        apply(await saveColors(colors));
    };

    const onLogoChange = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const data = new FormData();
        data.append("file", file);

        apply(await uploadLogo(data));
        e.target.value = "";
    };

    const loading = settings.loading || saving.loading || uploading.loading || removing.loading;
    const state = settings.data || {};

    return (
        <TemplateMain title="Visual" breadcrumbs={["page.config"]}>
            <div className={loading ? "full-loading" : ""} style={{ minHeight: 200 }}>
                {colors && (
                    <Row className="g-4">
                        <Col lg={7}>
                            <Form onSubmit={onSaveColors}>
                                {GROUPS.map((group) => (
                                    <div key={group.title} className="mb-4">
                                        <h5 className="fw-light border-bottom pb-2 mb-3">{group.title}</h5>
                                        <Row>
                                            {group.fields.map(([key, label]) => (
                                                <Col sm={6} key={key}>
                                                    <ColorField label={label} value={colors[key]} onChange={(value) => setColors((prev) => ({ ...prev, [key]: value }))} />
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                ))}
                                <div className="d-flex flex-wrap gap-2 justify-content-end">
                                    <Button variant="light" onClick={() => setColors(state.defaults)}>Restaurar cores padrão</Button>
                                    <Button type="submit" variant="primary" disabled={saving.loading}>Salvar cores</Button>
                                </div>
                            </Form>
                        </Col>
                        <Col lg={5}>
                            <h5 className="fw-light border-bottom pb-2 mb-3">Pré-visualização</h5>
                            <Preview colors={colors} logo={state.logo} />

                            <h5 className="fw-light border-bottom pb-2 mb-3 mt-5">Logo</h5>
                            <div className="border rounded p-3 text-center bg-light">
                                <img src={state.logo} alt="Logo atual" className="brand-logo mx-auto" />
                                <div className="fs-13 text-secondary mt-2">
                                    {state.logo_custom ? "Logo personalizado" : "Logo padrão do template"}
                                </div>
                            </div>
                            <div className="d-flex flex-wrap gap-2 mt-3">
                                <Button variant="outline-primary" onClick={() => fileRef.current && fileRef.current.click()}>
                                    <HiOutlineArrowUpTray /> <span className="ms-1">Enviar logo</span>
                                </Button>
                                {state.logo_custom && (
                                    <Button variant="outline-secondary" onClick={async () => apply(await removeLogo())}>
                                        <HiOutlineArrowUturnLeft /> <span className="ms-1">Restaurar padrão</span>
                                    </Button>
                                )}
                            </div>
                            <div className="form-text">PNG, JPG, GIF ou WebP de até 2 MB. O original fica guardado; o site usa uma versão WebP otimizada.</div>
                            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="d-none" onChange={onLogoChange} />
                        </Col>
                    </Row>
                )}
            </div>
        </TemplateMain>
    );
}
