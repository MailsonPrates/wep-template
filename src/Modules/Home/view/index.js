import {TemplateMain} from "components";
import Cards from "./Cards";
import Head from "./Head";

export default function Home(){
    return <TemplateMain title="Início" header={false}>
        <Head />
        <div className="mt-5">
            <Cards />
        </div>
    </TemplateMain>
}