import { HiOutlineMegaphone, HiOutlineTicket, HiOutlineSquares2X2 } from "react-icons/hi2";
import { LinkCards, TemplateMain } from "components";
import { user } from "core/user";

/**
 * Página inicial de exemplo do template: troque o título, o subtítulo e os cartões pelos do app.
 */
const CARDS = [
    {
        title: "Título",
        icon: <HiOutlineMegaphone />,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
        title: "Título",
        icon: <HiOutlineTicket />,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
        title: "Título",
        icon: <HiOutlineSquares2X2 />,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
].map((card, index) => ({ ...card, title: `${card.title} ${index + 1}` }));

export default function Home() {
    const current = user();

    return (
        <TemplateMain title="Início" header={false}>
            <div>Olá <b>{current.nickname || current.firstname || "Usuário"}</b></div>
            <div className="mt-3">
                <h1 className="mb-0">Título</h1>
                <span className="h1 text-gradient gradient-primary fw-bold">Subtítulo</span>
            </div>
            <div className="mt-5">
                <LinkCards items={CARDS} />
            </div>
        </TemplateMain>
    );
}
