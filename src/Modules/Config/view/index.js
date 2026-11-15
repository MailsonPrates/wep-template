import { HiOutlineBars3, HiOutlineSwatch } from "react-icons/hi2";
import { LinkCards, TemplateMain } from "components";

const CARDS = [
    { title: "Menu", icon: <HiOutlineBars3 />, description: "Itens, ícones e permissões do menu da barra lateral", to: "/config/menu/", role: "page.config.menu" },
    { title: "Visual", icon: <HiOutlineSwatch />, description: "Cores dos botões e da barra superior, e o logo", to: "/config/visual/", role: "page.config.visual" },
];

export default function Config() {
    return (
        <TemplateMain title="Configurações">
            <div className="mt-4"><LinkCards items={CARDS} /></div>
        </TemplateMain>
    );
}
