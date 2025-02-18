import Clean from "./index.js";

export default function CleanPlaceholder(){
    return Clean({
        title: $.div({
            class: "placeholder rounded-5"
        }),
        content: $.div({
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