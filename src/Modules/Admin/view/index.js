import {TemplateMain} from "components";
import Cards from "./Cards";

export default function Config(){
    return <TemplateMain title="Admin">
        <div className="mt-5">
            <Cards />
        </div>
    </TemplateMain>
}