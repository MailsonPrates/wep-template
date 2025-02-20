import Main from "./index.js";

export default function Placeholder(){

    return Main({
        title: "Usuários",
        content: $.div({
            key: "placeholder",
            class: "placeholder-glow",
            html: [
                $.div({html: $.span({class: "placeholder col-6"})}),
                $.div({html: $.span({class: "placeholder col-6"})}),
                $.div({html: $.span({class: "placeholder col-8"})}),
                $.div({html: $.span({class: "placeholder col-4"})})
            ]
        })
    })
}