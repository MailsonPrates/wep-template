import { Link } from "jeact";
import App from "app";

export default function Main(props={}){

    const menu = [
        {title: "Pedidos", link: "/pedidos/"},
        {title: "Pedido 123", link: "/pedidos/123"},
        {title: "Pedido criar", link: "/pedidos/criar"},
        {title: "Inválido", link: "/invalido"},
        {title: "Home", link: "/"}
    ];

    if ( props.title ){
        document.title = `${props.title} | ${App.data("title", "Wep")}`;
    }

    return $.div({
        class: "main container-fluid",
        html: $.div({
            class: "row",
            html: [
                $.div({
                    class: "col-sm-2 p-3 border h-100",
                    html: menu.map(item => {
                        return Link({
                            href: item.link,
                            class: "p-3 border-bottom d-block",
                            html: item.title
                        })
                    })
                }),
                $.div({
                    class: "col-sm-10 p-3 border h-100",
                    html: [
                        $.h1(props.title || "Sem título"),
                        $.div({
                            class: "mt-4",
                            html: props.content || ""
                        })
                    ]
                })
            ]
        })
    })
}