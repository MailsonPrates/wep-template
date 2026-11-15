import { useEffect, useRef, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { HiOutlineCamera } from "react-icons/hi2";
import { UserProfileApi } from "api";
import { Avatar, Field, Password, TemplateMain } from "components";
import { user } from "core/user";
import { useAction, useForm, useToast } from "hooks";

const MIN_PASSWORD = 8;
const SAVED_FLAG = "profile_saved";

/**
 * Meus dados: nome, apelido, senha e foto.
 * Depois de salvar a página recarrega para a nav mostrar o nome e a foto novos (eles vêm do HTML).
 */
export default function UserProfile() {
    const toast = useToast();
    const current = user();
    const fileRef = useRef(null);

    const [image, setImage] = useState(current.profile_images ? current.profile_images.medium : "");
    const [imageFile, setImageFile] = useState(null);
    const [imageRemoved, setImageRemoved] = useState(false);

    const form = useForm(
        { firstname: current.firstname || "", lastname: current.lastname || "", nickname: current.nickname || "", password: "", confirmPassword: "" },
        {
            firstname: { required: "Informe o nome" },
            lastname: { required: "Informe o sobrenome" },
            password: { minLength: [MIN_PASSWORD, `Mínimo de ${MIN_PASSWORD} caracteres`] },
            confirmPassword: { validate: (value, values) => (values.password && value !== values.password ? "As senhas precisam ser iguais" : null) },
        }
    );

    // aviso de "salvo" depois do recarregamento
    useEffect(() => {
        try {
            if (window.sessionStorage.getItem(SAVED_FLAG)) {
                window.sessionStorage.removeItem(SAVED_FLAG);
                toast.success("Dados salvos");
            }
        } catch (e) { /* sem storage */ }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // libera a URL de pré-visualização da imagem escolhida
    useEffect(() => () => { if (image && image.startsWith("blob:")) URL.revokeObjectURL(image); }, [image]);

    const [save, { loading }] = useAction((payload) => UserProfileApi.requestOptions({ data: payload }).salvar());

    const onImageChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        setImageFile(file);
        setImageRemoved(false);
        setImage(URL.createObjectURL(file));
    };

    const onRemoveImage = () => {
        if (!window.confirm("Remover a foto?")) return;

        setImageFile(null);
        setImageRemoved(true);
        setImage("");
        if (fileRef.current) fileRef.current.value = "";
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!form.validate()) return;

        const data = new FormData();
        data.append("firstname", form.values.firstname);
        data.append("lastname", form.values.lastname);
        data.append("nickname", form.values.nickname);
        data.append("password", form.values.password);
        data.append("image_update", imageFile || imageRemoved ? "true" : "false");
        data.append("image_remove", imageRemoved ? "true" : "false");
        if (imageFile) data.append("file", imageFile);

        const res = await save(data);

        if (!res || res.error) return;

        try { window.sessionStorage.setItem(SAVED_FLAG, "1"); } catch (err) { /* sem storage */ }
        window.location.reload();
    };

    const fullName = `${form.values.firstname} ${form.values.lastname}`.trim();

    return (
        <TemplateMain title="Meus dados" breadcrumbs={false}>
            <Form noValidate onSubmit={onSubmit} className={`p-2${loading ? " full-loading" : ""}`}>
                <div className="mb-5 d-flex flex-wrap align-items-center gap-4">
                    <div className="text-center">
                        <div className="profile-image-container" style={image ? { backgroundImage: `url("${image}")` } : undefined}>
                            {!image && <Avatar name={current.firstname} size={120} className="border-0" />}
                            <button
                                type="button"
                                className="profile-image-cover border-0 w-100 fw-semibold"
                                onClick={() => fileRef.current && fileRef.current.click()}
                            >
                                <HiOutlineCamera className="me-1" /> {image ? "Alterar foto" : "Adicionar foto"}
                            </button>
                        </div>
                        {image && <Button variant="link" size="sm" className="text-secondary mt-1" onClick={onRemoveImage}>Remover foto</Button>}
                        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="d-none" onChange={onImageChange} />
                    </div>
                    <div>
                        {current.username && <span className="px-2 bg-light d-inline-block rounded text-secondary">{current.username}</span>}
                        <div className="fw-semibold fs-2">{fullName}{form.values.nickname ? ` (${form.values.nickname})` : ""}</div>
                        {current.created_at && <div>Cadastrado desde {current.created_at}</div>}
                    </div>
                </div>

                <h5 className="fw-light border-bottom pb-2 mb-3">Dados de cadastro</h5>
                <Row>
                    <Col md={4}><Field label="Nome" autoComplete="given-name" {...form.field("firstname")} /></Col>
                    <Col md={4}><Field label="Sobrenome" autoComplete="family-name" {...form.field("lastname")} /></Col>
                    <Col md={4}><Field label="Apelido" {...form.field("nickname")} /></Col>
                </Row>

                <h5 className="fw-light border-bottom pb-2 mb-3 mt-4">Senha</h5>
                <Row>
                    <Col md={4}><Field label="Usuário" value={current.username || ""} disabled readOnly /></Col>
                    <Col md={4}><Password label="Nova senha (opcional)" autoComplete="new-password" {...form.field("password")} /></Col>
                    <Col md={4}><Password label="Repita a nova senha" autoComplete="new-password" {...form.field("confirmPassword")} /></Col>
                </Row>

                <div className="mt-4 text-end">
                    <Button type="submit" size="lg" variant="primary" className="px-5" disabled={loading}>
                        {loading ? "Salvando..." : "Salvar"}
                    </Button>
                </div>
            </Form>
        </TemplateMain>
    );
}
