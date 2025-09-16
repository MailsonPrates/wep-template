import TemplateMain from "ui/templates/main";
import Cards from "./Cards";
import Head from "./Head";
import {MockupApi} from "api";

let req = MockupApi.clientes.find();

req.then(res => {
    console.log({res});
})

export default function Home(){
    return <TemplateMain title="Início" header={false}>
        <Head />
        <div className="mt-5">
            <Cards />
        </div>
    </TemplateMain>
}